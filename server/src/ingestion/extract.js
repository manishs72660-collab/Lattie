// src/ingestion/extract.js
import { extractText } from "unpdf";

// Returns an array of page texts so every chunk can carry a page number for citations.
export async function extractPages(buffer, mimetype, filename = "") {
  const isPdf = mimetype === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
  if (!isPdf) return [buffer.toString("utf8")];

  const { text } = await extractText(new Uint8Array(buffer), { mergePages: false });
  // unpdf returns per-page strings when mergePages:false (array),
  // or a single string otherwise. Normalize to array.
  return Array.isArray(text) ? text : [text];
}