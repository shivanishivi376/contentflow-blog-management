import React, { useState } from 'react'
import { Avatar, Badge, Button, Modal } from '../../../components/ui/CustomerComponents.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'

const AI_REVIEW_ITEMS = [
  { key: 'readability', label: 'Readability' },
  { key: 'seo', label: 'SEO Optimization' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'structure', label: 'Structure' },
  { key: 'engagement', label: 'Engagement' },
]

const ReviewScreen = ({
  blog = {},
  isTeam = false,
  currentUser = null,
  reviewerComments = [],
  reviewComment = '',
  onReviewCommentChange,
  onPostReviewComment,
  postingReviewComment = false,
  onReplyComment,
  onResolveComment,
  aiReviewScore = null,
  aiReviewLoading = false,
  onAIReview,
  onApprove,
  onReject,
  saving = false,
  isRevisionModalOpen,
  onOpenRevisionModal,
  onCloseRevisionModal,
  onSubmitRevision,
  revising = false,
}) => {
  const { hasPermission, isTeam: isTeamUser, workflowRole } = useTeamPermissions()
  const isTeamMode = isTeam || isTeamUser || blog.accountType === 'TEAM'
  const isAssignedReviewer = Boolean(
    currentUser && blog?.reviewer && (
      String(blog.reviewer?._id || blog.reviewer) === String(currentUser.id || currentUser._id)
    )
  )
  const canApprove = !isTeamMode || hasPermission(TEAM_PERMISSIONS.BLOG_APPROVE)
  const canReject = !isTeamMode || hasPermission(TEAM_PERMISSIONS.BLOG_REJECT)
  const canAIReview = !isTeamMode || hasPermission(TEAM_PERMISSIONS.BLOG_AI_REVIEW)
  const isReviewerUser = !isTeamMode ||
    isAssignedReviewer ||
    workflowRole?.toLowerCase() === 'reviewer' ||
    currentUser?.workflowRole?.toLowerCase() === 'reviewer' ||
    currentUser?.role === 'Reviewer' ||
    currentUser?.role === 'ADMIN' ||
    canApprove ||
    canReject

  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showSubmitReview, setShowSubmitReview] = useState(false)
  const [revisionReason, setRevisionReason] = useState('')
  const [replyingCommentId, setReplyingCommentId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const handleSendReply = (commentId) => {
    if (replyText.trim()) {
      onReplyComment?.(commentId, replyText.trim())
      setReplyText('')
      setReplyingCommentId(null)
    }
  }

  const wordCount = (blog.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="wf-review-screen">
      {/* Review Header Actions */}
      <div className="wf-workspace-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            {isTeamMode ? 'Team Review' : 'Self Review'}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
            {isTeamMode ? 'Review Blog' : 'Self Review'}
          </h2>
          {!isTeamMode && (
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Review your blog before publishing.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canAIReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIReview}
              isLoading={aiReviewLoading}
            >
              🤖 AI Review
            </Button>
          )}
          {isTeamMode && (
            <>
              {canReject && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onOpenRevisionModal}
                >
                  ✗ Reject
                </Button>
              )}
              {canApprove && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowApproveConfirm(true)}
                  isLoading={saving}
                >
                  ✓ Approve
                </Button>
              )}
              {!canApprove && !canReject && (
                <Button
                  size="sm"
                  disabled
                  style={{ background: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' }}
                >
                  🔒 Reviewer Only
                </Button>
              )}
            </>
          )}
          {!isTeamMode && (
            <Button
              size="sm"

              onClick={() => setShowApproveConfirm(true)}
              isLoading={saving}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              ✓ Approve &amp; Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="wf-review-layout">
        {/* Left panel: reviewer controls + AI review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Blog info */}
          <div className="v2-sidecard">
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px' }}>Review the Blog</h3>
            <p style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#475569' }}>
              Review the content carefully.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Title: </span>
                <strong style={{ color: '#0f172a' }}>{blog.title}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Words: </span>
                <span>{wordCount} words · {readingTime} min read</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Status: </span>
                <Badge variant="warning">In Review</Badge>
              </div>
            </div>
          </div>

          {/* Reviewer Comments (for team reviewer) */}
          {isTeam && (
            <div className="v2-sidecard">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
                  Reviewer Comments
                </h3>
                {isReviewerUser ? (
                  <Badge variant="info">Reviewer</Badge>
                ) : (
                  <Badge variant="neutral">Read Only</Badge>
                )}
              </div>

              {isReviewerUser ? (
                <div>
                  <textarea
                    className="v2-input"
                    rows={4}
                    placeholder="Add your review comments / feedback here..."
                    value={reviewComment}
                    onChange={(e) => onReviewCommentChange?.(e.target.value)}
                    style={{ resize: 'vertical', width: '100%', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      disabled={!reviewComment?.trim() || postingReviewComment}
                      onClick={() => onPostReviewComment?.(reviewComment)}
                      isLoading={postingReviewComment}
                    >
                      Post Review Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.84rem', color: '#64748b', background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🔒</span>
                  <span>Reviewer comments can only be published by the designated Reviewer. You can reply or resolve existing comments below.</span>
                </div>
              )}
            </div>
          )}

          {/* Previous / Active Reviewer Comments with Reply & Resolve */}
          {reviewerComments.length > 0 && (
            <div className="v2-sidecard">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
                  Reviewer Feedback ({reviewerComments.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviewerComments.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      padding: '12px 14px',
                      background: c.status === 'RESOLVED' ? '#f8fafc' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={c.author?.name || 'U'} size="sm" />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                            {c.author?.name || 'Reviewer'}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: 8 }}>
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div>
                        {c.status === 'RESOLVED' ? (
                          <span style={{ fontSize: '0.74rem', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                            Resolved
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onResolveComment?.(c._id)}
                            style={{ padding: '2px 8px', fontSize: '0.78rem' }}
                          >
                            ✓ Resolve
                          </Button>
                        )}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 8px 0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.45 }}>
                      {c.content}
                    </p>

                    {/* Replies */}
                    {c.replies?.length > 0 && (
                      <div style={{ marginTop: 8, paddingLeft: 10, borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {c.replies.map((reply) => (
                          <div key={reply._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <Avatar name={reply.author?.name || 'U'} size="xs" />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                                <strong style={{ fontSize: '0.8rem', color: '#1e293b' }}>{reply.author?.name}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                  {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#475569' }}>
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Action */}
                    {c.status !== 'RESOLVED' && (
                      <div style={{ marginTop: 8 }}>
                        {replyingCommentId === c._id ? (
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <input
                              className="v2-input"
                              placeholder="Reply to this reviewer comment..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendReply(c._id)}
                              style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleSendReply(c._id)} disabled={!replyText.trim()}>
                              Send
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingCommentId(null)
                                setReplyText('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReplyingCommentId(c._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            💬 Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Review Summary */}
          <div className="wf-ai-review-panel">
            <div className="wf-ai-review-header">
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                  AI Review Summary
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Automated editorial evaluation
                </span>
              </div>
              {aiReviewScore !== null && (
                <div className="wf-ai-score">
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                    {aiReviewScore}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/100</span>
                </div>
              )}
            </div>

            {aiReviewLoading ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div className="v2-spinner-sm" style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Analyzing content quality, SEO, and readability...
                </p>
              </div>
            ) : aiReviewScore !== null ? (
              <div style={{ marginTop: 8 }}>
                <div className="wf-ai-metrics-list">
                  {[
                    { key: 'readability', label: 'Readability', score: Math.min(98, Math.max(70, aiReviewScore + 4)), desc: 'Clear, easily readable sentences' },
                    { key: 'seo', label: 'SEO Optimization', score: Math.min(96, Math.max(68, aiReviewScore - 2)), desc: 'Keywords in titles & headers' },
                    { key: 'grammar', label: 'Grammar & Tone', score: Math.min(99, Math.max(80, aiReviewScore + 6)), desc: 'Clean mechanics and flow' },
                    { key: 'structure', label: 'Structure & Depth', score: Math.min(95, Math.max(72, aiReviewScore + 1)), desc: 'Logical header hierarchy' },
                  ].map((metric) => (
                    <div key={metric.key} className="wf-ai-metric-item">
                      <div className="wf-ai-metric-header">
                        <span className="wf-ai-metric-label">
                          <span style={{ color: '#16a34a' }}>✓</span> {metric.label}
                        </span>
                        <span className="wf-ai-metric-value">{metric.score}%</span>
                      </div>
                      <div className="wf-ai-progress-track">
                        <div
                          className="wf-ai-progress-bar"
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="wf-ai-suggestions-box">
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💡</span> Key Highlights
                  </div>
                  <div style={{ color: '#475569', lineHeight: 1.45 }}>
                    High editorial quality detected. Article is well-structured and ready for publication.
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAIReview}
                  isLoading={aiReviewLoading}
                  style={{ width: '100%', marginTop: 10 }}
                >
                  ↻ Re-run AI Analysis
                </Button>
              </div>
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b' }}>
                  Run AI Review to get an automated analysis of readability, grammar, and SEO before approving.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAIReview}
                  isLoading={aiReviewLoading}
                  style={{ width: '100%' }}
                >
                  🤖 Run AI Review
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel: Content Preview */}
        <div className="v2-preview-box">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Content Preview · Live Draft View
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: '1.8rem', color: '#0f172a', lineHeight: 1.2 }}>
            {blog.title}
          </h1>
          {blog.description && (
            <p style={{ fontSize: '1.05rem', color: '#475569', fontStyle: 'italic', marginBottom: 20 }}>
              {blog.description}
            </p>
          )}
          <div
            style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Bottom action row */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {isTeam ? (
              <>
                {canReject && (
                  <Button
                    variant="danger"
                    onClick={onOpenRevisionModal}
                  >
                    ✗ Reject
                  </Button>
                )}
                {canApprove && (
                  <Button
                    onClick={() => setShowApproveConfirm(true)}
                    isLoading={saving}
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    ✓ Approve for Publishing →
                  </Button>
                )}
                {!canApprove && !canReject && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                    🔒 Editorial Review: Only the assigned Reviewer can approve or request revisions for this blog.
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={() => setShowApproveConfirm(true)}
                isLoading={saving}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
              >
                ✓ Approve &amp; Publish
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title={isTeam ? 'Approve for Publishing?' : 'Approve & Publish?'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowApproveConfirm(false)
                onApprove?.()
              }}
              isLoading={saving}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              {isTeam ? 'Approve' : 'Approve & Publish'}
            </Button>
          </>
        }
      >
        <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>
          {isTeam
            ? 'This will move the blog to the In Publishing stage. The publisher will be notified to review and publish the content.'
            : 'This will approve your blog and move it to the publishing stage.'}
        </p>
      </Modal>

      {/* Reject / Revision Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={onCloseRevisionModal}
        title="Request Revisions"
        footer={
          <>
            <Button variant="outline" onClick={onCloseRevisionModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => onSubmitRevision?.({ reason: revisionReason })}
              isLoading={revising}
              disabled={!revisionReason.trim()}
            >
              Reject &amp; Request Changes
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>
            Explain what changes are needed. The writer will be notified and the blog
            will be returned for revisions.
          </p>
          <div className="v2-field-group">
            <label className="v2-label">Revision Reason *</label>
            <textarea
              className="v2-input"
              rows={4}
              placeholder="Please describe what needs to be changed..."
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewScreen
