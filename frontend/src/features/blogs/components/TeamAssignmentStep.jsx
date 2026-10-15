import React from 'react'
import { Avatar, Button, Select } from '../../../components/ui/CustomerComponents.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'

export const filterMembersForRole = (members = [], roleName = '') => {
  const target = (roleName || '').toLowerCase().trim()
  return members.filter((m) => {
    const role = (m.workflowRole || m.role || '').toLowerCase().trim()
    if (role) {
      return role === target
    }
    const label = (m.label || '').toLowerCase()
    return label.includes(`(${target}`) || label.includes(` ${target}`)
  })
}

const TeamAssignmentStep = ({
  teamMembers = [],
  formData = {},
  onFormChange,
  onBack,
  onSave,
  saving = false,
  error = '',
  isOwner: isOwnerProp,
}) => {
  const { isOwner: isOwnerHook } = useTeamPermissions()
  const isOwner = isOwnerProp !== undefined ? isOwnerProp : isOwnerHook


  const ROLES = [
    {
      key: 'writer',
      icon: '✏️',
      name: 'Writer',
      required: true,
      description: 'Responsible for writing and editing the blog content.',
      color: '#3b82f6',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      key: 'reviewer',
      icon: '🔍',
      name: 'Reviewer',
      required: true,
      description: 'Responsible for reviewing and approving content.',
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
    },
    {
      key: 'publisher',
      icon: '🚀',
      name: 'Publisher',
      required: true,
      description: 'Responsible for publishing the approved blog.',
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
  ]

  const getSelectedMember = (roleKey) => {
    const val = formData[roleKey]
    return teamMembers.find((m) => m.value === val)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!isOwner && (
        <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 10, fontSize: '0.88rem' }}>
          👑 <strong>Team Owner Assignment:</strong> Blog role assignments must be set by the Team Owner. You can view the assignments below.
        </div>
      )}

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

      {/* Three Role Cards */}
      <div className="wf-assignment-cards">
        {ROLES.map((role) => {
          const selected = getSelectedMember(role.key)
          const filteredMembers = filterMembersForRole(teamMembers, role.name)
          const options = [
            {
              label: filteredMembers.length === 0
                ? `Select ${role.name} (No ${role.name.toLowerCase()}s in team)`
                : `Select ${role.name}`,
              value: '',
            },
            ...filteredMembers,
          ]

          if (selected && !filteredMembers.some((m) => m.value === selected.value)) {
            options.push(selected)
          }

          return (
            <div
              key={role.key}
              className="wf-assignment-card"
              style={{ borderTop: `3px solid ${role.color}` }}
            >
              {/* Card header */}
              <div className="wf-assignment-card-header">
                <div
                  className="wf-role-icon-circle"
                  style={{ background: role.bg, color: role.color }}
                >
                  {role.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    {role.name}{' '}
                    {role.required && (
                      <span style={{ color: '#ef4444' }}>*</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                    {role.description}
                  </div>
                </div>
              </div>

              {/* Dropdown */}
              <div style={{ marginTop: 16 }}>
                <Select
                  label={`Select ${role.name}`}
                  value={formData[role.key] || ''}
                  onChange={(e) => onFormChange(role.key, e.target.value)}
                  options={options}
                  disabled={!isOwner}
                />
                {filteredMembers.length === 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#b45309' }}>
                    ⚠️ No team members with the {role.name} role found in this team.
                  </div>
                )}
              </div>

              {/* Selected member display */}
              {selected && (
                <div className="wf-member-display">
                  <Avatar name={selected.label || 'Member'} size="sm" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                      {(selected.label || '').split(' (')[0] || 'Team Member'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {selected.label || ''}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )
        })}
      </div>

      {/* Note */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '0.84rem',
          color: '#64748b',
        }}
      >
        💡 Note: Only the Team Owner can reassign roles for team blogs.
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16,
        }}
      >
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onSave} isLoading={saving} disabled={!isOwner}>
          Save &amp; Next →
        </Button>
      </div>
    </div>
  )
}

export default TeamAssignmentStep
