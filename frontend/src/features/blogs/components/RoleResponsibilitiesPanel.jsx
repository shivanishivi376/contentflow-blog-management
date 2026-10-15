import React from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'

const ROLES = [
  {
    key: 'writer',
    name: 'Writer',
    badge: 'Drafting',
    icon: <EditOutlinedIcon sx={{ fontSize: 18 }} />,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    iconBorder: '#dbeafe',
    description: 'Creates and writes the blog content, manages revisions, and submits for editorial review.',
  },
  {
    key: 'reviewer',
    name: 'Reviewer',
    badge: 'Editorial',
    icon: <RateReviewOutlinedIcon sx={{ fontSize: 18 }} />,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    iconBorder: '#fef3c7',
    description: 'Publishes review feedback comments, and approves or requests changes on submissions.',
  },
  {
    key: 'publisher',
    name: 'Publisher',
    badge: 'Distribution',
    icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} />,
    iconBg: '#e3f2e9',
    iconColor: '#004124',
    iconBorder: '#bce4ce',
    description: 'Finalizes approved blogs and publishes them live to audiences and syndicated platforms.',
  },
]

const RoleResponsibilitiesPanel = () => {
  return (
    <div
      style={{
        marginTop: 16,
        background: '#ffffff',
        border: '1px solid #e3e7e4',
        borderRadius: 20,
        padding: '20px',
        boxShadow: '0 4px 20px -4px rgba(13, 58, 35, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #edf1ee' }}>
        <h4
          style={{
            margin: 0,
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#004124',
          }}
        >
          Role Responsibilities
        </h4>
        <span style={{ fontSize: '0.72rem', color: '#707971', fontWeight: 600 }}>Team Workflow</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROLES.map((role) => (
          <div
            key={role.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 14,
              background: '#fcfdfc',
              border: '1px solid #e8ece8',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: role.iconBg,
                color: role.iconColor,
                border: `1px solid ${role.iconBorder}`,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {role.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#191c1b' }}>
                  {role.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: role.iconBg,
                    color: role.iconColor,
                    border: `1px solid ${role.iconBorder}`,
                  }}
                >
                  {role.badge}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  lineHeight: 1.45,
                  color: '#4f5b51',
                }}
              >
                {role.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoleResponsibilitiesPanel
