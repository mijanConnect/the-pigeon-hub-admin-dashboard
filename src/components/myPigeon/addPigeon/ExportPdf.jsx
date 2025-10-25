import React from "react";
import jsPDF from "jspdf";
import moment from "moment";
// import { Button } from "@/components/ui/button";
import { Button } from "antd";
import { Download } from "lucide-react";

const PigeonPdfExport = ({ pigeon, siblings = [] }) => {
  // Use your existing getImageUrl function
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

  // Convert image URL to base64
  const getBase64FromUrl = async (url) => {
    try {
      const imageUrl = getImageUrl(url);

      const response = await fetch(imageUrl, {
        mode: "cors",
        cache: "no-cache",
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
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add section header with cyan background
      const addSectionHeader = (title, yPos) => {
        // Cyan background (#37B7C3)
        pdf.setFillColor(55, 183, 195);
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");

        // White text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 2, yPos);

        // Reset text color to black
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

      // Basic Information Content (without header)
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

      // Move yPosition after the image/info section
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
        // { label: "Iconic", value: String(pigeon?.iconic ? "Yes" : "No") },
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
          type: 26,
          ring: 22,
          year: 16,
          breeder: 16,
          racer: 18,
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
        pdf.text("Siblings Type", xPos + 1, yPosition);
        xPos += colWidths.type;
        pdf.text("Ring Number", xPos + 1, yPosition);
        xPos += colWidths.ring;
        pdf.text("Birth Year", xPos + 1, yPosition);
        xPos += colWidths.year;
        pdf.text("Breeder", xPos + 1, yPosition);
        xPos += colWidths.breeder;
        pdf.text("Racing Rating", xPos + 1, yPosition);
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
            truncate(sibling.racingRating, colWidths.racer),
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

      // Save PDF
      const fileName = `Pigeon_${
        pigeon?.ringNumber || "Report"
      }_${moment().format("YYYYMMDD")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      className="bg-primary border border-primary text-white"
    >
      <Download className="w-4 h-4" />
      Export PDF
    </Button>
  );
};

export default PigeonPdfExport;
