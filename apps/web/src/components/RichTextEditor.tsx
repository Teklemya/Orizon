import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { MenuBar } from "./MenuBar";

type Props = {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: Props) {
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Highlight,
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[220px] px-5 py-4 text-[15px] leading-7 text-gray-800 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || "<p></p>", { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate((n) => n + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition focus-within:border-gray-300 focus-within:shadow-md">
      {editor && <MenuBar editor={editor} />}

      <div
        className="
          bg-white
          [&_.ProseMirror]:min-h-[220px]
          [&_.ProseMirror]:outline-none
          [&_.tiptap_h1]:mt-4
          [&_.tiptap_h1]:mb-2
          [&_.tiptap_h1]:text-2xl
          [&_.tiptap_h1]:font-semibold
          [&_.tiptap_h1]:tracking-tight
          [&_.tiptap_h2]:mt-4
          [&_.tiptap_h2]:mb-2
          [&_.tiptap_h2]:text-xl
          [&_.tiptap_h2]:font-semibold
          [&_.tiptap_p]:my-2
          [&_.tiptap_ul]:my-3
          [&_.tiptap_ul]:ml-5
          [&_.tiptap_ul]:list-disc
          [&_.tiptap_ol]:my-3
          [&_.tiptap_ol]:ml-5
          [&_.tiptap_ol]:list-decimal
          [&_.tiptap_li]:my-1
          [&_.tiptap_blockquote]:my-4
          [&_.tiptap_blockquote]:border-l-4
          [&_.tiptap_blockquote]:border-gray-300
          [&_.tiptap_blockquote]:pl-4
          [&_.tiptap_blockquote]:italic
          [&_.tiptap_blockquote]:text-gray-600
          [&_.tiptap_a]:text-blue-600
          [&_.tiptap_a]:underline
          [&_.tiptap_code]:rounded
          [&_.tiptap_code]:bg-gray-100
          [&_.tiptap_code]:px-1.5
          [&_.tiptap_code]:py-0.5
          [&_.tiptap_code]:text-[13px]
          [&_.tiptap_pre]:my-4
          [&_.tiptap_pre]:overflow-x-auto
          [&_.tiptap_pre]:rounded-xl
          [&_.tiptap_pre]:bg-gray-950
          [&_.tiptap_pre]:p-4
          [&_.tiptap_pre]:text-gray-100
          [&_.tiptap_hr]:my-6
          [&_.tiptap_hr]:border-gray-200
        "
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}