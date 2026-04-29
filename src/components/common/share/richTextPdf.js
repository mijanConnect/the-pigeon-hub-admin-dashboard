// Shared rich-text → jsPDF renderer
// Mirrors the semantics of `RichTextDisplay` (bold/italic + custom lists),
// but renders into a PDF instead of the DOM.

export function renderRichTextToPdf({
    pdf,
    html,
    x,
    y,
    maxWidth,
    /** Max baseline Y (mm). No further lines drawn at or below this value. */
    maxY = null,
    lineHeight = 2.5,
    listIndent = 2.3,
    blockSpacing,
    itemSpacing,
  }) {
    if (!pdf || !html || maxWidth <= 0) return y;
  
    const raw =
      html != null ? String(html).replace(/\\n/g, "\n").trim() : "";
    if (!raw) return y;
  
    let stopRender = false;
    const isPastClip = () => maxY != null && y >= maxY;

    // If no tags, treat as plain text with newlines.
    if (!/<[a-z][\s\S]*>/i.test(raw)) {
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        if (stopRender || isPastClip()) break;
        if (!line) {
          y += lineHeight;
          continue;
        }
        const wrapped = pdf.splitTextToSize(line, maxWidth);
        for (const w of wrapped) {
          if (isPastClip()) {
            stopRender = true;
            break;
          }
          pdf.text(w, x, y);
          y += lineHeight;
        }
      }
      return y;
    }
  
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = raw;
  
    const lh = Number(lineHeight);
    const liIndent = Number(listIndent);
    const blkSpacing =
      blockSpacing !== undefined
        ? Number(blockSpacing)
        : Math.max(1, lh * 0.8);
    const itmSpacing =
      itemSpacing !== undefined
        ? Number(itemSpacing)
        : Math.max(0.3, lh * 0.25);
  
    const drawListMarker = (type, mx, my) => {
      if (type === "arrow") {
        const centerY = my - lh * 0.32;
        const arrowStartX = mx;
        const arrowEndX = mx + Math.max(2.0, lh * 0.56);
        const headDX = Math.max(0.6, lh * 0.22);
        const headDY = Math.max(0.45, lh * 0.18);
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.35);
        pdf.line(arrowStartX, centerY, arrowEndX, centerY);
        pdf.line(arrowEndX - headDX, centerY - headDY, arrowEndX, centerY);
        pdf.line(arrowEndX - headDX, centerY + headDY, arrowEndX, centerY);
        return;
      }
  
      if (type === "stripe") {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.35);
        pdf.line(mx, my - lh * 0.64, mx, my - lh * 0.08);
        return;
      }
  
      pdf.text("•", mx, my);
    };
  
    // ── Inline segment collector ──────────────────────────────────────────────
    // Walks a DOM node and returns a flat array of { text, bold, italic } segments.
    const collectInlineSegments = (node, bold = false, italic = false) => {
      const segments = [];
  
      if (node.nodeType === 3) {
        // Text node – collapse whitespace but keep a single space between words
        const text = node.textContent.replace(/\s+/g, " ");
        if (text) segments.push({ text, bold, italic });
        return segments;
      }
  
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        const isBold   = bold   || tag === "strong" || tag === "b";
        const isItalic = italic || tag === "em"     || tag === "i";
  
        if (tag === "br") {
          segments.push({ text: "\n", bold, italic });
          return segments;
        }
  
        node.childNodes.forEach((child) => {
          segments.push(...collectInlineSegments(child, isBold, isItalic));
        });
      }
  
      return segments;
    };
  
    // ── Render a flat array of inline segments, word-wrapping across the full
    //    availableWidth.  Honours bold/italic font changes mid-line.
    const renderInlineSegments = (segments, offsetX, availableWidth) => {
      if (!segments.length || stopRender || isPastClip()) return;
  
      // Build a list of word tokens: { word, bold, italic }
      // We split on spaces / newlines so we can re-flow them.
      const tokens = [];
      segments.forEach(({ text, bold, italic }) => {
        // Split on explicit newlines first
        const parts = text.split("\n");
        parts.forEach((part, pi) => {
          const words = part.split(" ");
          words.forEach((word, wi) => {
            if (word) tokens.push({ word, bold, italic });
            // Preserve spaces between words as a zero-width glue token
            if (wi < words.length - 1) tokens.push({ word: " ", bold, italic });
          });
          if (pi < parts.length - 1) tokens.push({ word: "\n", bold: false, italic: false });
        });
      });
  
      // Helper: measure a word with the right font
      const measureWord = (token) => {
        const style = token.bold && token.italic
          ? "bolditalic"
          : token.bold
          ? "bold"
          : token.italic
          ? "italic"
          : "normal";
        pdf.setFont("helvetica", style);
        return pdf.getStringUnitWidth(token.word) * pdf.getFontSize() / pdf.internal.scaleFactor;
      };
  
      // Greedy line-wrap
      let lineTokens = [];
      let lineWidth  = 0;
  
      const flushLine = () => {
        if (!lineTokens.length) return;
        if (maxY != null && y >= maxY) {
          stopRender = true;
          lineTokens = [];
          lineWidth = 0;
          return;
        }
        let curX = offsetX;
        // Trim trailing space token
        while (lineTokens.length && lineTokens[lineTokens.length - 1].word === " ") {
          lineTokens.pop();
        }
        lineTokens.forEach((t) => {
          const style = t.bold && t.italic
            ? "bolditalic"
            : t.bold
            ? "bold"
            : t.italic
            ? "italic"
            : "normal";
          pdf.setFont("helvetica", style);
          pdf.text(t.word, curX, y);
          curX += measureWord(t);
        });
        y += lh;
        lineTokens = [];
        lineWidth  = 0;
        // Reset font to normal after each line
        pdf.setFont("helvetica", "normal");
        if (maxY != null && y >= maxY) stopRender = true;
      };
  
      for (const token of tokens) {
        if (stopRender) break;
        if (token.word === "\n") {
          flushLine();
          continue;
        }

        const w = measureWord(token);

        // If adding this token would overflow AND it's not the first token,
        // flush the current line first.
        if (lineWidth + w > availableWidth + 0.01 && lineTokens.length > 0) {
          // Don't start a new line with a space
          if (token.word === " ") continue;
          flushLine();
          if (stopRender) break;
        }

        lineTokens.push(token);
        lineWidth += w;
      }

      if (!stopRender) flushLine();
      pdf.setFont("helvetica", "normal");
    };
  
    // ── Main recursive renderer ───────────────────────────────────────────────
    const renderNode = (node, indent = 0, listType = "disc") => {
      if (stopRender || isPastClip()) return;

      // TEXT NODE at block level (shouldn't normally happen, but handle gracefully)
      if (node.nodeType === 3) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const availableWidth = Math.max(10, maxWidth - indent);
          renderInlineSegments([{ text, bold: false, italic: false }], x + indent, availableWidth);
        }
        return;
      }
  
      // ELEMENT NODE
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
  
        // ── <p> – render inline text OR (if it contains block nodes like <ul>/<ol>) render children
        if (tag === "p") {
          // Some saved HTML can be invalid like: <p><ul>...</ul></p>.
          // If this <p> contains lists, treat it as a block container and render its children
          // so lists keep their formatting instead of being collapsed into plain text.
          if (node.querySelector && node.querySelector("ul,ol")) {
            for (const child of node.childNodes) {
              if (stopRender) break;
              renderNode(child, indent, listType);
            }
            y += blkSpacing;
            if (maxY != null && y >= maxY) stopRender = true;
            return;
          }

          const segments = [];
          node.childNodes.forEach((child) => {
            segments.push(...collectInlineSegments(child));
          });
          // Trim leading/trailing empty space tokens
          const text = segments.map((s) => s.text).join("").trim();
          if (text) {
            const availableWidth = Math.max(10, maxWidth - indent);
            renderInlineSegments(segments, x + indent, availableWidth);
          }
          y += blkSpacing;
          if (maxY != null && y >= maxY) stopRender = true;
          return;
        }
  
        if (tag === "ul") {
          let type = "disc";
          if (node.classList.contains("rich-ul-arrow")) type = "arrow";
          else if (node.classList.contains("rich-ul-stripe")) type = "stripe";
  
          for (const child of node.childNodes) {
            if (stopRender) break;
            renderNode(child, indent + liIndent, type);
          }
          y += blkSpacing;
          if (maxY != null && y >= maxY) stopRender = true;
          return;
        }
  
        if (tag === "li") {
          if (stopRender || isPastClip()) return;
          const symbolX = x + indent;
          let isMarkerDrawn = false;
  
          const renderChildWithMarker = (child) => {
            if (stopRender) return;
            if (child.nodeType === 1 && child.tagName.toLowerCase() === "p") {
              // Collect inline segments from this <p> inside <li>
              const segments = [];
              child.childNodes.forEach((c) => {
                segments.push(...collectInlineSegments(c));
              });
              const text = segments.map((s) => s.text).join("").trim();
              if (text) {
                const availableWidth = Math.max(10, maxWidth - indent - liIndent);
  
                // We need to draw the marker on the FIRST line only.
                // We'll measure how many lines the content wraps to,
                // draw the marker before the first line, then render inline.
                if (!isMarkerDrawn) {
                  if (isPastClip()) return;
                  drawListMarker(listType, symbolX, y);
                  isMarkerDrawn = true;
                }
                renderInlineSegments(segments, x + indent + liIndent, availableWidth);
              }
              y += blkSpacing * 0.5;
              if (maxY != null && y >= maxY) stopRender = true;
            } else {
              renderNode(child, indent + liIndent, listType);
            }
          };
  
          for (const child of node.childNodes) {
            if (stopRender) break;
            renderChildWithMarker(child);
          }
          if (!isMarkerDrawn) {
            if (!isPastClip()) {
              drawListMarker(listType, symbolX, y);
              y += lh + itmSpacing;
            }
          } else {
            y += itmSpacing;
          }
          if (maxY != null && y >= maxY) stopRender = true;
          return;
        }
  
        // ── <strong> / <b> / <em> / <i> at block level (edge case)
        //    Collect inline content and render it directly.
        if (
          tag === "strong" || tag === "b" ||
          tag === "em"     || tag === "i"
        ) {
          const isBold   = tag === "strong" || tag === "b";
          const isItalic = tag === "em"     || tag === "i";
          const segments = [];
          node.childNodes.forEach((child) => {
            segments.push(...collectInlineSegments(child, isBold, isItalic));
          });
          if (segments.length) {
            const availableWidth = Math.max(10, maxWidth - indent);
            renderInlineSegments(segments, x + indent, availableWidth);
          }
          return;
        }
  
        if (tag === "br") {
          y += lh;
          return;
        }
  
        // Default: traverse children
        node.childNodes.forEach((child) =>
          renderNode(child, indent, listType)
        );
      }
    };
  
    tempDiv.childNodes.forEach((node) => renderNode(node));
    return y;
  }