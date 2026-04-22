import { Dropdown, Tooltip } from "antd";
import DOMPurify from "dompurify";
import { Bold, ChevronDown, Italic, List } from "lucide-react";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

const LIST_CLASSES = {
  disc: "rich-ul-disc",
  arrow: "rich-ul-arrow",
  stripe: "rich-ul-stripe",
};

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function sanitizeRichHtml(html) {
  return DOMPurify.sanitize(html ?? "", {
    USE_PROFILES: { html: true },
  });
}

function FormatButton({ label, active, onMouseDown, children }) {
  return (
    <Tooltip title={label} mouseEnterDelay={0.4}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onMouseDown={(e) => {
          e.preventDefault();
          onMouseDown?.();
        }}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
          active && "border-teal-400 bg-teal-50 text-teal-900",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

export default function TooltipRichTextField({
  value,
  onChange,
  placeholder,
  className,
  editorClassName,
  minHeightClass = "min-h-[120px]",
}) {
  const isInternalChange = useRef(false);
  const onChangeRef = useRef(onChange);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      StyledBulletList,
      ListItem,
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder: ({ editor }) => {
          if (editor.getText().trim().length > 0) return "";
          return placeholder || "Write here…";
        },
      }),
    ],
    [placeholder],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions,
      content: value ?? "",
      editorProps: {
        attributes: {
          class: cn(
            "tiptap-editor max-w-none px-3 py-3 text-sm text-gray-900 focus:outline-none",
            minHeightClass,
            "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
            "[&_ul]:my-1",
            editorClassName,
          ),
        },
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData("text/plain");
          if (text == null || text === "") return false;
          event.preventDefault();
          const tr = view.state.tr.insertText(text);
          view.dispatch(tr);
          return true;
        },
      },
      onUpdate: ({ editor: ed }) => {
        isInternalChange.current = true;
        onChangeRef.current?.(sanitizeRichHtml(ed.getHTML()));
      },
    },
    [extensions],
  );

  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const next = value ?? "";
    const current = editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const applyListStyle = (styleKey) => {
    if (!editor) return;
    const cls = LIST_CLASSES[styleKey] || LIST_CLASSES.disc;
    let chain = editor.chain().focus();
    if (!editor.isActive("bulletList")) {
      chain = chain.toggleBulletList();
    }
    chain.updateAttributes("bulletList", { class: cls }).run();
  };

  const bulletItems = [
    {
      key: "disc",
      label: (
        <div className="flex items-center">
          <span className="mr-2" style={{ color: "#000" }}>
            ●
          </span>
          Circle bullets
        </div>
      ),
      onClick: () => applyListStyle("disc"),
    },
    {
      key: "arrow",
      label: (
        <div className="flex items-center">
          <span className="mr-2" style={{ color: "#000" }}>
            →
          </span>
          Arrow bullets
        </div>
      ),
      onClick: () => applyListStyle("arrow"),
    },
    {
      key: "stripe",
      label: (
        <div className="flex items-center">
          <span
            className="mr-2"
            style={{
              display: "inline-block",
              width: "10px",
              height: "14px",
              borderLeft: "2px solid #000",
            }}
          />
          Stripe list
        </div>
      ),
      onClick: () => applyListStyle("stripe"),
    },
  ];

  return (
    <div className={cn("rounded-lg border border-gray-300 bg-white", className)}>
      <style>{`
        .tiptap-editor.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Bullet styles by class on <ul> */
        .tiptap-editor ul.rich-ul-disc {
          list-style-type: disc;
          margin-left: 20px;
          padding-left: 0;
        }

        .tiptap-editor ul.rich-ul-arrow {
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }

        .tiptap-editor ul.rich-ul-arrow > li {
          position: relative;
          padding-left: 22px;
        }

        .tiptap-editor ul.rich-ul-arrow > li::before {
          content: "→";
          position: absolute;
          left: 0;
          top: 0;
          color: #000;
          font-weight: 600;
        }

        .tiptap-editor ul.rich-ul-stripe {
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }

        .tiptap-editor ul.rich-ul-stripe > li {
          border-left: 2px solid #000;
          padding-left: 8px;
          margin: 4px 0;
          border-radius: 0;
        }

        /* Stripe list: no background requested */
      `}</style>

      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1.5">
        <FormatButton
          label="Bold"
          active={editor?.isActive("bold")}
          onMouseDown={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" strokeWidth={2.5} />
        </FormatButton>

        <FormatButton
          label="Italic"
          active={editor?.isActive("italic")}
          onMouseDown={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </FormatButton>

        <Dropdown
          trigger={["click"]}
          menu={{
            items: bulletItems,
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <List className="h-4 w-4" />
            Bullets
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </Dropdown>
      </div>

      <EditorContent
        editor={editor}
        className="rounded-b-lg focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-inset"
        // Placeholder needs this attribute for the ::before rule
        data-placeholder={placeholder || "Write here…"}
      />
    </div>
  );
}

