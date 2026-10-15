import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createInterestRequest,
  deleteInterestRequest,
  fetchInterestsRequest,
  updateInterestRequest,
} from '../../../services/api/interestApi.js'
import {
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
  slug: '',
  description: '',
}

const AdminInterestsPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')

  const loadInterests = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchInterestsRequest()
      setInterests(response.data?.data?.interests || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load interests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadInterests()
  }, [])

  const sortedInterests = useMemo(
    () => [...interests].sort((a, b) => a.name.localeCompare(b.name)),
    [interests],
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
        await updateInterestRequest(editingId, formData)
        setMessage('Interest updated successfully')
      } else {
        await createInterestRequest(formData)
        setMessage('Interest created successfully')
      }
      resetForm()
      await loadInterests()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save interest')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (interest) => {
    setEditingId(interest._id)
    setFormData({
      name: interest.name || '',
      slug: interest.slug || '',
      description: interest.description || '',
    })
  }

  const handleDelete = async (interestId) => {
    const isConfirmed = await confirm({ title: 'Delete Interest', message: 'Delete this interest?', variant: 'danger' })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteInterestRequest(interestId)
      setMessage('Interest deleted successfully')
      await loadInterests()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete interest')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            Dashboard › Admin › Interests
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Interest Topics
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            These interests power onboarding and dashboard personalization.
          </p>
        </div>
      </div>

      {error   && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Interest' : 'Create Interest'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Technology"
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="technology"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of the interest topic"
                rows="4"
                className="v2-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Interest' : 'Create Interest'}
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
          title="Existing Interests"
          subtitle={loading ? 'Loading...' : `${sortedInterests.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading interests..." />
          ) : sortedInterests.length > 0 ? (
            <Table headers={['Name', 'Slug', 'Description', 'Actions']}>
              {sortedInterests.map((interest) => (
                <tr key={interest._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{interest.name}</td>
                  <td>
                    <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>
                      {interest.slug}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {interest.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(interest)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(interest._id)} disabled={saving}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No interests yet"
              description="Create your first interest topic to power onboarding personalization."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminInterestsPage
