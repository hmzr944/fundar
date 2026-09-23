import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

/** Splits inline markdown (**bold**, *italic*, `code`) into styled runs. */
function inlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) runs.push(new TextRun(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith("**")) runs.push(new TextRun({ text: tok.slice(2, -2), bold: true }));
    else if (tok.startsWith("`")) runs.push(new TextRun({ text: tok.slice(1, -1), font: "Consolas" }));
    else if (tok.startsWith("[")) {
      const [, label, url] = tok.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      runs.push(new TextRun(`${label} (${url})`));
    } else runs.push(new TextRun({ text: tok.slice(1, -1), italics: true }));
    last = m.index! + tok.length;
  }
  if (last < text.length) runs.push(new TextRun(text.slice(last)));
  return runs;
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

/** Minimal Markdown → DOCX conversion covering what Atlas produces. */
export async function markdownToDocx(title: string, markdown: string): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [new Paragraph({ text: title, heading: HeadingLevel.TITLE })];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const header = splitRow(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(splitRow(lines[i++]));
      i--;
      const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
      const mkRow = (cells: string[], bold: boolean) =>
        new TableRow({
          children: header.map(
            (_, idx) =>
              new TableCell({
                borders: { top: border, bottom: border, left: border, right: border },
                children: [new Paragraph({ children: bold ? [new TextRun({ text: cells[idx] ?? "", bold: true })] : inlineRuns(cells[idx] ?? "") })],
              }),
          ),
        });
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [mkRow(header, true), ...rows.map((r) => mkRow(r, false))],
        }),
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][heading[1].length - 1];
      children.push(new Paragraph({ text: heading[2], heading: level }));
      continue;
    }
    const check = trimmed.match(/^[-*]\s+\[( |x|X)\]\s+(.*)$/);
    if (check) {
      children.push(new Paragraph({ children: [new TextRun(check[1] === " " ? "☐ " : "☑ "), ...inlineRuns(check[2])] }));
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      const depth = Math.min(Math.floor((line.length - line.trimStart().length) / 2), 3);
      children.push(new Paragraph({ children: inlineRuns(bullet[1]), bullet: { level: depth } }));
      continue;
    }
    const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (numbered) {
      children.push(new Paragraph({ children: [new TextRun(`${numbered[1]}. `), ...inlineRuns(numbered[2])] }));
      continue;
    }
    if (/^-{3,}$/.test(trimmed)) {
      children.push(new Paragraph({ text: "", alignment: AlignmentType.CENTER }));
      continue;
    }
    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      children.push(new Paragraph({ children: [new TextRun({ text: quote[1], italics: true })], indent: { left: 400 } }));
      continue;
    }
    children.push(new Paragraph({ children: inlineRuns(trimmed), spacing: { after: 120 } }));
  }
  const doc = new Document({ creator: "Atlas", title, sections: [{ children }] });
  return Packer.toBuffer(doc);
}

/** Extracts the first markdown table as CSV (for comparison tables). */
export function markdownTableToCsv(markdown: string): string | null {
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim().startsWith("|") && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows = [splitRow(lines[i])];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) rows.push(splitRow(lines[j++]));
      const esc = (c: string) => {
        const v = c.replace(/\*\*/g, "");
        // Neutralise spreadsheet formula injection.
        const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
        return /[",;\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
      };
      return rows.map((r) => r.map(esc).join(",")).join("\n") + "\n";
    }
  }
  return null;
}

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 60) || "livrable"
  );
}
