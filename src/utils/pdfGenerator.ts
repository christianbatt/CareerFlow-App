import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PdfExportOptions {
  fileName?: string;
  candidateName?: string;
  company?: string;
  role?: string;
  lang?: string;
}

/**
 * High-definition multi-page aware A4 PDF export from HTML DOM elements.
 * Generates an executive, pixel-perfect A4 PDF directly in the browser.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  if (!element) return false;

  const candidate = (options.candidateName || "Candidato")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const targetCompany = (options.company || "Azienda")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const targetRole = (options.role || "Ruolo")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const defaultFileName = `CV_${candidate}_${targetCompany}_${targetRole}.pdf`;
  const finalFileName = options.fileName || defaultFileName;

  try {
    // Render the element to a high-resolution canvas (scale 2 = crystal clear typography)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
      scrollX: 0,
      scrollY: 0,
    });

    // Standard A4 dimensions in millimeters
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 12; // 12mm executive margin
    const contentWidth = pdfWidth - margin * 2; // 186mm printable width
    const maxPageContentHeight = pdfHeight - margin * 2; // 273mm printable height per page

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Calculate canvas slice height corresponding to one A4 page
    const pageCanvasHeight = Math.floor((canvas.width * maxPageContentHeight) / contentWidth);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage();
      }

      const sourceY = p * pageCanvasHeight;
      const currentSliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

      // Create a slice canvas to prevent any multi-page bleed or clipping distortion
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSliceHeight;
      const ctx = pageCanvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        const sliceData = pageCanvas.toDataURL("image/jpeg", 0.98);
        const slicePdfHeight = (currentSliceHeight * contentWidth) / canvas.width;
        pdf.addImage(sliceData, "JPEG", margin, margin, contentWidth, slicePdfHeight);
      }
    }

    // Direct download to user device
    pdf.save(finalFileName);
    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    return false;
  }
}

/**
 * Specialized helper to export Cover Letter as an executive letterhead PDF.
 */
export async function exportCoverLetterPdf(
  element: HTMLElement,
  options: {
    candidateName: string;
    company: string;
    role: string;
    lang?: string;
  }
): Promise<boolean> {
  const safeName = (options.candidateName || "Candidato")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const safeCompany = (options.company || "Azienda")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const fileName = `Lettera_${safeName}_${safeCompany}.pdf`;

  return exportElementToPdf(element, {
    fileName,
    candidateName: options.candidateName,
    company: options.company,
    role: options.role,
    lang: options.lang,
  });
}
