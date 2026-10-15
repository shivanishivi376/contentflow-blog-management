import { useEffect, useState } from 'react'
import { fetchExternalPublicationsRequest, publishToDevToRequest } from '../../../services/api/devtoApi.js'
import { Button } from '../../../components/ui/CustomerComponents.jsx'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'

const DevToPublishModal = ({
  blog,
  isOpen,
  onClose,
  onPublished,
  isPostPublishConfirm = false,
}) => {
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [publishedUrl, setPublishedUrl] = useState('')
  const [publications, setPublications] = useState([])

  const blogId = blog?.id || blog?._id

  useEffect(() => {
    if (!isOpen || !blogId) return undefined

    let isActive = true
    setError('')
    setMessage('')
    setPublishedUrl('')
    setLoading(false)

    fetchExternalPublicationsRequest(blogId)
      .then((response) => {
        if (isActive) setPublications(response.data?.data?.publications || [])
      })
      .catch((err) => {
        if (isActive) {
          setError(err.response?.data?.message || 'Failed to load previous Dev.to publications')
        }
      })

    return () => {
      isActive = false
    }
  }, [isOpen, blogId])

  if (!isOpen || !blog) return null

  const handlePublish = async (e) => {
    e?.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')
    setMessage('')

    const currentBlogId = blog.id || blog._id
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    try {
      const response = await publishToDevToRequest(currentBlogId, { tags: parsedTags })
      const pub = response.data?.data?.publication
      const url = pub?.externalUrl || response.data?.data?.url
      setMessage('Article published to Dev.to successfully!')
      if (url) {
        setPublishedUrl(url)
      }
      if (pub) {
        setPublications((previous) => [pub, ...previous.filter((item) => item._id !== pub._id)])
      }
      onPublished?.(pub || response.data?.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish to Dev.to')
    } finally {
      setLoading(false)
    }
  }

  const handleSkipOrCancel = () => {
    if (loading) return
    onClose?.()
  }

  return (
    <div className="v2-modal-overlay" onClick={handleSkipOrCancel}>
      <div className="v2-modal-container" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="v2-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#090909',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                flexShrink: 0,
              }}
            >
              DEV
            </div>
            <div>
              <h3 className="v2-modal-title" style={{ margin: 0, fontSize: '1.05rem' }}>
                {isPostPublishConfirm ? 'Publish to Dev.to?' : 'Cross-Post to Dev.to'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {isPostPublishConfirm
                  ? 'Blog published to platform successfully'
                  : 'Syndicate article to developer community'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="v2-modal-close-btn"
            onClick={handleSkipOrCancel}
            aria-label="Close dialog"
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: 19 }} />
          </button>
        </div>

        <div className="v2-modal-body">
          {/* Post-publish confirmation banner */}
          {isPostPublishConfirm ? (
            <div
              style={{
                padding: '14px 16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 22, marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem', marginBottom: 2 }}>
                  Blog Published to Platform!
                </div>
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  Your blog is now live on our platform. Would you also like to cross-post{' '}
                  <strong style={{ color: '#14532d' }}>&ldquo;{blog.title}&rdquo;</strong> to Dev.to for broader developer reach?
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Publish <strong style={{ color: '#0f172a' }}>&ldquo;{blog.title}&rdquo;</strong> directly to Dev.to for broader developer reach.
            </p>
          )}

          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fee2e2',
                color: '#b91c1c',
                borderRadius: 8,
                fontSize: '0.86rem',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {message && (
            <div
              style={{
                padding: '12px 14px',
                background: '#dcfce7',
                color: '#15803d',
                borderRadius: 8,
                fontSize: '0.86rem',
                marginBottom: 14,
              }}
            >
              <div style={{ fontWeight: 600 }}>{message}</div>
              {publishedUrl && (
                <div style={{ marginTop: 6 }}>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#16a34a', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    View published article on Dev.to ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {!publishedUrl && (
            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="v2-field-group">
                <label className="v2-label">Optional article tags (comma separated, max 4)</label>
                <input
                  type="text"
                  className="v2-input"
                  placeholder="Defaults to this blog's category and keywords"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipOrCancel}
                  disabled={loading}
                >
                  {isPostPublishConfirm ? 'Skip / Not Now' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={loading}
                  style={{ background: '#090909', borderColor: '#090909' }}
                >
                  🚀 Publish to Dev.to
                </Button>
              </div>
            </form>
          )}

          {publishedUrl && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button
                type="button"
                onClick={onClose}
                style={{ background: '#090909', borderColor: '#090909' }}
              >
                Done
              </Button>
            </div>
          )}

          {publications.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>
                Previous External Publications:
              </h4>
              {publications.map((pub) => (
                <div key={pub._id} style={{ fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{pub.externalPlatform}:</span>{' '}
                  <a href={pub.externalUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                    {pub.externalUrl}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DevToPublishModal
