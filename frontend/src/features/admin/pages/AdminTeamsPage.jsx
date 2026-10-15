import { useEffect, useRef, useState } from 'react'
import {
  fetchAdminTeamsRequest,
  deleteTeamRequest,
} from '../../../services/api/adminAnalyticsApi.js'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Table,
  EmptyState,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx'
import CircularProgress from '@mui/material/CircularProgress'

const AdminTeamsPage = () => {
  const hasFetchedRef = useRef(false)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [teamToDelete, setTeamToDelete] = useState(null)

  const loadTeams = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchAdminTeamsRequest()
      setTeams(response.data?.data?.teams || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadTeams()
  }, [])

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return
    const targetId = teamToDelete._id
    setActionLoadingId(targetId)
    setError('')
    setActionSuccess('')
    try {
      await deleteTeamRequest(targetId)
      setTeams((prevTeams) => prevTeams.filter((t) => t._id !== targetId))
      setActionSuccess(`Team "${teamToDelete.name}" deleted successfully`)
      setTeamToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team')
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
            Dashboard › Admin › Teams
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Registered Teams
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            View active editorial teams, owner profiles, member counts, and manage team accounts.
          </p>
        </div>
      </div>

      {error && <div className="auth-alert error">{error}</div>}
      {actionSuccess && (
        <div
          className="auth-alert success"
          style={{
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.88rem',
          }}
        >
          {actionSuccess}
        </div>
      )}

      <Card
        title="Organization Teams"
        subtitle={loading ? 'Loading...' : `${teams.length} team${teams.length !== 1 ? 's' : ''}`}
      >
        {loading ? (
          <LoadingState message="Loading registered teams..." />
        ) : teams.length > 0 ? (
          <Table headers={['Team', 'URL Slug', 'Owner', 'Members', 'Created', 'Actions']}>
            {teams.map((team) => (
              <tr key={team._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={team.name} size="sm" />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{team.name}</span>
                  </div>
                </td>
                <td>
                  <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>
                    {team.slug}
                  </code>
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                      {team.owner?.name || team.owner?.username || 'Owner'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{team.owner?.email}</div>
                  </div>
                </td>
                <td>
                  <Badge variant="info">
                    {team.members?.length || 1} Member{(team.members?.length || 1) !== 1 ? 's' : ''}
                  </Badge>
                </td>
                <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {new Date(team.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoadingId === team._id}
                    onClick={() => setTeamToDelete(team)}
                    startIcon={actionLoadingId === team._id ? <CircularProgress size={14} color="inherit" /> : undefined}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            title="No teams registered"
            description="No editorial teams have been created on the platform yet."
          />
        )}
      </Card>

      {teamToDelete && (
        <ConfirmModal
          title="Delete Team"
          message={`Are you sure you want to delete team "${teamToDelete.name}"? All associated team memberships, roles, and pending invitations will be removed. Team members will be reverted to individual accounts. This action cannot be undone.`}
          confirmText="Delete Team"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setTeamToDelete(null)}
        />
      )}
    </div>
  )
}

export default AdminTeamsPage
