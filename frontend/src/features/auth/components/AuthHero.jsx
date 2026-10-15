import React from 'react'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import EditNoteIcon from '@mui/icons-material/EditNote'
import ShareIcon from '@mui/icons-material/Share'

const AuthHero = ({
  badge = 'Creator Workspace',
  title = 'Where ideas flow into published stories.',
  description = 'A calm, modern editorial workspace for independent writers and high-velocity publishing teams.',
}) => {
  return (
    <div className="auth-hero-panel">
      {/* Top Brand Identity */}
      <div>
        <div className="flex items-center gap-2.5 mb-6" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(161, 245, 189, 0.2)',
              border: '1px solid rgba(161, 245, 189, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a1f5bd',
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 22 }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            ContentFlow
          </span>
        </div>

        <div className="auth-badge">
          <span>✨</span>
          <span>{badge}</span>
        </div>

        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {/* Stacked Bento Feature Cards */}
      <div className="auth-points">
        <div>
          <span className="point-num">
            <EditNoteIcon sx={{ fontSize: 20 }} />
          </span>
          <div>
            <p>Distraction-Free Drafting</p>
            <span className="point-desc">Rich markdown & TipTap integration</span>
          </div>
        </div>

        <div>
          <span className="point-num">
            <AutoStoriesIcon sx={{ fontSize: 18 }} />
          </span>
          <div>
            <p>Team Editorial Pipeline</p>
            <span className="point-desc">Multi-stage reviews and live comments</span>
          </div>
        </div>

        <div>
          <span className="point-num">
            <ShareIcon sx={{ fontSize: 18 }} />
          </span>
          <div>
            <p>One-Click Syndication</p>
            <span className="point-desc">Direct to Dev.to and public domains</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AuthHero
