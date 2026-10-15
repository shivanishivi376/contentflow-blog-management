import React, { useState } from 'react'
import { generateAIContentRequest, generateAIMetadataRequest, improveAITextRequest } from '../../../services/api/aiApi.js'
import { Button, Select } from '../../../components/ui/CustomerComponents.jsx'

const AIAssistantModal = ({ isOpen, onClose, currentTitle, currentContent, onApplyContent, onApplyMetadata }) => {
  const [activeTab, setActiveTab] = useState('generate') // generate | polish | metadata
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Draft generator state
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('informative')
  const [length, setLength] = useState('medium')
  const [generatedDraft, setGeneratedDraft] = useState('')

  // Polish state
  const [inputText, setInputText] = useState('')
  const [polishAction, setPolishAction] = useState('improve')
  const [improvedResult, setImprovedResult] = useState('')

  // Metadata state
  const [generatedMeta, setGeneratedMeta] = useState(null)

  if (!isOpen) return null

  const handleGenerateContent = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await generateAIContentRequest({ topic, context, tone, length })
      setGeneratedDraft(response.data?.data?.result || '')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI content')
    } finally {
      setLoading(false)
    }
  }

  const handleImproveText = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await improveAITextRequest({ text: inputText, action: polishAction, tone })
      setImprovedResult(response.data?.data?.result || '')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to polish text')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMetadata = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await generateAIMetadataRequest({ title: currentTitle, content: currentContent })
      setGeneratedMeta(response.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI metadata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v2-modal-backdrop" onClick={onClose}>
      <div
        className="v2-modal-container"
        style={{ maxWidth: 680, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="v2-modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              ✨
            </div>
            <div>
              <h3 className="v2-modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>AI Co-Pilot Assistant</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Generate drafts, refine prose, and optimize SEO</p>
            </div>
          </div>
          <button className="v2-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '0 24px',
            gap: 24,
          }}
        >
          {[
            { id: 'generate', label: 'Draft Generator' },
            { id: 'polish', label: 'Polish & Rewrite' },
            { id: 'metadata', label: 'SEO Metadata' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 0',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                backgroundColor: 'transparent',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.86rem' }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {/* TAB 1: Draft Generator */}
          {activeTab === 'generate' && (
            <form onSubmit={handleGenerateContent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="v2-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="v2-label">
                    Topic / Subject <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                    {topic.length} / 200 chars
                  </span>
                </div>
                <input
                  type="text"
                  className="v2-input"
                  placeholder="e.g. 5 Strategies for Scaling Microservices with Node.js"
                  value={topic}
                  maxLength={200}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Select
                  label="Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  options={[
                    { value: 'informative', label: 'Informative / Technical' },
                    { value: 'conversational', label: 'Conversational / Casual' },
                    { value: 'professional', label: 'Professional / Executive' },
                    { value: 'persuasive', label: 'Persuasive / Opinionated' },
                  ]}
                />

                <Select
                  label="Length Target"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  options={[
                    { value: 'short', label: 'Short (~200 words)' },
                    { value: 'medium', label: 'Medium (~400 words)' },
                    { value: 'long', label: 'Detailed (~700 words)' },
                  ]}
                />
              </div>

              <div className="v2-field-group">
                <label className="v2-label">Context / Specific Outlines (Optional)</label>
                <textarea
                  className="v2-input"
                  placeholder="Key points, frameworks, or takeaways you want covered..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <Button type="submit" isLoading={loading} disabled={!topic.trim()} style={{ width: '100%' }}>
                ✨ {loading ? 'Generating Article Draft...' : 'Generate Draft'}
              </Button>

              {generatedDraft && (
                <div style={{ marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>Generated Preview:</h4>
                  </div>
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: 'auto',
                      backgroundColor: '#f8fafc',
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: '#334155',
                    }}
                    dangerouslySetInnerHTML={{ __html: generatedDraft }}
                  />
                  <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        onApplyContent?.(generatedDraft)
                        onClose()
                      }}
                    >
                      Apply to Editor
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setGeneratedDraft('')}>
                      Discard
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: Polish & Rewrite */}
          {activeTab === 'polish' && (
            <form onSubmit={handleImproveText} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="v2-field-group">
                <label className="v2-label">
                  Target Text <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="v2-input"
                  placeholder="Paste or type text you want the AI to improve, expand, or rewrite..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Select
                  label="Action"
                  value={polishAction}
                  onChange={(e) => setPolishAction(e.target.value)}
                  options={[
                    { value: 'improve', label: 'Improve & Fix Grammar' },
                    { value: 'rewrite', label: 'Rewrite for Clarity' },
                    { value: 'expand', label: 'Expand Detail' },
                    { value: 'shorten', label: 'Shorten / Concise' },
                  ]}
                />

                <Select
                  label="Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  options={[
                    { value: 'professional', label: 'Professional' },
                    { value: 'engaging', label: 'Engaging & Dynamic' },
                    { value: 'academic', label: 'Academic & Precise' },
                  ]}
                />
              </div>

              <Button type="submit" isLoading={loading} disabled={!inputText.trim()} style={{ width: '100%' }}>
                ✨ {loading ? 'Polishing Text...' : 'Polish Text'}
              </Button>

              {improvedResult && (
                <div style={{ marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>Improved Result:</h4>
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      backgroundColor: '#f8fafc',
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: '#334155',
                    }}
                    dangerouslySetInnerHTML={{ __html: improvedResult }}
                  />
                  <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        onApplyContent?.(improvedResult)
                        onClose()
                      }}
                    >
                      Apply Result
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setImprovedResult('')}>
                      Discard
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: SEO Metadata */}
          {activeTab === 'metadata' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Generate SEO-optimized Meta Titles, Meta Descriptions, and Alternative Title Ideas tailored for your article.
              </p>

              <Button type="button" onClick={handleGenerateMetadata} isLoading={loading} style={{ width: '100%' }}>
                ✨ {loading ? 'Generating Metadata...' : 'Auto-Generate Meta Title & Description'}
              </Button>

              {generatedMeta && (
                <div style={{ marginTop: 8, backgroundColor: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: 14 }}>
                    <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                      Suggested Meta Title
                    </strong>
                    <div style={{ color: '#0f172a', fontWeight: 600, marginTop: 4, fontSize: '0.95rem' }}>{generatedMeta.metaTitle}</div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                      Suggested Meta Description
                    </strong>
                    <div style={{ color: '#475569', marginTop: 4, fontSize: '0.88rem', lineHeight: 1.5 }}>{generatedMeta.metaDescription}</div>
                  </div>

                  {generatedMeta.suggestedTitles?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                        Alternative Headline Ideas
                      </strong>
                      <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '0.88rem', color: '#2563eb' }}>
                        {generatedMeta.suggestedTitles.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => {
                      onApplyMetadata?.(generatedMeta)
                      onClose()
                    }}
                    style={{ width: '100%' }}
                  >
                    Apply Metadata to Settings
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIAssistantModal
