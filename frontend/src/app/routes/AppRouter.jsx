import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import AdminProtectedRoute from './AdminProtectedRoute.jsx'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice.js'
import { useConfirm } from '../../context/ConfirmationContext.jsx'
import LoginPage from '../../features/auth/pages/LoginPage.jsx'
import SignupPage from '../../features/auth/pages/SignupPage.jsx'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage.jsx'
import AdminLoginPage from '../../features/admin/pages/AdminLoginPage.jsx'
import AdminCategoriesPage from '../../features/admin/pages/AdminCategoriesPage.jsx'
import AdminSubcategoriesPage from '../../features/admin/pages/AdminSubcategoriesPage.jsx'
import AdminKeywordsPage from '../../features/admin/pages/AdminKeywordsPage.jsx'
import AdminPermissionsPage from '../../features/admin/pages/AdminPermissionsPage.jsx'
import AdminRolesPage from '../../features/admin/pages/AdminRolesPage.jsx'
import AdminSMTPPage from '../../features/admin/pages/AdminSMTPPage.jsx'
import AdminAnalyticsPage from '../../features/admin/pages/AdminAnalyticsPage.jsx'
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage.jsx'
import AdminTeamsPage from '../../features/admin/pages/AdminTeamsPage.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import BlogCreatePage from '../../features/blogs/pages/BlogCreatePage.jsx'
import BlogEditPage from '../../features/blogs/pages/BlogEditPage.jsx'
import BlogsListPage from '../../features/blogs/pages/BlogsListPage.jsx'
import PublicBlogDetailPage from '../../features/blogs/pages/PublicBlogDetailPage.jsx'
import ProfilePage from '../../features/profile/pages/ProfilePage.jsx'
import DashboardFeedPage from '../../features/dashboard/pages/DashboardFeedPage.jsx'
import AdminInterestsPage from '../../features/interests/pages/AdminInterestsPage.jsx'
import OnboardingPage from '../../features/onboarding/pages/OnboardingPage.jsx'
import WelcomePage from '../../features/onboarding/pages/WelcomePage.jsx'
import TeamDashboardPage from '../../features/teams/pages/TeamDashboardPage.jsx'
import InvitationPage from '../../features/teams/pages/InvitationPage.jsx'
import CategoriesPage from '../../features/categories/pages/CategoriesPage.jsx'

const RootRedirect = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

const CustomerRoute = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { confirm } = useConfirm()
  const { user } = useSelector((state) => state.auth)

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

  return (
    <ProtectedRoute>
      <CustomerLayout user={user} onLogout={handleLogout}>
        {children}
      </CustomerLayout>
    </ProtectedRoute>
  )
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/feed" element={<RootRedirect />} />
      <Route path="/blog/:slug" element={<PublicBlogDetailPage />} />
      <Route path="/invitations/:token" element={<InvitationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminAnalyticsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="teams" element={<AdminTeamsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="subcategories" element={<AdminSubcategoriesPage />} />
        <Route path="keywords" element={<AdminKeywordsPage />} />
        <Route path="interests" element={<AdminInterestsPage />} />
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="permissions" element={<AdminPermissionsPage />} />
        <Route path="smtp" element={<AdminSMTPPage />} />
      </Route>
      <Route
        path="/dashboard"
        element={
          <CustomerRoute>
            <DashboardFeedPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <ProfilePage />
          </CustomerRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <CustomerRoute>
            <CategoriesPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/team"
        element={
          <CustomerRoute>
            <TeamDashboardPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/blogs"
        element={
          <CustomerRoute>
            <BlogsListPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/blogs/create"
        element={
          <CustomerRoute>
            <BlogCreatePage />
          </CustomerRoute>
        }
      />
      <Route
        path="/blogs/:id/edit"
        element={
          <CustomerRoute>
            <BlogEditPage />
          </CustomerRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRouter
