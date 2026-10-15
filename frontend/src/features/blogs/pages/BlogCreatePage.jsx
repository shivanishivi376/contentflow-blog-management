import { Navigate } from 'react-router-dom'
import BlogWorkflowWorkspace from '../components/BlogWorkflowWorkspace.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'

const BlogCreatePage = () => {
  const { hasPermission } = useTeamPermissions()

  if (!hasPermission(TEAM_PERMISSIONS.BLOG_CREATE)) {
    return <Navigate to="/blogs" replace />
  }

  return <BlogWorkflowWorkspace isNew={true} />
}

export default BlogCreatePage

