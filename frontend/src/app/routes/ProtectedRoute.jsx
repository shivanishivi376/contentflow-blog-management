import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { accessToken, user } = useSelector((state) => state.auth)

  if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Invitation routes must be accessible to authenticated users who have not yet completed
  // onboarding. An invitation user has onboardingCompleted=false until they accept the
  // invitation (which sets it to true server-side). Without this exception, the user would
  // be caught in an infinite redirect loop: login → /invitations/:token (ProtectedRoute) →
  // /onboarding → login.
  //
  // Note: /invitations/:token is already a PUBLIC route in AppRouter.jsx, so this guard
  // only triggers for authenticated users who access it while onboarding is incomplete.
  const isInvitationRoute = location.pathname.startsWith('/invitations/')

  if (!user.onboardingCompleted && location.pathname !== '/onboarding' && !isInvitationRoute) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default ProtectedRoute
