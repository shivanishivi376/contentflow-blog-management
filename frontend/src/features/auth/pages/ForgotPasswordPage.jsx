import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { forgotPassword as forgotPasswordAction } from '../authSlice.js'
import AuthHero from '../components/AuthHero.jsx'
import { Input, Button } from '../../../components/ui/CustomerComponents.jsx'
import Alert from '@mui/material/Alert'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const ForgotPasswordPage = () => {
  const dispatch = useDispatch()
  const { loading, error, message } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await dispatch(forgotPasswordAction({ email }))
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <AuthHero
          badge="Security & Recovery"
          title="Recover your workspace password"
          description="Enter your registered email address and we will generate a password reset link to restore your account access."
        />

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Forgot password 🔑</h2>
            <p>We will send reset instructions to your verified email address.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="noah@contentflow.io"
              required
              startAdornment={<EmailOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            {error   ? <Alert severity="error">{error}</Alert>   : null}
            {message ? <Alert severity="success">{message}</Alert> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
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

export default ForgotPasswordPage
