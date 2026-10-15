import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

// Icons
import GridViewIcon from '@mui/icons-material/GridView';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export const Sidebar = ({ isTeamUser = false, user, onLogout, isMobileOpen = false, onCloseMobile }) => {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`v2-sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`v2-sidebar-card ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="v2-sidebar-header">
          <div
            className="v2-sidebar-brand-group"
            onClick={() => handleNavClick('/dashboard')}
            title="Go to Creator Workspace"
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #155a37 0%, #004124 100%)',
                color: '#a1f5bd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(21, 90, 55, 0.25)',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 22, color: '#a1f5bd' }} />
            </div>
            <div className="v2-brand-info">
              <strong className="v2-brand-name" style={{ color: '#004124' }}>
                Content<span style={{ color: '#155a37' }}>Flow</span>
              </strong>
              <span className="v2-brand-subtitle">Workspace</span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-outline hover:text-on-surface"
              style={{ display: isMobileOpen ? 'flex' : 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: '#707971' }}
              aria-label="Close navigation"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          )}
        </div>

        {/* Primary CTA Button: Create Blog */}
        {(!isTeamUser || user?.workflowRole === 'Writer' || user?.isOwner) && (
          <button
            type="button"
            className="v2-create-blog-btn"
            onClick={() => handleNavClick('/blogs/create')}
          >
            <AddCircleIcon sx={{ fontSize: 19 }} />
            <span>Create Blog</span>
          </button>
        )}

        {/* Main Navigation Menu */}
        <nav className="v2-sidebar-menu">
          <div className="v2-menu-group">
            <span className="v2-menu-heading">MAIN MENU</span>

            <NavLink
              to="/dashboard"
              onClick={onCloseMobile}
              className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
            >
              <div className="v2-link-left">
                <GridViewIcon className="v2-link-icon" fontSize="small" />
                <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink
              to="/blogs"
              end
              onClick={onCloseMobile}
              className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
            >
              <div className="v2-link-left">
                <ArticleIcon className="v2-link-icon" fontSize="small" />
                <span>My Blogs</span>
              </div>
            </NavLink>

            <NavLink
              to="/categories"
              onClick={onCloseMobile}
              className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
            >
              <div className="v2-link-left">
                <AccountTreeIcon className="v2-link-icon" fontSize="small" />
                <span>Categories & Keywords</span>
              </div>
            </NavLink>

            {isTeamUser && (
              <NavLink
                to="/team"
                onClick={onCloseMobile}
                className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
              >
                <div className="v2-link-left">
                  <GroupIcon className="v2-link-icon" fontSize="small" />
                  <span>Team Hub</span>
                </div>
              </NavLink>
            )}
          </div>

          {/* Settings Section */}
          <div className="v2-menu-group">
            <span className="v2-menu-heading">SETTINGS</span>

            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              className={({ isActive }) => `v2-menu-link ${isActive ? 'active' : ''}`}
            >
              <div className="v2-link-left">
                <PersonIcon className="v2-link-icon" fontSize="small" />
                <span>Profile & Security</span>
              </div>
              <ChevronRightIcon className="v2-link-arrow" sx={{ fontSize: 16 }} />
            </NavLink>
          </div>
        </nav>

        {/* Footer Section */}
        <div className="v2-sidebar-footer">
          {onLogout && (
            <button
              type="button"
              className="v2-signout-card-btn"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
            >
              <LogoutIcon sx={{ fontSize: 18, color: '#ba1a1a' }} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
