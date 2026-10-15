import React, { useState } from 'react'
import { Avatar, Button } from '../../../components/ui/CustomerComponents.jsx'

const CommentsTab = ({
  comments = [],
  loading = false,
  currentUser = null,
  isTeam = false,
  isReviewer = true,
  newCommentText = '',
  onNewCommentChange,
  onAddComment,
  onResolve,
  onReply,
}) => {
  const [replyingToId, setReplyingToId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const handleReply = (commentId) => {
    if (replyText.trim()) {
      onReply?.(commentId, replyText.trim())
      setReplyText('')
      setReplyingToId(null)
    }
  }

  if (loading) {
    return (
      <div className="wf-tab-empty">
        <div className="v2-spinner-lg" style={{ margin: '0 auto 12px' }} />
        <p>Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="wf-comments-tab">
      {/* Comment list */}
      <div className="wf-comments-list">
        {comments.length === 0 ? (
          <div className="wf-tab-empty">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
            <p style={{ color: '#64748b', margin: 0 }}>No comments yet.</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Add a comment to start the discussion.
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className={`wf-comment-item ${c.status === 'RESOLVED' ? 'resolved' : ''}`}
            >
              <div className="wf-comment-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={c.author?.name || 'U'} size="sm" />
                  <div>
                    <div className="wf-comment-author">{c.author?.name || 'User'}</div>
                    <div className="wf-comment-time">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {c.status !== 'RESOLVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResolve?.(c._id)}
                    >
                      ✓ Resolve
                    </Button>
                  )}
                  {c.status === 'RESOLVED' && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#16a34a',
                        fontWeight: 600,
                        padding: '2px 8px',
                        background: '#dcfce7',
                        borderRadius: 999,
                      }}
                    >
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              <p className="wf-comment-body">{c.content}</p>

              {/* Replies */}
              {c.replies?.length > 0 && (
                <div className="wf-comment-replies">
                  {c.replies.map((r) => (
                    <div key={r._id} className="wf-reply-item">
                      <Avatar name={r.author?.name || 'U'} size="sm" />
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <strong className="wf-comment-author">{r.author?.name}</strong>
                          <span className="wf-comment-time">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="wf-comment-body" style={{ marginTop: 4 }}>
                          {r.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply toggle */}
              {c.status !== 'RESOLVED' && (
                <>
                  {replyingToId === c._id ? (
                    <div className="wf-reply-form">
                      <input
                        className="v2-input"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply(c._id)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleReply(c._id)}>
                        Send
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToId(null)
                          setReplyText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="wf-reply-btn"
                      onClick={() => setReplyingToId(c._id)}
                    >
                      Reply
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form className="wf-comment-composer" onSubmit={onAddComment}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Avatar name={currentUser?.name || 'U'} size="sm" />
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <input
              className="v2-input"
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => onNewCommentChange?.(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={!newCommentText?.trim()}>
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CommentsTab
