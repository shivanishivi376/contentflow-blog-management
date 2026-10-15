import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginAdmin } from '../adminSlice.js'
import { Input, PasswordInput, Button } from '../../../components/ui/CustomerComponents.jsx'
import Alert from '@mui/material/Alert'
import LockIcon from '@mui/icons-material/Lock'
import SecurityIcon from '@mui/icons-material/Security'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const AdminLoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, message } = useSelector((state) => state.admin)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(loginAdmin(formData))

    if (loginAdmin.fulfilled.match(result)) {
      navigate('/admin/dashboard')
    }
  }

  return (
    <main
      className="auth-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      {/* Elevated Admin Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e3e7e4',
          boxShadow: '0 8px 30px rgba(13, 58, 35, 0.08), 0 1px 3px rgba(13, 58, 35, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            height: '6px',
            width: '100%',
            background: 'linear-gradient(90deg, #155a37 0%, #126c41 50%, #0d3a23 100%)',
          }}
        />

        <div style={{ padding: '32px 28px' }}>
          {/* Top Header Pill Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '9999px',
                background: '#0d3a23',
                color: '#a1f5bd',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(13, 58, 35, 0.2)',
              }}
            >
              <LockIcon sx={{ fontSize: 14, color: '#a1f5bd' }} />
              <span>CONTENTFLOW CONTROL ROOM • SUPER ADMIN</span>
            </div>
          </div>

          {/* Typography Header Group */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#004124',
                letterSpacing: '-0.025em',
              }}
            >
              Sign in to Admin Workspace
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#404942' }}>
              Enter your administrative credentials to access platform controls.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@contentflow.io"
              required
              startAdornment={<EmailOutlinedIcon fontSize="small" sx={{ color: '#707971' }} />}
            />

            <PasswordInput
              label="Security Passcode"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />

            {error   && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? 'Authenticating...' : 'Login to Control Room'}
            </Button>
          </form>

          {/* Card Footer Security Indicator */}
          <div
            style={{
              paddingTop: '20px',
              marginTop: '20px',
              borderTop: '1px solid #e3e7e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: '#707971',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            <SecurityIcon sx={{ fontSize: 16, color: '#155a37' }} />
            <span>Protected by ContentFlow Security Matrix • Encrypted Session</span>
          </div>
        </div>
      </div>

      {/* Return to Creator Workspace Link */}
      <div style={{ marginTop: 24 }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid #e3e7e4',
            color: '#155a37',
            fontSize: '0.85rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Return to Creator Workspace</span>
        </Link>
      </div>
    </main>
  )
}

export default AdminLoginPage
