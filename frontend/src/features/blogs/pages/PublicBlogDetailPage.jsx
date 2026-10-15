import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchPublicBlogBySlugRequest } from '../../../services/api/publicApi.js'
import { Avatar, Badge, Button, LoadingState } from '../../../components/ui/CustomerComponents.jsx'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

const calculateReadingTime = (content = '', description = '') => {
  const text = `${description} ${content}`.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

const PublicBlogDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetchPublicBlogBySlugRequest(slug)
        setBlog(response.data?.data?.blog || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Article not found or unavailable')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas, #e9ebe9)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Reader Navbar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-hairline, #e3e7e4)',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #155a37 0%, #004124 100%)',
              color: '#a1f5bd',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '0.88rem',
              boxShadow: '0 2px 8px rgba(21, 90, 55, 0.25)',
            }}>
              CF
            </div>
            <strong style={{ fontSize: '1.15rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Content<span style={{ color: '#155a37' }}>Flow</span>
            </strong>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              variant="outline"
              size="sm"
              startIcon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleShare}
              style={{ borderRadius: '9999px' }}
            >
              {copied ? 'Link Copied!' : 'Share Story'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 20px 80px', width: '100%', flex: 1 }}>
        {loading ? (
          <LoadingState message="Loading article..." />
        ) : error || !blog ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '24px', border: '1px solid var(--border-hairline, #e3e7e4)' }}>
            <div style={{ color: '#ba1a1a', fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
              {error || 'Article not found.'}
            </div>
            <p style={{ color: '#687a6e', marginBottom: '24px' }}>This story might have been moved or unpublished.</p>
            <Button variant="primary" onClick={handleBack} style={{ borderRadius: '9999px' }}>← Go Back</Button>
          </div>
        ) : (
          <article style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-hairline, #e3e7e4)',
            padding: '48px 44px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}>
            
            {/* Top Back Trigger */}
            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#155a37',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                <span>Back to Stories</span>
              </button>
            </div>

            {/* Category & Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{
                background: '#e6f9ed',
                color: '#004124',
                border: '1px solid #c2eed1',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}>
                {blog.category?.name || 'General'}
              </span>
              {blog.subcategory && (
                <span style={{ fontSize: '0.82rem', color: '#687a6e', fontWeight: 600 }}>
                  › {blog.subcategory.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="editorial-title" style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              lineHeight: 1.2,
              margin: '0 0 18px',
              color: '#0f172a',
            }}>
              {blog.title}
            </h1>

            {/* Subtitle / Description */}
            {blog.description ? (
              <p style={{
                fontSize: '1.18rem',
                color: '#475569',
                lineHeight: 1.6,
                margin: '0 0 28px',
              }}>
                {blog.description}
              </p>
            ) : null}

            {/* Author and Metadata Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 0',
              borderTop: '1px solid #f1f5f9',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: 36,
              flexWrap: 'wrap',
              gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar
                  name={blog.author?.name || blog.author?.username || 'Author'}
                  src={blog.author?.profileImage?.url || blog.author?.profileImage}
                  size={44}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.98rem' }}>
                    {blog.author?.name || blog.author?.username || 'Author'}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Author & Creator
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
                  {new Date(blog.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  {calculateReadingTime(blog.content, blog.description)}
                </span>
              </div>
            </div>

            {/* Featured Hero Image */}
            {blog.featuredImage ? (
              <div style={{ marginBottom: 36, borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  style={{ width: '100%', maxHeight: '460px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : null}

            {/* Editorial Content Body */}
            <div
              className="editorial-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* External Syndication Notice if Dev.to published */}
            {blog.devToUrl && (
              <div style={{
                marginTop: 48,
                padding: '16px 20px',
                background: '#f2f4f2',
                border: '1px solid var(--border-hairline, #e3e7e4)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.88rem', color: '#384b3e' }}>
                  Also syndicated on <strong>DEV Community</strong>
                </span>
                <a
                  href={blog.devToUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#155a37', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <span>Read on DEV.to</span>
                  <OpenInNewIcon sx={{ fontSize: 15 }} />
                </a>
              </div>
            )}

          </article>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-hairline, #e3e7e4)', padding: '24px 24px', textAlign: 'center', color: '#687a6e', fontSize: '0.84rem' }}>
        ContentFlow &copy; {new Date().getFullYear()} &middot; Fernly Bento Publication Engine
      </footer>
    </div>
  )
}

export default PublicBlogDetailPage
