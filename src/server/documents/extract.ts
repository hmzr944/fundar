import path from "node:path";

export type SupportedFormat = "pdf" | "docx" | "text";

export const SUPPORTED_EXTENSIONS: Record<string, { format: SupportedFormat; mime: string }> = {
  ".pdf": { format: "pdf", mime: "application/pdf" },
  ".docx": { format: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  ".txt": { format: "text", mime: "text/plain" },
  ".md": { format: "text", mime: "text/markdown" },
  ".csv": { format: "text", mime: "text/csv" },
};

export const ACCEPT_ATTRIBUTE = Object.keys(SUPPORTED_EXTENSIONS).join(",");
export const MAX_EXTRACTED_CHARS = 400_000;

export class UnsupportedFileError extends Error {}

/** Safe display name: strips paths and control characters. */
export function sanitizeFileName(name: string): string {
  const base = path.basename(name.replace(/\\/g, "/"));
  const cleaned = base.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "").trim();
  return (cleaned || "document").slice(0, 150);
}

/**
 * Validates a file from its extension AND its content (magic bytes). The
 * client-provided MIME type is ignored.
 */
export function detectFormat(fileName: string, data: Buffer): { format: SupportedFormat; mime: string } {
  const ext = path.extname(fileName).toLowerCase();
  const entry = SUPPORTED_EXTENSIONS[ext];
  if (!entry) {
    throw new UnsupportedFileError(
      `Format « ${ext || "sans extension"} » non pris en charge. Formats acceptés : PDF, DOCX, TXT, MD, CSV.`,
    );
  }
  if (data.length === 0) throw new UnsupportedFileError("Le fichier est vide.");
  if (entry.format === "pdf" && data.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new UnsupportedFileError("Le contenu du fichier ne correspond pas à un PDF valide.");
  }
  if (entry.format === "docx" && !(data[0] === 0x50 && data[1] === 0x4b && data[2] === 0x03 && data[3] === 0x04)) {
    throw new UnsupportedFileError("Le contenu du fichier ne correspond pas à un document DOCX valide.");
  }
  if (entry.format === "text") {
    const sample = data.subarray(0, 8192);
    if (sample.includes(0)) throw new UnsupportedFileError("Le fichier texte contient des données binaires.");
  }
  return entry;
}

export async function extractText(format: SupportedFormat, data: Buffer): Promise<string> {
  let text: string;
  if (format === "pdf") {
    const { extractText: pdfExtract, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const res = await pdfExtract(pdf, { mergePages: false });
    const pages = Array.isArray(res.text) ? res.text : [res.text];
    text = pages.map((p, i) => `--- Page ${i + 1} ---\n${p}`).join("\n\n");
    if (!pages.join("").trim()) {
      throw new UnsupportedFileError(
        "Aucun texte n'a pu être extrait de ce PDF (document probablement scanné). La reconnaissance de texte (OCR) n'est pas encore disponible.",
      );
    }
  } else if (format === "docx") {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ buffer: data });
    text = res.value;
  } else {
    text = new TextDecoder("utf-8", { fatal: false }).decode(data).replace(/^﻿/, "");
  }
  text = text.replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();
  if (!text) throw new UnsupportedFileError("Le document ne contient aucun texte exploitable.");
  return text.slice(0, MAX_EXTRACTED_CHARS);
}
