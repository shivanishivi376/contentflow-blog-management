import { useEffect, useRef, useState } from 'react'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import {
  fetchAdminUsersRequest,
  updateUserStatusRequest,
  deleteUserRequest,
} from '../../../services/api/adminAnalyticsApi.js'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Table,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx'

const AdminUsersPage = () => {
  const hasFetchedRef = useRef(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)

  const loadUsers = async (searchTerm = search) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchAdminUsersRequest({ search: searchTerm || undefined })
      setUsers(response.data?.data?.users || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadUsers()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadUsers(search)
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.isActive === false ? true : false
    setActionLoadingId(user._id)
    setError('')
    setActionSuccess('')
    try {
      await updateUserStatusRequest(user._id, newStatus)
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      )
      setActionSuccess(`User status for ${user.name} set to ${newStatus ? 'Active' : 'Inactive'}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    const targetId = userToDelete._id
    setActionLoadingId(targetId)
    setError('')
    setActionSuccess('')
    try {
      await deleteUserRequest(targetId)
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== targetId))
      setActionSuccess(`User "${userToDelete.name}" deleted successfully`)
      setUserToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            Dashboard › Admin › Users
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Platform Users
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            View registered authors, creators, team members, role assignments, and manage account statuses.
          </p>
        </div>
      </div>

      {error && <div className="auth-alert error">{error}</div>}
      {actionSuccess && <div className="auth-alert success" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, fontSize: '0.88rem' }}>{actionSuccess}</div>}

      {/* Search Card */}
      <Card>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Search users by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => { setSearch(''); loadUsers('') }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Users Table Card */}
      <Card
        title="Users"
        subtitle={loading ? 'Loading...' : `${users.length} result${users.length !== 1 ? 's' : ''}`}
      >
        {loading ? (
          <LoadingState message="Loading users..." />
        ) : users.length > 0 ? (
          <Table headers={['User', 'Email', 'Account Type', 'Team', 'Workflow Role', 'Status', 'Joined', 'Actions']}>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</td>
                <td>
                  <Badge variant={user.accountType === 'TEAM' ? 'info' : 'neutral'}>
                    {user.accountType || 'INDIVIDUAL'}
                  </Badge>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.team?.name || '—'}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.workflowRole || 'Author'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {actionLoadingId === user._id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CircularProgress size={18} />
                        <Badge variant={user.isActive !== false ? 'success' : 'danger'}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ) : (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive !== false}
                            onChange={() => handleToggleStatus(user)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={
                          <Badge variant={user.isActive !== false ? 'success' : 'danger'}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        }
                        sx={{ margin: 0 }}
                      />
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoadingId === user._id}
                    onClick={() => setUserToDelete(user)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            title="No users found"
            description={search ? `No users match "${search}". Try a different search term.` : 'No users registered on the platform yet.'}
          />
        )}
      </Card>

      {userToDelete && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete user "${userToDelete.name}" (@${userToDelete.username})? This action cannot be undone.`}
          confirmText="Delete User"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  )
}

export default AdminUsersPage

