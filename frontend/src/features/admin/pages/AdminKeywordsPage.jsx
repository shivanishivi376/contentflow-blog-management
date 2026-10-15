import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adminCreateKeywordRequest,
  adminDeleteKeywordRequest,
  adminFetchCategoriesRequest,
  adminFetchKeywordsRequest,
  adminFetchSubcategoriesRequest,
  adminUpdateKeywordRequest,
} from '../../../services/api/categoryApi.js'
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Badge,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'

const emptyForm = {
  categoryId: '',
  subcategoryId: '',
  name: '',
  keywordType: 'primary',
  description: '',
}

const AdminKeywordsPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [keywords, setKeywords] = useState([])
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
      const [categoriesResponse, subcategoriesResponse, keywordsResponse] = await Promise.all([
        adminFetchCategoriesRequest(),
        adminFetchSubcategoriesRequest(),
        adminFetchKeywordsRequest(),
      ])
      setCategories(categoriesResponse.data?.data?.categories || [])
      setSubcategories(subcategoriesResponse.data?.data?.subcategories || [])
      setKeywords(keywordsResponse.data?.data?.keywords || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load keywords')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadData()
  }, [])

  const filteredSubcategories = useMemo(
    () =>
      subcategories.filter(
        (subcategory) => String(subcategory.category?._id || subcategory.category) === formData.categoryId,
      ),
    [subcategories, formData.categoryId],
  )

  const sortedKeywords = useMemo(
    () =>
      [...keywords].sort((a, b) => {
        const subcategoryA = a.subcategory?.name || ''
        const subcategoryB = b.subcategory?.name || ''
        if (subcategoryA !== subcategoryB) return subcategoryA.localeCompare(subcategoryB)
        if (a.keywordType !== b.keywordType) return a.keywordType.localeCompare(b.keywordType)
        return a.name.localeCompare(b.name)
      }),
    [keywords],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'categoryId') {
      setFormData((current) => ({ ...current, categoryId: value, subcategoryId: '' }))
      return
    }
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
        await adminUpdateKeywordRequest(editingId, formData)
        setMessage('Keyword updated successfully')
      } else {
        await adminCreateKeywordRequest(formData)
        setMessage('Keyword created successfully')
      }
      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save keyword')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (keyword) => {
    setEditingId(keyword._id)
    setFormData({
      categoryId: String(keyword.category?._id || keyword.category || ''),
      subcategoryId: String(keyword.subcategory?._id || keyword.subcategory || ''),
      name: keyword.name || '',
      keywordType: keyword.keywordType || 'primary',
      description: keyword.description || '',
    })
  }

  const handleDelete = async (keywordId) => {
    const isConfirmed = await confirm({ title: 'Delete Keyword', message: 'Delete this keyword?', variant: 'danger' })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminDeleteKeywordRequest(keywordId)
      setMessage('Keyword deleted successfully')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete keyword')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { label: 'Select category', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c._id })),
  ]

  const subcategoryOptions = [
    { label: formData.categoryId ? 'Select subcategory' : 'Select category first', value: '' },
    ...filteredSubcategories.map((s) => ({ label: s.name, value: s._id })),
  ]

  const typeOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            Dashboard › Admin › Keywords
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Keywords
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Keywords are linked to a subcategory and marked as primary or secondary.
          </p>
        </div>
      </div>

      {error   && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Keyword' : 'Create Keyword'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              options={categoryOptions}
              required
            />
            <Select
              label="Subcategory"
              name="subcategoryId"
              value={formData.subcategoryId}
              onChange={handleChange}
              options={subcategoryOptions}
              required
              disabled={!formData.categoryId}
            />
            <Select
              label="Keyword Type"
              name="keywordType"
              value={formData.keywordType}
              onChange={handleChange}
              options={typeOptions}
              required
            />
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="React"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of the keyword"
                rows="3"
                className="v2-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving || !categories.length} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Keyword' : 'Create Keyword'}
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
          title="Existing Keywords"
          subtitle={loading ? 'Loading...' : `${sortedKeywords.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading keywords..." />
          ) : sortedKeywords.length > 0 ? (
            <Table headers={['Name', 'Subcategory', 'Type', 'Actions']}>
              {sortedKeywords.map((keyword) => (
                <tr key={keyword._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{keyword.name}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {keyword.subcategory?.name || <span style={{ color: '#cbd5e1' }}>Unknown</span>}
                  </td>
                  <td>
                    <Badge variant={keyword.keywordType === 'primary' ? 'info' : 'neutral'}>
                      {keyword.keywordType === 'primary' ? 'Primary' : 'Secondary'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(keyword)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(keyword._id)} disabled={saving}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No keywords yet"
              description="Create your first keyword by selecting a category and subcategory above."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminKeywordsPage
