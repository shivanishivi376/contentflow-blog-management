import React, { useState } from 'react'
import { Badge, Button } from '../../../components/ui/CustomerComponents.jsx'
import { useTeamPermissions } from '../../../hooks/useTeamPermissions.js'
import { TEAM_PERMISSIONS } from '../../../constants/permissions.js'
import EditorTab from './EditorTab.jsx'
import AIWriterTab from './AIWriterTab.jsx'
import VersionHistoryTab from './VersionHistoryTab.jsx'
import CommentsTab from './CommentsTab.jsx'

const ContentWorkspace = ({
  blog = {},
  isTeam = false,
  currentUser = null,
  // Editor
  content,
  onContentChange,
  autoSaveStatus,
  onSaveDraft,
  onSubmitForReview,
  saving,
  // AI Writer
  aiTopic, setAiTopic,
  aiTone, setAiTone,
  aiLength, setAiLength,
  aiContext, setAiContext,
  aiResult, aiLoading,
  onAIGenerate,
  onAIInsert,
  onAIReplace,
  onAIRegenerate,
  onAIDiscard,
  // Versions
  versions, loadingVersions,
  onRestoreVersion,
  // Comments
  comments, loadingComments,
  newCommentText,
  onNewCommentChange,
  onAddComment,
  onResolveComment,
  onReplyComment,
  // Submit confirm modal
  onOpenSubmitConfirm,
}) => {
  const { hasPermission, isTeam: isTeamUser, workflowRole } = useTeamPermissions()
  const isTeamWorkspace = isTeam || isTeamUser || blog.accountType === 'TEAM'
  const isAssignedReviewer = Boolean(
    currentUser && blog?.reviewer && (
      String(blog.reviewer?._id || blog.reviewer) === String(currentUser.id || currentUser._id)
    )
  )
  const canWrite = !isTeamWorkspace || hasPermission(TEAM_PERMISSIONS.BLOG_WRITE)
  const canSubmit = !isTeamWorkspace || hasPermission(TEAM_PERMISSIONS.BLOG_SUBMIT_REVIEW)
  const canAIWrite = !isTeamWorkspace || hasPermission(TEAM_PERMISSIONS.BLOG_AI_WRITE)

  const tabs = ['Editor', ...(canAIWrite ? ['AI Writer'] : []), 'Version History', 'Comments']
  const [activeTab, setActiveTab] = useState('Editor')

  const wordCount = (content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const charCount = (content || '').replace(/<[^>]+>/g, '').length

  return (
    <div className="wf-content-workspace">
      {/* Workspace header */}
      <div className="wf-workspace-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            Blog: {blog.title || 'Untitled'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge variant="info">In Writing</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {canWrite && (
            <Button variant="outline" size="sm" onClick={onSaveDraft} isLoading={saving}>
              Save Draft
            </Button>
          )}
          {canSubmit ? (
            <Button
              size="sm"
              onClick={onOpenSubmitConfirm}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              Submit for Review
            </Button>
          ) : (
            <Button
              size="sm"
              disabled
              style={{ background: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' }}
            >
              🔒 Writer Only
            </Button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="wf-content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`wf-content-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Comments' && comments?.length > 0 && (
              <span className="wf-tab-badge">{comments.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="wf-tab-content">
        {activeTab === 'Editor' && (
          <EditorTab
            content={content}
            onChange={onContentChange}
            wordCount={wordCount}
            charCount={charCount}
            autoSaveStatus={autoSaveStatus}
            editable={canWrite}
          />
        )}

        {activeTab === 'AI Writer' && (
          <AIWriterTab
            blogId={blog._id || blog.id}
            blogTitle={blog.title || ''}
            aiTopic={aiTopic}
            setAiTopic={setAiTopic}
            aiTone={aiTone}
            setAiTone={setAiTone}
            aiLength={aiLength}
            setAiLength={setAiLength}
            aiContext={aiContext}
            setAiContext={setAiContext}
            aiResult={aiResult}
            aiLoading={aiLoading}
            onGenerate={onAIGenerate}
            onInsert={onAIInsert}
            onReplace={onAIReplace}
            onRegenerate={onAIRegenerate}
            onDiscard={onAIDiscard}
          />
        )}

        {activeTab === 'Version History' && (
          <div style={{ padding: 20 }}>
            <VersionHistoryTab
              versions={versions}
              loading={loadingVersions}
              onRestore={async (vId) => {
                await onRestoreVersion?.(vId)
                setActiveTab('Editor')
              }}
              onGoToEditor={() => setActiveTab('Editor')}
            />
          </div>
        )}

        {activeTab === 'Comments' && (
          <div style={{ padding: 20 }}>
            <CommentsTab
              blog={blog}
              isTeam={isTeamWorkspace}
              isReviewer={!isTeamWorkspace || isAssignedReviewer || workflowRole?.toLowerCase() === 'reviewer' || currentUser?.role === 'Reviewer' || currentUser?.role === 'ADMIN'}
              comments={comments}
              loading={loadingComments}
              currentUser={currentUser}
              newCommentText={newCommentText}
              onNewCommentChange={onNewCommentChange}
              onAddComment={onAddComment}
              onResolve={onResolveComment}
              onReply={onReplyComment}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentWorkspace
