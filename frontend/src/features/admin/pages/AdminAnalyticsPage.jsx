import { useEffect, useRef, useState } from 'react'
import { fetchAdminAnalyticsRequest } from '../../../services/api/adminAnalyticsApi.js'
import {
  Card,
  Table,
  Badge,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'

const PIPELINE_STAGES = [
  { key: 'draftBlogs',      label: 'Drafts',        color: '#374151', bg: '#f3f4f6' },
  { key: 'writingBlogs',    label: 'In Writing',    color: '#2563eb', bg: '#eff6ff' },
  { key: 'reviewBlogs',     label: 'In Review',     color: '#b45309', bg: '#fffbeb' },
  { key: 'reassignedBlogs', label: 'Re-assigned',   color: '#dc2626', bg: '#fef2f2' },
  { key: 'publishingBlogs', label: 'In Publishing', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'publishedBlogs',  label: 'Published',     color: '#059669', bg: '#ecfdf5' },
]

const StatCard = ({ label, value, sub, color, isHero = false }) => {
  if (isHero) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #155a37 0%, #004124 100%)',
        borderRadius: 24,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(21, 90, 55, 0.22)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#a1f5bd', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
            {label}
          </span>
          <span style={{ background: 'rgba(161, 245, 189, 0.2)', color: '#a1f5bd', padding: '3px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
            Live
          </span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <span style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)' }}>
          {sub || 'Production database verified'}
        </span>
      </div>
    )
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 24,
      border: '1px solid var(--border-hairline, #e3e7e4)',
      padding: '24px 26px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '0.75rem', color: '#687a6e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: color || '#131d16', margin: '12px 0 4px', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <span style={{ fontSize: '0.8rem', color: '#687a6e' }}>
        {sub || 'Active ecosystem metric'}
      </span>
    </div>
  )
}

const AdminAnalyticsPage = () => {
  const hasFetchedRef = useRef(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    const loadAnalytics = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchAdminAnalyticsRequest()
        setData(response.data?.data || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: '#e6f9ed',
              color: '#004124',
              border: '1px solid #c2eed1',
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Telemetry Engine
            </span>
            <span style={{ fontSize: '0.82rem', color: '#687a6e' }}>Control Room Overview</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 2.5vw, 2.2rem)', color: '#131d16', fontWeight: 800, letterSpacing: '-0.03em' }}>
            System Analytics & Telemetry
          </h1>
          <p style={{ margin: '6px 0 0', color: '#687a6e', fontSize: '0.92rem' }}>
            Platform metrics, publication pipeline statuses, and author contributions.
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <LoadingState message="Connecting to analytics telemetry..." />
        </Card>
      ) : error || !data ? (
        <div className="auth-alert error">{error || 'Analytics unavailable.'}</div>
      ) : (() => {
        const { overview, topAuthors, categoryDistribution } = data
        return (
          <>
            {/* Overview Stat Cards Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              <StatCard label="Published Blogs" value={overview.publishedBlogs} isHero sub="Live in public catalog" />
              <StatCard label="Total Users"     value={overview.totalUsers}    color="#155a37" sub="Registered accounts" />
              <StatCard label="Total Teams"     value={overview.totalTeams}    color="#1c7246" sub="Active organization teams" />
              <StatCard label="In Pipeline"     value={overview.reviewBlogs + overview.publishingBlogs} color="#f59e0b" sub="Review & publishing queue" />
            </div>

            {/* Article Lifecycle Pipeline */}
            <Card title="Article Lifecycle Pipeline" subtitle="Real-time distribution across all workflow stages">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginTop: 8 }}>
                {PIPELINE_STAGES.map(({ key, label, color, bg }) => (
                  <div key={key} style={{
                    padding: '16px 14px',
                    backgroundColor: bg,
                    borderRadius: 16,
                    textAlign: 'center',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.15s ease',
                  }}>
                    <div style={{ fontSize: '0.78rem', color, fontWeight: 700, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{overview[key] ?? 0}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bottom two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Top Authors */}
              <Card title="Top Active Authors" subtitle="Writers with the most published articles">
                {topAuthors?.length > 0 ? (
                  <Table headers={['Author', 'Username', 'Published']}>
                    {topAuthors.map((author) => (
                      <tr key={author._id}>
                        <td style={{ fontWeight: 700, color: '#131d16' }}>{author.name || 'Author'}</td>
                        <td style={{ fontSize: '0.84rem', color: '#687a6e' }}>@{author.username}</td>
                        <td>
                          <Badge variant="success">{author.publishedCount}</Badge>
                        </td>
                      </tr>
                    ))}
                  </Table>
                ) : (
                  <EmptyState title="No author publications" description="No publication data recorded yet." />
                )}
              </Card>

              {/* Category Distribution */}
              <Card title="Category Distribution" subtitle="Stories breakdown by taxonomy">
                {categoryDistribution?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 6 }}>
                    {categoryDistribution.map((cat) => {
                      const pct = Math.min(100, Math.round((cat.count / (overview.totalBlogs || 1)) * 100))
                      return (
                        <div key={cat._id || cat.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, color: '#131d16' }}>{cat.name}</span>
                            <span style={{ color: '#687a6e', fontWeight: 600 }}>{cat.count} articles ({pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 10, backgroundColor: '#f2f4f2', borderRadius: 9999, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #155a37 0%, #1c7246 100%)',
                                borderRadius: 9999,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState title="No category data" description="No articles categorized yet." />
                )}
              </Card>
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default AdminAnalyticsPage
