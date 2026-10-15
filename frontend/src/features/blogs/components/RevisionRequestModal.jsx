import { useState } from 'react'
import { Button, Modal } from '../../../components/ui/CustomerComponents.jsx'

const RevisionRequestModal = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a specific reason for requesting revisions.')
      return
    }
    setError('')
    onSubmit({ reason: reason.trim(), comment: comment.trim() })
  }

  const handleClose = () => {
    setReason('')
    setComment('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Changes & Revisions">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
          This will return the blog to the <strong>Re-assigned</strong> state so the author can address your editorial feedback.
        </p>

        {error ? (
          <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.85rem' }}>
            {error}
          </div>
        ) : null}

        <div className="v2-field-group">
          <label className="v2-label">
            Revision Reason <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            className="v2-input"
            placeholder="e.g. Strengthen conclusion and fix code formatting"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
        </div>

        <div className="v2-field-group">
          <label className="v2-label">Detailed Feedback / Comments (Optional)</label>
          <textarea
            className="v2-input"
            rows="4"
            placeholder="Specify any additional guidelines, references, or context for the author..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" isLoading={isSubmitting}>
            Confirm Re-assignment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RevisionRequestModal
