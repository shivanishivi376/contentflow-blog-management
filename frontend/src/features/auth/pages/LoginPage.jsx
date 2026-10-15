import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { googleAuthUser, loginUser } from '../authSlice.js'
import AuthHero from '../components/AuthHero.jsx'
import GoogleAuthButton from '../components/GoogleAuthButton.jsx'
import { Input, PasswordInput, Button } from '../../../components/ui/CustomerComponents.jsx'
import Alert from '@mui/material/Alert'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const extractInvitationToken = (from) => {
  if (!from || typeof from !== 'string') return null
  const match = from.match(/^\/invitations\/([^/?#]+)/)
  return match ? match[1] : null
}

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [googleError, setGoogleError] = useState('')

  const invitationToken = extractInvitationToken(location.state?.from)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(loginUser(formData))

    if (loginUser.fulfilled.match(result)) {
      const nextUser = result.payload?.data?.user

      if (invitationToken) {
        navigate(`/invitations/${invitationToken}`, { replace: true })
      } else {
        navigate(nextUser?.onboardingCompleted ? '/dashboard' : '/onboarding')
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
          badge="Creator Portal"
          title="Where ideas flow into published stories."
          description="A calm, modern editorial workspace for independent writers and high-velocity publishing teams."
        />

        <div className="auth-card">
          {/* Segmented Pill Switcher */}
          <div className="auth-segmented-switch">
            <div className="auth-segmented-container">
              <button
                type="button"
                className="auth-segmented-tab active"
                onClick={() => { }}
              >
                Login
              </button>
              <button
                type="button"
                className="auth-segmented-tab"
                onClick={() =>
                  navigate('/signup', {
                    state: invitationToken ? { from: `/invitations/${invitationToken}` } : undefined,
                  })
                }
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="auth-card-header">
            <h2>Welcome👋</h2>
            <p>
              {invitationToken
                ? 'Log in to accept your pending team invitation'
                : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          {invitationToken && (
            <div
              style={{
                background: '#e3f2e9',
                border: '1px solid #a1f5bd',
                borderRadius: '12px',
                padding: '12px 14px',
                marginTop: '14px',
                fontSize: '0.84rem',
                color: '#155a37',
                fontWeight: 500,
              }}
            >
              🔗 Team invitation active: After logging in, you will be directed to accept and join.
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="noah@contentflow.io"
              required
              startAdornment={<EmailOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#404942' }}>Password</span>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#155a37', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
              />
            </div>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? 'Logging in...' : 'Login to ContentFlow'}
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
            text="signin_with"
          />

          <div className="auth-links" style={{ justifyContent: 'center', marginTop: 22 }}>
            <span style={{ color: '#404942' }}>Don't have an account?</span>
            <Link
              to="/signup"
              state={invitationToken ? { from: `/invitations/${invitationToken}` } : undefined}
              style={{ color: '#155a37', fontWeight: 700 }}
            >
              Sign up for free.
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
