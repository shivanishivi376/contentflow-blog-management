import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptInvitation } from '../../auth/authSlice.js'
import { getInvitationRequest } from '../../../services/api/invitationApi.js'
import { Button, LoadingState, Badge } from '../../../components/ui/CustomerComponents.jsx'
import GroupsIcon from '@mui/icons-material/Groups'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import Alert from '@mui/material/Alert'

const InvitationPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, accessToken, loading: authLoading, error: authError } = useSelector((state) => state.auth)

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getInvitationRequest(token)
        setInvitation(response.data?.data?.invitation || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchInvitation()
    }
  }, [token])

  const handleAccept = async () => {
    const result = await dispatch(acceptInvitation(token))

    if (acceptInvitation.fulfilled.match(result)) {
      navigate('/team', { replace: true })
    }
  }

  if (loading) {
    return (
      <main className="auth-shell">
        <LoadingState message="Validating team invitation..." />
      </main>
    )
  }

  if (error || !invitation) {
    return (
      <main className="auth-shell">
        <section
          style={{
            width: 'min(480px, 100%)',
            background: '#ffffff',
            border: '1px solid #e3e7e4',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 10px 30px -5px rgba(13, 58, 35, 0.08)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', color: '#004124', margin: '0 0 10px', fontWeight: 800 }}>
            Invitation Unavailable
          </h2>
          <p style={{ color: '#404942', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
            {error || 'This invitation is invalid, has expired, or was revoked by the team administrator.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </section>
      </main>
    )
  }

  const isEmailSpecific = Boolean(invitation.email)
  const emailMatch = !isEmailSpecific || (
    user && String(user.email).toLowerCase() === String(invitation.email).toLowerCase()
  )

  const canAccept = accessToken && user && emailMatch

  return (
    <main className="auth-shell">
      <section
        style={{
          width: 'min(500px, 100%)',
          background: '#ffffff',
          border: '1px solid #e3e7e4',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 10px 30px -5px rgba(13, 58, 35, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: '#e3f2e9',
              color: '#155a37',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <GroupsIcon sx={{ fontSize: 28 }} />
          </div>

          <Badge variant="success">Team Invitation</Badge>

          <h2 style={{ fontSize: '1.6rem', color: '#004124', margin: '14px 0 6px', fontWeight: 800 }}>
            Join {invitation.team?.name || 'Editorial Team'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#404942', margin: 0 }}>
            You've been invited to join the workspace as a <strong>{invitation.assignedRole}</strong>.
          </p>
        </div>

        {/* Invitation details card */}
        <div
          style={{
            background: '#f8faf8',
            border: '1px solid #e3e7e4',
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#404942', fontSize: '0.85rem' }}>Team Organization</span>
            <strong style={{ color: '#004124', fontSize: '0.9rem' }}>{invitation.team?.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#404942', fontSize: '0.85rem' }}>Designated Role</span>
            <Badge variant="info">{invitation.assignedRole}</Badge>
          </div>
          {isEmailSpecific && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#404942', fontSize: '0.85rem' }}>Invited Email</span>
              <span style={{ color: '#191c1b', fontSize: '0.85rem', fontWeight: 600 }}>{invitation.email}</span>
            </div>
          )}
        </div>

        {authError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>
        ) : null}

        {!accessToken || !user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.85rem', color: '#404942', textAlign: 'center', margin: 0 }}>
              {isEmailSpecific
                ? <>Please register or sign in with <strong>{invitation.email}</strong> to accept.</>
                : 'Create an account or sign in to join this team.'}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup', { state: { from: `/invitations/${token}` } })}
              style={{ width: '100%' }}
            >
              Sign Up to Accept →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/login', { state: { from: `/invitations/${token}` } })}
              style={{ width: '100%' }}
            >
              Sign In with Existing Account
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isEmailSpecific && !emailMatch && (
              <Alert severity="warning" sx={{ mb: 1, fontSize: '0.82rem' }}>
                This invitation was sent to <strong>{invitation.email}</strong>, but you are signed in as <strong>{user.email}</strong>.
              </Alert>
            )}
            <Button
              variant="primary"
              size="lg"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleAccept}
              isLoading={authLoading}
              disabled={!canAccept}
              style={{ width: '100%' }}
            >
              Accept Invitation & Join Team
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}

export default InvitationPage
