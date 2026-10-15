import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyTeamRequest } from '../../../services/api/teamApi.js'
import apiClient from '../../../services/api/apiClient.js'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import { Avatar, Badge, Button, Card, EmptyState, Input, LoadingState, Modal, Select, Table } from '../../../components/ui/CustomerComponents.jsx'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

const TeamDashboardPage = () => {
  const { alert, confirm } = useConfirm()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Invitation Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteRole, setInviteRole] = useState('Writer')
  const [inviteEmail, setInviteEmail] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const loadTeam = async () => {
    try {
      const response = await fetchMyTeamRequest()
      const teamData = response.data?.data?.team || response.data?.team
      if (teamData) {
        setTeam(teamData)
        setError(null)
      } else {
        setError('Unable to load team workspace details')
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [])

  const copyToClipboard = async (text) => {
    if (!text) return false
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch (err) {
      console.warn('navigator.clipboard fallback:', err)
    }

    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    } catch {
      return false
    }
  }

  const handleCopyInviteLink = async () => {
    if (!team?.id) return
    setGeneratingLink(true)
    setInviteError('')

    try {
      const response = await apiClient.post(`/api/teams/${team.id}/invitations/link`, {
        assignedRole: inviteRole,
        email: inviteEmail ? inviteEmail.trim() : undefined
      })

      const invitation = response.data?.data?.invitation
      const link = invitation?.invitationLink || response.data?.data?.invitationLink

      if (link) {
        setGeneratedLink(link)
        await copyToClipboard(link)
        await alert('Invitation link generated and copied to your clipboard!')
        loadTeam()
      } else {
        setInviteError('Invitation created but link URL was missing')
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to generate invitation link')
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleSendInviteEmail = async () => {
    if (!team?.id) return
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email address to send the invitation.')
      return
    }

    setGeneratingLink(true)
    setInviteError('')

    try {
      const response = await apiClient.post(`/api/teams/${team.id}/invitations/link`, {
        assignedRole: inviteRole,
        email: inviteEmail.trim()
      })

      const invitation = response.data?.data?.invitation
      const link = invitation?.invitationLink || response.data?.data?.invitationLink
      const emailStatus = invitation?.emailStatus

      if (link) {
        setGeneratedLink(link)
        await copyToClipboard(link)

        if (emailStatus?.skipped || (emailStatus && !emailStatus.success)) {
          await alert(
            `Invitation link created! (Automated email was skipped because SMTP is not configured in Admin settings: "${emailStatus?.reason || 'Missing SMTP settings'}"). Link copied to clipboard.`
          )
        } else {
          await alert(`Invitation email sent to ${inviteEmail}! Link copied to clipboard.`)
        }
        loadTeam()
      } else {
        setInviteError('Invitation created but link URL was missing')
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation email')
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      const copied = await copyToClipboard(generatedLink)
      if (copied) {
        await alert('Invitation link copied to clipboard!')
      } else {
        await alert(`Link: ${generatedLink}`)
      }
    }
  }

  const handleRevokeInvitation = async (invitationId) => {
    const isConfirmed = await confirm({
      title: 'Revoke Invitation',
      message: 'Are you sure you want to revoke this pending invitation link?',
      confirmText: 'Revoke Link',
      cancelText: 'Cancel',
      variant: 'danger'
    })
    if (!isConfirmed) return

    try {
      await apiClient.delete(`/api/teams/${team.id}/invitations/${invitationId}`)
      await alert('Invitation successfully revoked.')
      loadTeam()
    } catch (err) {
      await alert(err.response?.data?.message || 'Failed to revoke invitation')
    }
  }

  const handleRemoveMember = async (memberUserId, memberName) => {
    const isConfirmed = await confirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${memberName || 'this member'} from your team?`,
      confirmText: 'Remove Member',
      cancelText: 'Cancel',
      variant: 'danger'
    })
    if (!isConfirmed) return

    try {
      await apiClient.delete(`/api/teams/${team.id}/members/${memberUserId}`)
      await alert('Member removed from team.')
      loadTeam()
    } catch (err) {
      await alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const ownerMember = team?.members?.find((m) => m.isOwner)
  const ownerRole = ownerMember?.workflowRole
  const availableInviteRoles = ['Writer', 'Reviewer', 'Publisher'].filter((role) => role !== ownerRole)

  if (loading) {
    return <LoadingState message="Loading team workspace..." />
  }

  if (error) {
    return (
      <Card title="Team Workspace Unavailable">
        <p style={{ color: '#404942' }}>{error}</p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => loadTeam()}>Retry</Button>
          <Link to="/dashboard"><Button variant="ghost">Back to Dashboard</Button></Link>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#e3f2e9',
              color: '#155a37',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <GroupsIcon sx={{ fontSize: 26 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                Team Hub
              </span>
              <span style={{ fontSize: '0.75rem', color: '#bfc9bf' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: '#404942' }}>
                Owner: <strong>{team.owner.name || team.owner.email}</strong>
              </span>
            </div>
            <h1 style={{ margin: '2px 0 0', fontSize: '1.75rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.025em' }}>
              {team.name}
            </h1>
          </div>
        </div>

        {team.currentUser.isOwner && (
          <Button
            variant="primary"
            size="md"
            startIcon={<PersonAddAlt1Icon />}
            onClick={() => {
              if (availableInviteRoles.length > 0) {
                setInviteRole(availableInviteRoles[0])
              }
              setIsInviteModalOpen(true)
            }}
          >
            Invite Member
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {/* Team Members List */}
        <div style={{ flex: 1.6 }}>
          <Card
            title={`Team Members (${team.members.length})`}
            subtitle="Collaborators with access to this editorial workspace"
          >
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <Table headers={['Member Name', 'Email', 'Role Assignment', 'Status', 'Actions']}>
                {team.members.map((member) => (
                  <tr key={member.user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={member.user.name || 'Member'} size="sm" />
                        <strong style={{ color: '#191c1b', fontSize: '0.9rem' }}>
                          {member.user.name || 'Team Member'} {member.isCurrentUser ? '(You)' : ''}
                        </strong>
                      </div>
                    </td>
                    <td style={{ color: '#404942', fontSize: '0.85rem' }}>{member.user.email}</td>
                    <td>
                      <Badge variant={member.isOwner ? 'success' : 'neutral'}>
                        {member.isOwner ? `Owner (${member.workflowRole})` : member.workflowRole}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td>
                      {team.currentUser.isOwner && !member.isOwner && !member.isCurrentUser ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: '#ba1a1a' }}
                          onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                          title="Remove Member"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </Button>
                      ) : (
                        <span style={{ color: '#707971', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* Pending Invitations */}
          <Card title="Pending Invitations" subtitle={`${team.pendingInvitations.length} outstanding links`}>
            {team.pendingInvitations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {team.pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: '12px 14px',
                      border: '1px solid #e3e7e4',
                      borderRadius: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8faf8',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#191c1b' }}>
                        {inv.email || 'Shareable Link'}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#404942' }}>Role: {inv.assignedRole}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge variant="warning" size="sm">Pending</Badge>
                      {inv.invitationLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await copyToClipboard(inv.invitationLink)
                            setCopiedId(inv.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                        >
                          {copiedId === inv.id ? 'Copied' : 'Copy'}
                        </Button>
                      )}
                      {team.currentUser.isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: '#ba1a1a' }}
                          onClick={() => handleRevokeInvitation(inv.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Pending Invites" description="Invite teammates to assign Writer, Reviewer, or Publisher roles." />
            )}
          </Card>

          {/* Quick Category Access */}
          <Card title="Team Taxonomy" subtitle="Shared categories & subcategories">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#404942' }}>
                Collaborate with custom taxonomy nodes scoped to your organization.
              </p>
              <Link to="/categories">
                <Button variant="outline" size="md" startIcon={<FolderOutlinedIcon />} style={{ width: '100%', justifyContent: 'flex-start' }}>
                  Manage Team Categories
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Invitation Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false)
          setGeneratedLink('')
        }}
        title="Invite Team Member"
        footer={
          <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Assigned Workflow Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={availableInviteRoles.map((role) => ({ label: role, value: role }))}
          />
          {ownerRole && (
            <p style={{ fontSize: '0.78rem', color: '#404942', margin: '-8px 0 0' }}>
              Note: You are currently holding the <strong>{ownerRole}</strong> role. Teammates can be invited for the other roles.
            </p>
          )}

          <Input
            label="Invitee Email Address"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          {inviteError ? <div style={{ background: '#ffdad6', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px', color: '#93000a', fontSize: '0.85rem' }}>{inviteError}</div> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            <Button variant="primary" onClick={handleCopyInviteLink} isLoading={generatingLink} startIcon={<ContentCopyIcon />}>
              Copy Link
            </Button>
            <Button variant="outline" onClick={handleSendInviteEmail} isLoading={generatingLink} startIcon={<SendOutlinedIcon />}>
              Send via Email
            </Button>
          </div>

          {generatedLink && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e3e7e4' }}>
              <label className="v2-label" style={{ fontSize: '0.82rem', color: '#404942' }}>Generated Link (Valid for 7 days)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={generatedLink} readOnly style={{ flex: 1 }} />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>Copy</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default TeamDashboardPage
