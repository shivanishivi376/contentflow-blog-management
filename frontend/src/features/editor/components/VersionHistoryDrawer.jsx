import React, { useEffect, useState } from 'react'
import { fetchVersionsRequest, restoreVersionRequest } from '../../../services/api/versionApi.js'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import { Button } from '../../../components/ui/CustomerComponents.jsx'

const VersionHistoryDrawer = ({ blogId, isOpen, onClose, onRestoreSuccess }) => {
  const { confirm } = useConfirm()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState('')
  const [selectedVersion, setSelectedVersion] = useState(null)

  const loadVersions = async () => {
    if (!blogId || !isOpen) return
    setLoading(true)
    setError('')

    try {
      const response = await fetchVersionsRequest(blogId)
      const list = response.data?.data?.versions || []
      setVersions(list)
      if (list.length > 0) {
        setSelectedVersion(list[0])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load version history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [blogId, isOpen])

  const handleRestore = async (versionId) => {
    const isConfirmed = await confirm({
      title: 'Restore Version',
      message: 'Restore this version snapshot? A new version snapshot will be created.',
      variant: 'primary',
    })
    if (!isConfirmed) return

    setRestoring(true)
    setError('')

    try {
      const response = await restoreVersionRequest(blogId, versionId)
      const restoredBlog = response.data?.data?.blog
      onRestoreSuccess?.(restoredBlog)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore version snapshot')
    } finally {
      setRestoring(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 500,
        maxWidth: '92vw',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 30px rgba(15, 23, 42, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>📜</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Version History</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Browse & restore snapshots</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
            color: '#94a3b8',
            lineHeight: 1,
            padding: 4,
          }}
        >
          &times;
        </button>
      </div>

      {error && (
        <div style={{ margin: '12px 20px', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.86rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div className="v2-spinner-lg" />
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Loading history snapshots...</p>
        </div>
      ) : versions.length > 0 ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Version Selector list */}
          <div
            style={{
              width: 170,
              borderRight: '1px solid #e2e8f0',
              overflowY: 'auto',
              padding: '12px 10px',
              backgroundColor: '#f8fafc',
            }}
          >
            {versions.map((ver) => {
              const isSelected = selectedVersion?._id === ver._id
              return (
                <button
                  key={ver._id}
                  type="button"
                  onClick={() => setSelectedVersion(ver)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    borderRadius: 8,
                    border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    marginBottom: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                    Version {ver.versionNumber}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isSelected ? '#2563eb' : '#64748b', marginTop: 4, wordBreak: 'break-word', fontWeight: 500 }}>
                    {ver.changeSummary || 'Snapshot'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Version details & preview */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {selectedVersion ? (
              <>
                <div style={{ marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedVersion.title || 'Untitled'}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    By {selectedVersion.createdBy?.name || selectedVersion.createdBy?.username || 'User'} on{' '}
                    {new Date(selectedVersion.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: '#334155',
                    backgroundColor: '#f8fafc',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    overflowY: 'auto',
                    marginBottom: 16,
                    fontFamily: 'Lora, serif',
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<p><em>Empty content</em></p>' }}
                />

                <Button
                  type="button"
                  onClick={() => handleRestore(selectedVersion._id)}
                  isLoading={restoring}
                  style={{ width: '100%' }}
                >
                  Restore Version {selectedVersion.versionNumber}
                </Button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', fontSize: '0.88rem' }}>
                Select a version to preview.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
          No version snapshots recorded yet.
        </div>
      )}
    </div>
  )
}

export default VersionHistoryDrawer
