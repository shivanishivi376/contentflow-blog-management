import React from 'react'

const WORKFLOW_STEPS = [
  {
    key: 'DRAFT',
    label: 'Draft',
    description: 'Blog created but not started.',
    color: '#94a3b8',
    dot: '#94a3b8',
  },
  {
    key: 'IN_WRITING',
    label: 'In Writing',
    description: 'Writer is creating the content.',
    color: '#3b82f6',
    dot: '#3b82f6',
  },
  {
    key: 'IN_REVIEW',
    label: 'In Review',
    description: 'Writer is reviewing the content.',
    color: '#f59e0b',
    dot: '#f59e0b',
  },
  {
    key: 'RE_ASSIGN',
    label: 'Re Assign',
    description: 'Blog rejected and sent back to writer.',
    color: '#ef4444',
    dot: '#ef4444',
  },
  {
    key: 'IN_PUBLISHING',
    label: 'In Publishing',
    description: 'Publisher is publishing the blog.',
    color: '#8b5cf6',
    dot: '#8b5cf6',
  },
  {
    key: 'PUBLISHED',
    label: 'Published',
    description: 'Blog is live and available.',
    color: '#16a34a',
    dot: '#22c55e',
  },
]

const WorkflowStatusGuide = ({ currentStatus = 'DRAFT' }) => {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStatus)

  return (
    <div className="wf-guide-panel">
      <div className="wf-guide-section">
        <h4 className="wf-guide-heading">Workflow &amp; Status Guide</h4>
        <div className="wf-status-guide">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = step.key === currentStatus
            const isDone = currentIndex > idx
            const isPast = currentIndex < idx

            return (
              <div key={step.key} className="wf-status-step">
                {/* Connector line above (except first) */}
                {idx > 0 && (
                  <div
                    className="wf-step-connector"
                    style={{ background: isDone || isActive ? step.color : '#e2e8f0' }}
                  />
                )}
                <div className="wf-step-row">
                  <div
                    className={`wf-step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                    style={{
                      background: isActive ? step.dot : isDone ? '#dcfce7' : '#f1f5f9',
                      border: `2px solid ${isActive ? step.dot : isDone ? '#86efac' : '#e2e8f0'}`,
                    }}
                  >
                    {isDone && <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>✓</span>}
                    {isActive && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          background: '#fff',
                          borderRadius: '50%',
                          display: 'block',
                        }}
                      />
                    )}
                  </div>
                  <div className="wf-step-text">
                    <span
                      className="wf-step-name"
                      style={{
                        color: isActive ? step.color : isDone ? '#16a34a' : '#94a3b8',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="wf-step-desc">{step.description}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* User Type Guide */}
      <div className="wf-guide-section" style={{ marginTop: 20 }}>
        <h4 className="wf-guide-heading">User Type Guide</h4>
        <div className="wf-user-type-card">
          <div className="wf-user-type-icon">👤</div>
          <div>
            <div className="wf-user-type-name">Individual User</div>
            <div className="wf-user-type-desc">
              Can create, write, self review and publish directly.
            </div>
          </div>
        </div>
        <div className="wf-user-type-card" style={{ marginTop: 8 }}>
          <div className="wf-user-type-icon">👥</div>
          <div>
            <div className="wf-user-type-name">Team User</div>
            <div className="wf-user-type-desc">
              Must follow the full workflow with assigned roles.
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="wf-guide-section" style={{ marginTop: 20 }}>
        <h4 className="wf-guide-heading">Important Notes</h4>
        <ul className="wf-notes-list">
          <li>Blog status cannot be manually changed.</li>
          <li>Proper workflow must be followed.</li>
          <li>Rejected blogs go back to writer for updates.</li>
          <li>Use AI tools to improve content quality.</li>
        </ul>
      </div>
    </div>
  )
}

export default WorkflowStatusGuide
