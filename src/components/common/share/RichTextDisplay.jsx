import classNames from "classnames";

export default function RichTextDisplay({
  html,
  fallback = null,
  className,
  block = true,
}) {
  const normalized = html != null ? String(html).replace(/\\n/g, "\n").trim() : "";

  if (!normalized) {
    if (fallback == null) return null;
    return (
      <span className={classNames(block && "block", className)}>
        {fallback}
      </span>
    );
  }

  if (!/<[a-z][\s\S]*>/i.test(normalized)) {
    return (
      <span
        className={classNames("whitespace-pre-line", block && "block", className)}
      >
        {normalized}
      </span>
    );
  }

  const Tag = block ? "div" : "span";

  return (
    <Tag className={classNames("rich-text-display text-inherit", className)}>
      <style>{`
        /* Keep list markers visible in Tailwind preflight + match editor output */
        .rich-text-display p { margin: 0.25rem 0; }
        .rich-text-display p:first-child { margin-top: 0; }
        .rich-text-display p:last-child { margin-bottom: 0; }

        .rich-text-display ul { margin: 0.25rem 0; padding-left: 1.25rem; }
        .rich-text-display ol { margin: 0.25rem 0; padding-left: 1.25rem; }

        .rich-text-display ul.rich-ul-disc { list-style-type: disc; }

        .rich-text-display ul.rich-ul-arrow { list-style: none; padding-left: 0; margin-left: 0; }
        .rich-text-display ul.rich-ul-arrow > li { position: relative; padding-left: 1.375rem; }
        .rich-text-display ul.rich-ul-arrow > li::before {
          content: "→";
          position: absolute;
          left: 0;
          top: 0;
          color: #000;
          font-weight: 600;
        }

        .rich-text-display ul.rich-ul-stripe { list-style: none; padding-left: 0; margin-left: 0; }
        .rich-text-display ul.rich-ul-stripe > li {
          border-left: 2px solid #000;
          padding-left: 0.5rem;
          margin: 0.25rem 0;
          border-radius: 0;
        }
      `}</style>
      <span dangerouslySetInnerHTML={{ __html: normalized }} />
    </Tag>
  );
}