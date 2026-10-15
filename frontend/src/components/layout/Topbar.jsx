import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/CustomerComponents.jsx'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LogoutIcon from '@mui/icons-material/Logout'

export const Topbar = ({ user, onLogout }) => {
  const navigate = useNavigate()

  return (
    <header className="v2-topbar" style={{ justifyContent: 'flex-end' }}>

      {/* User Actions & Profile */}
      <div className="v2-topbar-user" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* User Info Block */}
        <div
          className="v2-user-info-block"
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '12px',
            transition: 'background 0.15s ease',
          }}
          title="View Profile"
        >
          <Avatar name={user?.name || 'User'} src={user?.profileImage?.url || user?.profileImage} size="md" />
          <div className="v2-user-text">
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {user?.accountType || 'Individual'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <Tooltip title="Sign Out" arrow>
            <IconButton
              onClick={onLogout}
              size="small"
              sx={{
                color: '#ef4444',
                borderRadius: '10px',
                p: 1,
                border: '1px solid #fee2e2',
                backgroundColor: '#ffffff',
                '&:hover': { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
                transition: 'all 0.2s ease',
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </header>
  )
}

export default Topbar
