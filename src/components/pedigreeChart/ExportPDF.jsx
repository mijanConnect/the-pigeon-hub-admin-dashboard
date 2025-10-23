import React, { useCallback } from "react";
import jsPDF from "jspdf";


// Helper function to load image as base64
const loadImageAsBase64 = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      console.error("Failed to load image:", url);
      resolve(null);
    };
    img.src = url;
  });
};

// Main PDF export function
export const exportPedigreeToPDF = async (
  nodes,
  edges,
  pedigreeData,
  generations = null
) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // Load images
    let logoImage = null;
    let letterBImage = null;
    let letterPImage = null;
    let goldCupImage = null;
    let goldTrophyImage = null;
    let cockImage = null;
    let henImage = null;
    let unspecifiedImage = null;

    try {
      // Load logo from pedigreeData if available, otherwise use default
      const logoUrl = pedigreeData?.data?.breeder?.logo || "/assets/logo.png";
      logoImage = await loadImageAsBase64(logoUrl);

      letterBImage = await loadImageAsBase64("/assets/Letter-B.png");
      letterPImage = await loadImageAsBase64("/assets/Letter-P.png");
      goldCupImage = await loadImageAsBase64("/assets/Gold-cup.png");
      cockImage = await loadImageAsBase64("/assets/cock.png");
      goldTrophyImage = await loadImageAsBase64("/assets/Gold-tropy.png");
      henImage = await loadImageAsBase64("/assets/hen.jpg");
      unspecifiedImage = await loadImageAsBase64("/assets/unspeficic.jpg");
    } catch (error) {
      console.error("Error loading images:", error);
    }

    // Filter nodes by generation if specified
    let filteredNodes = nodes;
    if (generations !== null) {
      const maxGen = Math.max(0, generations - 1);
      filteredNodes = nodes.filter((n) => {
        const gen = n?.data?.generation ?? 0;
        return gen <= maxGen;
      });
    }

    // Helper: Convert hex to RGB
    const hexToRgb = (hex) => {
      if (!hex || hex === "transparent") return { r: 255, g: 255, b: 255 };
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 };
    };

    // Helper: Load country flag
    const loadCountryFlag = async (countryCode) => {
      try {
        const flagUrl = `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
        return await loadImageAsBase64(flagUrl);
      } catch (error) {
        console.error("Error loading flag:", error);
        return null;
      }
    };

    // Helper: Get country code from country name
    const getCountryCode = (countryName) => {
      // You may need to import 'country-list' package or use a mapping
      // For now, returning first 2 letters as fallback
      if (!countryName) return null;
      return countryName.substring(0, 2).toUpperCase();
    };

    // Helper: Draw simple smooth step connection line
    const drawSimpleConnection = (x1, y1, x2, y2, lineWidth = 0.1) => {
      pdf.setDrawColor(55, 183, 195);
      pdf.setLineWidth(lineWidth);

      const midX = (x1 + x2) / 2;

      pdf.line(x1, y1, midX, y1);
      pdf.line(midX, y1, midX, y2);
      pdf.line(midX, y2, x2, y2);
    };

    // Helper: Add text with word wrap
    const addWrappedText = (
      text,
      x,
      y,
      maxWidth,
      lineHeight = 3.5,
      maxLines = null
    ) => {
      if (!text) return y;
      const lines = pdf.splitTextToSize(String(text), maxWidth);
      const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
      linesToShow.forEach((line) => {
        if (y < pageHeight - margin) {
          pdf.text(line, x, y);
          y += lineHeight;
        }
      });
      return y;
    };

    // Helper: Draw pigeon card
    const drawPigeonCard = async (node, x, y, width, height) => {
      const data = node.data;

      // Set background color and border color
      const bgColor = data.isEmpty ? "#FFFFFF" : data.color || "#FFFFFF";
      const rgb = hexToRgb(bgColor);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(x, y, width, height, "F");

      // Set draw color for borders (always black)
      pdf.setDrawColor(0, 0, 0);

      // Set line width for borders
      const topAndLeftBorderWidth = 0.2; // Thinner borders for top and left
      const rightAndBottomBorderWidth = 1.2; // Thicker borders for right and bottom

      // Draw top and left borders (normal thickness)
      pdf.setLineWidth(topAndLeftBorderWidth);
      pdf.line(x, y, x + width, y); // top
      pdf.line(x, y, x, y + height); // left

      // Draw right and bottom borders (thicker)
      pdf.setLineWidth(rightAndBottomBorderWidth);
      pdf.line(x + width, y, x + width, y + height); // right
      pdf.line(x, y + height, x + width, y + height); // bottom

      let currentY = y + 4;
      const leftMargin = x + 2;
      const contentWidth = width - 4;

      // === HEADER ROW ===
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      let headerX = leftMargin;

      // Country flag image
      if (data.country) {
        const countryCode = getCountryCode(data.country);
        if (countryCode) {
          try {
            const flagImage = await loadCountryFlag(countryCode);
            if (flagImage) {
              pdf.addImage(flagImage, "PNG", headerX, currentY - 2.5, 4, 3);
              headerX += 5;
            }
          } catch (error) {
            console.error("Flag load error:", error);
          }
        }
      }

      // Birth year
      if (data.birthYear) {
        const yearText = String(data.birthYear).slice(-2);
        pdf.text(yearText, headerX, currentY);
        headerX += pdf.getTextWidth(yearText) + 1;
      }

      // Ring number (RED)
      if (data.ringNumber) {
        pdf.setTextColor(195, 55, 57);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(data.ringNumber), headerX, currentY);
      }

      // Right side icons - Calculate total width first
      const iconWidth = 3;
      const iconSpacing = 0.5;
      let totalRightWidth = 0;

      // Count what we need to display
      const hasGender =
        data.gender &&
        (data.gender === "Cock" ||
          data.gender === "Hen" ||
          data.gender === "Unspecified");
      const hasVerified = data.verified && letterPImage;
      const hasIconic = data.iconic && goldCupImage;

      if (hasGender) totalRightWidth += iconWidth + iconSpacing;
      if (hasVerified) totalRightWidth += iconWidth + iconSpacing;
      if (hasIconic) totalRightWidth += iconWidth + iconSpacing;

      // Start from right edge
      let rightX = x + width - 2 - totalRightWidth;

      // Gender symbols (leftmost of the right side)
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      if (data.gender === "Cock") {
        pdf.addImage(cockImage, "PNG", rightX, currentY - 2.5, 3, 3);
        rightX += iconWidth + iconSpacing;
      } else if (data.gender === "Hen") {
        pdf.addImage(henImage, "PNG", rightX, currentY - 2.5, 3, 3);
        rightX += iconWidth + iconSpacing;
      } else if (data.gender === "Unspecified") {
        pdf.addImage(unspecifiedImage, "PNG", rightX, currentY - 2.5, 3, 3);
        rightX += iconWidth + iconSpacing;
      }

      // Verified P (middle)
      if (data.verified && letterPImage) {
        pdf.addImage(letterPImage, "PNG", rightX, currentY - 2.5, 3, 3);
        rightX += iconWidth + iconSpacing;
      }

      // Iconic trophy (rightmost)
      if (data.iconic && goldCupImage) {
        pdf.addImage(goldCupImage, "PNG", rightX, currentY - 2.5, 3, 3);
      }

      currentY += 5;

      // === NAME ===
      if (data.name) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        const nameLines = Math.min(2, Math.ceil(height / 30));
        currentY = addWrappedText(
          data.name,
          leftMargin,
          currentY,
          contentWidth,
          3,
          nameLines
        );
        currentY += 1;
      }

      // === OWNER ===
      if (data.owner) {
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(0, 0, 0);
        let ownerText = String(data.owner);
        pdf.text(ownerText, leftMargin, currentY);

        // Breeder verified badge
        if (data.breederVerified && letterBImage) {
          const ownerWidth = pdf.getTextWidth(ownerText);
          pdf.addImage(
            letterBImage,
            "PNG",
            leftMargin + ownerWidth + 1,
            currentY - 2.5,
            3,
            3
          );
        }
        currentY += 4;
      }

      // === DESCRIPTION ===
      if (data.description && height > 40 && currentY < y + height - 15) {
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(70, 70, 70);
        const remainingSpace = y + height - currentY - 12;
        const maxDescLines = Math.floor(remainingSpace / 3);
        if (maxDescLines > 0) {
          currentY = addWrappedText(
            String(data.description).substring(0, 300),
            leftMargin,
            currentY,
            contentWidth,
            3,
            maxDescLines
          );
          currentY += 1;
        }
      }

      // === COLOR NAME ===
      if (data.colorName && currentY < y + height - 10) {
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(70, 70, 70);
        currentY = addWrappedText(
          data.colorName,
          leftMargin,
          currentY,
          contentWidth,
          3,
          1
        );
        currentY += 1;
      }

      // === ACHIEVEMENTS ===
      if (data.achievements && currentY < y + height - 8) {
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        let achievementsX = leftMargin;

        // Gold trophy icon
        if (goldTrophyImage) {
          pdf.addImage(
            goldTrophyImage,
            "PNG",
            achievementsX,
            currentY - 2.5,
            3,
            3
          );
          achievementsX += 4;
        }

        pdf.text("Results:", achievementsX, currentY);
        currentY += 3;

        pdf.setFontSize(5.5);
        const remainingSpace = y + height - currentY - 2;
        const maxAchvLines = Math.floor(remainingSpace / 2.5);
        if (maxAchvLines > 0) {
          currentY = addWrappedText(
            String(data.achievements).substring(0, 200),
            leftMargin,
            currentY,
            contentWidth,
            2.5,
            maxAchvLines
          );
        }
      }
    };

    // === LOGO ===
    if (logoImage) {
      pdf.addImage(logoImage, "PNG", margin, margin - 2, 16, 16);
    }

    // === CARD DIMENSIONS ===
    const cardSpacing = 4;

    const gen0 = { w: 35, h: 90 };
    const gen1 = { w: 30, h: 90 };

    const gen2Gap = 3;
    const gen2 = { w: 30, h: 68.25 - (gen2Gap * 3) / 4 };

    const gen3Gap = 3;
    const gen3 = { w: 30, h: 34.125 - (gen3Gap * 7) / 8 };

    const gen4Gap = 2;
    const gen4 = { w: 30, h: 17.0625 - (gen4Gap * 15) / 16 };

    const gen1Gap = 93;

    // Starting positions
    const totalGen1Height = gen1.h * 2 + gen1Gap;
    const startY = (pageHeight - totalGen1Height) / 2;
    const startX = margin + 5;

    // === GENERATION 0 (Subject) ===
    const gen0Nodes = filteredNodes.filter((n) => n.data.generation === 0);
    const gen0Y = startY + (totalGen1Height - gen0.h) / 2;

    if (gen0Nodes.length > 0) {
      const node = gen0Nodes[0];
      await drawPigeonCard(node, startX, gen0Y, gen0.w, gen0.h);
    }

    // === GENERATION 1 (Parents) ===
    const gen1Nodes = filteredNodes
      .filter((n) => n.data.generation === 1)
      .sort((a, b) => {
        if (a.id.includes("father")) return -1;
        return 1;
      });

    const gen1X = startX + gen0.w + cardSpacing;
    const gen1Positions = [];

    for (const [idx, node] of gen1Nodes.entries()) {
      const y = startY + idx * (gen1.h + gen1Gap);
      await drawPigeonCard(node, gen1X, y, gen1.w, gen1.h);
      gen1Positions.push({ y, centerY: y + gen1.h / 2 });

      const subjectCenterY = gen0Y + gen0.h / 2;
      const nodeCenterY = y + gen1.h / 2;
      drawSimpleConnection(
        startX + gen0.w,
        subjectCenterY,
        gen1X,
        nodeCenterY,
        0.3
      );
    }

    // === GENERATION 2 ===
    if (generations === null || generations > 2) {
      const gen2Nodes = filteredNodes.filter((n) => n.data.generation === 2);
      const gen2X = gen1X + gen1.w + cardSpacing;
      const gen2Positions = [];

      for (const [idx, node] of gen2Nodes.entries()) {
        const parentIdx = Math.floor(idx / 2);
        const isSecondChild = idx % 2 === 1;

        if (gen1Positions[parentIdx]) {
          const baseY = startY;
          const cardIndex = parentIdx * 2 + (isSecondChild ? 1 : 0);
          const y = baseY + cardIndex * (gen2.h + gen2Gap);

          await drawPigeonCard(node, gen2X, y, gen2.w, gen2.h);
          gen2Positions.push({ y, centerY: y + gen2.h / 2 });

          const nodeCenterY = y + gen2.h / 2;
          drawSimpleConnection(
            gen1X + gen1.w,
            gen1Positions[parentIdx].centerY,
            gen2X,
            nodeCenterY,
            0.3
          );
        }
      }

      // === GENERATION 3 ===
      if (generations === null || generations > 3) {
        const gen3Nodes = filteredNodes.filter((n) => n.data.generation === 3);
        const gen3X = gen2X + gen2.w + cardSpacing;
        const gen3Positions = [];

        for (const [idx, node] of gen3Nodes.entries()) {
          const gen2ParentIdx = Math.floor(idx / 2);

          if (gen2Positions[gen2ParentIdx]) {
            const baseY = startY;
            const y = baseY + idx * (gen3.h + gen3Gap);

            await drawPigeonCard(node, gen3X, y, gen3.w, gen3.h);
            gen3Positions.push({ y, centerY: y + gen3.h / 2 });

            const nodeCenterY = y + gen3.h / 2;
            drawSimpleConnection(
              gen2X + gen2.w,
              gen2Positions[gen2ParentIdx].centerY,
              gen3X,
              nodeCenterY,
              0.3
            );
          }
        }

        // === GENERATION 4 ===
        if (generations === null || generations > 4) {
          const gen4Nodes = filteredNodes.filter(
            (n) => n.data.generation === 4
          );
          const gen4X = gen3X + gen3.w + cardSpacing;

          for (const [idx, node] of gen4Nodes.entries()) {
            const gen3ParentIdx = Math.floor(idx / 2);

            if (gen3Positions[gen3ParentIdx]) {
              const baseY = startY;
              const y = baseY + idx * (gen4.h + gen4Gap);

              await drawPigeonCard(node, gen4X, y, gen4.w, gen4.h);

              const nodeCenterY = y + gen4.h / 2;
              drawSimpleConnection(
                gen3X + gen3.w,
                gen3Positions[gen3ParentIdx].centerY,
                gen4X,
                nodeCenterY,
                0.3
              );
            }
          }
        }
      }
    }

    // === FOOTER: Breeder Info ===
    const footerY = pageHeight - margin - 8;
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);

    if (pedigreeData?.data?.breeder?.breederName) {
      pdf.text(pedigreeData.data.breeder.breederName, margin, footerY);
    }

    pdf.setFont("helvetica", "normal");
    let footerTextY = footerY + 3.5;

    if (pedigreeData?.data?.breeder?.country) {
      pdf.text(
        `Country: ${pedigreeData.data.breeder.country}`,
        margin,
        footerTextY
      );
      footerTextY += 3.5;
    }
    if (pedigreeData?.data?.breeder?.phone) {
      pdf.text(
        `Phone: ${pedigreeData.data.breeder.phone}`,
        margin,
        footerTextY
      );
    }

    // === BOTTOM CENTER ===
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(55, 183, 195);
    pdf.text(
      "Generated by thepigeonhub.com",
      pageWidth / 2,
      pageHeight - margin + 9,
      { align: "center" }
    );

    // === SAVE PDF ===
    const currentDate = new Date().toISOString().split("T")[0];
    const genText = generations ? `${generations}gen-` : "";
    const filename = `pigeon-pedigree-${genText}${currentDate}.pdf`;
    pdf.save(filename);

    return filename;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Component to use in your app
const PedigreeExportButton = ({
  nodes,
  edges,
  pedigreeData,
  generations = null,
  buttonText = "Export as PDF",
}) => {
  const handleExport = useCallback(async () => {
    try {
      await exportPedigreeToPDF(nodes, edges, pedigreeData, generations);
    } catch (error) {
      alert("Error exporting PDF. Please try again.");
    }
  }, [nodes, edges, pedigreeData, generations]);

  return (
    <button
      onClick={handleExport}
      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {buttonText}
    </button>
  );
};

export default PedigreeExportButton;
