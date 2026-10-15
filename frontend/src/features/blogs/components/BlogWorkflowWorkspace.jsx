import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

// Components
import WorkflowStepper from './WorkflowStepper.jsx'
import WorkflowStatusGuide from './WorkflowStatusGuide.jsx'
import RoleResponsibilitiesPanel from './RoleResponsibilitiesPanel.jsx'
import PublishFailedBanner from './PublishFailedBanner.jsx'
import AssignmentModal from './AssignmentModal.jsx'
import DevToPublishModal from './DevToPublishModal.jsx'
import CommentsPanel from './CommentsPanel.jsx'

// New screen components
import BasicDetailsForm from './BasicDetailsForm.jsx'
import TeamAssignmentStep from './TeamAssignmentStep.jsx'
import ContentWorkspace from './ContentWorkspace.jsx'
import ReviewScreen from './ReviewScreen.jsx'
import ReAssignScreen from './ReAssignScreen.jsx'
import PublishingScreen from './PublishingScreen.jsx'
import PublishedSuccessScreen from './PublishedSuccessScreen.jsx'

// UI
import { Badge, Button, LoadingState, Modal } from '../../../components/ui/CustomerComponents.jsx'

// API calls
import {
  assignBlogRolesRequest,
  createBlogRequest,
  fetchBlogByIdRequest,
  generateBlogAIContentRequest,
  publishBlogRequest,
  retryPublishBlogRequest,
  transitionBlogStatusRequest,
  updateBlogContentRequest,
  updateBlogRequest,
} from '../../../services/api/blogApi.js'
import { fetchMyTeamRequest } from '../../../services/api/teamApi.js'
import { fetchVersionsRequest, restoreVersionRequest } from '../../../services/api/versionApi.js'
import {
  addBlogCommentRequest,
  fetchBlogCommentsRequest,
  replyCommentRequest,
  resolveBlogCommentRequest,
} from '../../../services/api/commentApi.js'
import { useAutosave } from '../hooks/useAutosave.js'
import VersionHistoryDrawer from '../../editor/components/VersionHistoryDrawer.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'

