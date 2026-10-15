import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { accessToken, admin } = useSelector((state) => state.admin)

  if (!accessToken || !admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export default AdminProtectedRoute
