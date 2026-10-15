import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword as resetPasswordAction } from '../authSlice.js'
import AuthHero from '../components/AuthHero.jsx'
import { Input, PasswordInput, Button } from '../../../components/ui/CustomerComponents.jsx'
import Alert from '@mui/material/Alert'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const ResetPasswordPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''

  const { loading, error, message } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    resetToken: tokenFromUrl,
    password: '',
  })

  useEffect(() => {
    if (tokenFromUrl) {
      setFormData((current) => ({ ...current, resetToken: tokenFromUrl }))
    }
  }, [tokenFromUrl])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(resetPasswordAction(formData))

    if (resetPasswordAction.fulfilled.match(result)) {
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <AuthHero
          badge="Security Credentials"
          title="Set your fresh account password"
          description="Enter your secure reset token and specify a new password to regain access to your editorial workspace."
        />

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Reset password 🛡️</h2>
            <p>Enter your reset token and choose a strong new password.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Reset Token"
              type="text"
              name="resetToken"
              value={formData.resetToken}
              onChange={handleChange}
              placeholder="Paste security token"
              required
              startAdornment={<VpnKeyOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <PasswordInput
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
              helperText="Must be at least 6 characters"
            />

            {error   ? <Alert severity="error">{error}</Alert>   : null}
            {message ? <Alert severity="success">{message} Redirecting to login...</Alert> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? 'Resetting Password...' : 'Update Password'}
            </Button>
          </form>

          <div className="auth-links" style={{ justifyContent: 'center', marginTop: 24 }}>
            <Link to="/login" style={{ color: '#155a37', fontWeight: 700 }}>
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage
