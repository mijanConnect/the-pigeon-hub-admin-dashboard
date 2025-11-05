import jsPDF from "jspdf";
import { useCallback } from "react";

// Helper function to load image as base64
const loadImageAsBase64 = async (url, isCircular = false) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (isCircular) {
        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      // Draw image (centered if dimensions differ)
      const offsetX = (size - img.width) / 2;
      const offsetY = (size - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

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
  data,
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
      const getImageUrl = (path) => {
        if (path?.startsWith("http://") || path?.startsWith("https://")) {
          return path;
        } else {
          const baseUrl = "https://ftp.thepigeonhub.com";
          // const baseUrl = "http://10.10.7.41:5001";
          // const baseUrl = baseUrlApi;
          return `${baseUrl}/${path?.replace(/^\/+/, "")}`; // Remove leading slashes
        }
      };

      // Load logo from pedigreeData if available, otherwise use default
      const profilePath = data?.profile || "/assests/logo.png";
      const logoUrl = getImageUrl(profilePath);
      logoImage = await loadImageAsBase64(logoUrl, true); // true for circular

      letterBImage = await loadImageAsBase64("/assets/Letter-B.png");
      letterPImage = await loadImageAsBase64("/assets/Letter-P.png");
      goldCupImage = await loadImageAsBase64("/assets/Gold-cup.png");
      cockImage = await loadImageAsBase64("/assets/cock.png");
      goldTrophyImage = await loadImageAsBase64("/assets/Gold-tropy.png");
      henImage = await loadImageAsBase64("/assets/hen.png");
      unspecifiedImage = await loadImageAsBase64("/assets/unspeficic.png");
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

    // Helper: Draw connection line from subject to parents
    const drawConnectionFromSubject = (
      subjectX,
      subjectY,
      targetX,
      targetY,
      isTop,
      lineWidth = 0.3
    ) => {
      pdf.setDrawColor(55, 183, 195);
      pdf.setLineWidth(lineWidth);

      // Horizontal line from subject center
      const startX = subjectX;
      const startY = isTop ? subjectY : subjectY;

      // Create smooth step connection
      const midX = (startX + targetX) / 2;

      pdf.line(startX, startY, midX, startY);
      pdf.line(midX, startY, midX, targetY);
      pdf.line(midX, targetY, targetX, targetY);
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

    // Collect borders to draw at the end so borders render on top of everything
    const bordersToDraw = [];

    // Helper: Draw pigeon card
    const drawPigeonCard = async (node, x, y, width, height) => {
      const data = node.data;

      // Set background color and border color
      const bgColor = data.isEmpty ? "#FFFFFF" : data.color || "#FFFFFF";
      const rgb = hexToRgb(bgColor);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(x, y, width, height, "F");
      // Defer drawing borders until the very end so borders appear above lines/other elements
      bordersToDraw.push({ x, y, width, height });

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
              pdf.addImage(flagImage, "PNG", headerX, currentY - 2.5, 3.5, 2.5);
              headerX += 4.5;
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
        pdf.addImage(henImage, "PNG", rightX, currentY - 2.2, 2.7, 2.4);
        rightX += iconWidth + iconSpacing;
      } else if (data.gender === "Unspecified") {
        pdf.addImage(unspecifiedImage, "PNG", rightX, currentY - 2.5, 2.5, 2.5);
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
        const ownerText = String(data.owner);

        // Split into lines that fit the content width so the owner name doesn't overflow
        const ownerLines = pdf.splitTextToSize(ownerText, contentWidth);
        const firstLine = ownerLines.length > 0 ? ownerLines[0] : "";

        // Draw first line
        pdf.text(firstLine, leftMargin, currentY);

        // Breeder verified badge: try to render inline after the first line if there's space,
        // otherwise render on the next line at the left margin.
        if (data.breederVerified && letterBImage) {
          const firstLineWidth = pdf.getTextWidth(firstLine);
          const badgeWidth = 3; // px/mm set above when adding image
          const gap = 1;
          if (firstLineWidth + gap + badgeWidth < contentWidth) {
            // place inline
            pdf.addImage(
              letterBImage,
              "PNG",
              leftMargin + firstLineWidth + gap,
              currentY - 2.5,
              badgeWidth,
              badgeWidth
            );
          } else {
            // place on the next line
            pdf.addImage(
              letterBImage,
              "PNG",
              leftMargin,
              currentY + 3 - 2.5,
              badgeWidth,
              badgeWidth
            );
          }
        }

        // Draw any remaining wrapped lines beneath the first
        for (let i = 1; i < ownerLines.length; i++) {
          currentY += 3; // line height similar to addWrappedText
          pdf.text(ownerLines[i], leftMargin, currentY);
        }

        // Advance currentY to leave a small gap after owner block
        currentY += 4;
      }

      // === DESCRIPTION ===
      if (data.description && height > 40 && currentY < y + height - 15) {
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
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
        pdf.setTextColor(0, 0, 0);
        currentY = addWrappedText(
          data.colorName,
          leftMargin,
          currentY,
          contentWidth,
          3,
          1
        );
        // currentY += 1;
      }

      // === ACHIEVEMENTS ===
      if (data.achievements && currentY < y + height - 8) {
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        // let achievementsX = leftMargin;

        // pdf.text("Results:", achievementsX, currentY);

        // if (goldTrophyImage) {
        //   const textWidth = pdf.getTextWidth("Results:");
        //   const imageX = achievementsX + textWidth + 2;
        //   pdf.addImage(goldTrophyImage, "PNG", imageX, currentY - 2.5, 3, 3);
        // }

        // currentY += 3;

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
    const cardSpacing = generations === 4 ? 7 : generations === 5 ? 5 : 4;

    const cardWidth = generations === 4 ? 40 : 35;

    const gen0 = { w: cardWidth, h: 90 };
    const gen1 = { w: cardWidth, h: 88 };

    const gen2Gap = 3;
    const gen2 = { w: cardWidth, h: 68.25 - (gen2Gap * 3) / 4 };

    const gen3Gap = 3;
    const gen3 = { w: cardWidth, h: 34.125 - (gen3Gap * 7) / 8 };

    const gen4Gap = 2;
    const gen4 = { w: cardWidth, h: 17.0625 - (gen4Gap * 15) / 16 };

    const gen1Gap = 97;

    // Starting positions
    const totalGen1Height = gen1.h * 2 + gen1Gap;
    const startY = (pageHeight - totalGen1Height) / 2;
    const startX = margin + 5;

    const gen0Nodes = filteredNodes.filter((n) => n.data.generation === 0);
    const gen0Y = startY + (totalGen1Height - gen0.h) / 2;

    // We'll compute positions first and draw connections first so lines are under cards.
    const gen0Positions = [];
    if (gen0Nodes.length > 0) {
      const node = gen0Nodes[0];
      gen0Positions.push({
        node,
        x: startX,
        y: gen0Y,
        w: gen0.w,
        h: gen0.h,
        centerX: startX + gen0.w / 2,
        centerY: gen0Y + gen0.h / 2,
      });
    }

    const gen0CenterX = startX + gen0.w / 2;

    // === GENERATION 1 (Parents) ===
    const gen1Nodes = filteredNodes
      .filter((n) => n.data.generation === 1)
      .sort((a, b) => {
        if (a.id.includes("father")) return -1;
        return 1;
      });

    const gen1X = startX + gen0.w - 15 + cardSpacing;
    const gen1Positions = [];

    // First pass: compute positions and draw connections (lines)
    for (const [idx, node] of gen1Nodes.entries()) {
      const y = startY + idx * (gen1.h + gen1Gap);
      const nodeCenterY = y + gen1.h / 2;
      gen1Positions.push({
        node,
        x: gen1X,
        y,
        w: gen1.w,
        h: gen1.h,
        centerY: nodeCenterY,
      });

      // Connect from subject to parent (draw lines now so they'll be behind cards)
      if (idx === 0) {
        // Father - connect from top of subject
        const subjectTopY = gen0Y;
        drawConnectionFromSubject(
          gen0CenterX,
          subjectTopY,
          gen1X,
          nodeCenterY,
          true,
          0.3
        );
      } else {
        // Mother - connect from bottom of subject
        const subjectBottomY = gen0Y + gen0.h;
        drawConnectionFromSubject(
          gen0CenterX,
          subjectBottomY,
          gen1X,
          nodeCenterY,
          false,
          0.3
        );
      }
    }

    // After drawing connections, draw subject and parent cards so cards render on top of lines
    // Draw subject (gen0) card(s)
    for (const pos of gen0Positions) {
      await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
    }

    // Draw gen1 cards
    for (const pos of gen1Positions) {
      await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
    }

    // === GENERATION 2 ===
    if (generations === null || generations > 2) {
      const gen2Nodes = filteredNodes.filter((n) => n.data.generation === 2);
      const gen2X = gen1X + gen1.w + cardSpacing;
      const gen2Positions = [];

      // First pass: compute positions and draw connections for gen2
      for (const [idx, node] of gen2Nodes.entries()) {
        const parentIdx = Math.floor(idx / 2);
        const isSecondChild = idx % 2 === 1;

        if (gen1Positions[parentIdx]) {
          const baseY = startY;
          const cardIndex = parentIdx * 2 + (isSecondChild ? 1 : 0);
          const y = baseY + cardIndex * (gen2.h + gen2Gap);

          gen2Positions.push({
            node,
            x: gen2X,
            y,
            w: gen2.w,
            h: gen2.h,
            centerY: y + gen2.h / 2,
          });

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

      // Draw gen2 cards after connections
      for (const pos of gen2Positions) {
        await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
      }

      // === GENERATION 3 ===
      if (generations === null || generations > 3) {
        const gen3Nodes = filteredNodes.filter((n) => n.data.generation === 3);
        const gen3X = gen2X + gen2.w + cardSpacing;
        const gen3Positions = [];

        // First pass: compute positions and draw connections for gen3 (parent-based positioning to avoid overlap)
        for (const [idx, node] of gen3Nodes.entries()) {
          const gen2ParentIdx = Math.floor(idx / 2);
          const isSecondChild = idx % 2 === 1;

          if (gen2Positions[gen2ParentIdx]) {
            const baseY = startY;
            // Position relative to parent grouping (each parent produces two children)
            const cardIndex = gen2ParentIdx * 2 + (isSecondChild ? 1 : 0);
            const y = baseY + cardIndex * (gen3.h + gen3Gap);

            gen3Positions.push({
              node,
              x: gen3X,
              y,
              w: gen3.w,
              h: gen3.h,
              centerY: y + gen3.h / 2,
            });

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

        // Draw gen3 cards after connections
        for (const pos of gen3Positions) {
          await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
        }

        // === GENERATION 4 ===
        if (generations === null || generations > 4) {
          const gen4Nodes = filteredNodes.filter(
            (n) => n.data.generation === 4
          );
          const gen4X = gen3X + gen3.w + cardSpacing;

          // First pass: compute positions and draw connections for gen4 (parent-based positioning)
          for (const [idx, node] of gen4Nodes.entries()) {
            const gen3ParentIdx = Math.floor(idx / 2);
            const isSecondChild = idx % 2 === 1;

            if (gen3Positions[gen3ParentIdx]) {
              const baseY = startY;
              const cardIndex = gen3ParentIdx * 2 + (isSecondChild ? 1 : 0);
              const y = baseY + cardIndex * (gen4.h + gen4Gap);

              // store position
              const pos = {
                node,
                x: gen4X,
                y,
                w: gen4.w,
                h: gen4.h,
                centerY: y + gen4.h / 2,
              };
              // draw connection
              drawSimpleConnection(
                gen3X + gen3.w,
                gen3Positions[gen3ParentIdx].centerY,
                gen4X,
                pos.centerY,
                0.3
              );

              // draw card after connections (to keep cards above lines)
              await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
            }
          }
        }
      }
    }

    // === FOOTER: Breeder Info ===
    const footerY = pageHeight - margin - 10;
    pdf.setFontSize(5.8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);

    if (data?.name) {
      // Wrap breeder name in footer so it doesn't overflow horizontally
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(5.8);
      const maxFooterWidth = pageWidth - margin * 2;
      // Allow up to 2 lines for the breeder name in the footer
      const nameEndY = addWrappedText(
        String(data.name),
        margin,
        footerY,
        maxFooterWidth,
        3.5,
        2
      );
      // Position subsequent footer text just below the wrapped name (or the original footerY + 3.5)
      var footerTextY = Math.max(nameEndY + 1, footerY + 3.5);
      // Reset font to normal for the rest of footer
      pdf.setFont("helvetica", "normal");
    } else {
      pdf.setFont("helvetica", "normal");
      var footerTextY = footerY + 3.5;
    }

    if (data?.contact) {
      pdf.text(` ${data.contact}`, margin, footerTextY);
      footerTextY += 3.5;
    }
    if (data?.email) {
      pdf.text(`${data.email}`, margin, footerTextY);
    }

    // === BOTTOM CENTER ===
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");

    const text1 = "Generated by ";
    const text2 = "ThePigeonHub.Com";
    const marginY = pageHeight - margin + 9;

    // Measure text width to align both parts properly
    const text1Width = pdf.getTextWidth(text1);
    const totalWidth = pdf.getTextWidth(text1 + text2);
    const startZ = (pageWidth - totalWidth) / 2;

    // First part: teal color
    pdf.setTextColor(55, 183, 195);
    pdf.text(text1, startZ, marginY);

    // Second part: black color, right after the first part
    pdf.setTextColor(0, 0, 0);
    pdf.text(text2, startZ + text1Width, marginY);

    // === DRAW CARD BORDERS LAST ===
    // Draw borders for all pigeon cards so borders are on top of connection lines / other elements
    try {
      for (const b of bordersToDraw) {
        // Top and left - thinner
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.line(b.x, b.y, b.x + b.width, b.y); // top
        pdf.line(b.x, b.y, b.x, b.y + b.height); // left

        // Right and bottom - thicker
        pdf.setLineWidth(1.2);
        pdf.line(b.x + b.width, b.y, b.x + b.width, b.y + b.height); // right
        pdf.line(b.x, b.y + b.height, b.x + b.width, b.y + b.height); // bottom
      }
    } catch (err) {
      // If border drawing fails for any reason, continue to saving the PDF
      console.error("Error drawing borders:", err);
    }

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
  buttonText = "Export to PDF",
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
          d="M4 16v1a3 3 0 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {buttonText}
    </button>
  );
};

export default PedigreeExportButton;
