import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface UsePdfExportOptions {
  filename?: string;
  format?: "a4" | "letter";
  quality?: number;
}

export function usePdfExport(options: UsePdfExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const { filename = "resume", format = "a4", quality = 2 } = options;

  const exportToPdf = useCallback(
    async (elementRef: React.RefObject<HTMLElement>) => {
      if (!elementRef.current) {
        toast.error("Unable to export: Resume preview not found");
        return;
      }

      setIsExporting(true);
      toast.loading("Generating PDF...", { id: "pdf-export" });

      try {
        const element = elementRef.current;

        // Get the computed styles
        const rect = element.getBoundingClientRect();

        // Create canvas with higher resolution for better quality
        const canvas = await html2canvas(element, {
          scale: quality,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: rect.width,
          height: rect.height,
        });

        // Calculate PDF dimensions
        const imgWidth = format === "a4" ? 210 : 215.9; // mm
        const imgHeight = format === "a4" ? 297 : 279.4; // mm
        const pdfWidth = imgWidth;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF({
          orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
          unit: "mm",
          format: format,
        });

        const imgData = canvas.toDataURL("image/png");

        // If content is longer than one page, we need to handle pagination
        if (pdfHeight > imgHeight) {
          let position = 0;
          let remainingHeight = pdfHeight;

          while (remainingHeight > 0) {
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
            remainingHeight -= imgHeight;
            position -= imgHeight;

            if (remainingHeight > 0) {
              pdf.addPage();
            }
          }
        } else {
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        // Download the PDF
        pdf.save(`${filename}.pdf`);
        toast.success("PDF exported successfully!", { id: "pdf-export" });
      } catch (error) {
        console.error("PDF export error:", error);
        toast.error("Failed to export PDF. Please try again.", {
          id: "pdf-export",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [filename, format, quality]
  );

  return { exportToPdf, isExporting };
}
