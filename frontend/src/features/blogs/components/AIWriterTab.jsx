import React, { useEffect, useState } from 'react'
import { Button, Input, Select, Textarea } from '../../../components/ui/CustomerComponents.jsx'

const AIWriterTab = ({
  blogId,
  blogTitle = '',
  aiTopic = '',
  setAiTopic,
  aiTone = 'professional',
  setAiTone,
  aiLength = 'medium',
  setAiLength,
  aiContext = '',
  setAiContext,
  aiResult,
  aiLoading,
  onGenerate,
  onInsert,
  onReplace,
  onRegenerate,
  onDiscard,
}) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    if (!aiTopic && blogTitle) {
      setAiTopic?.(blogTitle)
    }
  }, [blogTitle])

  const toneOptions = [
    { label: 'Professional', value: 'professional' },
    { label: 'Casual', value: 'casual' },
    { label: 'Technical', value: 'technical' },
    { label: 'Friendly', value: 'friendly' },
    { label: 'Educational', value: 'educational' },
  ]

  const lengthOptions = [
    { label: 'Short (~200 words)', value: 'short' },
    { label: 'Medium (~400 words)', value: 'medium' },
    { label: 'Long (~700 words)', value: 'long' },
  ]

  const aiSuggestions = [
    'Use descriptive headings',
    'Add images to improve engagement',
    'Keep paragraphs short',
    'Use lists and bullets',
    'Optimize for SEO',
  ]

  const canGenerate = Boolean(aiTopic?.trim()) && !aiLoading

  return (
    <div className="wf-ai-writer-layout">
      {/* Left: Input panel */}
      <div className="wf-ai-input-panel">
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Generate Content with AI Co-Pilot
          </h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
            Fill in the details below and generate publication-ready drafts in seconds.
          </p>
        </div>

        {/* Topic */}
        <Input
          label="What is your blog about?"
          placeholder="e.g. Playwright best practices for QA engineers"
          value={aiTopic || ''}
          onChange={(e) => setAiTopic?.(e.target.value)}
          required
        />

        {/* Tone & Length */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select
            label="Tone"
            value={aiTone}
            onChange={(e) => setAiTone?.(e.target.value)}
            options={toneOptions}
          />
          <Select
            label="Length"
            value={aiLength}
            onChange={(e) => setAiLength?.(e.target.value)}
            options={lengthOptions}
          />
        </div>

        {/* Additional Instructions */}
        <Textarea
          label="Additional Instructions (Optional)"
          rows={3}
          placeholder="e.g. Focus on practical examples, benchmark comparisons, and clean architecture..."
          value={aiContext || ''}
          onChange={(e) => setAiContext?.(e.target.value)}
        />

        {/* Generate button */}
        <Button
          onClick={onGenerate}
          isLoading={aiLoading}
          disabled={!canGenerate}
          size="lg"
          style={{ width: '100%', marginTop: 4 }}
        >
          {aiLoading ? 'Generating Content with AI...' : '✨ Generate Content'}
        </Button>

        {/* AI Output */}
        {aiResult && (
          <div className="wf-ai-output">
            <div className="wf-ai-output-header">
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                Generated Content
              </span>
              <button
                className="wf-reply-btn"
                onClick={() => setShowDiscardConfirm(true)}
              >
                Discard
              </button>
            </div>
            <div
              className="wf-ai-output-preview"
              dangerouslySetInnerHTML={{ __html: aiResult }}
            />
            <div className="wf-ai-output-actions">
              <Button size="sm" onClick={onInsert}>
                Insert into Editor
              </Button>
              <Button variant="outline" size="sm" onClick={onReplace}>
                Replace Editor
              </Button>
              <Button variant="ghost" size="sm" onClick={onRegenerate} isLoading={aiLoading}>
                ↻ Regenerate
              </Button>
            </div>
            <div className="wf-ai-disclaimer">
              ⚠ AI content may be inaccurate. Please review before using.
            </div>
          </div>
        )}
      </div>

      {/* Right: AI Suggestions panel */}
      <div className="wf-ai-suggestions-panel">
        <div className="wf-content-tips">
          <h4 className="wf-tips-heading">AI Suggestions</h4>
          <ul className="wf-tips-list">
            {aiSuggestions.map((tip, i) => (
              <li key={i} className="wf-tip-item">
                <span className="wf-tip-dot">●</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="wf-content-tips" style={{ marginTop: 12 }}>
          <h4 className="wf-tips-heading">Quick Prompts</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {[
              'Write an introduction',
              'Write a conclusion',
              'Expand this section',
              'Write code examples',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                className="wf-quick-prompt-btn"
                onClick={() => setAiContext?.((prev) => prev ? `${prev}\n${prompt}` : prompt)}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>+</span>
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Discard confirm */}
      {showDiscardConfirm && (
        <div className="v2-modal-backdrop" onClick={() => setShowDiscardConfirm(false)}>
          <div className="v2-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="v2-modal-header">
              <h3 className="v2-modal-title">Discard AI Content?</h3>
              <button className="v2-modal-close" onClick={() => setShowDiscardConfirm(false)}>
                &times;
              </button>
            </div>
            <div className="v2-modal-body">
              <p style={{ color: '#475569', margin: 0 }}>
                Are you sure you want to discard the generated content?
              </p>
            </div>
            <div className="v2-modal-footer">
              <Button variant="outline" onClick={() => setShowDiscardConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onDiscard?.()
                  setShowDiscardConfirm(false)
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIWriterTab
