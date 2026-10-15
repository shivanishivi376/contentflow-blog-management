import { useState } from 'react'
import { publishBlogRequest, retryPublishBlogRequest, transitionBlogStatusRequest } from '../../../services/api/blogApi.js'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'

const statusBadges = {
  DRAFT: { label: 'Draft', color: '#6b7280' },
  IN_WRITING: { label: 'In Writing', color: '#3b82f6' },
  IN_REVIEW: { label: 'In Review', color: '#f59e0b' },
  RE_ASSIGN: { label: 'Re-assigned', color: '#ef4444' },
  IN_PUBLISHING: { label: 'In Publishing', color: '#8b5cf6' },
  PUBLISHED: { label: 'Published', color: '#10b981' },
  PUBLISH_FAILED: { label: 'Publish Failed', color: '#dc2626' },
}

const WorkflowActionsBar = ({
  blogId,
  currentStatus,
  onStatusChanged,
  onRequestRevisionModal,
  isTeam = false,
  currentUser,
  blog
}) => {
  const { hasPermission } = useTeamPermissions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async (action, reason = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await transitionBlogStatusRequest(blogId, { action, reason })
      const updatedBlog = response.data?.data?.blog
      onStatusChanged?.(updatedBlog)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to execute action ${action}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await publishBlogRequest(blogId)
      const updatedBlog = response.data?.data?.blog
      onStatusChanged?.(updatedBlog)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish article')
      try {
        const response = await transitionBlogStatusRequest(blogId, { action: 'PUBLISH_FAIL', reason: err.message })
        onStatusChanged?.(response.data?.data?.blog)
      } catch {
        // ignore
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await retryPublishBlogRequest(blogId)
      const updatedBlog = response.data?.data?.blog
      onStatusChanged?.(updatedBlog)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retry publishing')
    } finally {
      setLoading(false)
    }
  }

  const badge = statusBadges[currentStatus] || { label: currentStatus, color: '#6b7280' }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <strong>Current Workflow Status:</strong>
        <span
          style={{
            backgroundColor: badge.color,
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            padding: '3px 10px',
            borderRadius: '12px',
          }}
        >
          {badge.label}
        </span>
        {error ? <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</span> : null}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {currentStatus === 'DRAFT' && hasPermission(TEAM_PERMISSIONS.BLOG_WRITE) ? (
          <button
            type="button"
            className="auth-button"
            style={{ width: 'auto', padding: '6px 14px' }}
            disabled={loading}
            onClick={() => handleAction('START_WRITING', 'Moved to writing phase')}
          >
            Start Writing →
          </button>
        ) : null}

        {currentStatus === 'RE_ASSIGN' && hasPermission(TEAM_PERMISSIONS.BLOG_WRITE) ? (
          <button
            type="button"
            className="auth-button"
            style={{ width: 'auto', padding: '6px 14px' }}
            disabled={loading}
            onClick={() => handleAction('RESUME_WRITING', 'Author resumed writing after revision request')}
          >
            Resume Writing →
          </button>
        ) : null}

        {currentStatus === 'IN_WRITING' && hasPermission(TEAM_PERMISSIONS.BLOG_SUBMIT_REVIEW) ? (
          <button
            type="button"
            className="auth-button"
            style={{ width: 'auto', padding: '6px 14px', backgroundColor: '#4f46e5' }}
            disabled={loading}
            onClick={() => handleAction('SUBMIT_FOR_REVIEW', 'Submitted for editorial review')}
          >
            Submit for Review →
          </button>
        ) : null}

        {currentStatus === 'IN_REVIEW' ? (
          <>
            {hasPermission(TEAM_PERMISSIONS.BLOG_REJECT) && (
              <button
                type="button"
                className="admin-secondary-button"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                disabled={loading}
                onClick={() => {
                  if (onRequestRevisionModal) {
                    onRequestRevisionModal()
                  } else {
                    const reason = window.prompt('Reason for requesting revisions:')
                    if (reason) handleAction('REJECT', reason)
                  }
                }}
              >
                Request Revisions
              </button>
            )}
            {hasPermission(TEAM_PERMISSIONS.BLOG_APPROVE) && (
              <button
                type="button"
                className="auth-button"
                style={{ width: 'auto', padding: '6px 14px', backgroundColor: '#8b5cf6' }}
                disabled={loading}
                onClick={() => handleAction('APPROVE', 'Approved for publishing')}
              >
                Approve for Publishing →
              </button>
            )}
          </>
        ) : null}

        {currentStatus === 'IN_PUBLISHING' && hasPermission(TEAM_PERMISSIONS.BLOG_PUBLISH) ? (
          <button
            type="button"
            className="auth-button"
            style={{ width: 'auto', padding: '6px 14px', backgroundColor: '#10b981' }}
            disabled={loading}
            onClick={handlePublish}
          >
            🚀 Publish Article Now
          </button>
        ) : null}

        {currentStatus === 'PUBLISH_FAILED' && hasPermission(TEAM_PERMISSIONS.BLOG_PUBLISH) ? (
          <button
            type="button"
            className="auth-button"
            style={{ width: 'auto', padding: '6px 14px', backgroundColor: '#dc2626' }}
            disabled={loading}
            onClick={handleRetry}
          >
            🔄 Retry Publishing
          </button>
        ) : null}

        {currentStatus === 'PUBLISHED' ? (
          <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✓ Article is Live & Published
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default WorkflowActionsBar


