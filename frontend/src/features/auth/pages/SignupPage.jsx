import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { googleAuthUser, signupUser } from '../authSlice.js'
import { getInvitationRequest } from '../../../services/api/invitationApi.js'
import AuthHero from '../components/AuthHero.jsx'
import GoogleAuthButton from '../components/GoogleAuthButton.jsx'
import { Input, PasswordInput, Button } from '../../../components/ui/CustomerComponents.jsx'
import Alert from '@mui/material/Alert'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const extractInvitationToken = (from) => {
  if (!from || typeof from !== 'string') return null
  const match = from.match(/^\/invitations\/([^/?#]+)/)
  return match ? match[1] : null
}

const SignupPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector((state) => state.auth)

  const invitationToken = extractInvitationToken(location.state?.from)

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  })

  const [invitation, setInvitation] = useState(null)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const [invitationError, setInvitationError] = useState(null)
  const [googleError, setGoogleError] = useState('')

  useEffect(() => {
    if (!invitationToken) return

    const fetchInvitation = async () => {
      setInvitationLoading(true)
      setInvitationError(null)
      try {
        const response = await getInvitationRequest(invitationToken)
        const inv = response.data?.data?.invitation || null
        setInvitation(inv)

        if (inv?.email) {
          setFormData((current) => ({ ...current, email: inv.email }))
        }
      } catch (err) {
        setInvitationError(err.response?.data?.message || 'Could not load invitation details')
      } finally {
        setInvitationLoading(false)
      }
    }

    fetchInvitation()
  }, [invitationToken])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = { ...formData }

    if (invitationToken) {
      payload.invitationToken = invitationToken
    }

    const result = await dispatch(signupUser(payload))

    if (signupUser.fulfilled.match(result)) {
      const data = result.payload?.data

      if (data?.hasInvitation && data?.invitationToken) {
        navigate('/login', {
          state: { from: `/invitations/${data.invitationToken}` },
          replace: true,
        })
      } else {
        navigate('/login')
      }
    }
  }

  const handleGoogleCredential = async (credential, errorMessage = '') => {
    setGoogleError(errorMessage)
    if (!credential) return

    const result = await dispatch(googleAuthUser(credential))
    if (googleAuthUser.fulfilled.match(result)) {
      const nextUser = result.payload?.data?.user
      if (invitationToken) {
        navigate(`/invitations/${invitationToken}`, { replace: true })
      } else {
        navigate(nextUser?.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true })
      }
    } else {
      setGoogleError(result.payload || 'Google authentication failed. Please try again.')
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <AuthHero
          badge="Start Writing"
          title="Create your account & share your voice."
          description="Join thousands of independent authors and high-velocity publication teams on ContentFlow."
        />

        <div className="auth-card">
          {/* Segmented Pill Switcher */}
          <div className="auth-segmented-switch">
            <div className="auth-segmented-container">
              <button
                type="button"
                className="auth-segmented-tab"
                onClick={() =>
                  navigate('/login', {
                    state: invitationToken ? { from: `/invitations/${invitationToken}` } : undefined,
                  })
                }
              >
                Login
              </button>
              <button
                type="button"
                className="auth-segmented-tab active"
                onClick={() => {}}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="auth-card-header">
            <h2>Create free account 🚀</h2>
            <p>
              {invitationToken
                ? 'Create an account to join your team workspace'
                : 'Join modern editorial teams in seconds.'}
            </p>
          </div>

          {invitation && (
            <div
              style={{
                background: '#e3f2e9',
                border: '1px solid #a1f5bd',
                borderRadius: '12px',
                padding: '12px 14px',
                marginTop: '12px',
                fontSize: '0.84rem',
                color: '#155a37',
              }}
            >
              Invited to join <strong>{invitation.team?.name || 'team'}</strong> as{' '}
              <strong>{invitation.assignedRole || invitation.role || 'Member'}</strong>
            </div>
          )}

          {invitationError && <Alert severity="warning" sx={{ mt: 1.5 }}>{invitationError}</Alert>}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Full name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Noah Castell"
              required
              startAdornment={<PersonOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="noahcastell"
              required
              startAdornment={<AlternateEmailIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="noah@contentflow.io"
              required
              disabled={Boolean(invitation?.email)}
              startAdornment={<EmailOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading || invitationLoading}
              disabled={loading || invitationLoading}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </Button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '22px 0 16px' }}>
            <div style={{ width: '100%', borderTop: '1px solid #e3e7e4' }} />
            <span style={{ position: 'absolute', background: '#ffffff', padding: '0 12px', fontSize: '0.78rem', color: '#707971', fontWeight: 600 }}>
              or continue with
            </span>
          </div>

          <GoogleAuthButton
            onCredential={handleGoogleCredential}
            disabled={loading}
            error={googleError}
            text="signup_with"
          />

          <div className="auth-links" style={{ justifyContent: 'center', marginTop: 22 }}>
            <span style={{ color: '#404942' }}>Already have an account?</span>
            <Link
              to="/login"
              state={invitationToken ? { from: `/invitations/${invitationToken}` } : undefined}
              style={{ color: '#155a37', fontWeight: 700 }}
            >
              Login here.
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SignupPage
