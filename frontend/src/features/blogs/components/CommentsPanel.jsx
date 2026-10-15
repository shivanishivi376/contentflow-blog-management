import React, { useEffect, useState } from 'react'
import {
  createCommentRequest,
  deleteCommentRequest,
  fetchBlogCommentsRequest,
  replyCommentRequest,
  resolveCommentRequest,
} from '../../../services/api/commentApi.js'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import { Avatar, Button } from '../../../components/ui/CustomerComponents.jsx'

const CommentsPanel = ({ blogId, blog = null, isTeam = false, currentUser = null, isOpen, onClose }) => {
  const { confirm } = useConfirm()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTextMap, setReplyTextMap] = useState({})
  const [activeReplyId, setActiveReplyId] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL | OPEN | RESOLVED

  const isTeamWorkspace = isTeam || blog?.accountType === 'TEAM' || Boolean(blog?.team)
  const isAssignedReviewer = Boolean(
    currentUser && blog?.reviewer && (
      String(blog.reviewer?._id || blog.reviewer) === String(currentUser.id || currentUser._id)
    )
  )
  const isReviewer = !isTeamWorkspace || isAssignedReviewer || currentUser?.workflowRole?.toLowerCase() === 'reviewer' || currentUser?.role === 'Reviewer' || currentUser?.role === 'ADMIN'

  const loadComments = async () => {
    if (!blogId || !isOpen) return
    setLoading(true)
    setError('')

    try {
      const response = await fetchBlogCommentsRequest(blogId)
      setComments(response.data?.data?.comments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [blogId, isOpen])

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setError('')
    try {
      await createCommentRequest({ blog: blogId, content: newComment })
      setNewComment('')
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment')
    }
  }

  const handlePostReply = async (commentId) => {
    const text = replyTextMap[commentId]
    if (!text?.trim()) return

    setError('')
    try {
      await replyCommentRequest(commentId, text)
      setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }))
      setActiveReplyId(null)
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply')
    }
  }

  const handleToggleResolve = async (commentId) => {
    try {
      await resolveCommentRequest(commentId)
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update comment status')
    }
  }

  const handleDelete = async (commentId) => {
    const isConfirmed = await confirm({
      title: 'Delete Comment',
      message: 'Delete this comment thread?',
      variant: 'danger',
    })
    if (!isConfirmed) return

    try {
      await deleteCommentRequest(commentId)
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment')
    }
  }

  const filteredComments = comments.filter((c) => {
    if (filter === 'OPEN') return c.status === 'OPEN'
    if (filter === 'RESOLVED') return c.status === 'RESOLVED'
    return true
  })

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 440,
        maxWidth: '92vw',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 30px rgba(15, 23, 42, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Blog Discussion</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Team notes & revision threads</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
            color: '#94a3b8',
            lineHeight: 1,
            padding: 4,
          }}
        >
          &times;
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          padding: '10px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: 8,
        }}
      >
        {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === f ? '#2563eb' : '#e2e8f0',
              color: filter === f ? '#ffffff' : '#64748b',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ margin: '12px 20px', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.86rem' }}>
          {error}
        </div>
      )}

      {/* Comments List */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div className="v2-spinner-lg" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Loading discussion...</p>
          </div>
        ) : filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div
              key={comment._id}
              style={{
                backgroundColor: comment.status === 'RESOLVED' ? '#f8fafc' : '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
                opacity: comment.status === 'RESOLVED' ? 0.75 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={comment.author?.name || comment.author?.username || 'User'} size="sm" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                    {comment.author?.name || comment.author?.username || 'User'}
                  </span>
                  {(comment.isReviewFeedback || comment.content?.startsWith('[Revision Request]')) && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontWeight: 700,
                      }}
                    >
                      Review Feedback
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                {comment.content}
              </p>

              <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem' }}>
                <button
                  type="button"
                  onClick={() => handleToggleResolve(comment._id)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  {comment.status === 'RESOLVED' ? 'Reopen' : '✓ Resolve'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(comment._id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>

              {/* Nested Replies */}
              {comment.replies?.length > 0 && (
                <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {comment.replies.map((reply) => (
                    <div key={reply._id}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {reply.author?.name || reply.author?.username || 'User'}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {activeReplyId === comment._id && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="v2-input"
                    placeholder="Write a reply..."
                    value={replyTextMap[comment._id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [comment._id]: e.target.value })}
                    style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                  />
                  <Button size="sm" onClick={() => handlePostReply(comment._id)}>
                    Send
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            No discussion comments yet.
          </div>
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handlePostComment} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="v2-input"
            placeholder="Add a comment to this article..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="submit" disabled={!newComment.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentsPanel
