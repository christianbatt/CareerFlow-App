import { ParsedDocumentResult } from "../types";

/**
 * Converts a browser File into a base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:application/pdf;base64, prefix
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Parses a file (PDF, DOCX, TXT, MD) using the AI-assisted backend endpoint
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocumentResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  
  // Format check
  const supported = ["pdf", "docx", "doc", "txt", "md", "markdown", "json"];
  if (!supported.includes(extension)) {
    throw new Error(
      `Formato file non supportato (.${extension}). Puoi caricare file in formato PDF (.pdf), Word (.docx), Markdown (.md) o Testo (.txt).`
    );
  }

  // Size check (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Il file supera la dimensione massima consentita di 15MB.");
  }

  // If plain text or markdown, we can also extract local text directly as fallback
  let localText = "";
  if (extension === "txt" || extension === "md" || extension === "markdown") {
    try {
      localText = await file.text();
    } catch {
      // ignore
    }
  }

  const base64Data = await fileToBase64(file);

  const response = await fetch("/api/documents/parse-file", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBase64: base64Data,
      fileName: file.name,
      mimeType: file.type || (extension === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      text: localText,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Errore durante l'elaborazione del file (${response.status})`
    );
  }

  const result: ParsedDocumentResult = await response.json();
  return result;
}

/**
 * Returns a human-friendly format badge label and color
 */
export function getFileFormatMeta(formatOrExt?: string): { label: string; bg: string; text: string } {
  const ext = (formatOrExt || "").toLowerCase();
  if (ext.includes("pdf")) {
    return { label: "PDF", bg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-300" };
  }
  if (ext.includes("doc")) {
    return { label: "DOCX", bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300" };
  }
  if (ext.includes("md") || ext.includes("mark")) {
    return { label: "MARKDOWN", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300" };
  }
  return { label: "TXT", bg: "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700", text: "text-stone-700 dark:text-stone-300" };
}
