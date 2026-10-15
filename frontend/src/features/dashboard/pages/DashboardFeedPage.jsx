import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRecommendedBlogsRequest, fetchUserProfileRequest } from '../../../services/api/userApi.js'
import { fetchBlogsRequest } from '../../../services/api/blogApi.js'
import { Badge, Button, EmptyState, LoadingState } from '../../../components/ui/CustomerComponents.jsx'

// Icons
import AddIcon from '@mui/icons-material/Add'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

const DashboardFeedPage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [myBlogs, setMyBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const [profRes, recRes, blogRes] = await Promise.all([
        fetchUserProfileRequest(),
        fetchRecommendedBlogsRequest(),
        fetchBlogsRequest({ limit: 6 }),
      ])

      setProfile(profRes.data?.data?.profile || null)
      setRecommended(recRes.data?.data?.blogs || [])
      setMyBlogs(blogRes.data?.data?.blogs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return <LoadingState message="Loading your creator workspace..." />
  }

  const draftsCount = myBlogs.filter((b) => b.status === 'DRAFT' || b.status === 'IN_WRITING').length
  const reviewCount = myBlogs.filter((b) => b.status === 'IN_REVIEW' || b.status === 'RE_ASSIGN').length
  const publishedCount = myBlogs.filter((b) => b.status === 'PUBLISHED').length

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'success'
      case 'IN_REVIEW': return 'warning'
      case 'RE_ASSIGN': return 'danger'
      case 'IN_WRITING': return 'info'
      default: return 'neutral'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* Bento Main Board Canvas (26px border radius) */}
      <div className="bento-board">
        {/* Canvas Header & Primary Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #e3e7e4',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#155a37',
                  background: '#a1f5bd',
                  padding: '2px 10px',
                  borderRadius: 9999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Creator Workspace
              </span>
              <span style={{ fontSize: '0.75rem', color: '#bfc9bf' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: '#404942', fontWeight: 600 }}>
                {profile?.accountType || 'Individual'} Account
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                color: '#004124',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              Creator Workspace
            </h1>
            <p style={{ margin: '4px 0 0', color: '#404942', fontSize: '0.88rem' }}>
              Everything your publication pipeline is shipping, in one calm place.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              variant="outline"
              size="md"
              startIcon={<RefreshIcon />}
              onClick={loadDashboard}
              title="Refresh dashboard metrics"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              startIcon={<AddIcon />}
              onClick={() => navigate('/blogs/create')}
            >
              Create Blog
            </Button>
          </div>
        </div>

        {error ? (
          <div
            style={{
              background: '#ffdad6',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#93000a',
              fontSize: '0.88rem',
            }}
          >
            {error}
          </div>
        ) : null}

        {/* Bento Grid: 12-Column Responsive */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {/* Bento Tile 1: Pine Gradient Hero Stat Card */}
          <div className="bento-hero-stat">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#a1f5bd',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Performance Metrics
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  Total Published Articles
                </h3>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
              </div>
            </div>

            <div style={{ margin: '24px 0 16px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {publishedCount}
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  background: '#a1f5bd',
                  color: '#004124',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                <span>Live Stories</span>
              </div>
            </div>

            <span style={{ fontSize: '0.78rem', color: '#8ccfa3' }}>
              Live across ContentFlow, DEV.to & Syndicated channels
            </span>
          </div>

          {/* Bento Tile 2: Drafts in Progress */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3e7e4',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#707971', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Draft Pipeline
                </span>
                <h4 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#191c1b' }}>
                  Drafts In Progress
                </h4>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArticleOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
            <div style={{ margin: '18px 0 10px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#004124', lineHeight: 1 }}>
                {draftsCount}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#707971' }}>
              Ready to edit, refine & push to editorial review
            </span>
          </div>

          {/* Bento Tile 3: In Review & Re-assign */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3e7e4',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#707971', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Editorial Quality
                </span>
                <h4 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#191c1b' }}>
                  In Review & Feedback
                </h4>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RateReviewOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
            <div style={{ margin: '18px 0 10px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#004124', lineHeight: 1 }}>
                {reviewCount}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#707971' }}>
              Pending reviewer evaluation or revision comments
            </span>
          </div>

          {/* Bento Tile 4: Total Workspace Items */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3e7e4',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#707971', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Repository Sum
                </span>
                <h4 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#191c1b' }}>
                  Workspace Items
                </h4>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#e3f2e9',
                  color: '#155a37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoStoriesOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
            </div>
            <div style={{ margin: '18px 0 10px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#004124', lineHeight: 1 }}>
                {myBlogs.length}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#707971' }}>
              All articles across authoring, review & published states
            </span>
          </div>
        </div>

        {/* Bento Recommended Curated Section */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e3e7e4',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#004124' }}>
              Recommended For You
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#707971' }}>
              Curated articles based on your selected topic interests
            </p>
          </div>

          {recommended.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {recommended.map((blog) => (
                <div
                  key={blog.id || blog._id}
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  style={{
                    border: '1px solid #e3e7e4',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    background: '#f8faf8',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#155a37'
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e3e7e4'
                    e.currentTarget.style.background = '#f8faf8'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#155a37',
                          background: '#a1f5bd',
                          padding: '2px 10px',
                          borderRadius: 9999,
                        }}
                      >
                        {blog.category?.name || 'Topic'}
                      </span>
                      <ArrowForwardIcon sx={{ fontSize: 16, color: '#707971' }} />
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '0.98rem', fontWeight: 700, color: '#191c1b', lineHeight: 1.35 }}>
                      {blog.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#404942',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                      }}
                    >
                      {blog.description || 'No summary available.'}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: '0.75rem',
                      color: '#707971',
                      borderTop: '1px solid #e3e7e4',
                      paddingTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>By {blog.author?.name || 'Contributor'}</span>
                    <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Recommended Stories Yet"
              description="Personalize your discovery recommendations by updating your topic interests."
              action={
                <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                  Configure Interests
                </Button>
              }
            />
          )}
        </div>

        {/* 2-Column Bento: Recent Blogs & Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {/* Recent Blogs Bento Tile */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e3e7e4',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#004124' }}>
                  Recent Blogs
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#707971' }}>
                  Your latest edited and submitted posts
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/blogs')}>
                View All ({myBlogs.length}) →
              </Button>
            </div>

            {myBlogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myBlogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog._id || blog.id}
                    onClick={() => navigate(`/blogs/${blog._id || blog.id}/edit`)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid #e3e7e4',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      background: '#f8faf8',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#bfc9bf'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e3e7e4'
                      e.currentTarget.style.background = '#f8faf8'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontSize: '0.9rem', color: '#191c1b' }}>{blog.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#707971' }}>
                        {blog.category?.name || 'General'} • Updated {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(blog.status)}>
                      {blog.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Blogs In Progress"
                description="Ready to create your first article? Start authoring today."
                action={
                  <Button size="sm" variant="primary" onClick={() => navigate('/blogs/create')}>
                    Create First Blog
                  </Button>
                }
              />
            )}
          </div>

          {/* Quick Actions & Activity Feed Tile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e3e7e4',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
              }}
            >
              <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 700, color: '#004124' }}>
                Quick Shortcuts
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#707971' }}>
                Fast paths to author, manage and configure
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button
                  variant="primary"
                  size="md"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/blogs/create')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Create New Article
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  startIcon={<ArticleOutlinedIcon />}
                  onClick={() => navigate('/blogs')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Manage All Blogs
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/categories')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Taxonomies & Topics
                </Button>
              </div>
            </div>

            {/* Activity Feed */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e3e7e4',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
              }}
            >
              <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 700, color: '#004124' }}>
                Recent Activity
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#707971' }}>
                Latest editorial events in your account
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
                {myBlogs.length > 0 ? (
                  myBlogs.slice(0, 3).map((blog) => (
                    <div key={blog._id || blog.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#f2f4f2',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          fontSize: '0.9rem',
                        }}
                      >
                        {blog.status === 'PUBLISHED' ? '🎉' : blog.status === 'IN_REVIEW' ? '👀' : '📝'}
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#191c1b', lineHeight: 1.3 }}>
                          {blog.title}
                        </strong>
                        <span style={{ color: '#707971', fontSize: '0.75rem' }}>
                          Status: {blog.status} • {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#707971', margin: 0 }}>No recent activity logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardFeedPage
