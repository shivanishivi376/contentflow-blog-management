import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createRoleRequest,
  deleteRoleRequest,
  fetchPermissionsRequest,
  fetchRolesRequest,
  updateRoleRequest,
} from '../../../services/api/rbacApi.js'
import {
  Button,
  Card,
  Input,
  Table,
  Badge,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CheckIcon from '@mui/icons-material/Check'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  permissionIds: [],
}

const AdminRolesPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
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
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetchRolesRequest(),
        fetchPermissionsRequest(),
      ])
      setRoles(rolesResponse.data?.data?.roles || [])
      setPermissions(permissionsResponse.data?.data?.permissions || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadData()
  }, [])

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  )

  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.code.localeCompare(b.code)),
    [permissions],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const togglePermission = (permissionId) => {
    setFormData((current) => {
      const permissionIds = current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((id) => id !== permissionId)
        : [...current.permissionIds, permissionId]
      return { ...current, permissionIds }
    })
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
        await updateRoleRequest(editingId, formData)
        setMessage('Role updated successfully')
      } else {
        await createRoleRequest(formData)
        setMessage('Role created successfully')
      }
      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (role) => {
    setEditingId(role._id)
    setFormData({
      name: role.name || '',
      slug: role.slug || '',
      description: role.description || '',
      permissionIds: (role.permissions || []).map((permission) => String(permission._id || permission)),
    })
  }

  const handleDelete = async (role) => {
    if (role.isDefault) {
      setError('Default roles cannot be deleted')
      return
    }
    const isConfirmed = await confirm({ title: 'Delete Role', message: 'Delete this role?', variant: 'danger' })
    if (!isConfirmed) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteRoleRequest(role._id)
      setMessage('Role deleted successfully')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete role')
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
            Dashboard › Admin › Roles
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Roles
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Roles group permissions together for writers, reviewers, publishers, and custom workflows.
          </p>
        </div>
      </div>

      {error   && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form Card */}
        <Card title={editingId ? 'Edit Role' : 'Create Role'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Content Manager"
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="content-manager"
              required
            />
            <div className="v2-field-group">
              <label className="v2-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What this role is responsible for"
                rows="3"
                className="v2-input"
              />
            </div>

            {/* Permissions Chip Panel — MUI Chip */}
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>
                  RBAC
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Assign Permissions</div>
              </div>
              {sortedPermissions.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sortedPermissions.map((permission) => {
                    const isSelected = formData.permissionIds.includes(String(permission._id))
                    return (
                      <Chip
                        key={permission._id}
                        label={permission.code}
                        size="small"
                        clickable
                        onClick={() => togglePermission(String(permission._id))}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        icon={isSelected ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          py: 1.5,
                          px: 0.5,
                          boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                        }}
                      />
                    )
                  })}
                </Box>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  No permissions available. Seed RBAC data first.
                </p>
              )}
            </Box>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Role' : 'Create Role'}
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
          title="Existing Roles"
          subtitle={loading ? 'Loading...' : `${sortedRoles.length} total`}
        >
          {loading ? (
            <LoadingState message="Loading roles..." />
          ) : sortedRoles.length > 0 ? (
            <Table headers={['Name', 'Slug', 'Permissions', 'Actions']}>
              {sortedRoles.map((role) => (
                <tr key={role._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{role.name}</span>
                      {role.isDefault && <Badge variant="success">Default</Badge>}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>
                      {role.slug}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: 240 }}>
                    {(role.permissions || []).map((p) => p.code).join(', ') || (
                      <span style={{ color: '#cbd5e1' }}>No permissions</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                        Edit
                      </Button>
                      {!role.isDefault && (
                        <Button variant="danger" size="sm" onClick={() => handleDelete(role)} disabled={saving}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No roles yet"
              description="Run the RBAC seed script to add default roles, or create one manually."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminRolesPage
