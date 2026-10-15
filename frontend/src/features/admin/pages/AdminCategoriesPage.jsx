import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adminCreateCategoryRequest,
  adminDeleteCategoryRequest,
  adminFetchCategoriesRequest,
  adminUpdateCategoryRequest,
} from '../../../services/api/categoryApi.js'
import {
  Badge,
  Button,
  Card,
  Input,
  Table,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'

const emptyForm = {
  name: '',
  description: '',
}

const AdminCategoriesPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminFetchCategoriesRequest()
      setCategories(response.data?.data?.categories || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadCategories()
  }, [])

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingId) {
        await adminUpdateCategoryRequest(editingId, formData)
        setMessage('Category updated successfully')
      } else {
        await adminCreateCategoryRequest(formData)
        setMessage('Global category created successfully')
      }
      resetForm()
      await loadCategories()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category._id)
    setFormData({
      name: category.name || '',
      description: category.description || '',
    })
  }

  const handleDelete = async (categoryId) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will also remove associated subcategories and keywords if not used by any blogs.',
      variant: 'danger'
    })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminDeleteCategoryRequest(categoryId)
      setMessage('Category deleted successfully')
      await loadCategories()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  const getScopeBadge = (category) => {
    const scope = category.scope || 'GLOBAL'
    if (scope === 'TEAM') {
      const teamName = category.team?.name || 'Team'
      return <Badge variant="info">Team: {teamName}</Badge>
    }
    if (scope === 'INDIVIDUAL') {
      const creatorName = category.createdBy?.name || category.createdBy?.username || 'User'
      return <Badge variant="neutral">User: {creatorName}</Badge>
    }
    return <Badge variant="success">Global</Badge>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            Dashboard › Admin › Categories
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Categories
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage all platform categories across Global, Team, and Individual scopes.
          </p>
        </div>
      </div>

      {error && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Category' : 'Create Global Category'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Technology"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of the category"
                rows="4"
                className="v2-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* List Card */}
        <Card
          title="All Categories"
          subtitle={loading ? 'Loading...' : `${sortedCategories.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading categories..." />
          ) : sortedCategories.length > 0 ? (
            <Table headers={['Name', 'Scope', 'Description', 'Actions']}>
              {sortedCategories.map((category) => (
                <tr key={category._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{category.name}</td>
                  <td>{getScopeBadge(category)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {category.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(category._id)} disabled={saving}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No categories yet"
              description="Create your first category to start organizing your blog content."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminCategoriesPage
