import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout, setAuthUser } from '../../auth/authSlice.js'
import { fetchUserProfileRequest, updateUserPasswordRequest, updateUserProfileRequest } from '../../../services/api/userApi.js'
import { uploadMediaRequest } from '../../../services/api/mediaApi.js'
import { Avatar, Badge, Button, Card, Input, PasswordInput, LoadingState } from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import IconButton from '@mui/material/IconButton'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import LogoutIcon from '@mui/icons-material/Logout'
import CircularProgress from '@mui/material/CircularProgress'

const ProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { confirm } = useConfirm()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadProfile = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetchUserProfileRequest()
      const p = response.data?.data?.profile || {}
      setProfile(p)
      setFormData({
        name: p.name || '',
        bio: p.bio || '',
        profileImage: p.profileImage || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const fileInputRef = useRef(null)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError('')
    setMessage('Uploading profile image...')

    try {
      const res = await uploadMediaRequest(file)
      const media = res.data?.data?.media || res.data?.data || res.data
      const uploadedUrl = media?.url || res.data?.url
      const uploadedPublicId = media?.publicId || ''

      if (uploadedUrl) {
        const updateRes = await updateUserProfileRequest({
          ...formData,
          profileImage: { url: uploadedUrl, publicId: uploadedPublicId },
        })
        const updatedProfile = updateRes.data?.data?.profile || updateRes.data?.profile
        if (updatedProfile) {
          setProfile(updatedProfile)
          setFormData((prev) => ({
            ...prev,
            name: updatedProfile.name || prev.name,
            bio: updatedProfile.bio || prev.bio,
            profileImage: updatedProfile.profileImage || { url: uploadedUrl, publicId: uploadedPublicId },
          }))
          dispatch(setAuthUser(updatedProfile))
        } else {
          await loadProfile()
        }
        setMessage('Profile image updated successfully!')
      } else {
        setError('Upload succeeded but no image URL was returned')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updateRes = await updateUserProfileRequest({
        ...formData,
        profileImage: profile?.profileImage || formData.profileImage,
      })
      const updatedProfile = updateRes.data?.data?.profile || updateRes.data?.profile
      if (updatedProfile) {
        setProfile(updatedProfile)
        dispatch(setAuthUser(updatedProfile))
      } else {
        await loadProfile()
      }
      setMessage('Profile details updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setPasswordSaving(true)
    setError('')
    setMessage('')

    try {
      await updateUserPasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setMessage('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout of your account?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (isConfirmed) {
      dispatch(logout())
      navigate('/login')
    }
  }

  if (loading) {
    return <LoadingState message="Loading your profile details..." />
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
              Preferences & Security
            </span>
            <span style={{ fontSize: '0.75rem', color: '#bfc9bf' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#404942', fontWeight: 600 }}>
              {profile?.accountType || 'INDIVIDUAL'}
            </span>
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: '1.75rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Profile & Appearance Settings
          </h1>
          <p style={{ margin: '3px 0 0', color: '#404942', fontSize: '0.88rem' }}>
            Manage your author bio, avatar, credentials, and publication preferences.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          startIcon={<LogoutIcon fontSize="small" />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      {error   && <div style={{ background: '#ffdad6', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#93000a', fontSize: '0.88rem' }}>{error}</div>}
      {message && <div style={{ background: '#e3f2e9', border: '1px solid #a1f5bd', borderRadius: '12px', padding: '12px 16px', color: '#155a37', fontSize: '0.88rem' }}>{message}</div>}

      {/* Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Column 1: Profile Avatar Card */}
        <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '0 auto',
                aspectRatio: '1 / 1',
              }}
            >
              {profile?.profileImage?.url || (typeof profile?.profileImage === 'string' && profile.profileImage) ? (
                <img
                  src={profile?.profileImage?.url || profile.profileImage}
                  alt={profile?.name || 'User'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    border: '3px solid #e3e7e4',
                    aspectRatio: '1 / 1',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#155a37',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    aspectRatio: '1 / 1',
                  }}
                >
                  {profile?.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
              )}
              {uploadingPhoto && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(13, 58, 35, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    zIndex: 10,
                  }}
                >
                  <CircularProgress size={26} color="inherit" thickness={4} />
                </div>
              )}
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                size="small"
                disabled={uploadingPhoto}
                title="Upload new photo"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#155a37',
                  color: 'white',
                  width: 32,
                  height: 32,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  zIndex: 20,
                  '&:hover': { background: '#0d3a23' },
                  '&:disabled': { background: '#bfc9bf', color: '#f8faf8' },
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </div>
          </div>

          <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#004124', fontWeight: 700 }}>
            {profile?.name || 'User'}
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#404942', display: 'block', marginBottom: '10px' }}>
            {profile?.email}
          </span>
          <Badge variant="success">
            {profile?.accountType || 'INDIVIDUAL'}
          </Badge>
        </Card>

        {/* Column 2: Personal Information Form */}
        <div style={{ minWidth: 0 }}>
          <Card title="Author Information" subtitle="Publicly displayed on your articles">
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <Input
                  label="First Name"
                  value={formData.name.split(' ')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, name: `${e.target.value} ${formData.name.split(' ').slice(1).join(' ')}`.trim() })}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.name.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => setFormData({ ...formData, name: `${formData.name.split(' ')[0] || ''} ${e.target.value}`.trim() })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <Input
                  label="Email Address"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  helperText="Email is bound to your account"
                />
                <Input
                  label="Account Mode"
                  value={profile?.accountType || 'INDIVIDUAL'}
                  disabled
                />
              </div>

              <div className="v2-field-group">
                <label className="v2-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#404942', marginBottom: 4 }}>
                  Author Bio
                </label>
                <textarea
                  className="v2-input"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Passionate blogger, technical writer and software creator..."
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <Button type="submit" variant="primary" isLoading={saving}>
                  Save Profile Details
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Column 3: Security & Password Settings */}
        <div style={{ minWidth: 0 }}>
          <Card title="Security & Password" subtitle="Update authentication credentials">
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <PasswordInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
              <PasswordInput
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                helperText="Minimum 8 characters"
              />
              <PasswordInput
                label="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
              <Button type="submit" variant="primary" size="sm" isLoading={passwordSaving}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
