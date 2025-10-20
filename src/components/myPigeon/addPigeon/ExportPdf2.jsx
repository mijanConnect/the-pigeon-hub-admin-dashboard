import { Spin, message } from "antd";
import jsPDF from "jspdf";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetSiblingsQuery,
  useGetSinglePigeonQuery,
} from "../../../redux/apiSlices/mypigeonSlice";

const PigeonPdfExport2 = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const origin = location?.state?.from || "/my-pigeon";
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const runOnceRef = useRef(false); // guard for StrictMode double-invoke

  const { data: pigeonResp, isLoading: loading } = useGetSinglePigeonQuery(id, {
    skip: !id,
  });
  const pigeon = pigeonResp?.data || null;

  const { data: siblingsResp, isLoading: siblingsLoading } =
    useGetSiblingsQuery(id, { skip: !id });
  const siblings = siblingsResp?.data?.siblings || [];

  const getImageUrl = (path) => {
    if (!path) {
      return "https://i.ibb.co/fYZx5zCP/Region-Gallery-Viewer.png";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    } else {
      // const baseUrl = "http://10.10.7.41:5001";
      const baseUrl = "https://ftp.thepigeonhub.com";
      return `${baseUrl}/${path}`;
    }
  };

  const getBase64FromUrl = async (url) => {
    try {
      const imageUrl = getImageUrl(url);

      // attach Authorization header when token is available (protected images)
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const response = await fetch(imageUrl, {
        mode: "cors",
        cache: "no-cache",
        headers,
      });

      if (!response.ok) {
        console.error(`Failed to load image: ${response.status}`);
        return null;
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading image:", error);
      return null;
    }
  };

  const handleExportPDF = async () => {
    if (!pigeon) {
      message.error("Pigeon data not loaded");
      return;
    }

    setPdfGenerating(true);

    console.log(
      "[ExportPdf2] handleExportPDF started for pigeon:",
      pigeon?._id
    );

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const addSectionHeader = (title, yPos) => {
        pdf.setFillColor(55, 183, 195);
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 2, yPos);
        pdf.setTextColor(0, 0, 0);
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pigeon Overview Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Date
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated on: ${moment().format("DD MMM YYYY, hh:mm A")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      // Get image
      const imageSource =
        pigeon?.pigeonPhoto || pigeon?.eyePhoto || pigeon?.pedigreePhoto;
      let base64Image = null;

      if (imageSource) {
        try {
          base64Image = await getBase64FromUrl(imageSource);
        } catch (error) {
          console.error("Error loading image:", error);
        }
      }

      // LEFT SIDE: Image | RIGHT SIDE: Basic Information
      const leftColumnX = margin;
      const rightColumnX = margin + 85;
      const imageSize = 70;
      const contentStartY = yPosition;

      // LEFT: Add Image with border
      if (base64Image) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(
          leftColumnX - 1,
          contentStartY - 1,
          imageSize + 2,
          imageSize + 2
        );
        pdf.addImage(
          base64Image,
          "JPEG",
          leftColumnX,
          contentStartY,
          imageSize,
          imageSize
        );
      } else {
        // Placeholder if no image
        pdf.setFillColor(240, 240, 240);
        pdf.rect(leftColumnX, contentStartY, imageSize, imageSize, "F");
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "No Image",
          leftColumnX + imageSize / 2,
          contentStartY + imageSize / 2,
          {
            align: "center",
          }
        );
        pdf.setTextColor(0, 0, 0);
      }

      // RIGHT: Basic Information Section
      let rightY = contentStartY;

      const infoItems = [
        { label: "Name", value: String(pigeon?.name || "N/A"), bold: true },
        { label: "Ring Number", value: String(pigeon?.ringNumber || "N/A") },
        { label: "Birth Year", value: String(pigeon?.birthYear || "N/A") },
        { label: "Gender", value: String(pigeon?.gender || "N/A") },
        { label: "Color", value: String(pigeon?.color || "N/A") },
        { label: "Country", value: String(pigeon?.country || "N/A") },
        { label: "Status", value: String(pigeon?.status || "Racing") },
      ];

      pdf.setFontSize(9);
      infoItems.forEach((item) => {
        pdf.setFont("helvetica", "normal");
        pdf.text(`${item.label}: `, rightColumnX, rightY);

        const labelWidth = pdf.getTextWidth(`${item.label}: `);
        pdf.setFont("helvetica", item.bold ? "bold" : "normal");
        pdf.text(item.value, rightColumnX + labelWidth, rightY);

        rightY += 6;
      });

      yPosition = Math.max(contentStartY + imageSize + 15, rightY + 10);

      // Parents Information Section (Full Width)
      checkPageBreak(40);
      addSectionHeader("Parents Information", yPosition);
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Father: ${String(pigeon?.fatherRingId?.name || "N/A")} (${String(
          pigeon?.fatherRingId?.ringNumber || "N/A"
        )})`,
        margin,
        yPosition
      );
      yPosition += 6;

      pdf.text(
        `Mother: ${String(pigeon?.motherRingId?.name || "N/A")} (${String(
          pigeon?.motherRingId?.ringNumber || "N/A"
        )})`,
        margin,
        yPosition
      );
      yPosition += 12;

      // Additional Information Section
      checkPageBreak(50);
      addSectionHeader("Additional Information", yPosition);
      yPosition += 10;

      const additionalInfo = [
        {
          label: "Breeder",
          value: String(pigeon?.breeder?.breederName || "N/A"),
        },
        {
          label: "Breeder Loft Name",
          value: String(pigeon?.breeder?.loftName || "N/A"),
        },
        { label: "Location", value: String(pigeon?.location || "N/A") },
        {
          label: "Father Ring Number",
          value: String(pigeon?.fatherRingId?.ringNumber || "N/A"),
        },
        {
          label: "Mother Ring Number",
          value: String(pigeon?.motherRingId?.ringNumber || "N/A"),
        },
        { label: "Country", value: String(pigeon?.country || "N/A") },
        { label: "Status", value: String(pigeon?.status || "N/A") },
        { label: "Verified", value: String(pigeon?.verified ? "Yes" : "No") },
        { label: "Iconic Score", value: String(pigeon?.iconicScore || "N/A") },
      ];

      pdf.setFontSize(9);
      additionalInfo.forEach((item) => {
        checkPageBreak(6);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${item.label}: `, margin, yPosition);

        const labelWidth = pdf.getTextWidth(`${item.label}: `);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.value, margin + labelWidth, yPosition);

        yPosition += 6;
      });

      // Your Story
      if (pigeon?.shortInfo) {
        yPosition += 5;
        checkPageBreak(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Your Story:", margin, yPosition);
        yPosition += 6;

        const storyLines = pdf.splitTextToSize(
          pigeon.shortInfo,
          pageWidth - 2 * margin
        );

        pdf.setFont("helvetica", "normal");
        storyLines.forEach((line) => {
          checkPageBreak(5);
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
      }

      // Notes
      if (pigeon?.notes) {
        yPosition += 5;
        checkPageBreak(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Notes:", margin, yPosition);
        yPosition += 6;

        const notesLines = pdf.splitTextToSize(
          pigeon.notes,
          pageWidth - 2 * margin
        );

        pdf.setFont("helvetica", "normal");
        notesLines.forEach((line) => {
          checkPageBreak(5);
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
      }

      // Siblings Information - Table format
      if (siblings && siblings.length > 0) {
        yPosition += 5;
        checkPageBreak(60);

        addSectionHeader("Siblings Information", yPosition);
        yPosition += 10;

        // Table setup
        const colWidths = {
          name: 28,
          type: 22,
          ring: 26,
          year: 16,
          breeder: 16,
          racer: 16,
          father: 18,
          mother: 18,
          gender: 16,
        };

        let xPos = margin;

        // Header row
        pdf.setFillColor(45, 45, 45);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, "F");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);

        pdf.text("Name", xPos + 1, yPosition);
        xPos += colWidths.name;
        pdf.text("Type", xPos + 1, yPosition);
        xPos += colWidths.type;
        pdf.text("Ring Number", xPos + 1, yPosition);
        xPos += colWidths.ring;
        pdf.text("Birth Year", xPos + 1, yPosition);
        xPos += colWidths.year;
        pdf.text("Breeder", xPos + 1, yPosition);
        xPos += colWidths.breeder;
        pdf.text("Racer", xPos + 1, yPosition);
        xPos += colWidths.racer;
        pdf.text("Father", xPos + 1, yPosition);
        xPos += colWidths.father;
        pdf.text("Mother", xPos + 1, yPosition);
        xPos += colWidths.mother;
        pdf.text("Gender", xPos + 1, yPosition);

        pdf.setTextColor(0, 0, 0);
        yPosition += 5;

        // Table rows
        pdf.setFont("helvetica", "normal");
        siblings.forEach((sibling, index) => {
          checkPageBreak(10);

          xPos = margin;
          const rowY = yPosition;

          // Alternating row colors
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
          } else {
            pdf.setFillColor(240, 240, 240);
          }
          pdf.rect(margin, rowY - 4, pageWidth - 2 * margin, 8, "F");

          // Row borders
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.1);
          pdf.line(margin, rowY + 4, pageWidth - margin, rowY + 4);

          pdf.setFontSize(7);
          pdf.setTextColor(0, 0, 0);

          const truncate = (text, width) => {
            const textStr = String(text || "N/A");
            const lines = pdf.splitTextToSize(textStr, width - 2);
            return lines[0];
          };

          pdf.text(truncate(sibling.name, colWidths.name), xPos + 1, rowY);
          xPos += colWidths.name;
          pdf.text(truncate(sibling.type, colWidths.type), xPos + 1, rowY);
          xPos += colWidths.type;
          pdf.text(
            truncate(sibling.ringNumber, colWidths.ring),
            xPos + 1,
            rowY
          );
          xPos += colWidths.ring;
          pdf.text(truncate(sibling.birthYear, colWidths.year), xPos + 1, rowY);
          xPos += colWidths.year;
          pdf.text(
            truncate(sibling.breederRating, colWidths.breeder),
            xPos + 1,
            rowY
          );
          xPos += colWidths.breeder;
          pdf.text(
            truncate(sibling.racerRating, colWidths.racer),
            xPos + 1,
            rowY
          );
          xPos += colWidths.racer;
          pdf.text(
            truncate(sibling.fatherRingId?.name, colWidths.father),
            xPos + 1,
            rowY
          );
          xPos += colWidths.father;
          pdf.text(
            truncate(sibling.motherRingId?.name, colWidths.mother),
            xPos + 1,
            rowY
          );
          xPos += colWidths.mother;
          pdf.text(truncate(sibling.gender, colWidths.gender), xPos + 1, rowY);

          yPosition += 8;
        });

        yPosition += 5;
      }

      // Race Results Section
      if (
        pigeon?.addresults &&
        Array.isArray(pigeon.addresults) &&
        pigeon.addresults.length > 0
      ) {
        checkPageBreak(20);
        addSectionHeader("Race Results", yPosition);
        yPosition += 10;

        pigeon.addresults.forEach((result, index) => {
          checkPageBreak(6);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text(`${index + 1}. ${result}`, margin + 2, yPosition);
          yPosition += 6;
        });
      }

      // Save PDF - create blob and trigger download (more reliable in some browsers)
      const fileName = `Pigeon_${
        pigeon?.ringNumber || "Report"
      }_${moment().format("YYYYMMDD")}.pdf`;

      try {
        console.log("[ExportPdf2] preparing blob for download...");
        const pdfBlob = pdf.output("blob");
        const objectUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
        console.log("[ExportPdf2] download triggered for", fileName);
        message.success("PDF downloaded successfully!");
      } catch (err) {
        console.error("[ExportPdf2] fallback to pdf.save due to error:", err);
        // fallback
        pdf.save(fileName);
        message.success("PDF downloaded successfully!");
      }

      // Navigate back to the originating route after delay (preserves where user started)
      setTimeout(() => {
        navigate(origin);
      }, 1500);
      setPdfGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF. Please try again.");
      setPdfGenerating(false);
    }
  };

  // Trigger PDF export when component mounts and data is ready
  useEffect(() => {
    // In development React StrictMode mounts components twice; guard against double export
    // Also wait until siblings are loaded so the first export includes them
    if (runOnceRef.current) return;
    if (!loading && !siblingsLoading && pigeon && id) {
      runOnceRef.current = true;
      console.log(
        "[ExportPdf2] both pigeon and siblings ready, running export",
        { pigeonId: id }
      );
      handleExportPDF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pigeon, loading, siblingsLoading, id]);

  // Show loading state
  if (loading || pdfGenerating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {loading ? "Loading pigeon data..." : "Generating PDF..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error if pigeon not found
  if (!pigeon) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Pigeon not found</p>
          <button
            onClick={() => navigate("/my-pigeon")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Processing your request...
        </p>
      </div>
    </div>
  );
};

export default PigeonPdfExport2;
