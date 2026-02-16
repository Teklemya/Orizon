import { Editor } from '@tiptap/react'

type Props = {
  editor: Editor
}

export function MenuBar({ editor }: Props) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-2 border-b px-3 py-2 bg-gray-50 sticky top-0 z-10">
      
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bold')
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded italic ${
          editor.isActive('italic')
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        I
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded underline ${
          editor.isActive('underline')
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        U
      </button>

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bulletList')
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        • List
      </button>

      {/* Normal Paragraph */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className="px-2 py-1 rounded bg-white border"
      >
        Normal
      </button>

      {/* H1 */}
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        H1
      </button>

      {/* H2 */}
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-black text-white'
            : 'bg-white border'
        }`}
      >
        H2
      </button>

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        className="px-2 py-1 rounded bg-red-100 text-red-800 border"
      >
        Clear
      </button>
    </div>
  )
}
