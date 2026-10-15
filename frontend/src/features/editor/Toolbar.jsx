import React, { useState } from 'react'
import { uploadMediaRequest } from '../../services/api/mediaApi.js'
import { Button, Input, Modal } from '../../components/ui/CustomerComponents.jsx'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import ImageIcon from '@mui/icons-material/Image'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import Tooltip from '@mui/material/Tooltip'

const Toolbar = ({ editor }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleInsertUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
      setImageUrl('')
      setIsImageModalOpen(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const response = await uploadMediaRequest(file)
      const uploadedUrl = response.data?.data?.media?.url || response.data?.data?.url
      if (uploadedUrl) {
        editor.chain().focus().setImage({ src: uploadedUrl }).run()
        setIsImageModalOpen(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const btnStyle = (isActive) => ({
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: isActive ? '#eff6ff' : 'transparent',
    color: isActive ? '#2563eb' : '#475569',
    fontWeight: 600,
    fontSize: '0.82rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  })

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <Tooltip title="Bold" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            style={btnStyle(editor.isActive('bold'))}
          >
            <FormatBoldIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Italic" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            style={btnStyle(editor.isActive('italic'))}
          >
            <FormatItalicIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <span style={{ height: 20, borderLeft: '1px solid #e2e8f0', margin: '0 4px' }} />

        <Tooltip title="Heading 1" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            style={btnStyle(editor.isActive('heading', { level: 1 }))}
          >
            H1
          </button>
        </Tooltip>

        <Tooltip title="Heading 2" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            style={btnStyle(editor.isActive('heading', { level: 2 }))}
          >
            H2
          </button>
        </Tooltip>

        <Tooltip title="Heading 3" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            style={btnStyle(editor.isActive('heading', { level: 3 }))}
          >
            H3
          </button>
        </Tooltip>

        <span style={{ height: 20, borderLeft: '1px solid #e2e8f0', margin: '0 4px' }} />

        <Tooltip title="Bullet List" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={btnStyle(editor.isActive('bulletList'))}
          >
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Numbered List" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            style={btnStyle(editor.isActive('orderedList'))}
          >
            <FormatListNumberedIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Quote" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            style={btnStyle(editor.isActive('blockquote'))}
          >
            <FormatQuoteIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Code Block" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            style={btnStyle(editor.isActive('codeBlock'))}
          >
            <CodeIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <span style={{ height: 20, borderLeft: '1px solid #e2e8f0', margin: '0 4px' }} />

        <Tooltip title="Insert Link" arrow>
          <button
            type="button"
            onClick={setLink}
            style={btnStyle(editor.isActive('link'))}
          >
            <InsertLinkIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Insert Image" arrow>
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            style={btnStyle(false)}
          >
            <ImageIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <span style={{ height: 20, borderLeft: '1px solid #e2e8f0', margin: '0 4px' }} />

        <Tooltip title="Undo" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            style={btnStyle(false)}
          >
            <UndoIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        <Tooltip title="Redo" arrow>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            style={btnStyle(false)}
          >
            <RedoIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Insert Image into Article"
        footer={
          <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
            Close
          </Button>
        }
      >
        {error && (
          <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Option 1: URL */}
          <div>
            <label className="v2-label" style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
              Insert by Image URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button variant="primary" onClick={handleInsertUrl} disabled={!imageUrl.trim()}>
                Insert
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: '0.78rem' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            OR UPLOAD FILE
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Option 2: Upload */}
          <div>
            <label className="v2-label" style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
              Upload Image from Computer
            </label>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              {uploading && (
                <p style={{ margin: '10px 0 0', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
                  Uploading image to cloud storage...
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Toolbar
