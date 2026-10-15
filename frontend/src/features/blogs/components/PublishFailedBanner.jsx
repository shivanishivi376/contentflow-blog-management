import { useState } from 'react'
import { retryPublishBlogRequest } from '../../../services/api/blogApi.js'

const PublishFailedBanner = ({ blogId, publishFailReason, publishFailedAt, onPublished }) => {
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')

  const handleRetry = async () => {
    setRetrying(true)
    setError('')

    try {
      const response = await retryPublishBlogRequest(blogId)
      const updatedBlog = response.data?.data?.blog
      onPublished?.({ ...updatedBlog, responseMessage: response.data?.message })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retry publishing')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #f87171',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <div>
            <strong style={{ color: '#991b1b', fontSize: '1rem' }}>Article Publication Failed</strong>
            <p style={{ margin: '2px 0 0', color: '#b91c1c', fontSize: '0.875rem' }}>
              {publishFailReason || 'An unexpected error occurred during the publishing lifecycle.'}
            </p>
            {publishFailedAt ? (
              <span style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                Failed at: {new Date(publishFailedAt).toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="auth-button"
          onClick={handleRetry}
          disabled={retrying}
          style={{ width: 'auto', padding: '8px 18px', backgroundColor: '#dc2626' }}
        >
          {retrying ? 'Retrying...' : '🔄 Retry Publishing'}
        </button>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px' }}>
          Retry Error: {error}
        </div>
      ) : null}
    </div>
  )
}

export default PublishFailedBanner
