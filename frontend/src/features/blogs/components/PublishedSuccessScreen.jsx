import { Button } from '../../../components/ui/CustomerComponents.jsx'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

const PublishedSuccessScreen = ({ blog = {}, onOpenDevTo }) => {
  const blogUrl = `${window.location.origin}/blog/${blog.slug}`

  return (
    <div className="wf-success-screen">
      {/* Success Icon */}
      <div className="wf-success-icon">
        <div className="wf-success-circle">
          <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981' }} />
        </div>
      </div>

      <h2 className="wf-success-title">Congratulations!</h2>
      <p className="wf-success-subtitle">
        Your article &ldquo;{blog.title || 'Draft'}&rdquo; is now live and published to the web.
      </p>

      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 18px',
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          Status: Published Live
        </span>
      </div>

      {/* What's Next */}
      <div style={{ width: '100%', maxWidth: 580 }}>
        <h3 className="wf-success-next-title">Next Steps &amp; Distribution</h3>
        <div className="wf-next-cards">
          {/* Show Blog card */}
          <div className="wf-next-card">
            <div className="wf-next-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              🌐
            </div>
            <div className="wf-next-card-content">
              <div className="wf-next-card-title">View Live Article</div>
              <div className="wf-next-card-desc">
                Inspect your published article on the live web permalink.
              </div>
            </div>
            <Button
              onClick={() => window.open(blogUrl, '_blank')}
              size="sm"
              endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            >
              Open Live
            </Button>
          </div>

          {/* Dev.to publication status */}
          <div className="wf-next-card">
            <div className="wf-next-card-icon" style={{ background: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
              DEV
            </div>
            <div className="wf-next-card-content">
              <div className="wf-next-card-title">Dev.to</div>
              <div className="wf-next-card-desc">
                {blog.devToPublished
                  ? 'This article is published on Dev.to.'
                  : blog.devToPublishError || 'This article is not synced with Dev.to yet.'}
              </div>
            </div>
            {blog.devToPublished && blog.devToUrl ? (
              <a
                href={blog.devToUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.88rem' }}
              >
                View on Dev.to ↗
              </a>
            ) : null}
            <Button variant="secondary" size="sm" onClick={onOpenDevTo}>
              {blog.devToPublished ? 'Sync updates' : (blog.devToPublishError ? 'Retry Dev.to' : 'Publish to Dev.to')}
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default PublishedSuccessScreen