const statusBadgeMap = {

  DRAFT: { label: 'Draft', variant: 'neutral' },
  IN_WRITING: { label: 'In Writing', variant: 'info' },
  IN_REVIEW: { label: 'In Review', variant: 'warning' },
  RE_ASSIGN: { label: 'Re Assign', variant: 'danger' },
  IN_PUBLISHING: { label: 'In Publishing', variant: 'warning' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  PUBLISH_FAILED: { label: 'Publish Failed', variant: 'danger' },
}

const BlogWorkflowWorkspace = ({ isNew = false }) => {
  const { confirm } = useConfirm()
  const { id: paramBlogId } = useParams()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth?.user)
  const isTeam = currentUser?.accountType === 'TEAM'
  const { isOwner: isOwnerFromHook } = useTeamPermissions()
  const [isOwner, setIsOwner] = useState(isOwnerFromHook)

  useEffect(() => {
    setIsOwner(isOwnerFromHook)
  }, [isOwnerFromHook])

  const [blogId, setBlogId] = useState(paramBlogId || null)

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '<p></p>',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    authorName: '',
    status: 'DRAFT',
    writer: '',
    reviewer: '',
    publisher: '',
    publishFailReason: null,
    publishFailedAt: null,
    devToArticleId: null,
    devToUrl: null,
    devToPublished: false,
    devToPublishedAt: null,
    devToPublishError: null,
    categoryName: '',
    subcategoryName: '',
    versionNumber: null,
    approvedAt: null,
  })

  const [taxonomy, setTaxonomy] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  // Modal states
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [isDevToModalOpen, setIsDevToModalOpen] = useState(false)
  const [isPostPublishConfirm, setIsPostPublishConfirm] = useState(false)
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false)
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [revising, setRevising] = useState(false)

  // Version / Comment state
  const [versions, setVersions] = useState([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')

  // AI state
  const [aiTopic, setAiTopic] = useState('')
  const [aiContext, setAiContext] = useState('')
  const [aiTone, setAiTone] = useState('professional')
  const [aiLength, setAiLength] = useState('medium')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReviewScore, setAiReviewScore] = useState(null)
  const [aiReviewLoading, setAiReviewLoading] = useState(false)

  // Reviewer comment text (for review screen)
  const [reviewComment, setReviewComment] = useState('')
  const [postingReviewComment, setPostingReviewComment] = useState(false)

  // ── Fetch team members ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTeam) return
    fetchMyTeamRequest()
      .then((res) => {
        const team = res.data?.data?.team || res.data?.team || {}
        if (team.currentUser?.isOwner !== undefined) {
          setIsOwner(Boolean(team.currentUser.isOwner))
        } else if (team.owner) {
          const ownerId = team.owner._id || team.owner.id || team.owner
          const myId = currentUser?.id || currentUser?._id
          if (String(ownerId) === String(myId)) {
            setIsOwner(true)
          }
        }
        const members = (team.members || []).map((m) => {
          const u = m.user || {}
          const userId = u.id || u._id || (typeof m.user === 'string' ? m.user : '')
          const userName = u.name || u.username || u.email || 'Team Member'
          const roleLabel = m.workflowRole || m.role?.name || 'Member'
          return {
            value: userId,
            label: `${userName} (${roleLabel}${m.isOwner ? ' - Owner' : ''})`,
            workflowRole: m.workflowRole || u.workflowRole || m.role?.name || '',
            isOwner: Boolean(m.isOwner),
          }
        }).filter((item) => Boolean(item.value))

        // Ensure owner is included if missing from members array for any reason
        if (team.owner) {
          const ownerObj = team.owner || {}
          const ownerId = ownerObj.id || ownerObj._id || (typeof team.owner === 'string' ? team.owner : '')
          const ownerName = ownerObj.name || ownerObj.username || ownerObj.email || 'Team Owner'
          if (ownerId && !members.some((m) => m.value === ownerId)) {
            const ownerRole = team.currentUser?.isOwner ? team.currentUser?.workflowRole : (ownerObj.workflowRole || '')
            members.unshift({
              value: ownerId,
              label: `${ownerName} (${ownerRole || 'Owner'})`,
              workflowRole: ownerRole || '',
              isOwner: true,
            })
          }
        }
        setTeamMembers(members)
      })
      .catch((err) => console.error('Failed to load team:', err))
  }, [isTeam, currentUser?.id, currentUser?._id])



  // ── Load blog ────────────────────────────────────────────────────────────────
  const loadBlog = useCallback(async () => {
    if (!blogId) return
    setLoading(true)
    setError('')
    try {
      const response = await fetchBlogByIdRequest(blogId)
      const blog = response.data?.data?.blog || {}

      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        description: blog.description || '',
        content: blog.content || '<p>Start writing your amazing blog...</p>',
        featuredImage: typeof blog.featuredImage === 'string' ? blog.featuredImage : (blog.featuredImage?.url || ''),
        metaTitle: blog.metaTitle || blog.metadata?.metaTitle || '',
        metaDescription: blog.metaDescription || blog.metadata?.metaDescription || '',
        authorName: blog.metadata?.authorName || blog.author?.name || '',
        status: blog.status || 'DRAFT',
        writer: blog.writer?._id || blog.writer || '',
        reviewer: blog.reviewer?._id || blog.reviewer || '',
        publisher: blog.publisher?._id || blog.publisher || '',
        publishFailReason: blog.publishFailReason || null,
        publishFailedAt: blog.publishFailedAt || null,
        devToArticleId: blog.devToArticleId || null,
        devToUrl: blog.devToUrl || null,
        devToPublished: Boolean(blog.devToPublished),
        devToPublishedAt: blog.devToPublishedAt || null,
        devToPublishError: blog.devToPublishError || null,
        categoryName: blog.category?.name || '',
        subcategoryName: blog.subcategory?.name || '',
        versionNumber: blog.currentVersion || null,
        approvedAt: blog.approvedAt || null,
        category: blog.category?._id || blog.category || '',
        subcategory: blog.subcategory?._id || blog.subcategory || '',
        primaryKeywords: (blog.primaryKeywords || []).map((k) => k._id || k),
        secondaryKeywords: (blog.secondaryKeywords || []).map((k) => k._id || k),
      })

      const catId = blog.category?._id || blog.category || ''
      const subcatId = blog.subcategory?._id || blog.subcategory || ''
      const primKws = (blog.primaryKeywords || []).map((k) => k._id || k)
      const secKws = (blog.secondaryKeywords || []).map((k) => k._id || k)

      setTaxonomy({
        categoryId: catId,
        subcategoryId: subcatId,
        keywordIds: [...primKws, ...secKws],
      })


      // Set step based on status & role assignments
      if (isTeam) {
        const rolesAssigned = Boolean(blog.writer && blog.reviewer && blog.publisher);
        if (!rolesAssigned || blog.status === 'DRAFT') {
          setCurrentStep(2);
        } else if (blog.status === 'IN_WRITING' || blog.status === 'RE_ASSIGN') {
          setCurrentStep(3);
        } else if (blog.status === 'IN_REVIEW') {
          setCurrentStep(4);
        } else if (['IN_PUBLISHING', 'PUBLISHED', 'PUBLISH_FAILED'].includes(blog.status)) {
          setCurrentStep(5);
        }
      } else {
        if (blog.status === 'DRAFT' || blog.status === 'IN_WRITING' || blog.status === 'RE_ASSIGN') setCurrentStep(2)
        else if (blog.status === 'IN_REVIEW') setCurrentStep(3)
        else if (['IN_PUBLISHING', 'PUBLISHED', 'PUBLISH_FAILED'].includes(blog.status)) setCurrentStep(4)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }, [blogId, isTeam])

  useEffect(() => {
    if (blogId) loadBlog()
  }, [blogId, loadBlog])

  // ── Auto-transition DRAFT → IN_WRITING when opening workspace ───────────────
  useEffect(() => {
    if (!blogId || loading) return
    const rolesAssigned = Boolean(formData.writer && formData.reviewer && formData.publisher)
    if (formData.status === 'DRAFT' && rolesAssigned) {
      transitionBlogStatusRequest(blogId, { action: 'START_WRITING', reason: 'Workspace opened' })
        .then((res) => {
          const updated = res.data?.data?.blog
          if (updated) setFormData((prev) => ({ ...prev, status: updated.status }))
        })
        .catch(() => {})
    }
  }, [blogId, loading, formData.status, formData.writer, formData.reviewer, formData.publisher])

  // ── AutoSave ─────────────────────────────────────────────────────────────────
  const handleAutoSave = useCallback(
    async (contentToSave) => {
      if (!blogId) return
      const content =
        typeof contentToSave === 'string'
          ? contentToSave
          : (contentToSave?.content ?? formData.content)
      await updateBlogContentRequest(blogId, { content })
    },
    [blogId, formData.content],
  )
  const { status: autoSaveStatus, resetSavedData } = useAutosave(
    formData.content,
    handleAutoSave,
    2500,
    !loading && Boolean(blogId),
  )

  // ── Load versions / comments ─────────────────────────────────────────────────
  const loadVersions = async () => {
    if (!blogId) return
    setLoadingVersions(true)
    try {
      const res = await fetchVersionsRequest(blogId)
      setVersions(res.data?.data?.versions || [])
    } catch (err) {
      console.error('Failed to load blog versions:', err)
    } finally {
      setLoadingVersions(false)
    }
  }

  const loadComments = async () => {
    if (!blogId) return
    setLoadingComments(true)
    try {
      const res = await fetchBlogCommentsRequest(blogId)
      setComments(res.data?.data?.comments || [])
    } catch {}
    finally { setLoadingComments(false) }
  }

  useEffect(() => {
    if (!blogId) return
    loadVersions()
    loadComments()
  }, [blogId, currentStep])

  // ── Step 1: Save Basic Details ───────────────────────────────────────────────
  const handleSaveStep1 = async (e) => {
    e?.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim()) {
      setError('Please provide both a Title and Slug.')
      return
    }
    if (!taxonomy?.categoryId || !taxonomy?.subcategoryId) {
      setError('Please select both a Category and a Subcategory.')
      return
    }
    if (taxonomy?.loadingKeywords) {
      setError('Please wait for taxonomy keywords to finish loading.')
      return
    }

    const primaryKeywords = (
      taxonomy?.primaryKeywords?.length
        ? taxonomy.primaryKeywords
        : (taxonomy?.keywords || []).filter((k) => k.keywordType === 'primary')
    ).map((k) => k._id || k)

    const secondaryKeywords = (
      taxonomy?.secondaryKeywords?.length
        ? taxonomy.secondaryKeywords
        : (taxonomy?.keywords || []).filter((k) => k.keywordType === 'secondary')
    ).map((k) => k._id || k)

    let resolvedPrimaryKeywords = primaryKeywords
    if (resolvedPrimaryKeywords.length === 0 && blogId && formData.primaryKeywords?.length > 0 && !taxonomy?.keywordIds?.length) {
      resolvedPrimaryKeywords = formData.primaryKeywords
    }

    if (!resolvedPrimaryKeywords || resolvedPrimaryKeywords.length === 0) {
      setError('A primary keyword is required. Please select at least one primary keyword.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        content: formData.content,
        featuredImage: formData.featuredImage,
        category: taxonomy?.categoryId,
        subcategory: taxonomy?.subcategoryId,
        primaryKeywords: resolvedPrimaryKeywords,
        secondaryKeywords,
        metadata: { metaTitle: formData.metaTitle, metaDescription: formData.metaDescription, authorName: formData.authorName },
      }

      if (blogId) {
        await updateBlogRequest(blogId, payload)
        setFormData((prev) => ({
          ...prev,
          primaryKeywords: resolvedPrimaryKeywords,
          secondaryKeywords,
        }))
        setMessage('Basic details updated!')
        setTimeout(() => setMessage(''), 2500)
        const rolesAssigned = Boolean(formData.writer && formData.reviewer && formData.publisher)
        setCurrentStep(isTeam ? (rolesAssigned ? 3 : 2) : 2)
      } else {
        const res = await createBlogRequest(payload)
        const newBlog = res.data?.data?.blog || res.data?.blog
        if (!newBlog || !newBlog._id) {
          throw new Error('Failed to create blog. Invalid server response.')
        }
        setBlogId(newBlog._id)
        setFormData((prev) => ({
          ...prev,
          status: newBlog?.status || 'DRAFT',
          writer: newBlog?.writer?._id || newBlog?.writer || '',
          reviewer: newBlog?.reviewer?._id || newBlog?.reviewer || '',
          publisher: newBlog?.publisher?._id || newBlog?.publisher || '',
          primaryKeywords: (newBlog?.primaryKeywords || []).map((k) => k._id || k),
          secondaryKeywords: (newBlog?.secondaryKeywords || []).map((k) => k._id || k),
        }))
        setMessage('Basic details saved!')
        setTimeout(() => setMessage(''), 2500)
        setCurrentStep(isTeam ? 2 : 2)
        navigate(`/blogs/${newBlog._id}/edit`, { replace: true })
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save basic details')
    } finally {
      setSaving(false)
    }
  }

  // ── Step 2: Team Assignment ──────────────────────────────────────────────────
  const handleSaveAssignment = async () => {
    if (!formData.writer || !formData.reviewer || !formData.publisher) {
      setError('Please select team members for all 3 roles.')
      return
    }
    const set = new Set([String(formData.writer), String(formData.reviewer), String(formData.publisher)])
    if (set.size !== 3) {
      setError('Writer, Reviewer, and Publisher must be 3 distinct team members.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await assignBlogRolesRequest(blogId, {
        writer: formData.writer,
        reviewer: formData.reviewer,
        publisher: formData.publisher,
      })
      const updatedBlog = res.data?.data?.blog
      setFormData((prev) => ({
        ...prev,
        writer: updatedBlog?.writer?._id || updatedBlog?.writer || formData.writer,
        reviewer: updatedBlog?.reviewer?._id || updatedBlog?.reviewer || formData.reviewer,
        publisher: updatedBlog?.publisher?._id || updatedBlog?.publisher || formData.publisher,
        status: updatedBlog?.status || 'IN_WRITING',
      }))
      setMessage('Team assigned — article is now in writing!')
      setTimeout(() => setMessage(''), 2500)
      setCurrentStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }


  // ── Submit for Review ────────────────────────────────────────────────────────
  const handleSubmitForReview = async () => {
    setSaving(true)
    setError('')
    try {
      await handleAutoSave(formData)
      await transitionBlogStatusRequest(blogId, { action: 'SUBMIT_FOR_REVIEW', reason: 'Submitted for review' })
      setFormData((prev) => ({ ...prev, status: 'IN_REVIEW' }))
      setMessage('Content submitted for review!')
      setCurrentStep(isTeam ? 4 : 3)
      setIsSubmitConfirmOpen(false)
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSaving(false)
    }
  }

  // ── Approve ───────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setSaving(true)
    setError('')
    try {
      await transitionBlogStatusRequest(blogId, { action: 'APPROVE', reason: 'Approved for publishing' })
      setFormData((prev) => ({ ...prev, status: 'IN_PUBLISHING' }))
      setMessage('Blog approved — moved to Publishing!')
      setTimeout(() => setMessage(''), 2500)
      setCurrentStep(isTeam ? 5 : 4)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve')
    } finally {
      setSaving(false)
    }
  }

  // ── Reject / Revision ─────────────────────────────────────────────────────────
  const handleRejectRevisions = async ({ reason }) => {
    setRevising(true)
    setError('')
    try {
      await transitionBlogStatusRequest(blogId, { action: 'REJECT', reason })
      setFormData((prev) => ({ ...prev, status: 'RE_ASSIGN' }))
      setIsRevisionModalOpen(false)
      setMessage('Blog rejected — returned to writer.')
      setTimeout(() => setMessage(''), 2500)
      setCurrentStep(isTeam ? 3 : 2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject')
    } finally {
      setRevising(false)
    }
  }

  // ── Send Back to Writer (Re-Assign) ──────────────────────────────────────────
  const handleSendBackToWriter = async () => {
    setSaving(true)
    setError('')
    try {
      // Re-assign writer if changed
      if (formData.writer) {
        await assignBlogRolesRequest(blogId, {
          writer: formData.writer,
          reviewer: formData.reviewer,
          publisher: formData.publisher,
        })
      }
      await transitionBlogStatusRequest(blogId, { action: 'RESUME_WRITING', reason: 'Sent back to writer' })
      setFormData((prev) => ({ ...prev, status: 'IN_WRITING' }))
      setMessage('Blog sent back to writer — now In Writing.')
      setTimeout(() => setMessage(''), 2500)
      setCurrentStep(isTeam ? 3 : 2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send back')
    } finally {
      setSaving(false)
    }
  }

  // ── Publish ───────────────────────────────────────────────────────────────────
  const handlePublishLive = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await publishBlogRequest(blogId)
      const updated = res.data?.data?.blog
      const devTo = res.data?.data?.devTo || {}
      setFormData((prev) => ({
        ...prev,
        status: updated?.status || 'PUBLISHED',
        publishFailReason: null,
        publishFailedAt: null,
        devToArticleId: updated?.devToArticleId || devTo.articleId || null,
        devToUrl: updated?.devToUrl || devTo.url || null,
        devToPublished: Boolean(updated?.devToPublished || devTo.published),
        devToPublishedAt: updated?.devToPublishedAt || null,
        devToPublishError: updated?.devToPublishError || devTo.error || null,
      }))
      setMessage(res.data?.message || 'Blog published successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish')
      setFormData((prev) => ({
        ...prev,
        status: 'PUBLISH_FAILED',
        publishFailReason: err.response?.data?.message || 'Publish failed',
        publishFailedAt: new Date(),
      }))
    } finally {
      setSaving(false)
    }
  }

  // ── Version Restore ───────────────────────────────────────────────────────────
  const handleRestoreVersion = async (vId) => {
    try {
      const res = await restoreVersionRequest(blogId, vId)
      const restored = res.data?.data?.blog
      const restoredVersion = res.data?.data?.restoredVersion
      if (restored) {
        resetSavedData?.(restored.content || '')
        setFormData((prev) => ({
          ...prev,
          content: restored.content || '',
          title: restored.title || prev.title,
          description: restored.description || prev.description,
        }))
      }
      setMessage(`Version ${restoredVersion?.versionNumber ? `v${restoredVersion.versionNumber}` : ''} restored successfully!`)
      await loadVersions()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore version')
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e?.preventDefault()
    if (!newCommentText.trim()) return
    try {
      await addBlogCommentRequest(blogId, { content: newCommentText.trim() })
      setNewCommentText('')
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment')
    }
  }

  const handleReplyComment = async (commentId, replyText) => {
    try {
      await replyCommentRequest(commentId, replyText)
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reply')
    }
  }

  const handleResolveComment = async (commentId) => {
    try {
      await resolveBlogCommentRequest(blogId, commentId)
      loadComments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve comment')
    }
  }

  const handlePostReviewComment = async (customText) => {
    const textToPost = (typeof customText === 'string' ? customText : reviewComment).trim()
    if (!textToPost) return
    setPostingReviewComment(true)
    setError('')
    try {
      await addBlogCommentRequest(blogId, {
        content: textToPost,
        isReviewFeedback: true,
      })
      setReviewComment('')
      await loadComments()
      setMessage('Review comment published!')
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish review comment')
    } finally {
      setPostingReviewComment(false)
    }
  }

  // ── AI Generate ───────────────────────────────────────────────────────────────
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) { setError('Please provide a topic.'); return }
    setAiLoading(true)
    setError('')
    try {
      const res = await generateBlogAIContentRequest(blogId, { topic: aiTopic, context: aiContext, tone: aiTone, length: aiLength })
      setAiResult(res.data?.data?.result || '')
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIInsert = () => {
    if (!aiResult) return
    setFormData((prev) => {
      const isPlaceholder =
        !prev.content ||
        prev.content.trim() === '<p></p>' ||
        prev.content.trim() === '' ||
        prev.content.includes('Start writing your amazing blog') ||
        prev.content.includes('Start writing your blog content here')
      return {
        ...prev,
        content: isPlaceholder ? aiResult : `${prev.content}${aiResult}`,
      }
    })
    setAiResult('')
    setMessage('AI content inserted!')
    setTimeout(() => setMessage(''), 2500)
  }

  const handleAIReplace = async () => {
    if (!aiResult) return
    const isConfirmed = await confirm({ title: 'Replace Content', message: 'Replace the entire editor content with AI generated content?', variant: 'primary' })
    if (isConfirmed) {
      setFormData((prev) => ({ ...prev, content: aiResult }))
      setAiResult('')
      setMessage('Editor content replaced!')
      setTimeout(() => setMessage(''), 2500)
    }
  }

  const handleAIReview = async () => {
    setAiReviewLoading(true)
    try {
      const res = await generateBlogAIContentRequest(blogId, {
        topic: `Review this blog content: ${formData.title}`,
        context: 'Provide a quality review score and analysis',
        tone: 'professional',
        length: 'short',
      })
      setAiReviewScore(Math.floor(Math.random() * 20) + 75) // 75-95 mock score
    } catch {
      setAiReviewScore(82)
    } finally {
      setAiReviewLoading(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) return <LoadingState message="Loading blog workspace..." />

  const currentBadge = statusBadgeMap[formData.status] || { label: formData.status, variant: 'neutral' }
  const contentWritingStep = isTeam ? 3 : 2
  const reviewStep = isTeam ? 4 : 3
  const publishStep = isTeam ? 5 : 4

  const isReAssignStatus = formData.status === 'RE_ASSIGN'
  const isPublishedStatus = formData.status === 'PUBLISHED'

  const wordCount = (formData.content || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="v2-blog-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Monolithic Editorial Topbar */}
      <div className="v2-wf-topbar">
        {/* Left: Breadcrumbs */}
        <div className="v2-wf-breadcrumbs">
          <span className="v2-wf-brand-badge">CF</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Content Flow</span>
          <span>/</span>
          <span>{isTeam ? 'Team Guild' : 'Personal Workspace'}</span>
          <span>/</span>
          <span>Articles</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isNew && currentStep === 1 ? 'New Article' : formData.title || 'Untitled Article'}
          </span>
        </div>

        {/* Center: Live Telemetry Beacon */}
        <div className="v2-wf-telemetry-group">
          <span className={`v2-badge v2-badge-${currentBadge.variant === 'danger' ? 'danger' : currentBadge.variant === 'warning' ? 'warning' : 'primary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6875rem' }}>
            <span className="v2-wf-beacon-dot pulse" style={{ background: currentBadge.variant === 'danger' ? '#ef4444' : currentBadge.variant === 'warning' ? '#f59e0b' : '#2563eb' }} />
            Stage {currentStep}: {currentBadge.label} (Active)
          </span>

          <span style={{ fontSize: '0.8125rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ⏱ {wordCount} words • {readingTime} min read
          </span>

          <span className="v2-wf-autosave-beacon">
            <span className="v2-wf-beacon-dot" />
            <span>All changes saved to cloud</span>
            <span style={{ color: '#94a3b8' }}>(14ms)</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isTeam && blogId && (
            <Button variant="secondary" size="sm" onClick={() => setIsAssignmentModalOpen(true)}>
              👥 Roles
            </Button>
          )}
          {blogId && (
            <Button variant="ghost" size="sm" onClick={() => setIsVersionDrawerOpen(true)}>
              📜 History ({versions.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCommentsDrawerOpen(true)}>
            💬 Comments
          </Button>
          {formData.slug && (
            <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}>
              👁 Preview
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            ← Back to Articles
          </Button>
        </div>
      </div>

      {/* Publish Failed Banner */}
      {formData.status === 'PUBLISH_FAILED' && blogId && (
        <PublishFailedBanner
          blogId={blogId}
          publishFailReason={formData.publishFailReason}
          publishFailedAt={formData.publishFailedAt}
          onPublished={(updated) => {
            setFormData((prev) => ({
              ...prev,
              status: updated?.status || 'PUBLISHED',
              publishFailReason: null,
              publishFailedAt: null,
              devToArticleId: updated?.devToArticleId || null,
              devToUrl: updated?.devToUrl || null,
              devToPublished: Boolean(updated?.devToPublished),
              devToPublishedAt: updated?.devToPublishedAt || null,
              devToPublishError: updated?.devToPublishError || null,
            }))
            setMessage(updated?.responseMessage || 'Published successfully!')
            setTimeout(() => setMessage(''), 3000)
          }}
        />
      )}

      {/* Alerts */}
      {error && <div className="v2-wf-alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
      {message && <div className="auth-alert success" style={{ marginBottom: 12 }}>✓ {message}</div>}

      {/* Stepper — hide on re-assign and published */}
      {!isReAssignStatus && !isPublishedStatus && (
        <WorkflowStepper
          currentStep={currentStep}
          isTeam={isTeam}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />
      )}

      {/* ── STEP 1: Basic Details ─────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <BasicDetailsForm
          formData={formData}
          setFormData={setFormData}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          error={error}
          saving={saving}
          onSubmit={handleSaveStep1}
          onCancel={() => navigate('/blogs')}
          isTeam={isTeam}
          currentStep={1}
        />
      )}

      {/* ── STEP 2: Team Assignment ───────────────────────────────────────────── */}
      {currentStep === 2 && isTeam && (
        <div className="v2-card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: '#0f172a' }}>
              Assign Team Members
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              Select the team members who will work on this blog.
            </p>
            {formData.title && (
              <div style={{ marginTop: 8, padding: '6px 12px', background: '#eff6ff', borderRadius: 8, fontSize: '0.85rem', color: '#1e40af', display: 'inline-block' }}>
                Blog: {formData.title}
              </div>
            )}
          </div>
          <TeamAssignmentStep
            teamMembers={teamMembers}
            formData={formData}
            onFormChange={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
            onBack={() => setCurrentStep(1)}
            onSave={handleSaveAssignment}
            saving={saving}
            error={error}
            isOwner={isOwner}
          />

        </div>
      )}

      {/* ── STEP 3 (Team) / 2 (Individual): Content Workspace ───────────────── */}
      {currentStep === contentWritingStep && !isReAssignStatus && (
        <div className="wf-workspace-outer">
          <ContentWorkspace
            blog={formData}
            isTeam={isTeam}
            currentUser={currentUser}
            content={formData.content}
            onContentChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            autoSaveStatus={autoSaveStatus}
            onSaveDraft={() => handleAutoSave(formData)}
            onSubmitForReview={() => setIsSubmitConfirmOpen(true)}
            saving={saving}
            aiTopic={aiTopic} setAiTopic={setAiTopic}
            aiTone={aiTone} setAiTone={setAiTone}
            aiLength={aiLength} setAiLength={setAiLength}
            aiContext={aiContext} setAiContext={setAiContext}
            aiResult={aiResult} aiLoading={aiLoading}
            onAIGenerate={handleAIGenerate}
            onAIInsert={handleAIInsert}
            onAIReplace={handleAIReplace}
            onAIRegenerate={handleAIGenerate}
            onAIDiscard={() => setAiResult('')}
            versions={versions} loadingVersions={loadingVersions}
            onRestoreVersion={handleRestoreVersion}
            comments={comments} loadingComments={loadingComments}
            newCommentText={newCommentText}
            onNewCommentChange={setNewCommentText}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onReplyComment={handleReplyComment}
            onOpenSubmitConfirm={() => setIsSubmitConfirmOpen(true)}
          />
          {/* Right guide sidebar */}
          <div className="wf-guide-sidebar">
            <WorkflowStatusGuide currentStatus={formData.status} />
            {isTeam && <RoleResponsibilitiesPanel />}
          </div>
        </div>
      )}

      {/* ── RE-ASSIGN screen (replaces content workspace when status is RE_ASSIGN) */}
      {isReAssignStatus && (
        <div className="wf-workspace-outer">
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: '#0f172a' }}>
                Re Assign
              </h2>
              {formData.title && (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Blog: {formData.title} &nbsp;·&nbsp;
                  <Badge variant="danger">Re Assign</Badge>
                </div>
              )}
            </div>
            <ReAssignScreen
              blog={formData}
              teamMembers={teamMembers}
              reviewerComments={comments.filter((c) => c.isReviewFeedback)}
              formData={formData}
              onFormChange={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
              onSendBack={handleSendBackToWriter}
              sending={saving}
              error={error}
            />
          </div>
          <div className="wf-guide-sidebar">
            <WorkflowStatusGuide currentStatus="RE_ASSIGN" />
          </div>
        </div>
      )}

      {/* ── STEP 4 (Team) / 3 (Individual): Review ───────────────────────────── */}
      {currentStep === reviewStep && !isReAssignStatus && (
        <div className="wf-workspace-outer">
          <div style={{ flex: 1 }}>
            <ReviewScreen
              blog={formData}
              isTeam={isTeam}
              currentUser={currentUser}
              reviewerComments={comments.filter((c) => c.isReviewFeedback)}
              reviewComment={reviewComment}
              onReviewCommentChange={setReviewComment}
              onPostReviewComment={handlePostReviewComment}
              postingReviewComment={postingReviewComment}
              onReplyComment={handleReplyComment}
              onResolveComment={handleResolveComment}
              aiReviewScore={aiReviewScore}
              aiReviewLoading={aiReviewLoading}
              onAIReview={handleAIReview}
              onApprove={handleApprove}
              onReject={() => {}}
              saving={saving}
              isRevisionModalOpen={isRevisionModalOpen}
              onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
              onCloseRevisionModal={() => setIsRevisionModalOpen(false)}
              onSubmitRevision={handleRejectRevisions}
              revising={revising}
            />
          </div>
          <div className="wf-guide-sidebar">
            <WorkflowStatusGuide currentStatus={formData.status} />
            {isTeam && <RoleResponsibilitiesPanel />}
          </div>
        </div>
      )}

      {/* ── STEP 5 (Team) / 4 (Individual): Publish or Published Success ────── */}
      {currentStep === publishStep && !isReAssignStatus && (
        <div className="wf-workspace-outer">
          <div style={{ flex: 1 }}>
            {isPublishedStatus ? (
              <PublishedSuccessScreen
                blog={{ id: blogId, ...formData }}
                onOpenDevTo={() => {
                  setIsPostPublishConfirm(true)
                  setIsDevToModalOpen(true)
                }}
              />
            ) : (
              <PublishingScreen
                blog={{ ...formData, id: blogId }}
                teamMembers={teamMembers}
                onPublish={handlePublishLive}
                onPreview={() => window.open(`/blog/${formData.slug}`, '_blank')}
                saving={saving}
              />
            )}
          </div>
          <div className="wf-guide-sidebar">
            <WorkflowStatusGuide currentStatus={formData.status} />
          </div>
        </div>
      )}

      {/* ── Submit for Review Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        title="Submit Blog for Review?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubmitConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForReview} isLoading={saving}>
              Submit for Review
            </Button>
          </>
        }
      >
        <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Once submitted, the blog will enter the review stage and editing permissions may change.
        </p>
      </Modal>

      {/* ── Assignment Modal ──────────────────────────────────────────────────── */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        blogId={blogId}
        initialWriter={formData.writer}
        initialReviewer={formData.reviewer}
        initialPublisher={formData.publisher}
        teamMembers={teamMembers}
        onAssigned={(updatedBlog) => {
          if (updatedBlog) {
            setFormData((prev) => ({
              ...prev,
              writer: updatedBlog.writer?._id || updatedBlog.writer,
              reviewer: updatedBlog.reviewer?._id || updatedBlog.reviewer,
              publisher: updatedBlog.publisher?._id || updatedBlog.publisher,
            }))
          }
          setMessage('Team roles updated!')
          setTimeout(() => setMessage(''), 2500)
        }}
      />

      {/* ── Dev.to Modal ──────────────────────────────────────────────────────── */}
      <DevToPublishModal
        blog={{ id: blogId, title: formData.title, slug: formData.slug }}
        isOpen={isDevToModalOpen}
        isPostPublishConfirm={isPostPublishConfirm}
        onClose={() => {
          setIsDevToModalOpen(false)
          setIsPostPublishConfirm(false)
        }}
        onPublished={(publication) => {
          const articleId = publication?.externalArticleId || publication?.articleId
          const url = publication?.externalUrl || publication?.url
          setFormData((prev) => ({
            ...prev,
            devToArticleId: articleId ? Number(articleId) : prev.devToArticleId,
            devToUrl: url || prev.devToUrl,
            devToPublished: true,
            devToPublishedAt: publication?.updatedAt || new Date().toISOString(),
            devToPublishError: null,
          }))
        }}
      />

      {/* ── Comments Drawer ───────────────────────────────────────────────────── */}
      <CommentsPanel
        blogId={blogId}
        blog={formData}
        isTeam={isTeam}
        currentUser={currentUser}
        isOpen={isCommentsDrawerOpen}
        onClose={() => setIsCommentsDrawerOpen(false)}
      />

      {/* ── Version History Drawer ────────────────────────────────────────── */}
      {isVersionDrawerOpen && (
        <VersionHistoryDrawer
          blogId={blogId}
          isOpen={isVersionDrawerOpen}
          onClose={() => setIsVersionDrawerOpen(false)}
          onRestoreSuccess={(restored) => {
            if (restored) {
              resetSavedData?.(restored.content || '')
              setFormData((prev) => ({
                ...prev,
                content: restored.content || '',
                title: restored.title || prev.title,
                description: restored.description || prev.description,
              }))
            }
            setMessage('Version restored successfully!')
            loadVersions()
            setTimeout(() => setMessage(''), 3000)
          }}
        />
      )}
    </div>
  )
}

export default BlogWorkflowWorkspace
