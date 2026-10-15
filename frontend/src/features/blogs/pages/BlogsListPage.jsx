import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { deleteBlogRequest, fetchBlogsRequest } from '../../../services/api/blogApi.js'
import DevToPublishModal from '../components/DevToPublishModal.jsx'
import { Badge, Button, Card, EmptyState, SearchInput, LoadingState, Select, Table } from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MuiChip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'

const STATUS_MAP = {
  DRAFT:         { label: 'Draft',         variant: 'neutral',  tab: 'DRAFT' },
  IN_WRITING:    { label: 'In Writing',    variant: 'info',     tab: 'IN_WRITING' },
  IN_REVIEW:     { label: 'In Review',     variant: 'warning',  tab: 'IN_REVIEW' },
  RE_ASSIGN:     { label: 'Re Assign',     variant: 'danger',   tab: 'RE_ASSIGN' },
  IN_PUBLISHING: { label: 'In Publishing', variant: 'warning',  tab: 'IN_PUBLISHING' },
  PUBLISHED:     { label: 'Published',     variant: 'success',  tab: 'PUBLISHED' },
}

const ACTION_MAP = {
  DRAFT:         { label: 'Edit Draft',      variant: 'primary' },
  IN_WRITING:    { label: 'Continue Writing', variant: 'primary' },
  IN_REVIEW:     { label: 'View / Review',   variant: 'primary' },
  RE_ASSIGN:     { label: 'Resolve Feedback', variant: 'danger' },
  IN_PUBLISHING: { label: 'Publish Post',    variant: 'primary' },
  PUBLISHED:     { label: 'View Live',       variant: 'outline' },
}

const TABS = [
  { key: 'ALL',        label: 'All Posts' },
  { key: 'MY_BLOGS',  label: 'My Blogs' },
  { key: 'IN_WRITING',label: 'In Writing' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'RE_ASSIGN', label: 'Re-assigned' },
]

const MemberCell = ({ name }) => {
  if (!name) return <span style={{ color: '#707971', fontSize: '0.82rem' }}>—</span>
  return (
    <span style={{ fontSize: '0.85rem', color: '#191c1b', fontWeight: 600 }}>
      {name}
    </span>
  )
}

const BlogsListPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { confirm } = useConfirm()
  const { hasPermission, isOwner } = useTeamPermissions()
  const currentUser = useSelector((state) => state.auth?.user)
  const isTeam = currentUser?.accountType === 'TEAM'

  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedDevToBlog, setSelectedDevToBlog] = useState(null)

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null) {
      setSearchTerm(q)
    }
  }, [searchParams])

  const loadBlogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchBlogsRequest({ status: statusFilter || undefined })
      setBlogs(response.data?.data?.blogs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [statusFilter])

  const handleDelete = async (blogId) => {
    const isConfirmed = await confirm({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to permanently delete this blog post? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete Post',
    })
    if (!isConfirmed) return
    try {
      await deleteBlogRequest(blogId)
      setMessage('Blog post deleted successfully.')
      setTimeout(() => setMessage(''), 3000)
      loadBlogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog post')
    }
  }

  const handlePrimaryAction = (blog) => {
    if (blog.status === 'PUBLISHED') {
      window.open(`/blog/${blog.slug}`, '_blank')
    } else {
      navigate(`/blogs/${blog._id}/edit`)
    }
  }

  const filteredBlogs = blogs.filter((b) => {
    const userId = currentUser?.id || currentUser?._id
    if (activeTab === 'MY_BLOGS') {
      if (String(b.author?._id || b.author) !== String(userId)) return false
    } else if (activeTab !== 'ALL') {
      if (b.status !== activeTab) return false
    }
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      b.title?.toLowerCase().includes(term) ||
      b.slug?.toLowerCase().includes(term) ||
      b.description?.toLowerCase().includes(term) ||
      b.author?.name?.toLowerCase().includes(term) ||
      b.category?.name?.toLowerCase().includes(term)
    )
  })

  const tabCounts = TABS.reduce((acc, tab) => {
    if (tab.key === 'ALL') acc[tab.key] = blogs.length
    else if (tab.key === 'MY_BLOGS') {
      const userId = currentUser?.id || currentUser?._id
      acc[tab.key] = blogs.filter((b) => String(b.author?._id || b.author) === String(userId)).length
    } else {
      acc[tab.key] = blogs.filter((b) => b.status === tab.key).length
    }
    return acc
  }, {})

  const teamHeaders = ['Title & Slug', 'Status', 'Writer', 'Reviewer', 'Publisher', 'Last Modified', 'Actions']
  const indHeaders  = ['Title & Slug', 'Status', 'Category', 'Last Modified', 'Actions']

  const tabIndex = TABS.findIndex((t) => t.key === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* Board Header Hero */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: '#ffffff',
          border: '1px solid #e3e7e4',
          borderRadius: '20px',
          padding: '22px 26px',
          boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
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
              Editorial Pipeline
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#004124',
                background: '#f2f4f2',
                border: '1px solid #e3e7e4',
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              Live
            </span>
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: '1.75rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Content Repository
          </h1>
          <p style={{ margin: '3px 0 0', color: '#404942', fontSize: '0.88rem' }}>
            Draft, review, refine, and syndicate your stories across the editorial pipeline.
          </p>
        </div>

        {hasPermission(TEAM_PERMISSIONS.BLOG_CREATE) && (
          <Button variant="primary" size="md" onClick={() => navigate('/blogs/create')} startIcon={<AddIcon />}>
            Create Blog
          </Button>
        )}
      </div>

      {error   && <div style={{ background: '#ffdad6', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#93000a', fontSize: '0.88rem' }}>{error}</div>}
      {message && <div style={{ background: '#e3f2e9', border: '1px solid #a1f5bd', borderRadius: '12px', padding: '12px 16px', color: '#155a37', fontSize: '0.88rem' }}>{message}</div>}

      {/* Segmented Filter Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setActiveTab(TABS[newIndex].key)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid #e3e7e4',
          minHeight: 44,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.88rem',
            minHeight: 44,
            color: '#707971',
            padding: '0 16px',
            fontFamily: 'Plus Jakarta Sans',
          },
          '& .Mui-selected': { color: '#155a37', fontWeight: 700 },
          '& .MuiTabs-indicator': { backgroundColor: '#155a37', height: 2.5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.key}
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <MuiChip
                    label={tabCounts[tab.key]}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: tabIndex === TABS.findIndex((t) => t.key === tab.key) ? '#155a37' : '#f2f4f2',
                      color: tabIndex === TABS.findIndex((t) => t.key === tab.key) ? '#fff' : '#707971',
                      border: tabIndex === TABS.findIndex((t) => t.key === tab.key) ? 'none' : '1px solid #e3e7e4',
                      '& .MuiChip-label': { px: '6px' },
                    }}
                  />
                )}
              </span>
            }
          />
        ))}
      </Tabs>

      {/* Table & Controls Card */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <SearchInput
            placeholder="Search by title, description, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Lifecycle Statuses', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'In Writing', value: 'IN_WRITING' },
              { label: 'In Review', value: 'IN_REVIEW' },
              { label: 'Re-assigned', value: 'RE_ASSIGN' },
              { label: 'In Publishing', value: 'IN_PUBLISHING' },
              { label: 'Published', value: 'PUBLISHED' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState message="Loading articles from repository..." />
        ) : filteredBlogs.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <Table headers={isTeam ? teamHeaders : indHeaders}>
                {filteredBlogs.map((blog) => {
                  const badge = STATUS_MAP[blog.status] || { label: blog.status, variant: 'neutral' }
                  const action = ACTION_MAP[blog.status]
                  const updatedDate = new Date(blog.updatedAt || blog.createdAt).toLocaleDateString(undefined, {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })

                  return (
                    <tr key={blog._id}>
                      {/* Title & Slug */}
                      <td style={{ maxWidth: 320 }}>
                        <div
                          onClick={() => navigate(`/blogs/${blog._id}/edit`)}
                          style={{
                            fontWeight: 700,
                            color: '#191c1b',
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            lineHeight: 1.35,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#155a37')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#191c1b')}
                        >
                          {blog.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#707971', marginTop: 2 }}>
                          /{blog.slug}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>

                      {/* Team columns or Category */}
                      {isTeam ? (
                        <>
                          <td><MemberCell name={blog.writer?.name} /></td>
                          <td><MemberCell name={blog.reviewer?.name} /></td>
                          <td><MemberCell name={blog.publisher?.name} /></td>
                        </>
                      ) : (
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#404942', fontWeight: 500 }}>
                            {blog.category?.name || 'General'}
                          </span>
                        </td>
                      )}

                      {/* Updated */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#707971' }}>{updatedDate}</span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {action && (
                            <Button
                              size="sm"
                              variant={action.variant || 'primary'}
                              onClick={() => handlePrimaryAction(blog)}
                              endIcon={blog.status === 'PUBLISHED' ? <OpenInNewIcon fontSize="small" /> : undefined}
                            >
                              {action.label}
                            </Button>
                          )}

                          {/* Dev.to cross-publishing button */}
                          {blog.status === 'PUBLISHED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedDevToBlog({ id: blog._id, title: blog.title, slug: blog.slug })}
                            >
                              DEV.to
                            </Button>
                          )}

                          {/* Delete Button */}
                          {((String(blog.author?._id || blog.author) === String(currentUser?.id || currentUser?._id)) ||
                            (isTeam && isOwner && blog.team && String(blog.team?._id || blog.team) === String(currentUser?.team?._id || currentUser?.team))) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(blog._id)}
                              style={{ color: '#ba1a1a' }}
                              title="Delete Blog"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </Table>
            </div>
            <div style={{ marginTop: 16, fontSize: '0.82rem', color: '#707971', textAlign: 'right' }}>
              Showing {filteredBlogs.length} of {blogs.length} article{blogs.length !== 1 ? 's' : ''}
            </div>
          </>
        ) : (
          <EmptyState
            title="No blogs found"
            description={
              searchTerm
                ? `No articles match "${searchTerm}". Try resetting search or changing filters.`
                : 'No blogs in this status tab yet. Start writing your next story!'
            }
            action={
              <Button size="sm" variant="primary" startIcon={<AddIcon />} onClick={() => navigate('/blogs/create')}>
                Create New Blog
              </Button>
            }
          />
        )}
      </Card>

      <DevToPublishModal
        blog={selectedDevToBlog}
        isOpen={Boolean(selectedDevToBlog)}
        onClose={() => setSelectedDevToBlog(null)}
      />
    </div>
  )
}

export default BlogsListPage
