import { useEffect, useRef, useState } from 'react'

export const useAutosave = (data, saveHandler, delay = 2500, enabled = true) => {
  const [status, setStatus] = useState('idle') // 'idle' | 'typing' | 'saving' | 'saved' | 'error'
  const isFirstRender = useRef(true)
  const prevEnabledRef = useRef(enabled)
  const dataRef = useRef(data)
  const lastSavedDataRef = useRef(data)
  const saveHandlerRef = useRef(saveHandler)

  dataRef.current = data
  saveHandlerRef.current = saveHandler

  useEffect(() => {
    // If not enabled (e.g. data still loading or blogId not ready), sync data and do nothing
    if (!enabled) {
      lastSavedDataRef.current = data
      prevEnabledRef.current = false
      return
    }

    // When transitioning from disabled to enabled (e.g. blog data finished loading), sync and do not save
    if (!prevEnabledRef.current) {
      prevEnabledRef.current = true
      lastSavedDataRef.current = data
      return
    }

    // Skip initial mount render
    if (isFirstRender.current) {
      isFirstRender.current = false
      lastSavedDataRef.current = data
      return
    }

    // If data hasn't changed from what was already saved or loaded, do not trigger autosave
    if (data === lastSavedDataRef.current) {
      return
    }

    setStatus('typing')

    const timer = setTimeout(async () => {
      const dataToSave = dataRef.current
      setStatus('saving')
      try {
        await saveHandlerRef.current(dataToSave)
        lastSavedDataRef.current = dataToSave
        setStatus('saved')
      } catch (err) {
        console.error('Autosave failed:', err)
        setStatus('error')
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [data, delay, enabled])

  const resetSavedData = (newData) => {
    lastSavedDataRef.current = newData
    dataRef.current = newData
    setStatus('saved')
  }

  return { status, resetSavedData }
}

export default useAutosave
