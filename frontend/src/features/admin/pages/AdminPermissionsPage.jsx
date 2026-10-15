import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createPermissionRequest,
  deletePermissionRequest,
  fetchPermissionsRequest,
  updatePermissionRequest,
} from '../../../services/api/rbacApi.js'
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
  code: '',
  description: '',
}

const AdminPermissionsPage = () => {
  const { confirm } = useConfirm()
  const hasFetchedRef = useRef(false)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')

  const loadPermissions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchPermissionsRequest()
      setPermissions(response.data?.data?.permissions || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadPermissions()
  }, [])

  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.code.localeCompare(b.code)),
    [permissions],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: name === 'code' ? value.toUpperCase() : value,
    }))
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
        await updatePermissionRequest(editingId, formData)
        setMessage('Permission updated successfully')
      } else {
        await createPermissionRequest(formData)
        setMessage('Permission created successfully')
      }
      resetForm()
      await loadPermissions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save permission')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (permission) => {
    setEditingId(permission._id)
    setFormData({
      code: permission.code || '',
      description: permission.description || '',
    })
  }

  const handleDelete = async (permissionId) => {
    const isConfirmed = await confirm({ title: 'Delete Permission', message: 'Delete this permission?', variant: 'danger' })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deletePermissionRequest(permissionId)
      setMessage('Permission deleted successfully')
      await loadPermissions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete permission')
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
            Dashboard › Admin › Permissions
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Permissions
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Permissions define what actions a role can perform across the platform.
          </p>
        </div>
      </div>

      {error   && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Permission' : 'Create Permission'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Permission Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="BLOG_CREATE"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What this permission allows"
                rows="4"
                className="v2-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Permission' : 'Create Permission'}
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
          title="Existing Permissions"
          subtitle={loading ? 'Loading...' : `${sortedPermissions.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading permissions..." />
          ) : sortedPermissions.length > 0 ? (
            <Table headers={['Code', 'Description', 'Actions']}>
              {sortedPermissions.map((permission) => (
                <tr key={permission._id}>
                  <td>
                    <code style={{ fontSize: '0.82rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a', fontWeight: 700 }}>
                      {permission.code}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {permission.description || <span style={{ color: '#cbd5e1' }}>No description</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(permission)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(permission._id)} disabled={saving}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No permissions yet"
              description="Run the RBAC seed script to add default permissions, or create one manually."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminPermissionsPage
