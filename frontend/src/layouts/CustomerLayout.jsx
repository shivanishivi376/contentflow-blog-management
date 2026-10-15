import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Avatar } from '../components/ui/CustomerComponents.jsx';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import './CustomerLayout.css';

export const CustomerLayout = ({ children, user, onLogout }) => {
  const isTeamUser = user?.accountType === 'TEAM';
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.name || 'User';

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="v2-customer-shell">
      {/* Sidebar with Mobile Support */}
      <Sidebar
        isTeamUser={isTeamUser}
        user={user}
        onLogout={onLogout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="v2-customer-main">
        {/* Top Header Bar matching Fernly Bento screen */}
        <header className="v2-customer-topbar">
          <div className="v2-topbar-left">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="v2-mobile-toggle-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </button>

            {/* Mobile Brand Logo */}
            <div
              className="v2-mobile-brand-logo"
              onClick={() => navigate('/dashboard')}
              title="ContentFlow Workspace"
              style={{ display: 'none', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #155a37 0%, #004124 100%)',
                color: '#a1f5bd',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                boxShadow: '0 2px 6px rgba(21, 90, 55, 0.25)',
              }}>
                CF
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Content<span style={{ color: '#155a37' }}>Flow</span>
              </strong>
            </div>

            {/* Topbar Search Input */}
            <div className="v2-topbar-search">
              <SearchIcon className="v2-search-icon-svg" sx={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder="Search articles, drafts, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="v2-topbar-search-input"
              />
              <span className="v2-search-shortcut-badge">⌘K</span>
            </div>
          </div>

          <div className="v2-topbar-right">
            {/* Profile Chip */}
            <div
              className="v2-profile-chip"
              onClick={() => navigate('/profile')}
              title="View Profile Settings"
            >
              <Avatar
                name={userName}
                src={user?.profileImage?.url || user?.profileImage}
                size={34}
              />
              <div className="v2-profile-chip-text">
                <span className="v2-profile-name">{userName}</span>
                <span className="v2-profile-role">{user?.accountType || 'INDIVIDUAL'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="v2-customer-content">{children}</main>
      </div>
    </div>
  );
};

export default CustomerLayout;
