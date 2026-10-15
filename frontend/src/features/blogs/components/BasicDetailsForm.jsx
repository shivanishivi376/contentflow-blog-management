import { useState } from 'react'
import CategorySelector from './CategorySelector.jsx'
import { uploadMediaRequest } from '../../../services/api/mediaApi.js'
import { Button, Input, Textarea } from '../../../components/ui/CustomerComponents.jsx'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinkIcon from '@mui/icons-material/Link'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

const CHAR_LIMIT_TITLE = 120
const CHAR_LIMIT_DESC = 300

const BasicDetailsForm = ({
  formData,
  setFormData,
  taxonomy,
  setTaxonomy,
  error,
  saving,
  onSubmit,
  onCancel,
  isTeam = false,
  currentStep = 1,
  totalSteps = 4,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleTitleChange = (e) => {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === slug.slice(0, prev.slug.length) ? slug : prev.slug,
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setUploadError('')
    try {
      const response = await uploadMediaRequest(file)
      const imageUrl = response.data?.data?.media?.url
      if (imageUrl) setFormData((prev) => ({ ...prev, featuredImage: imageUrl }))
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload cover image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="v2-wf-form-layout">
      {/* ── Left Column: Form Controls (7 Cols) ────────────────────────────── */}
      <div className="v2-wf-form-main">
        {error && (
          <div className="v2-wf-alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Section 1: Title & Slug */}
        <div className="v2-wf-section-card">
          <div className="v2-wf-section-header">
            <span className="v2-wf-section-tag">Stage 1.1</span>
            <h3 className="v2-wf-section-title">Headline & URL Permalinks</h3>
          </div>

          <div className="v2-field-group">
            <Input
              label="Article Headline / Title"
              placeholder="e.g. Designing High-Throughput Distributed Event Pipelines at Scale"
              value={formData.title || ''}
              onChange={handleTitleChange}
              maxLength={CHAR_LIMIT_TITLE}
              showCharCount
              required
            />
          </div>

          <div className="v2-field-group" style={{ marginTop: 14 }}>
            <label className="v2-label">
              Canonical Slug Permalinks <span className="v2-required-star">*</span>
            </label>
            <div className="v2-slug-input-wrapper">
              <span className="v2-slug-prefix">contentflow.io/blog/</span>
              <input
                type="text"
                className="v2-slug-input"
                placeholder="designing-distributed-pipelines"
                value={formData.slug || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                required
              />
              {formData.slug && (
                <span className="v2-slug-valid-badge">
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                </span>
              )}
            </div>
            <span className="v2-field-message is-helper">
              Auto-generated from title. Strictly lowercase alphanumeric with hyphens.
            </span>
          </div>
        </div>

        {/* Section 2: Editorial Abstract / Description */}
        <div className="v2-wf-section-card">
          <div className="v2-wf-section-header">
            <span className="v2-wf-section-tag">Stage 1.2</span>
            <h3 className="v2-wf-section-title">Editorial Summary & Abstract</h3>
          </div>

          <Textarea
            label="Abstract / Excerpt"
            placeholder="Provide a concise 2–3 sentence synopsis for reader previews and search indexing..."
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            maxLength={CHAR_LIMIT_DESC}
            showCharCount
            rows={3}
            required
          />
        </div>

        {/* Section 3: Taxonomy & Classification */}
        <div className="v2-wf-section-card">
          <div className="v2-wf-section-header">
            <span className="v2-wf-section-tag">Stage 1.3</span>
            <h3 className="v2-wf-section-title">
              Taxonomy &amp; Topic Mapping <span className="v2-required-star" style={{ color: '#ef4444' }}>*</span>
            </h3>
          </div>
          <span className="v2-field-message is-helper" style={{ marginBottom: 14, display: 'block' }}>
            Category, Subcategory, and at least one Primary Keyword are required.
          </span>

          <CategorySelector
            onSelectionChange={setTaxonomy}
            initialCategoryId={taxonomy?.categoryId || formData.category}
            initialSubcategoryId={taxonomy?.subcategoryId || formData.subcategory}
            initialKeywordIds={taxonomy?.keywordIds || formData.primaryKeywords}
          />
        </div>

        {/* Section 4: Featured Cover Media */}
        <div className="v2-wf-section-card">
          <div className="v2-wf-section-header">
            <span className="v2-wf-section-tag">Stage 1.4</span>
            <h3 className="v2-wf-section-title">Cover Image & OpenGraph Asset</h3>
          </div>

          <div className="v2-cover-upload-grid">
            <div className="v2-cover-upload-control">
              <label className={`v2-cover-dropzone ${uploadingImage ? 'is-uploading' : ''} ${formData.featuredImage ? 'has-image' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
                {formData.featuredImage ? (
                  <div className="v2-cover-preview-card">
                    <img src={formData.featuredImage} alt="Cover preview" className="v2-cover-preview-img" />
                    <div className="v2-cover-preview-overlay">
                      <span className="v2-badge v2-badge-primary">
                        {uploadingImage ? 'Uploading asset...' : 'Cover Asset Linked'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 32, color: '#2563eb', mb: 1 }} />
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                      {uploadingImage ? 'Uploading asset...' : 'Upload Cover Image'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      SVG, PNG, JPG, or WebP (Recommended 16:9 ratio, max 5MB)
                    </span>
                  </>
                )}
              </label>
              {formData.featuredImage && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, featuredImage: '' }))}
                  className="v2-cover-remove-btn"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="v2-cover-url-input-col">
              <span className="v2-label" style={{ marginBottom: 6, display: 'block' }}>Or Direct Media URL</span>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formData.featuredImage || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
                startAdornment={<LinkIcon fontSize="small" sx={{ color: '#94a3b8' }} />}
              />
            </div>
          </div>

          {uploadError && <p className="v2-field-message is-error" style={{ marginTop: 8 }}>{uploadError}</p>}

        </div>

        {/* Action Controls */}
        <div className="v2-wf-action-bar">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel Draft
          </Button>
          <Button type="submit" isLoading={saving || uploadingImage} size="lg">
            <span>{isTeam ? 'Proceed to Team Assignment' : 'Proceed to Content Workspace'}</span>
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* ── Right Column: Context & Quality Standards (5 Cols) ──────────────── */}
      <aside className="v2-wf-form-sidebar">
        {/* Account Mode Card */}
        <div className="v2-sidebar-context-card">
          <div className="v2-context-header">
            <div className="v2-context-badge">
              {isTeam ? '👥 Team Account' : '👤 Creator Account'}
            </div>
            <span className="v2-context-status">Active</span>
          </div>

          <h4 className="v2-context-title">
            {isTeam ? 'Collaborative Media Guild' : 'Solo Editorial Workspace'}
          </h4>
          <p className="v2-context-desc">
            {isTeam
              ? 'In Stage 2, you will assign a dedicated Writer, Reviewer, and Publisher from your guild roster.'
              : 'As an individual creator, you have full authority to draft, review, and unilaterally publish this article.'}
          </p>

          {isTeam && (
            <div className="v2-context-roles-grid">
              <div className="v2-context-role-chip writer">
                <span>✏️</span>
                <span>Writer</span>
              </div>
              <div className="v2-context-role-chip reviewer">
                <span>🔍</span>
                <span>Reviewer</span>
              </div>
              <div className="v2-context-role-chip publisher">
                <span>🚀</span>
                <span>Publisher</span>
              </div>
            </div>
          )}
        </div>

        {/* Editorial Standards Card */}
        <div className="v2-sidebar-context-card subtle">
          <h4 className="v2-context-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: '#2563eb' }} />
            <span>Editorial Standards</span>
          </h4>
          <ul className="v2-standards-list">
            <li>
              <span className="v2-bullet-check">✓</span>
              <span><strong>Actionable Title:</strong> Keep headlines under 120 characters for optimal feed CTR.</span>
            </li>
            <li>
              <span className="v2-bullet-check">✓</span>
              <span><strong>Precise Taxonomy:</strong> Map article to exact Category, Subcategory, and at least one required Primary Keyword for SEO ranking.</span>
            </li>
            <li>
              <span className="v2-bullet-check">✓</span>
              <span><strong>High-Res Cover:</strong> Use 16:9 high contrast imagery with clear focal points.</span>
            </li>
          </ul>
        </div>

        {/* Stage Timeline Preview */}
        <div className="v2-sidebar-context-card subtle">
          <h4 className="v2-context-title">Stage Progression</h4>
          <div className="v2-timeline-preview">
            <div className="v2-timeline-item active">
              <span className="v2-timeline-dot">1</span>
              <span>Basic Details (Active)</span>
            </div>
            {isTeam && (
              <div className="v2-timeline-item">
                <span className="v2-timeline-dot">2</span>
                <span>Team Assignment</span>
              </div>
            )}
            <div className="v2-timeline-item">
              <span className="v2-timeline-dot">{isTeam ? 3 : 2}</span>
              <span>TipTap Content &amp; AI Co-pilot</span>
            </div>
            <div className="v2-timeline-item">
              <span className="v2-timeline-dot">{isTeam ? 4 : 3}</span>
              <span>Review &amp; AI Score Gates</span>
            </div>
            <div className="v2-timeline-item">
              <span className="v2-timeline-dot">{isTeam ? 5 : 4}</span>
              <span>Publish &amp; Dev.to Syndication</span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  )
}

export default BasicDetailsForm
