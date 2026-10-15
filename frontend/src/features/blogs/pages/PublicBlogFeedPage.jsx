import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPublicBlogsRequest, fetchPublicCategoriesRequest } from '../../../services/api/publicApi.js'
import { SearchInput, Badge, Button, LoadingState, EmptyState } from '../../../components/ui/CustomerComponents.jsx'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'

const calculateReadingTime = (content = '', description = '') => {
  const text = `${description} ${content}`.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

const PublicBlogFeedPage = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [blogsRes, catRes] = await Promise.all([
        fetchPublicBlogsRequest({ category: selectedCategory || undefined, search: search || undefined }),
        fetchPublicCategoriesRequest(),
      ])

      setBlogs(blogsRes.data?.data?.blogs || [])
      setCategories(catRes.data?.data?.categories || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load published articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadData()
  }

  const featuredBlog = blogs[0]
  const restBlogs = blogs.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Editorial Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}>
              CF
            </div>
            <div>
              <strong style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                Content Flow
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Editorial Network
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 64px', width: '100%', flex: 1 }}>
        
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '24px',
          padding: '44px 36px',
          marginBottom: '36px',
          boxShadow: '0 4px 20px -2px rgba(37, 99, 235, 0.08)',
        }}>
          <div style={{ maxWidth: '720px' }}>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#2563eb',
              background: '#dbeafe',
              padding: '4px 12px',
              borderRadius: 999,
              display: 'inline-block',
              marginBottom: 14,
            }}>
              Discover & Read
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
              Explore curated stories and deep-dive engineering articles
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Written and peer-reviewed by expert creators, engineering teams, and thought leaders worldwide.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <SearchInput
                  placeholder="Search articles by title, summary or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => { setSearch(''); loadData(); }}
                />
              </div>
              <Button type="submit" variant="primary" size="md">Search</Button>
            </div>

            {/* Category Topic Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === '' ? '#2563eb' : '#e2e8f0',
                  background: selectedCategory === '' ? '#2563eb' : '#ffffff',
                  color: selectedCategory === '' ? '#ffffff' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                All Topics
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setSelectedCategory(cat._id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat._id ? '#2563eb' : '#e2e8f0',
                    background: selectedCategory === cat._id ? '#2563eb' : '#ffffff',
                    color: selectedCategory === cat._id ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </form>
        </section>

        {error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', color: '#991b1b', marginBottom: 24 }}>
            {error}
          </div>
        ) : null}

        {loading ? (
          <LoadingState message="Loading latest published stories..." />
        ) : blogs.length === 0 ? (
          <EmptyState
            icon={<AutoStoriesOutlinedIcon fontSize="large" />}
            title="No published articles found"
            description="Try adjusting your topic filters or search query to find more articles."
            action={
              <Button variant="outline" size="sm" onClick={() => { setSelectedCategory(''); setSearch(''); }}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Featured Article Card */}
            {featuredBlog && (
              <article
                onClick={() => navigate(`/blog/${featuredBlog.slug}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                  display: 'grid',
                  gridTemplateColumns: featuredBlog.featuredImage ? '1fr 1fr' : '1fr',
                  gap: 0,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {featuredBlog.featuredImage && (
                  <div style={{ height: '100%', minHeight: 320, background: '#f1f5f9' }}>
                    <img
                      src={featuredBlog.featuredImage}
                      alt={featuredBlog.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <Badge variant="info">{featuredBlog.category?.name || 'Featured'}</Badge>
                      {featuredBlog.subcategory && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          › {featuredBlog.subcategory.name}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 14px' }}>
                      {featuredBlog.title}
                    </h2>

                    <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {featuredBlog.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 18, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: '#2563eb', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {(featuredBlog.author?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{featuredBlog.author?.name || 'Author'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(featuredBlog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', fontWeight: 700, fontSize: '0.88rem' }}>
                      <span>Read Story</span>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Grid of Remaining Articles */}
            {restBlogs.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}>
                {restBlogs.map((blog) => (
                  <article
                    key={blog.id || blog._id}
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {blog.featuredImage ? (
                        <div style={{ height: 180, width: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : null}

                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <Badge variant="info" size="sm">{blog.category?.name || 'General'}</Badge>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AccessTimeIcon sx={{ fontSize: 13 }} />
                            {calculateReadingTime(blog.content, blog.description)}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35, margin: '0 0 10px' }}>
                          {blog.title}
                        </h3>

                        <p style={{
                          fontSize: '0.88rem',
                          color: '#64748b',
                          lineHeight: 1.55,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {blog.description}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      padding: '14px 20px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      background: '#fafafa',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PersonOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <span style={{ fontWeight: 600, color: '#334155' }}>{blog.author?.name || 'Author'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <span>{new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Editorial Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '32px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#0f172a' }}>Content Flow</p>
        <p style={{ margin: 0 }}>Clean, modern, collaborative editorial publication network.</p>
      </footer>
    </div>
  )
}

export default PublicBlogFeedPage
