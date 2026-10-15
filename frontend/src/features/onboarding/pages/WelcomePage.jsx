import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/CustomerComponents.jsx'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <main className="auth-shell">
      <div
        style={{
          width: 'min(560px, 100%)',
          background: '#ffffff',
          border: '1px solid #e3e7e4',
          borderRadius: '24px',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 30px -5px rgba(13, 58, 35, 0.08)',
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 22,
            background: '#e3f2e9',
            color: '#155a37',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 4px 14px rgba(21, 90, 55, 0.15)',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 38 }} />
        </div>

        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#155a37',
            background: '#a1f5bd',
            padding: '5px 14px',
            borderRadius: 9999,
          }}
        >
          Setup Complete
        </span>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#004124',
            margin: '16px 0 10px',
            letterSpacing: '-0.025em',
          }}
        >
          Your Workspace is Ready! 🎉
        </h1>

        <p style={{ fontSize: '0.92rem', color: '#404942', lineHeight: 1.6, margin: '0 0 32px' }}>
          Your account is configured with your topic preferences and editorial settings. You are all set to start writing, collaborating, and exploring stories on ContentFlow.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            variant="primary"
            size="lg"
            startIcon={<DashboardOutlinedIcon />}
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%' }}
          >
            Go to Creator Workspace
          </Button>

          <Button
            variant="secondary"
            size="md"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/blogs/create')}
            style={{ width: '100%' }}
          >
            Start Writing First Post
          </Button>
        </div>
      </div>
    </main>
  )
}

export default WelcomePage
