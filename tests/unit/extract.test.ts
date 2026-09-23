import { describe, expect, it } from "vitest";
import { detectFormat, extractText, sanitizeFileName, UnsupportedFileError } from "@/server/documents/extract";
import { makeDocx, makePdf } from "../helpers/files";

describe("detectFormat", () => {
  it("accepts supported formats whose content matches the extension", async () => {
    expect(detectFormat("a.pdf", makePdf("hello")).format).toBe("pdf");
    expect(detectFormat("a.docx", await makeDocx(["x"])).format).toBe("docx");
    expect(detectFormat("notes.MD", Buffer.from("# titre")).format).toBe("text");
  });
  it("rejects unsupported extensions", () => {
    expect(() => detectFormat("virus.exe", Buffer.from("MZ"))).toThrow(UnsupportedFileError);
    expect(() => detectFormat("photo.png", Buffer.from("x"))).toThrow(/non pris en charge/);
  });
  it("rejects files whose content does not match (spoofed extension)", () => {
    expect(() => detectFormat("fake.pdf", Buffer.from("<html>not a pdf"))).toThrow(/PDF valide/);
    expect(() => detectFormat("fake.docx", Buffer.from("plain text"))).toThrow(/DOCX valide/);
    expect(() => detectFormat("bin.txt", Buffer.from([0x41, 0x00, 0x42]))).toThrow(/binaires/);
    expect(() => detectFormat("empty.txt", Buffer.alloc(0))).toThrow(/vide/);
  });
});

describe("extractText", () => {
  it("extracts text from a real PDF", async () => {
    const text = await extractText("pdf", makePdf("Facture numero 4521 montant 120 euros"));
    expect(text).toContain("Facture numero 4521");
    expect(text).toContain("Page 1");
  });
  it("extracts text from a real DOCX", async () => {
    const text = await extractText("docx", await makeDocx(["Contrat de bail", "Loyer : 850 €"]));
    expect(text).toContain("Contrat de bail");
    expect(text).toContain("850 €");
  });
  it("decodes UTF-8 text and strips the BOM", async () => {
    expect(await extractText("text", Buffer.from("\uFEFFÉté à Noël", "utf-8"))).toBe("Été à Noël");
  });
  it("refuses documents without any text", async () => {
    await expect(extractText("text", Buffer.from("   \n  "))).rejects.toThrow(UnsupportedFileError);
  });
});

describe("sanitizeFileName", () => {
  it("removes paths and dangerous characters", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("C:\\Users\\x\\bail<1>.pdf")).toBe("bail1.pdf");
    expect(sanitizeFileName("")).toBe("document");
  });
});
