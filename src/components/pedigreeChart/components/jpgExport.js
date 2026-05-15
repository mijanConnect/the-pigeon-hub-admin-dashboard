// import { baseUrlApi } from "@/redux/baseUrl/baseUrlApi";
import { getCode } from "country-list";
import { renderRichTextToPdf } from "../../common/share/richTextPdf";
// import { renderRichTextToPdf } from "@/lib/richTextPdf";

// ---------------------------------------------------------------------------
// Canvas-based adapter that mimics the subset of jsPDF API used by
// `pdfExport.js` / `richTextPdf.js`. All coordinates are in millimetres (mm)
// just like jsPDF so we can reuse the EXACT SAME drawing logic used for PDF.
// ---------------------------------------------------------------------------
const createCanvasPdf = ({
  pageWidthMm = 210, // A4 portrait width
  pageHeightMm = 297, // A4 portrait height
  pxPerMm = 10, // ~254 DPI – plenty of resolution for a JPG
  background = "#FFFFFF",
} = {}) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pageWidthMm * pxPerMm);
  canvas.height = Math.round(pageHeightMm * pxPerMm);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const state = {
    fillColor: "#000000",
    drawColor: "#000000",
    textColor: "#000000",
    lineWidthMm: 0.2,
    fontSizePt: 10,
    fontStyle: "normal",
    fontFamily: "helvetica",
  };

  const toPx = (mm) => mm * pxPerMm;
  const fontSizePx = () => state.fontSizePt * (25.4 / 72) * pxPerMm;

  const applyFont = () => {
    let style = "";
    if (state.fontStyle === "bold") style = "bold ";
    else if (state.fontStyle === "italic") style = "italic ";
    else if (state.fontStyle === "bolditalic") style = "italic bold ";
    const family =
      state.fontFamily === "helvetica"
        ? "Helvetica, Arial, sans-serif"
        : state.fontFamily;
    ctx.font = `${style}${fontSizePx()}px ${family}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  };
  applyFont();

  const rgbToCss = (r, g, b) => `rgb(${r}, ${g}, ${b})`;

  // Pending image draw operations – images are decoded/drawn during flush()
  // because decoding an HTMLImageElement is async.
  const pendingImages = [];

  const pdf = {
    __canvas: canvas,
    __ctx: ctx,

    internal: {
      scaleFactor: 1,
      pageSize: {
        getWidth: () => pageWidthMm,
        getHeight: () => pageHeightMm,
      },
    },

    setDrawColor: (r, g, b) => {
      state.drawColor = rgbToCss(r, g, b);
    },
    setFillColor: (r, g, b) => {
      state.fillColor = rgbToCss(r, g, b);
    },
    setTextColor: (r, g, b) => {
      state.textColor = rgbToCss(r, g, b);
    },
    setLineWidth: (w) => {
      state.lineWidthMm = w;
    },
    setFont: (family, style = "normal") => {
      state.fontFamily = family || "helvetica";
      state.fontStyle = style || "normal";
      applyFont();
    },
    setFontSize: (size) => {
      state.fontSizePt = size;
      applyFont();
    },

    // We normalise `getStringUnitWidth` so that the formula used by
    // `richTextPdf.js` – (unitWidth * fontSize / scaleFactor) – collapses
    // to the real mm-width of the string: since getFontSize / scaleFactor
    // are both 1 in this adapter, getStringUnitWidth itself returns mm-width.
    getFontSize: () => 1,
    getStringUnitWidth: (str) =>
      ctx.measureText(String(str)).width / pxPerMm,
    getTextWidth: (str) =>
      ctx.measureText(String(str)).width / pxPerMm,

    splitTextToSize: (text, maxWidthMm) => {
      const maxWidthPx = maxWidthMm * pxPerMm;
      const str = String(text == null ? "" : text);
      const paragraphs = str.split(/\r?\n/);
      const result = [];
      paragraphs.forEach((p) => {
        if (!p) {
          result.push("");
          return;
        }
        const words = p.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
          result.push("");
          return;
        }
        let line = "";
        words.forEach((word) => {
          const trial = line ? line + " " + word : word;
          if (ctx.measureText(trial).width <= maxWidthPx || !line) {
            line = trial;
          } else {
            result.push(line);
            line = word;
          }
        });
        if (line) result.push(line);
      });
      return result;
    },

    text: (str, xMm, yMm) => {
      ctx.fillStyle = state.textColor;
      ctx.fillText(String(str), toPx(xMm), toPx(yMm));
    },

    rect: (xMm, yMm, wMm, hMm, style) => {
      const x = toPx(xMm);
      const y = toPx(yMm);
      const w = toPx(wMm);
      const h = toPx(hMm);
      if (style === "F" || style === "FD" || style === "DF") {
        ctx.fillStyle = state.fillColor;
        ctx.fillRect(x, y, w, h);
      }
      if (style === "S" || style === "FD" || style === "DF" || !style) {
        if (style !== "F") {
          ctx.strokeStyle = state.drawColor;
          ctx.lineWidth = toPx(state.lineWidthMm);
          ctx.strokeRect(x, y, w, h);
        }
      }
    },

    line: (x1Mm, y1Mm, x2Mm, y2Mm) => {
      ctx.strokeStyle = state.drawColor;
      ctx.lineWidth = Math.max(1, toPx(state.lineWidthMm));
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(toPx(x1Mm), toPx(y1Mm));
      ctx.lineTo(toPx(x2Mm), toPx(y2Mm));
      ctx.stroke();
    },

    addImage: (imgData, _format, xMm, yMm, wMm, hMm) => {
      if (!imgData) return;
      pendingImages.push({
        dataUrl: imgData,
        x: toPx(xMm),
        y: toPx(yMm),
        w: toPx(wMm),
        h: toPx(hMm),
      });
    },

    // Resolves all queued image operations in insertion order, then triggers
    // a JPG download.
    save: async (filename) => {
      for (const p of pendingImages) {
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              ctx.drawImage(img, p.x, p.y, p.w, p.h);
            } catch (err) {
              console.error("drawImage failed", err);
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = p.dataUrl;
        });
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename || "pigeon-pedigree.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };

  return pdf;
};

// Helper function to load image as base64 with compression and transparent background
const loadImageAsBase64 = async (url, isCircular = false) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const c = canvas.getContext("2d");

      if (isCircular) {
        c.beginPath();
        c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        c.closePath();
        c.clip();
      }

      const offsetX = (size - img.width) / 2;
      const offsetY = (size - img.height) / 2;
      c.drawImage(img, offsetX, offsetY, img.width, img.height);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      console.error("Failed to load image:", url);
      resolve(null);
    };
    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// Main JPG export function. Mirrors `exportPedigreeToPDF` 1-to-1 – same card
// positions, fonts, line widths, connection routing, etc. – but renders to an
// HTMLCanvasElement via the adapter above and downloads the canvas as a JPG.
// ---------------------------------------------------------------------------
export const exportPedigreeToJPG = async (
  nodes,
  edges,
  pedigreeData,
  profileData,
  generations = null
) => {
  try {
    const pdf = createCanvasPdf({
      pageWidthMm: 210,
      pageHeightMm: 297,
      pxPerMm: 10,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // Load images with compression
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
          const baseUrl = import.meta.env.VITE_ASSET_BASE_URL;
          return `${baseUrl}/${path?.replace(/^\/+/, "")}`;
        }
      };

      const profilePath = profileData?.profile || "/assests/logo.png";
      const logoUrl = getImageUrl(profilePath);
      logoImage = await loadImageAsBase64(logoUrl, true, 80);

      letterBImage = await loadImageAsBase64(
        "/assests/Letter-B.png",
        false,
        30
      );
      letterPImage = await loadImageAsBase64(
        "/assests/Letter-P.png",
        false,
        30
      );
      goldCupImage = await loadImageAsBase64(
        "/assests/Gold-tropy.png",
        false,
        30
      );
      cockImage = await loadImageAsBase64("/assests/cock.png", false, 30);
      goldTrophyImage = await loadImageAsBase64(
        "/assests/Gold-tropy.png",
        false,
        30
      );
      henImage = await loadImageAsBase64("/assests/hen.jpg", false, 30);
      unspecifiedImage = await loadImageAsBase64(
        "/assests/unspefied.png",
        false,
        30
      );
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

    const loadCountryFlag = async (countryNameOrCode) => {
      try {
        if (!countryNameOrCode) return null;
        let code = null;
        if (typeof countryNameOrCode === "string") {
          const trimmed = countryNameOrCode.trim();
          if (trimmed.length === 2) {
            code = trimmed;
          } else {
            code = getCode(trimmed) || null;
          }
        }

        if (!code && typeof countryNameOrCode === "string") {
          code = countryNameOrCode.substring(0, 2);
        }

        if (!code) return null;

        const flagUrl = `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
        return await loadImageAsBase64(flagUrl);
      } catch (error) {
        console.error("Error loading flag:", error);
        return null;
      }
    };

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

      const startX = subjectX;
      const startY = isTop ? subjectY : subjectY;
      const midX = (startX + targetX) / 2;

      pdf.line(startX, startY, midX, startY);
      pdf.line(midX, startY, midX, targetY);
      pdf.line(midX, targetY, targetX, targetY);
    };

    const drawSimpleConnection = (x1, y1, x2, y2, lineWidth = 0.1) => {
      pdf.setDrawColor(55, 183, 195);
      pdf.setLineWidth(lineWidth);

      const midX = (x1 + x2) / 2;

      pdf.line(x1, y1, midX, y1);
      pdf.line(midX, y1, midX, y2);
      pdf.line(midX, y2, x2, y2);
    };

    // Optional yMax (mm) keeps wrapped text inside the card bottom (same idea as ExportPDF.jsx).
    const addWrappedText = (
      text,
      x,
      y,
      maxWidth,
      lineHeight = 3.5,
      maxLines = null,
      yMax = null
    ) => {
      const normalizedText = String(text).replace(/ {1,}/g, " ").trim();
      if (!normalizedText) return y;
      const lines = pdf.splitTextToSize(normalizedText, maxWidth);
      const linesToShow =
        maxLines != null ? lines.slice(0, maxLines) : lines;
      const bottomLimit = yMax != null ? yMax : pageHeight - margin;
      let curY = y;
      for (const line of linesToShow) {
        if (curY >= bottomLimit) break;
        pdf.text(line, x, curY);
        curY += lineHeight;
      }
      return curY;
    };

    const bordersToDraw = [];

    const drawPigeonCard = async (node, x, y, width, height) => {
      const data = node.data;

      const bgColor = data.isEmpty ? "#FFFFFF" : data.color || "#FFFFFF";
      const rgb = hexToRgb(bgColor);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(x, y, width, height, "F");

      bordersToDraw.push({ x, y, width, height });

      const cardBottom = y + height - 1.5;

      // let currentY = y + 4;
      // const leftMargin = x + 2;
      // const contentWidth = width - 4;
      let currentY = y + 4;
      const horizontalPadding = 1.3;
      const leftMargin = x + horizontalPadding;
      const contentWidth = width - horizontalPadding * 2;

      // === HEADER ROW ===
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      let headerX = leftMargin;

      if (data.country) {
        try {
          const flagImage = await loadCountryFlag(data.country);
          if (flagImage) {
            pdf.addImage(flagImage, "PNG", headerX, currentY - 2.5, 3.5, 2.5);
            headerX += 4.5;
          }
        } catch (error) {
          console.error("Flag load error:", error);
        }
      }

      if (data.birthYear) {
        const yearText = String(data.birthYear).slice(-2);
        pdf.text(yearText, headerX, currentY);
        headerX += pdf.getTextWidth(yearText) + 1;
      }

      if (data.ringNumber) {
        pdf.setTextColor(195, 55, 57);
        pdf.setFont("helvetica");
        pdf.text(String(data.ringNumber), headerX, currentY);
      }

      const iconWidth = 3;
      const iconSpacing = 0.5;
      let totalRightWidth = 0;

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

      let rightX = x + width - horizontalPadding - totalRightWidth;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      if (data.gender === "Cock") {
        pdf.addImage(cockImage, "PNG", rightX, currentY - 2.5, 2.5, 2.5);
        rightX += iconWidth + iconSpacing;
      } else if (data.gender === "Hen") {
        pdf.addImage(henImage, "PNG", rightX, currentY - 2.2, 2.7, 2.4);
        rightX += iconWidth + iconSpacing;
      } else if (data.gender === "Unspecified") {
        pdf.addImage(
          unspecifiedImage,
          "PNG",
          rightX,
          currentY - 2.5,
          2.5,
          2.5
        );
        rightX += iconWidth + iconSpacing;
      }

      if (data.verified && letterPImage) {
        pdf.addImage(letterPImage, "PNG", rightX, currentY - 2.5, 3, 3);
        rightX += iconWidth + iconSpacing;
      }

      if (data.iconic && goldCupImage) {
        rightX += 0.8;
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
          nameLines,
          cardBottom
        );
        currentY += 1;
      }

      // === OWNER ===
      if (data.owner && currentY < cardBottom) {
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        const ownerText = String(data.owner);

        const ownerLines = pdf.splitTextToSize(ownerText, contentWidth);
        const firstLine = ownerLines.length > 0 ? ownerLines[0] : "";

        if (currentY < cardBottom) {
          pdf.text(firstLine, leftMargin, currentY);
        }

        if (data.breederVerified && letterBImage) {
          const firstLineWidth = pdf.getTextWidth(firstLine);
          const badgeWidth = 3;
          const gap = 1;
          if (firstLineWidth + gap + badgeWidth < contentWidth) {
            pdf.addImage(
              letterBImage,
              "PNG",
              leftMargin + firstLineWidth + gap,
              currentY - 2.5,
              badgeWidth,
              badgeWidth
            );
          } else if (currentY + 3 < cardBottom) {
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

        for (let i = 1; i < ownerLines.length; i++) {
          if (currentY + 3 >= cardBottom) break;
          currentY += 3;
          pdf.text(ownerLines[i], leftMargin, currentY);
        }

        currentY += 3;
      }

      // === COLOR NAME ===
      if (data.colorName && currentY < cardBottom - 8) {
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        currentY = addWrappedText(
          data.colorName,
          leftMargin,
          currentY,
          contentWidth,
          3,
          1,
          cardBottom
        );
        currentY += 0;
      }

      const availableSpace = Math.max(0, cardBottom - currentY - 3);

      const descriptionText =
        typeof data?.description === "string"
          ? data.description
          : data?.description == null
          ? ""
          : String(data.description);
      const hasDescription =
        descriptionText && descriptionText.trim().length > 0;

      let achievementsText = "";
      if (Array.isArray(data?.achievements)) {
        achievementsText = data.achievements
          .map((item) => (item == null ? "" : String(item)))
          .join("\n");
      } else if (data?.achievements != null) {
        achievementsText = String(data.achievements);
      }
      const hasAchievements =
        achievementsText && achievementsText.trim().length > 0;

      // === DESCRIPTION ===
      if (hasDescription && availableSpace > 10) {
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        const descriptionSpace = hasAchievements
          ? availableSpace * 0.5
          : Math.max(0, availableSpace - 5);
        const descMaxY = Math.min(currentY + descriptionSpace, cardBottom);

        if (descriptionSpace > 0 && descMaxY > currentY + 1) {
          if (/<[a-z][\s\S]*>/i.test(descriptionText)) {
            currentY = renderRichTextToPdf({
              pdf,
              html: descriptionText,
              x: leftMargin,
              y: currentY,
              maxWidth: contentWidth,
              maxY: descMaxY,
              lineHeight: 2,
              blockSpacing: 1.2,
              itemSpacing: 0.7,
              listIndent: 2.2,
            });
          } else {
            const maxDescLines = Math.floor(descriptionSpace / 3);
            if (maxDescLines > 0) {
              const normalizedDescription = descriptionText
                .replace(/[ \t]+/g, " ")
                .trim();

              currentY = addWrappedText(
                normalizedDescription,
                leftMargin,
                currentY,
                contentWidth,
                3,
                maxDescLines,
                descMaxY
              );
            }
          }
        }
      }

      // === ACHIEVEMENTS ===
      if (hasAchievements) {
        const remainingSpace = cardBottom - currentY - 2;

        if (remainingSpace > 2) {
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);

          if (/<[a-z][\s\S]*>/i.test(achievementsText)) {
            currentY = renderRichTextToPdf({
              pdf,
              html: achievementsText,
              x: leftMargin,
              y: currentY,
              maxWidth: contentWidth,
              maxY: cardBottom,
              lineHeight: 2.2,
              blockSpacing: 1.0,
              itemSpacing: 0.6,
              listIndent: 2.2,
            });
          } else {
            const maxAchvLines = Math.floor(remainingSpace / 2.5);
            if (maxAchvLines > 0) {
              const normalizedAchievements = achievementsText
                .replace(/[ \t]+/g, " ")
                .trim();

              currentY = addWrappedText(
                normalizedAchievements,
                leftMargin,
                currentY,
                contentWidth,
                2.5,
                maxAchvLines,
                cardBottom
              );
            }
          }
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

    const totalGen1Height = gen1.h * 2 + gen1Gap;
    const startY = (pageHeight - totalGen1Height) / 2;
    const startX = margin + 5;

    const gen0Nodes = filteredNodes.filter((n) => n.data.generation === 0);
    const gen0Y = startY + (totalGen1Height - gen0.h) / 2;

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

      if (idx === 0) {
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

    for (const pos of gen0Positions) {
      await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
    }

    for (const pos of gen1Positions) {
      await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
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

      for (const pos of gen2Positions) {
        await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
      }

      // === GENERATION 3 ===
      if (generations === null || generations > 3) {
        const gen3Nodes = filteredNodes.filter((n) => n.data.generation === 3);
        const gen3X = gen2X + gen2.w + cardSpacing;
        const gen3Positions = [];

        for (const [idx, node] of gen3Nodes.entries()) {
          const gen2ParentIdx = Math.floor(idx / 2);
          const isSecondChild = idx % 2 === 1;

          if (gen2Positions[gen2ParentIdx]) {
            const baseY = startY;
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

        for (const pos of gen3Positions) {
          await drawPigeonCard(pos.node, pos.x, pos.y, pos.w, pos.h);
        }

        // === GENERATION 4 ===
        if (generations === null || generations > 4) {
          const gen4Nodes = filteredNodes.filter(
            (n) => n.data.generation === 4
          );
          const gen4X = gen3X + gen3.w + cardSpacing;

          for (const [idx, node] of gen4Nodes.entries()) {
            const gen3ParentIdx = Math.floor(idx / 2);
            const isSecondChild = idx % 2 === 1;

            if (gen3Positions[gen3ParentIdx]) {
              const baseY = startY;
              const cardIndex = gen3ParentIdx * 2 + (isSecondChild ? 1 : 0);
              const y = baseY + cardIndex * (gen4.h + gen4Gap);

              const pos = {
                node,
                x: gen4X,
                y,
                w: gen4.w,
                h: gen4.h,
                centerY: y + gen4.h / 2,
              };

              drawSimpleConnection(
                gen3X + gen3.w,
                gen3Positions[gen3ParentIdx].centerY,
                gen4X,
                pos.centerY,
                0.3
              );

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

    if (profileData?.name) {
      pdf.text(profileData.name, margin, footerY);
    }

    pdf.setFont("helvetica", "normal");
    let footerTextY = footerY + 3.5;

    if (profileData?.contact) {
      pdf.text(`${profileData.contact}`, margin, footerTextY);
      footerTextY += 3.5;
    }
    if (profileData?.email) {
      pdf.text(`${profileData.email}`, margin, footerTextY);
    }

    // === BOTTOM CENTER ===
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");

    const text1 = "Generated by ";
    const text2 = "ThePigeonHub.Com";
    const marginY = pageHeight - margin + 9;

    const text1Width = pdf.getTextWidth(text1);
    const totalWidth = pdf.getTextWidth(text1 + text2);
    const startZ = (pageWidth - totalWidth) / 2;

    pdf.setTextColor(55, 183, 195);
    pdf.text(text1, startZ, marginY);

    pdf.setTextColor(0, 0, 0);
    pdf.text(text2, startZ + text1Width, marginY);

    // === DRAW CARD BORDERS LAST ===
    try {
      for (const b of bordersToDraw) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.line(b.x, b.y, b.x + b.width, b.y);
        pdf.line(b.x, b.y, b.x, b.y + b.height);

        pdf.setLineWidth(1.2);
        pdf.line(b.x + b.width, b.y, b.x + b.width, b.y + b.height);
        pdf.line(b.x, b.y + b.height, b.x + b.width, b.y + b.height);
      }
    } catch (err) {
      console.error("Error drawing borders:", err);
    }

    // === FILENAME (same convention as PDF export) ===
    let filename = "pigeon-pedigree.jpg";

    const gen0Node = filteredNodes.find((n) => n.data.generation === 0);
    if (gen0Node && gen0Node.data) {
      const pigeonData = gen0Node.data;

      let countryCode = "";
      if (pigeonData.country) {
        const trimmed = pigeonData.country.trim();
        if (trimmed.length === 2) {
          countryCode = trimmed.toUpperCase();
        } else {
          const code = getCode(trimmed);
          countryCode = code
            ? code.toUpperCase()
            : trimmed.substring(0, 2).toUpperCase();
        }
      }

      const ringNumber = pigeonData.ringNumber || "";
      const birthYear = pigeonData.birthYear || "";
      const name = pigeonData.name
        ? pigeonData.name.replace(/[^a-zA-Z0-9]/g, "-")
        : "";

      const parts = [countryCode, ringNumber, birthYear, name].filter(Boolean);

      if (parts.length > 0) {
        filename = `${parts.join("-")}.jpg`;
      }
    }

    await pdf.save(filename);

    return filename;
  } catch (error) {
    console.error("Error generating JPG:", error);
    throw error;
  }
};

export default exportPedigreeToJPG;
