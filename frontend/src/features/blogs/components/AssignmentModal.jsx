import { useState, useEffect } from 'react'
import { assignBlogRolesRequest } from '../../../services/api/blogApi.js'
import { filterMembersForRole } from './TeamAssignmentStep.jsx'
import { Select } from '../../../components/ui/CustomerComponents.jsx'

const AssignmentModal = ({ isOpen, onClose, blogId, initialWriter, initialReviewer, initialPublisher, teamMembers = [], onAssigned }) => {
  const [writer, setWriter] = useState(initialWriter || '')
  const [reviewer, setReviewer] = useState(initialReviewer || '')
  const [publisher, setPublisher] = useState(initialPublisher || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setWriter(initialWriter || '')
    setReviewer(initialReviewer || '')
    setPublisher(initialPublisher || '')
    setError('')
  }, [initialWriter, initialReviewer, initialPublisher, isOpen])

  if (!isOpen) return null

  const validateRoles = () => {
    if (!writer || !reviewer || !publisher) {
      return 'Please select a team member for all 3 roles (Writer, Reviewer, Publisher).'
    }
    const set = new Set([String(writer), String(reviewer), String(publisher)])
    if (set.size !== 3) {
      return 'Validation Error: Writer, Reviewer, and Publisher must be 3 distinct team members.'
    }
    return null
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    const validationErr = validateRoles()
    if (validationErr) {
      setError(validationErr)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await assignBlogRolesRequest(blogId, { writer, reviewer, publisher })
      const updatedBlog = response.data?.data?.blog
      onAssigned?.(updatedBlog)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign team roles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Assign Team Workflow Roles</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '20px' }}>
          In Team mode, you must assign 3 distinct members for the authoring, reviewing, and publishing lifecycle.
        </p>

        {error ? (
          <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="✍️ Writer Role"
            required
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="-- Select Writer --"
            options={(() => {
              const filtered = filterMembersForRole(teamMembers, 'Writer')
              const current = teamMembers.find((m) => m.value === writer)
              const options = [...filtered]
              if (current && !filtered.some((m) => m.value === current.value)) {
                options.push(current)
              }
              return options.map((member) => ({ value: member.value, label: member.label }))
            })()}
          />

          <Select
            label="🔍 Reviewer Role"
            required
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="-- Select Reviewer --"
            options={(() => {
              const filtered = filterMembersForRole(teamMembers, 'Reviewer')
              const current = teamMembers.find((m) => m.value === reviewer)
              const options = [...filtered]
              if (current && !filtered.some((m) => m.value === current.value)) {
                options.push(current)
              }
              return options.map((member) => ({ value: member.value, label: member.label }))
            })()}
          />

          <Select
            label="🚀 Publisher Role"
            required
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="-- Select Publisher --"
            options={(() => {
              const filtered = filterMembersForRole(teamMembers, 'Publisher')
              const current = teamMembers.find((m) => m.value === publisher)
              const options = [...filtered]
              if (current && !filtered.some((m) => m.value === current.value)) {
                options.push(current)
              }
              return options.map((member) => ({ value: member.value, label: member.label }))
            })()}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-button"
              style={{ width: 'auto', padding: '8px 20px' }}
              disabled={loading}
            >
              {loading ? 'Saving Roles...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignmentModal
