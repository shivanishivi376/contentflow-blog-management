import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adminCreateSubcategoryRequest,
  adminDeleteSubcategoryRequest,
  adminFetchCategoriesRequest,
  adminFetchSubcategoriesRequest,
  adminUpdateSubcategoryRequest,
} from '../../../services/api/categoryApi.js'
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  Table,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'

const emptyForm = {
  categoryId: '',
  name: '',
  description: '',
}

const AdminSubcategoriesPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        adminFetchCategoriesRequest(),
        adminFetchSubcategoriesRequest(),
      ])
      setCategories(categoriesResponse.data?.data?.categories || [])
      setSubcategories(subcategoriesResponse.data?.data?.subcategories || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load subcategories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadData()
  }, [])

  const sortedSubcategories = useMemo(
    () =>
      [...subcategories].sort((a, b) => {
        const categoryA = a.category?.name || ''
        const categoryB = b.category?.name || ''
        if (categoryA !== categoryB) return categoryA.localeCompare(categoryB)
        return a.name.localeCompare(b.name)
      }),
    [subcategories],
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
        await adminUpdateSubcategoryRequest(editingId, formData)
        setMessage('Subcategory updated successfully')
      } else {
        await adminCreateSubcategoryRequest(formData)
        setMessage('Subcategory created successfully')
      }
      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save subcategory')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (subcategory) => {
    setEditingId(subcategory._id)
    setFormData({
      categoryId: String(subcategory.category?._id || subcategory.category || ''),
      name: subcategory.name || '',
      description: subcategory.description || '',
    })
  }

  const handleDelete = async (subcategoryId) => {
    const isConfirmed = await confirm({
      title: 'Delete Subcategory',
      message: 'Are you sure you want to delete this subcategory? This will also remove associated keywords if not used by any blogs.',
      variant: 'danger'
    })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminDeleteSubcategoryRequest(subcategoryId)
      setMessage('Subcategory deleted successfully')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete subcategory')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { label: 'Select category', value: '' },
    ...categories.map((c) => ({ label: `${c.name} (${c.scope || 'GLOBAL'})`, value: c._id })),
  ]

  const getScopeBadge = (subcategory) => {
    const scope = subcategory.scope || 'GLOBAL'
    if (scope === 'TEAM') {
      const teamName = subcategory.team?.name || 'Team'
      return <Badge variant="info">Team: {teamName}</Badge>
    }
    if (scope === 'INDIVIDUAL') {
      const creatorName = subcategory.createdBy?.name || subcategory.createdBy?.username || 'User'
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
            Dashboard › Admin › Subcategories
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Subcategories
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage all platform subcategories across Global, Team, and Individual scopes.
          </p>
        </div>
      </div>

      {error && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Subcategory' : 'Create Subcategory'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Parent Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              options={categoryOptions}
              required
            />
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Web Development"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of the subcategory"
                rows="4"
                className="v2-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving || !categories.length} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Subcategory' : 'Create Subcategory'}
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
          title="All Subcategories"
          subtitle={loading ? 'Loading...' : `${sortedSubcategories.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading subcategories..." />
          ) : sortedSubcategories.length > 0 ? (
            <Table headers={['Name', 'Parent Category', 'Scope', 'Description', 'Actions']}>
              {sortedSubcategories.map((subcategory) => (
                <tr key={subcategory._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{subcategory.name}</td>
                  <td>
                    <Badge variant="info">{subcategory.category?.name || 'Unknown'}</Badge>
                  </td>
                  <td>{getScopeBadge(subcategory)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {subcategory.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(subcategory)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(subcategory._id)} disabled={saving}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No subcategories yet"
              description="Create your first subcategory by selecting a parent category above."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminSubcategoriesPage
