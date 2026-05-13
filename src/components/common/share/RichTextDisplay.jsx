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
        className={classNames("whitespace-break-spaces leading-snug", block && "block", className)}
      >
        {normalized}
      </span>
    );
  }

  const Tag = block ? "div" : "span";

  return (
    <Tag className={classNames("rich-text-display text-inherit leading-snug", className)}>
      <span dangerouslySetInnerHTML={{ __html: normalized }} />
    </Tag>
  );
}