import React, { useMemo, useState } from 'react'
import { Badge, Button, Modal } from '../../../components/ui/CustomerComponents.jsx'

const ITEMS_PER_PAGE = 15

const VersionHistoryTab = ({ versions = [], loading = false, onRestore, onGoToEditor }) => {
  const [confirmVersionId, setConfirmVersionId] = useState(null)
  const [selectedId, setSelectedId] = useState(versions[0]?._id || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'milestones' | 'autosaves'
  const [page, setPage] = useState(1)
  const [restoring, setRestoring] = useState(false)
  const [restoredBanner, setRestoredBanner] = useState('')

  // Determine current active preview version
  const selectedVersion = useMemo(() => {
    if (!versions.length) return null
    return versions.find((v) => v._id === selectedId) || versions[0]
  }, [versions, selectedId])

  const confirmVersion = versions.find((v) => v._id === confirmVersionId)

  // Filter versions
  const filteredVersions = useMemo(() => {
    return versions.filter((v) => {
      const summary = (v.changeSummary || '').toLowerCase()
      const title = (v.title || '').toLowerCase()
      const author = (v.createdBy?.name || '').toLowerCase()
      const vNum = `v${v.versionNumber}`

      const matchesSearch =
        !searchTerm.trim() ||
        summary.includes(searchTerm.toLowerCase()) ||
        title.includes(searchTerm.toLowerCase()) ||
        author.includes(searchTerm.toLowerCase()) ||
        vNum.includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (filterType === 'autosaves') {
        return summary.includes('autosave')
      }
      if (filterType === 'milestones') {
        return !summary.includes('autosave')
      }

      return true
    })
  }, [versions, searchTerm, filterType])

  // Paginated versions
  const paginatedVersions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredVersions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredVersions, page])

  const totalPages = Math.ceil(filteredVersions.length / ITEMS_PER_PAGE) || 1

  const handleRestoreConfirm = async () => {
    if (!confirmVersionId) return
    setRestoring(true)
    try {
      await onRestore?.(confirmVersionId)
      setRestoredBanner(`Version ${confirmVersion?.versionNumber} restored successfully!`)
      setConfirmVersionId(null)
      setTimeout(() => setRestoredBanner(''), 4000)
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="wf-tab-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="v2-spinner-lg" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b' }}>Loading version history...</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="wf-tab-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📜</div>
        <h4 style={{ margin: '0 0 6px', color: '#0f172a' }}>No Version Snapshots Recorded Yet</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
          Versions are created automatically as you write and save drafts or milestones.
        </p>
      </div>
    )
  }

  const selectedWordCount = (selectedVersion?.content || '')
    .replace(/<[^>]+>/g, '')
    .split(/\s+/)
    .filter(Boolean).length

  return (
    <div className="wf-version-history-container">
      {/* Restored notification banner */}
      {restoredBanner && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>✓ {restoredBanner}</span>
          {onGoToEditor && (
            <Button size="sm" variant="outline" onClick={onGoToEditor}>
              Switch to Editor →
            </Button>
          )}
        </div>
      )}

      {/* Main 2-column grid */}
      <div className="wf-version-history-grid">
        {/* Left column: Timeline & Filters */}
        <div className="wf-version-timeline-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Version Timeline
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {versions.length} Total
            </span>
          </div>

          {/* Search box & filter pills */}
          <div className="wf-version-search-box">
            <div className="v2-input-wrapper">
              <input
                type="text"
                className="v2-input"
                placeholder="Search versions, authors, tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
            <div className="wf-version-filter-pills">
              <button
                type="button"
                className={`wf-version-filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => { setFilterType('all'); setPage(1); }}
              >
                All ({versions.length})
              </button>
              <button
                type="button"
                className={`wf-version-filter-btn ${filterType === 'milestones' ? 'active' : ''}`}
                onClick={() => { setFilterType('milestones'); setPage(1); }}
              >
                Milestones
              </button>
              <button
                type="button"
                className={`wf-version-filter-btn ${filterType === 'autosaves' ? 'active' : ''}`}
                onClick={() => { setFilterType('autosaves'); setPage(1); }}
              >
                Autosaves
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="wf-version-cards-scroll">
            {paginatedVersions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                No versions match your search or filter.
              </p>
            ) : (
              paginatedVersions.map((v, idx) => {
                const isCurrent = v.versionNumber === versions[0]?.versionNumber
                const isSelected = selectedVersion?._id === v._id

                return (
                  <div
                    key={v._id}
                    className={`wf-version-item ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedId(v._id)}
                  >
                    <div className="wf-version-meta" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="wf-version-label" style={{ fontSize: '0.88rem' }}>
                          v{v.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="wf-version-badge current" style={{ fontSize: '0.7rem' }}>
                            Current
                          </span>
                        )}
                        {isSelected && (
                          <span
                            style={{
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Previewing
                          </span>
                        )}
                      </div>

                      <div className="wf-version-summary-tag" title={v.changeSummary || 'Snapshot'}>
                        {v.changeSummary || 'Snapshot'}
                      </div>

                      <div className="wf-version-author" style={{ fontSize: '0.78rem', marginTop: 3 }}>
                        By {v.createdBy?.name || v.createdBy?.username || 'Author'}
                      </div>
                      <div className="wf-version-time" style={{ fontSize: '0.74rem' }}>
                        {new Date(v.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="wf-version-actions" style={{ marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmVersionId(v._id)}
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </Button>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </Button>
            </div>
          )}
        </div>

        {/* Right column: Version Content Preview */}
        <div className="wf-version-preview-pane">
          {selectedVersion ? (
            <>
              {/* Preview Header */}
              <div className="wf-version-preview-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      Version {selectedVersion.versionNumber}
                    </span>
                    {selectedVersion.versionNumber === versions[0]?.versionNumber ? (
                      <Badge variant="success">Current Active Version</Badge>
                    ) : (
                      <Badge variant="info">Historical Snapshot</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 3 }}>
                    Saved on {new Date(selectedVersion.createdAt).toLocaleString()} by{' '}
                    <strong>{selectedVersion.createdBy?.name || selectedVersion.createdBy?.username || 'Author'}</strong>
                    {' · '}
                    <span>{selectedWordCount} words</span>
                  </div>
                  {selectedVersion.changeSummary && (
                    <div style={{ marginTop: 4 }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          background: '#e2e8f0',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        📌 {selectedVersion.changeSummary}
                      </span>
                    </div>
                  )}
                </div>

                {/* Restore CTA */}
                {selectedVersion.versionNumber !== versions[0]?.versionNumber && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirmVersionId(selectedVersion._id)}
                  >
                    ↺ Restore this Version
                  </Button>
                )}
              </div>

              {/* Preview Body */}
              <div className="wf-version-preview-body">
                {selectedVersion.title && (
                  <h2
                    style={{
                      margin: '0 0 14px 0',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '8px',
                    }}
                  >
                    {selectedVersion.title}
                  </h2>
                )}

                {selectedVersion.description && (
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      marginBottom: '16px',
                    }}
                  >
                    {selectedVersion.description}
                  </p>
                )}

                {selectedVersion.content ? (
                  <div
                    className="wf-version-preview-html"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <p>No content captured in this version snapshot.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p>Select a version from the timeline on the left to preview its content.</p>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmVersionId)}
        onClose={() => setConfirmVersionId(null)}
        title={`Restore Version ${confirmVersion?.versionNumber}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmVersionId(null)} disabled={restoring}>
              Cancel
            </Button>
            <Button onClick={handleRestoreConfirm} isLoading={restoring}>
              Yes, Restore Version {confirmVersion?.versionNumber}
            </Button>
          </>
        }
      >
        <div style={{ color: '#475569', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 10px' }}>
            Restoring will replace the current editor content with the contents of{' '}
            <strong>Version {confirmVersion?.versionNumber}</strong>.
          </p>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}
          >
            <div><strong>Snapshot Note:</strong> {confirmVersion?.changeSummary || 'Snapshot'}</div>
            <div><strong>Created:</strong> {confirmVersion ? new Date(confirmVersion.createdAt).toLocaleString() : ''}</div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Don't worry—a new version snapshot will be saved so your current progress is never lost.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default VersionHistoryTab
