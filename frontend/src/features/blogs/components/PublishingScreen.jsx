import React, { useState } from 'react'
import { Button, Modal } from '../../../components/ui/CustomerComponents.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'

const PublishingScreen = ({
  blog = {},
  teamMembers = [],
  onPublish,
  onPreview,
  saving = false,
}) => {
  const { hasPermission, isTeam: isTeamUser } = useTeamPermissions()
  const isTeam = isTeamUser || blog.accountType === 'TEAM'
  const canPublish = !isTeam || hasPermission(TEAM_PERMISSIONS.BLOG_PUBLISH)
  const [showConfirm, setShowConfirm] = useState(false)

  const writerMember = teamMembers.find((m) => m.value === blog.writer)
  const reviewerMember = teamMembers.find((m) => m.value === blog.reviewer)

  const infoRows = [
    { label: 'Title', value: blog.title },
    { label: 'Slug', value: `/${blog.slug}` },
    { label: 'Category', value: blog.categoryName || '—' },
    { label: 'Sub Category', value: blog.subcategoryName || '—' },
    { label: 'Writer', value: writerMember?.label?.split(' (')[0] || blog.writerName || '—' },
    { label: 'Reviewer', value: reviewerMember?.label?.split(' (')[0] || blog.reviewerName || '—' },
    { label: 'Content Version', value: blog.versionNumber ? `v${blog.versionNumber}` : '—' },
    {
      label: 'Approved On',
      value: blog.approvedAt
        ? new Date(blog.approvedAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
    },
  ]

  return (
    <div className="wf-publishing-screen">
      {/* Layout: info table + preview */}
      <div className="wf-publishing-layout">
        {/* Left: Blog information table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="v2-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                Blog Information
              </h3>
            </div>
            <table className="wf-publish-info-table">
              <tbody>
                {infoRows.map((row) => (
                  <tr key={row.label}>
                    <td className="wf-info-label">{row.label}</td>
                    <td className="wf-info-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action card */}
          <div className="v2-card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#0f172a' }}>
              Publish Blog
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>
              Review the content before publishing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="outline" onClick={onPreview}>
                  Preview Blog
                </Button>
                {canPublish ? (
                  <Button
                    onClick={() => setShowConfirm(true)}
                    isLoading={saving}
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    🚀 Publish Now
                  </Button>
                ) : (
                  <Button
                    disabled
                    style={{ background: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' }}
                  >
                    🔒 Publisher Only
                  </Button>
                )}
              </div>
              {!canPublish && (
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  Only the assigned Publisher role can publish this team blog live.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="v2-preview-box">
          <div
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Preview
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: '#0f172a' }}>
            {blog.title}
          </h2>
          {blog.description && (
            <p style={{ color: '#475569', fontStyle: 'italic', margin: '0 0 16px' }}>
              {blog.description}
            </p>
          )}
          <div
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: '#334155',
              maxHeight: 480,
              overflowY: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          <div style={{ marginTop: 20 }}>
            <Button variant="outline" size="sm" onClick={onPreview}>
              Preview Blog
            </Button>
          </div>
        </div>
      </div>

      {/* Publish confirmation modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Publish Blog?"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false)
                onPublish?.()
              }}
              isLoading={saving}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              Publish
            </Button>
          </>
        }
      >
        <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>
          This will make the blog publicly available at{' '}
          <strong>/{blog.slug}</strong>. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

export default PublishingScreen
