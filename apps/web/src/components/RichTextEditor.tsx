import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import { MenuBar } from './MenuBar'

type Props = {
  content: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: Props) {
  const [, forceUpdate] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'tiptap p-4 min-h-[150px] outline-none prose prose-sm max-w-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const update = () => forceUpdate((n) => n + 1)

    editor.on('selectionUpdate', update)
    editor.on('transaction', update)

    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  return (
    <div className="border rounded-md bg-white shadow-sm">
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
