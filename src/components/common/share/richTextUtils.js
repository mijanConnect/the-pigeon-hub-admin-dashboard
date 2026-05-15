/**
 * Helpers for Story Line (shortInfo) and Pigeon Results (addresults) HTML storage.
 */

export function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  export function stripHtmlToText(html) {
    if (html == null || html === "") return "";
    const s = String(html).trim();
    if (!s.includes("<")) return s.replace(/\\n/g, "\n");
    if (typeof document === "undefined") {
      return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    const doc = new DOMParser().parseFromString(`<div>${s}</div>`, "text/html");
    return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim();
  }
  
  export function sanitizeRichHtml(html) {
    if (!html) return "";
    return String(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  }
  
  export function addresultsArrayToHtml(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
    return arr
      .map((line) => {
        const s = String(line).trim();
        if (!s) return "";
        if (/^<p[\s>]/i.test(s)) return s;
        if (/<[a-z][\s\S]*>/i.test(s)) return `<p>${s}</p>`;
        return `<p>${escapeHtml(s)}</p>`;
      })
      .join("");
  }

  /** RichText / PDF: one `<p>` per API array row; strings pass through (commas never imply new blocks). */
  export function addresultsToDisplayHtml(value) {
    if (value == null || value === "") return "";
    if (Array.isArray(value)) return addresultsArrayToHtml(value);
    return String(value).trim();
  }
  
  export function htmlToAddresultsArray(html) {
    if (!html || !String(html).trim()) return [];
    const raw = String(html).trim();
    const sanitized = sanitizeRichHtml(raw);
    if (!sanitized.includes("<")) {
      return sanitized
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    }
    if (typeof document === "undefined") {
      return [stripHtmlToText(sanitized)].filter(Boolean);
    }
    const doc = new DOMParser().parseFromString(
      `<div id="rich-root">${sanitized}</div>`,
      "text/html"
    );
    const root = doc.getElementById("rich-root");
    if (!root) return [stripHtmlToText(sanitized)].filter(Boolean);
  
    const out = [];
    const pushParagraphHtml = (el) => {
      const inner = el.innerHTML.trim();
      if (inner) out.push(inner);
    };
  
    const walk = (parent) => {
      parent.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent?.replace(/\u00a0/g, " ").trim();
          if (t) out.push(escapeHtml(t));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toLowerCase();
          if (tag === "p") {
            pushParagraphHtml(child);
          } else if (tag === "ul" || tag === "ol") {
            child.querySelectorAll(":scope > li").forEach((li) => {
              const inner = li.innerHTML.trim();
              if (inner) out.push(inner);
            });
          } else if (tag === "br") {
            /* ignore */
          } else if (tag === "div") {
            if (child.querySelector("p,ul,ol")) {
              walk(child);
            } else {
              pushParagraphHtml(child);
            }
          } else {
            const inner = child.innerHTML.trim();
            if (inner) out.push(inner);
          }
        }
      });
    };
  
    walk(root);
    return out.length ? out : [stripHtmlToText(sanitized)].filter(Boolean);
  }
  