import React from 'react'
import { Avatar, Button, Select } from '../../../components/ui/CustomerComponents.jsx'
import { filterMembersForRole } from './TeamAssignmentStep.jsx'

const ReAssignScreen = ({
  blog = {},
  teamMembers = [],
  reviewerComments = [],
  formData = {},
  onFormChange,
  onSendBack,
  sending = false,
  error = '',
}) => {
  const otherWriters = filterMembersForRole(
    teamMembers.filter((m) => m.value !== formData.writer),
    'Writer'
  )
  const writerOptions = [
    { label: 'Keep current writer', value: formData.writer || '' },
    ...otherWriters,
  ]

  const reviewerMember = teamMembers.find((m) => m.value === formData.reviewer)
  const publisherMember = teamMembers.find((m) => m.value === formData.publisher)
  const writerMember = teamMembers.find((m) => m.value === formData.writer)

  return (
    <div className="wf-reassign-screen">
      {/* Rejection Banner */}
      <div className="wf-rejection-banner">
        <div className="wf-rejection-icon">⚠</div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Blog Rejected</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
            This blog has been rejected. Please check the reviewer comments and update
            the content before submitting again.
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 10,
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      <div className="wf-reassign-grid">
        {/* Left: Reviewer Comments + Writer Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Reviewer Comments */}
          <div className="v2-card" style={{ padding: 20 }}>
            <h3
              style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0f172a' }}
            >
              Reviewer Comments
            </h3>

            {reviewerComments.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                No reviewer comments available.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviewerComments.map((c) => (
                  <div key={c._id} className="wf-reviewer-comment">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <Avatar name={c.author?.name || 'R'} size="sm" />
                      <div>
                        <div
                          style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}
                        >
                          {c.author?.name || 'Reviewer'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#334155',
                        lineHeight: 1.6,
                        padding: '10px 14px',
                        background: '#fef3c7',
                        borderRadius: 8,
                        borderLeft: '3px solid #f59e0b',
                      }}
                    >
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Writer Re-assignment */}
          <div className="v2-card" style={{ padding: 20 }}>
            <h3
              style={{ margin: '0 0 6px', fontSize: '1rem', color: '#0f172a' }}
            >
              Reassign to Writer
            </h3>
            <p
              style={{
                margin: '0 0 16px',
                fontSize: '0.85rem',
                color: '#64748b',
              }}
            >
              Select the team member who will revise the content.
            </p>

            <Select
              label="Writer"
              value={formData.writer || ''}
              onChange={(e) => onFormChange?.('writer', e.target.value)}
              options={[
                { label: '-- Select Writer --', value: '' },
                ...teamMembers,
              ]}
            />

            {writerMember && (
              <div className="wf-member-display" style={{ marginTop: 12 }}>
                <Avatar name={writerMember.label} size="sm" />
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}
                  >
                    {writerMember.label.split(' (')[0]}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Assigned Writer
                  </div>
                </div>
              </div>
            )}

            {/* Current assignments */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Reviewer:</span>{' '}
                {reviewerMember?.label?.split(' (')[0] || 'Unassigned'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Publisher:</span>{' '}
                {publisherMember?.label?.split(' (')[0] || 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Action */}
          <div>
            <div
              style={{
                padding: '10px 14px',
                background: '#fef9c3',
                border: '1px solid #fde047',
                borderRadius: 8,
                fontSize: '0.82rem',
                color: '#854d0e',
                marginBottom: 16,
              }}
            >
              After sending back, status will change to{' '}
              <strong>In Writing</strong>.
            </div>
            <Button
              onClick={onSendBack}
              isLoading={sending}
              disabled={!formData.writer}
              style={{ width: '100%' }}
            >
              Send Back to Writer
            </Button>
          </div>
        </div>

        {/* Right: Blog info */}
        <div className="v2-card" style={{ padding: 20 }}>
          <h3
            style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0f172a' }}
          >
            Blog Details
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem', marginBottom: 2 }}>
                Title
              </span>
              <strong style={{ color: '#0f172a' }}>{blog.title}</strong>
            </div>
            <div>
              <span
                style={{ color: '#64748b', display: 'block', fontSize: '0.78rem', marginBottom: 2 }}
              >
                Slug
              </span>
              <span style={{ color: '#475569' }}>/{blog.slug}</span>
            </div>
            <div>
              <span
                style={{ color: '#64748b', display: 'block', fontSize: '0.78rem', marginBottom: 2 }}
              >
                Status
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              >
                Re Assign
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReAssignScreen
