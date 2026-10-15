import React from 'react'
import BlogEditor from '../../editor/BlogEditor.jsx'

const CONTENT_TIPS = [
  'Use descriptive headings',
  'Add practical examples',
  'Keep paragraphs short',
  'Use lists where appropriate',
  'Optimize for SEO',
]

const SHORTCUTS = [
  { keys: 'Ctrl + S', action: 'Save Draft' },
  { keys: 'Ctrl + Enter', action: 'Submit' },
]

const EditorTab = ({
  content,
  onChange,
  wordCount = 0,
  charCount = 0,
  autoSaveStatus = 'idle',
  editable = true,
}) => {
  const saveStatusText = !editable
    ? '🔒 Read Only'
    : autoSaveStatus === 'saving'
    ? '● Autosaving...'
    : autoSaveStatus === 'saved'
    ? '✓ Last saved: Just now'
    : '✓ Draft Ready'

  return (
    <div className="wf-editor-tab-layout">
      {/* Editor area */}
      <div className="wf-editor-main">
        {!editable && (
          <div style={{ padding: '8px 12px', marginBottom: '10px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔒</span>
            <span>You are viewing this content in read-only mode. Only the assigned Writer can edit this draft.</span>
          </div>
        )}
        <BlogEditor
          content={content}
          onChange={onChange}
          editable={editable}
        />

        {/* Editor footer */}
        <div className="v2-editor-footer-status">
          <span>
            Words: {wordCount} &nbsp;·&nbsp; Characters: {charCount}
          </span>
          <span style={{ color: autoSaveStatus === 'saving' ? '#f59e0b' : '#16a34a' }}>
            {saveStatusText}
          </span>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="wf-editor-sidebar">
        {/* Content Tips */}
        <div className="wf-content-tips">
          <h4 className="wf-tips-heading">Content Tips</h4>
          <ul className="wf-tips-list">
            {CONTENT_TIPS.map((tip, i) => (
              <li key={i} className="wf-tip-item">
                <span className="wf-tip-dot">●</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="wf-content-tips" style={{ marginTop: 12 }}>
          <h4 className="wf-tips-heading">Keyboard Shortcuts</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {SHORTCUTS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <code
                  style={{
                    fontSize: '0.78rem',
                    padding: '2px 8px',
                    background: '#f1f5f9',
                    borderRadius: 4,
                    color: '#334155',
                    fontFamily: 'monospace',
                  }}
                >
                  {s.keys}
                </code>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorTab
