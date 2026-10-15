import { useEffect, useRef, useState } from 'react'
import {
  fetchSMTPConfigRequest,
  testSMTPConnectionRequest,
  updateSMTPConfigRequest,
  unlinkSMTPConfigRequest,
} from '../../../services/api/smtpApi.js'
import {
  Button,
  Card,
  Input,
  LoadingState,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

const AdminSMTPPage = () => {
  const hasFetchedRef = useRef(false)
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [testError, setTestError] = useState('')

  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    senderEmail: '',
    senderName: '',
    isEmailNotificationEnabled: true,
  })
  const [passwordSet, setPasswordSet] = useState(false)
  const [isConfigSaved, setIsConfigSaved] = useState(false)
  const [savedConfig, setSavedConfig] = useState(null)

  const loadConfig = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchSMTPConfigRequest()
      const config = response.data?.data?.smtpConfig
      if (config && config.host) {
        const loadedForm = {
          host: config.host || '',
          port: config.port || 587,
          username: config.username || '',
          password: '',
          senderEmail: config.senderEmail || '',
          senderName: config.senderName || '',
          isEmailNotificationEnabled: config.isEmailNotificationEnabled ?? true,
        }
        setFormData(loadedForm)
        setSavedConfig(loadedForm)
        setPasswordSet(Boolean(config.passwordSet))
        setIsConfigSaved(true)
      } else {
        setSavedConfig(null)
        setIsConfigSaved(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load SMTP configuration')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadConfig()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, isEmailNotificationEnabled: e.target.checked }))
  }

  const handleReset = () => {
    if (savedConfig) {
      setFormData({ ...savedConfig, password: '' })
      setError('')
      setMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await updateSMTPConfigRequest(formData)
      setMessage('SMTP Configuration saved successfully')
      const updatedConfig = response.data?.data?.smtpConfig || {}
      setPasswordSet(Boolean(updatedConfig.passwordSet))
      const savedForm = {
        host: updatedConfig.host || formData.host,
        port: updatedConfig.port || formData.port,
        username: updatedConfig.username || formData.username,
        password: '',
        senderEmail: updatedConfig.senderEmail || formData.senderEmail,
        senderName: updatedConfig.senderName || formData.senderName,
        isEmailNotificationEnabled: updatedConfig.isEmailNotificationEnabled ?? formData.isEmailNotificationEnabled,
      }
      setFormData(savedForm)
      setSavedConfig(savedForm)
      setIsConfigSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save SMTP configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleUnlink = async () => {
    const isConfirmed = await confirm({ title: 'Unlink SMTP', message: 'Are you sure you want to unlink the SMTP configuration?', variant: 'danger' })
    if (!isConfirmed) return

    setUnlinking(true)
    setError('')
    setMessage('')
    try {
      await unlinkSMTPConfigRequest()
      setMessage('SMTP Configuration unlinked successfully')
      const emptyForm = {
        host: '',
        port: 587,
        username: '',
        password: '',
        senderEmail: '',
        senderName: '',
        isEmailNotificationEnabled: true,
      }
      setFormData(emptyForm)
      setSavedConfig(null)
      setPasswordSet(false)
      setIsConfigSaved(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlink SMTP configuration')
    } finally {
      setUnlinking(false)
    }
  }

  const handleTestSubmit = async (e) => {
    e.preventDefault()
    if (!testEmail) return
    setTesting(true)
    setTestError('')
    setTestMessage('')
    try {
      await testSMTPConnectionRequest(testEmail)
      setTestMessage(`Test email sent successfully to ${testEmail}!`)
    } catch (err) {
      setTestError(err.response?.data?.message || 'Failed to send test email.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: '#e6f9ed',
              color: '#004124',
              border: '1px solid #c2eed1',
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              SMTP Dispatcher
            </span>
            <span style={{ fontSize: '0.82rem', color: '#687a6e' }}>Mail Relay & Gateway</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 2.5vw, 2.2rem)', color: '#131d16', fontWeight: 800, letterSpacing: '-0.03em' }}>
            SMTP Server Configuration
          </h1>
          <p style={{ margin: '6px 0 0', color: '#687a6e', fontSize: '0.92rem' }}>
            Configure outgoing mail server credentials for invitations, resets, and publishing alerts.
          </p>
        </div>
      </div>

      {error   && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}

      {loading ? (
        <Card>
          <LoadingState message="Loading SMTP settings..." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
          {/* SMTP Config Form */}
          <Card
            title="Server & Sender Credentials"
            subtitle="Configures the primary outbound SMTP relay connection"
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="SMTP Host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="smtp.gmail.com or smtp.mailtrap.io"
                required
                disabled={saving}
              />
              <Input
                label="SMTP Port"
                name="port"
                type="number"
                value={formData.port}
                onChange={handleChange}
                placeholder="587"
                required
                disabled={saving}
              />
              <Input
                label="Username / Email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your-email@example.com"
                required
                disabled={saving}
              />
              <Input
                label={passwordSet ? 'Password (Saved in DB)' : 'Password'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={passwordSet ? '•••••••• (Leave blank to keep existing)' : 'Enter SMTP Password'}
                helperText={passwordSet ? 'A password is saved. Leave blank to keep existing, or type a new password to update.' : 'Enter the SMTP password or application-specific password.'}
                disabled={saving}
              />
              <Input
                label="Sender Name"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                placeholder="Blog Platform Team"
                required
                disabled={saving}
              />
              <Input
                label="Sender Email Address"
                name="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={handleChange}
                placeholder="noreply@yourdomain.com"
                required
                disabled={saving}
              />

              {/* MUI Switch replacing checkbox */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEmailNotificationEnabled}
                    onChange={handleSwitchChange}
                    disabled={saving}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <span style={{ fontSize: '0.88rem', color: '#131d16', fontWeight: 600 }}>
                    Enable Platform Email Notifications
                  </span>
                }
                sx={{ mt: 0.5 }}
              />

              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1, minWidth: 140, borderRadius: 9999 }}>
                  {saving ? 'Saving Settings...' : isConfigSaved ? 'Update Settings' : 'Save Settings'}
                </Button>
                {isConfigSaved && (
                  <>
                    <Button type="button" variant="secondary" onClick={handleReset} disabled={saving} style={{ borderRadius: 9999 }}>
                      Reset
                    </Button>
                    <Button type="button" variant="danger" onClick={handleUnlink} disabled={unlinking || saving} style={{ borderRadius: 9999 }}>
                      {unlinking ? 'Unlinking...' : 'Unlink Config'}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>

          {/* Test SMTP Card */}
          <Card
            title="Test Connection Gateway"
            subtitle="Send a test ping message to verify that your SMTP relay credentials work"
          >
            {testError   && <div className="auth-alert error" style={{ marginBottom: 14 }}>{testError}</div>}
            {testMessage && <div className="auth-alert success" style={{ marginBottom: 14 }}>{testMessage}</div>}

            <form onSubmit={handleTestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Recipient Email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" variant="secondary" disabled={testing || !testEmail} style={{ borderRadius: 9999 }}>
                {testing ? 'Sending Verification Email...' : 'Send Verification Email'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminSMTPPage
