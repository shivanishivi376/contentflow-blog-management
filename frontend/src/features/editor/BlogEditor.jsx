import { useEffect, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Toolbar from './Toolbar.jsx'
import { getEditorExtensions } from './editorConfig.js'

const calculateCounts = (html = '') => {
  const text = html.replace(/<[^>]*>/g, '').trim()
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0
  const chars = text.length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  return { words, chars, readingTime }
}

const BlogEditor = ({ content = '', onChange, editable = true }) => {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: content || '<p></p>',
    editable: editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  const counts = useMemo(() => {
    return calculateCounts(content)
  }, [content])

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      overflow: 'hidden',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    }}>
      {editable && <Toolbar editor={editor} />}
      <div style={{
        padding: '24px 28px',
        minHeight: '340px',
        backgroundColor: editable ? '#ffffff' : '#f8fafc',
        fontFamily: "'Lora', Georgia, serif",
        fontSize: '1.05rem',
        lineHeight: 1.8,
        color: '#1e293b',
      }}>
        <EditorContent editor={editor} />
      </div>

      {/* Editor word count status footer */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid #f1f5f9',
        background: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.78rem',
        color: '#64748b',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span><strong>{counts.words}</strong> words</span>
          <span><strong>{counts.chars}</strong> characters</span>
        </div>
        <div>
          <span>Estimated <strong>{counts.readingTime} min</strong> reading time</span>
        </div>
      </div>
    </div>
  )
}

export default BlogEditor
