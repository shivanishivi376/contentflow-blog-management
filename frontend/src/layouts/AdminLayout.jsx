import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { adminLogout } from '../features/admin/adminSlice.js'
import { useConfirm } from '../context/ConfirmationContext.jsx'
import IconButton from '@mui/material/IconButton'

// Icons
import GridViewIcon from '@mui/icons-material/GridView'
import PeopleIcon from '@mui/icons-material/People'
import GroupsIcon from '@mui/icons-material/Groups'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LockIcon from '@mui/icons-material/Lock'
import FolderIcon from '@mui/icons-material/Folder'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import LabelIcon from '@mui/icons-material/Label'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import EmailIcon from '@mui/icons-material/Email'
import SettingsIcon from '@mui/icons-material/Settings'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SecurityIcon from '@mui/icons-material/Security'

const adminNavItems = [
  { label: 'Users',         to: '/admin/users',         icon: <PeopleIcon fontSize="small" /> },
  { label: 'Teams',         to: '/admin/teams',         icon: <GroupsIcon fontSize="small" /> },
  { label: 'Roles',         to: '/admin/roles',         icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { label: 'Permissions',   to: '/admin/permissions',   icon: <LockIcon fontSize="small" /> },
  { label: 'Categories',    to: '/admin/categories',    icon: <FolderIcon fontSize="small" /> },
  { label: 'Subcategories', to: '/admin/subcategories', icon: <AccountTreeIcon fontSize="small" /> },
  { label: 'Keywords',      to: '/admin/keywords',      icon: <LabelIcon fontSize="small" /> },
  { label: 'Interests',     to: '/admin/interests',     icon: <BookmarkIcon fontSize="small" /> },
  { label: 'SMTP',          to: '/admin/smtp',          icon: <EmailIcon fontSize="small" /> },
]

const AdminLayout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { confirm } = useConfirm()
  const [isAdminSectionOpen, setIsAdminSectionOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout from the Admin Control Room?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (isConfirmed) {
      dispatch(adminLogout())
      navigate('/admin/login')
    }
  }

  const handleNavClick = () => {
    setIsMobileOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      <div
        className={`v2-sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`v2-sidebar-card ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="v2-sidebar-header">
          <div
            className="v2-sidebar-brand-group"
            onClick={() => {
              navigate('/admin/dashboard')
              setIsMobileOpen(false)
            }}
            title="ContentFlow Control Room"
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#0d3a23',
                color: '#a1f5bd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(13, 58, 35, 0.3)'
              }}
            >
              <SecurityIcon sx={{ fontSize: 22 }} />
            </div>
            <div className="v2-brand-info">
              <strong className="v2-brand-name" style={{ color: '#004124' }}>
                Content<span style={{ color: '#155a37' }}>Flow</span>
              </strong>
              <span className="v2-brand-subtitle">Control Room</span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            style={{
              display: isMobileOpen ? 'flex' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#707971',
              padding: 4
            }}
            aria-label="Close navigation"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="v2-sidebar-menu">
          {/* Dashboard Item */}
          <NavLink
            to="/admin/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
          >
            <div className="v2-link-left">
              <GridViewIcon className="v2-link-icon" fontSize="small" />
              <span>Dashboard</span>
            </div>
            <ChevronRightIcon className="v2-link-arrow" sx={{ fontSize: 16 }} />
          </NavLink>

          {/* Platform Administration Section Header */}
          <div className="v2-menu-group" style={{ marginTop: 10 }}>
            <div
              className="v2-menu-heading-row"
              onClick={() => setIsAdminSectionOpen((prev) => !prev)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              <span className="v2-menu-heading" style={{ padding: 0 }}>PLATFORM ADMINISTRATION</span>
              <IconButton size="small" sx={{ p: 0.2, color: '#707971' }}>
                {isAdminSectionOpen ? (
                  <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </div>

            {isAdminSectionOpen && (
              <div className="v2-nested-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
                  >
                    <div className="v2-link-left">
                      <span className="v2-link-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="v2-sidebar-footer">
          {/* Settings Link */}
          <NavLink
            to="/admin/smtp"
            onClick={handleNavClick}
            className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
          >
            <div className="v2-link-left">
              <SettingsIcon className="v2-link-icon" fontSize="small" />
              <span>Settings</span>
            </div>
            <ChevronRightIcon className="v2-link-arrow" sx={{ fontSize: 16 }} />
          </NavLink>

          {/* Logout Button */}
          <button type="button" className="v2-signout-card-btn" onClick={handleLogout}>
            <LogoutIcon sx={{ fontSize: 18, color: '#ba1a1a' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="v2-mobile-toggle-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Admin Menu"
              style={{ display: 'inline-flex' }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </button>
            <div>
              <span className="admin-topbar-kicker">ContentFlow Control Room</span>
              <h1 style={{ margin: '2px 0 0', fontSize: '1.25rem', color: '#004124', fontWeight: 800 }}>
                Super Admin Matrix
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#155a37',
                background: '#a1f5bd',
                border: '1px solid #78d3a0',
                padding: '4px 12px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Live Telemetry • v4.8
            </span>
          </div>
        </header>

        <section className="admin-panel">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default AdminLayout
