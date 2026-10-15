import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../../auth/authSlice.js'
import { fetchInterestsRequest } from '../../../services/api/interestApi.js'
import { Button, Input, SearchInput } from '../../../components/ui/CustomerComponents.jsx'
import Chip from '@mui/material/Chip'
import CheckIcon from '@mui/icons-material/Check'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import EditNoteIcon from '@mui/icons-material/EditNote'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

const OnboardingPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
  const [interests, setInterests] = useState([])
  const [loadingInterests, setLoadingInterests] = useState(true)
  const [interestError, setInterestError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    accountType: 'INDIVIDUAL',
    teamName: '',
    workflowRole: 'Writer',
    interests: [],
  })

  useEffect(() => {
    const loadInterests = async () => {
      setLoadingInterests(true)
      setInterestError('')

      try {
        const response = await fetchInterestsRequest()
        setInterests(response.data?.data?.interests || [])
      } catch (requestError) {
        setInterestError(requestError.response?.data?.message || 'Failed to load interests')
      } finally {
        setLoadingInterests(false)
      }
    }

    loadInterests()
  }, [])

  const filteredInterests = useMemo(() => {
    return interests
      .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [interests, searchTerm])

  if (user?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  const handleAccountTypeChange = (accountType) => {
    setFormData((current) => ({ ...current, accountType }))
  }

  const handleInterestToggle = (interestId) => {
    setFormData((current) => {
      const exists = current.interests.includes(interestId)
      return {
        ...current,
        interests: exists
          ? current.interests.filter((id) => id !== interestId)
          : [...current.interests, interestId],
      }
    })
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (formData.accountType === 'TEAM') {
        setCurrentStep(2)
      } else {
        setCurrentStep(3)
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 3) {
      if (formData.accountType === 'TEAM') {
        setCurrentStep(2)
      } else {
        setCurrentStep(1)
      }
    } else if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      accountType: formData.accountType,
      interests: formData.interests,
    }

    if (formData.accountType === 'TEAM') {
      payload.teamName = formData.teamName
      payload.workflowRole = formData.workflowRole
    }

    const result = await dispatch(completeOnboarding(payload))

    if (completeOnboarding.fulfilled.match(result)) {
      navigate('/welcome')
    }
  }

  const totalSteps = formData.accountType === 'TEAM' ? 3 : 2
  const activeStepNumber = currentStep === 3 && formData.accountType === 'INDIVIDUAL' ? 2 : currentStep

  const isStep1Valid = formData.accountType === 'INDIVIDUAL' || (formData.accountType === 'TEAM' && formData.teamName.trim().length >= 2)
  const isStep2Valid = formData.accountType === 'TEAM' ? formData.workflowRole.length > 0 : true
  const isStep3Valid = formData.interests.length > 0

  return (
    <main className="auth-shell">
      <div
        style={{
          width: 'min(660px, 100%)',
          background: '#ffffff',
          border: '1px solid #e3e7e4',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 10px 30px -5px rgba(13, 58, 35, 0.08)',
        }}
      >
        {/* Progress header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 26,
            paddingBottom: 16,
            borderBottom: '1px solid #e3e7e4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#155a37',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 18 }} />
            </div>
            <strong style={{ fontSize: '1rem', color: '#004124', fontWeight: 800 }}>ContentFlow Setup</strong>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#155a37',
              background: '#a1f5bd',
              padding: '3px 12px',
              borderRadius: 9999,
            }}
          >
            Step {activeStepNumber} of {totalSteps}
          </span>
        </div>

        {/* STEP 1: Account Type */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#004124', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
                How do you plan to use ContentFlow?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#404942', margin: 0 }}>
                Select your workspace type. You can invite team members and update settings anytime.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '26px' }}>
              <div
                onClick={() => handleAccountTypeChange('INDIVIDUAL')}
                style={{
                  border: formData.accountType === 'INDIVIDUAL' ? '2px solid #155a37' : '1px solid #e3e7e4',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  background: formData.accountType === 'INDIVIDUAL' ? '#e3f2e9' : '#f8faf8',
                  boxShadow: formData.accountType === 'INDIVIDUAL' ? '0 4px 14px rgba(21, 90, 55, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ width: '40px', height: '40px', background: '#a1f5bd', color: '#004124', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                  <PersonOutlineIcon />
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#004124' }}>Individual Creator</strong>
                <span style={{ fontSize: '0.82rem', color: '#404942', lineHeight: 1.45 }}>
                  Write, edit, and publish blogs independently with personal drafts and syndication.
                </span>
              </div>

              <div
                onClick={() => handleAccountTypeChange('TEAM')}
                style={{
                  border: formData.accountType === 'TEAM' ? '2px solid #155a37' : '1px solid #e3e7e4',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  background: formData.accountType === 'TEAM' ? '#e3f2e9' : '#f8faf8',
                  boxShadow: formData.accountType === 'TEAM' ? '0 4px 14px rgba(21, 90, 55, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ width: '40px', height: '40px', background: '#a1f5bd', color: '#004124', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                  <GroupsOutlinedIcon />
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#004124' }}>Team Organization</strong>
                <span style={{ fontSize: '0.82rem', color: '#404942', lineHeight: 1.45 }}>
                  Collaborate across Writers, Reviewers, and Publishers with multi-stage approval.
                </span>
              </div>
            </div>

            {formData.accountType === 'TEAM' && (
              <div style={{ marginBottom: '24px' }}>
                <Input
                  label="Team / Organization Name"
                  placeholder="e.g. Acme Media Guild"
                  value={formData.teamName}
                  onChange={(e) => setFormData((curr) => ({ ...curr, teamName: e.target.value }))}
                  required
                  helperText="Minimum 2 characters"
                />
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextStep}
              disabled={!isStep1Valid}
              style={{ width: '100%' }}
            >
              Continue →
            </Button>
          </div>
        )}

        {/* STEP 2: Team Role Selection */}
        {currentStep === 2 && formData.accountType === 'TEAM' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#004124', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
                Choose your primary role
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#404942', margin: 0 }}>
                As the Team Owner, select which workflow role you will actively take.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'Writer', title: 'Writer', desc: 'Author content, draft articles, and use AI prompts', icon: <EditNoteIcon /> },
                { id: 'Reviewer', title: 'Reviewer', desc: 'Review submissions, request revisions, and approve drafts', icon: <RateReviewOutlinedIcon /> },
                { id: 'Publisher', title: 'Publisher', desc: 'Manage final publishing release and DEV.to syndication', icon: <RocketLaunchOutlinedIcon /> },
              ].map((role) => (
                <div
                  key={role.id}
                  onClick={() => setFormData((curr) => ({ ...curr, workflowRole: role.id }))}
                  style={{
                    border: formData.workflowRole === role.id ? '2px solid #155a37' : '1px solid #e3e7e4',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: formData.workflowRole === role.id ? '#e3f2e9' : '#f8faf8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: formData.workflowRole === role.id ? '#155a37' : '#e3e7e4',
                        color: formData.workflowRole === role.id ? '#ffffff' : '#404942',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {role.icon}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#004124' }}>{role.title}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#404942' }}>{role.desc}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="workflowRole"
                    checked={formData.workflowRole === role.id}
                    onChange={() => {}}
                    style={{ accentColor: '#155a37', width: 18, height: 18 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#f8faf8', border: '1px solid #e3e7e4', fontSize: '0.84rem', color: '#404942', marginBottom: 24 }}>
              💡 <strong>Next step:</strong> You can invite other teammates for remaining roles directly from your Team Dashboard.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" size="lg" onClick={handlePrevStep} style={{ width: '35%' }}>
                ← Back
              </Button>
              <Button variant="primary" size="lg" onClick={handleNextStep} disabled={!isStep2Valid} style={{ width: '65%' }}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Topic Interests Selection */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#004124', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
                Select your topic interests
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#404942', margin: 0 }}>
                Pick topics you love to personalize your feed and discover relevant stories.
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <SearchInput
                placeholder="Search topic tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>

            {loadingInterests && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#404942' }}>
                <CircularProgress size={20} />
                <span>Loading topic taxonomy...</span>
              </div>
            )}
            {interestError && <Alert severity="error" sx={{ mb: 2 }}>{interestError}</Alert>}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxHeight: '250px',
                overflowY: 'auto',
                marginBottom: '24px',
                padding: '10px',
                border: '1px solid #e3e7e4',
                borderRadius: '16px',
                background: '#f8faf8',
              }}
            >
              {filteredInterests.map((interest) => {
                const selected = formData.interests.includes(interest._id)
                return (
                  <Chip
                    key={interest._id}
                    label={interest.name}
                    clickable
                    onClick={() => handleInterestToggle(interest._id)}
                    icon={selected ? <CheckIcon sx={{ fontSize: '15px !important' }} /> : undefined}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: 9999,
                      background: selected ? '#155a37' : '#ffffff',
                      color: selected ? '#ffffff' : '#191c1b',
                      border: selected ? '1px solid #155a37' : '1px solid #e3e7e4',
                      '&:hover': {
                        background: selected ? '#0d3a23' : '#f2f4f2',
                      },
                    }}
                  />
                )
              })}
            </div>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e3e7e4', paddingTop: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: '#404942', fontWeight: 600 }}>
                {formData.interests.length} topic{formData.interests.length === 1 ? '' : 's'} selected
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="outline" size="md" onClick={handlePrevStep}>
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  isLoading={loading}
                  disabled={!isStep3Valid || loading}
                >
                  Complete Setup 🚀
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

export default OnboardingPage
