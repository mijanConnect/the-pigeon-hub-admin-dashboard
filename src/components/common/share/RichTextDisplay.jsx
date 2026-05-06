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
      <span dangerouslySetInnerHTML={{ __html: normalized }} />
    </Tag>
  );
}