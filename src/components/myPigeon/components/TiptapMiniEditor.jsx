import { Select } from "antd";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

const { Option } = Select;

const tiptapExtensions = [
  StarterKit.configure({
    bulletList: false,
    listItem: false,
  }),
  BulletList,
  ListItem,
];

export default function TiptapMiniEditor({
  value,
  onChange,
  minHeight = 120,
  borderColor = "#071952",
}) {
  const [listStyle, setListStyle] = useState("default"); // default | circle | arrow | stripe
  const editorChangeTimeout = useRef(null);
  const wrapperRef = useRef(null);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value || "",
    onUpdate: ({ editor }) => {
      if (editorChangeTimeout.current) clearTimeout(editorChangeTimeout.current);
      editorChangeTimeout.current = setTimeout(() => {
        onChange?.(editor.getHTML());
      }, 200);
    },
    onBlur: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Keep editor content in sync when parent updates `value` (e.g., edit mode prefill)
  useEffect(() => {
    if (!editor) return;
    const next = value ?? "";
    const current = editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;

    // Ensure bullet list is enabled when user picks a style.
    if (!editor.isActive("bulletList")) {
      editor.chain().focus().toggleBulletList().run();
    }
  }, [editor, listStyle]);

  useEffect(() => {
    return () => {
      if (editorChangeTimeout.current) clearTimeout(editorChangeTimeout.current);
    };
  }, []);

  return (
    <div
      className="tiptap-editor-wrapper border rounded"
      style={{ border: `1px solid ${borderColor}`, borderRadius: "6px" }}
      ref={wrapperRef}
      data-list-style={listStyle}
    >
      <style>{`
        .tiptap-editor-wrapper {
          background: #fafafa !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
          overflow: hidden !important;
          display: block !important;
        }

        .tiptap-toolbar {
          display: flex !important;
          gap: 8px !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          padding: 6px 8px !important;
          background: #f5f5f5 !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .tiptap-toolbar button {
          width: 26px !important;
          height: 26px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          background: #fff !important;
          color: #333 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 12px !important;
        }

        .tiptap-toolbar button:hover {
          background: #f0f0f0 !important;
        }

        .tiptap-toolbar button.active {
          background: #0890e8 !important;
          color: white !important;
          border-color: #0890e8 !important;
        }

        .ProseMirror {
          outline: none !important;
          word-wrap: break-word !important;
          white-space: pre-wrap !important;
        }

        .ProseMirror p {
          margin: 0 !important;
        }

        .ProseMirror strong {
          font-weight: bold !important;
        }

        .ProseMirror em {
          font-style: italic !important;
        }

        /* Prevent browser default marker to avoid duplicate bullets */
        .tiptap-editor-wrapper .ProseMirror ul {
          list-style: none !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul > li {
          position: relative !important;
          padding-left: 14px !important;
          margin: 4px 0 !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul > li::before {
          content: "•" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #000 !important;
        }

        /* Keep rich class lists single-marker only */
        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-disc,
        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-arrow,
        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-stripe {
          list-style: none !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-disc > li,
        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-arrow > li,
        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-stripe > li {
          list-style: none !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-arrow > li::before {
          content: "→" !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-stripe > li {
          border-left: 2px solid #000 !important;
          padding-left: 8px !important;
        }

        .tiptap-editor-wrapper .ProseMirror ul.rich-ul-stripe > li::before {
          content: "" !important;
        }
      `}</style>

      <div className="tiptap-toolbar flex gap-1 flex-wrap bg-gray-100">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "active" : ""}
          style={{ fontWeight: "bold" }}
          aria-label="Bold"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "active" : ""}
          style={{ fontStyle: "italic" }}
          aria-label="Italic"
        >
          I
        </button>

        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "#ccc",
            margin: "0 4px",
          }}
        />

        <Select
          value={listStyle}
          onChange={(val) => setListStyle(val)}
          style={{ width: "90px", height: "26px" }}
          className="text-sm"
          optionLabelProp="label"
          label="Bullets"
        >
          <Option value="default" label="Bullets">
          Circle bullets
          </Option>
          {/* <Option value="circle" label="Circle bullets">
            Circle bullets
          </Option> */}
          <Option value="arrow" label="Arrow bullets">
            Arrow bullets
          </Option>
          <Option value="stripe" label="Stripe list">
            Stripe list
          </Option>
        </Select>
      </div>

      <EditorContent
        editor={editor}
        style={{
          minHeight: `${minHeight}px`,
          padding: "10px 12px",
          border: "none",
          borderRadius: "0 0 6px 6px",
          backgroundColor: "#fff",
        }}
      />
    </div>
  );
}
