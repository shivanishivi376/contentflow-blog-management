import { useEffect, useMemo, useState } from 'react'
import {
  fetchCategoriesRequest,
  fetchKeywordsRequest,
  fetchSubcategoriesRequest,
} from '../../../services/api/categoryApi.js'
import { Select } from '../../../components/ui/CustomerComponents.jsx'

const emptyState = {
  categories: [],
  subcategories: [],
  keywords: [],
  loadingCategories: false,
  loadingSubcategories: false,
  loadingKeywords: false,
  error: null,
}

const CategorySelector = ({
  onSelectionChange,
  initialCategoryId = '',
  initialSubcategoryId = '',
  initialKeywordIds = []
}) => {
  const [state, setState] = useState(emptyState)
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(initialSubcategoryId)
  const [selectedKeywordIds, setSelectedKeywordIds] = useState(initialKeywordIds)

  useEffect(() => {
    if (initialCategoryId && !selectedCategoryId) {
      setSelectedCategoryId(initialCategoryId)
    }
  }, [initialCategoryId])

  useEffect(() => {
    if (initialSubcategoryId && !selectedSubcategoryId) {
      setSelectedSubcategoryId(initialSubcategoryId)
    }
  }, [initialSubcategoryId])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      setState((current) => ({ ...current, loadingCategories: true, error: null }))

      try {
        const response = await fetchCategoriesRequest()
        const categories = response.data?.data?.categories || []

        if (isMounted) {
          setState((current) => ({
            ...current,
            categories,
            loadingCategories: false,
          }))
        }
      } catch (error) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            loadingCategories: false,
            error: error.response?.data?.message || 'Failed to load categories',
          }))
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) {
      setState((current) => ({ ...current, subcategories: [], keywords: [] }))
      setSelectedSubcategoryId('')
      setSelectedKeywordIds([])
      return
    }

    let isMounted = true

    const loadSubcategories = async () => {
      setState((current) => ({
        ...current,
        loadingSubcategories: true,
        error: null,
      }))

      try {
        const response = await fetchSubcategoriesRequest()
        const allSubcategories = response.data?.data?.subcategories || []
        const subcategories = allSubcategories.filter(
          (subcategory) => String(subcategory.category?._id || subcategory.category) === String(selectedCategoryId),
        )

        if (isMounted) {
          setState((current) => ({
            ...current,
            subcategories,
            loadingSubcategories: false,
          }))
        }
      } catch (error) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            loadingSubcategories: false,
            error: error.response?.data?.message || 'Failed to load subcategories',
          }))
        }
      }
    }

    loadSubcategories()

    return () => {
      isMounted = false
    }
  }, [selectedCategoryId])

  useEffect(() => {
    if (!selectedSubcategoryId) {
      setState((current) => ({ ...current, keywords: [] }))
      setSelectedKeywordIds([])
      return
    }

    let isMounted = true

    const loadKeywords = async () => {
      setState((current) => ({
        ...current,
        loadingKeywords: true,
        error: null,
      }))

      try {
        const response = await fetchKeywordsRequest({
          subcategoryId: selectedSubcategoryId,
        })
        const keywords = response.data?.data?.keywords || []

        if (isMounted) {
          setState((current) => ({
            ...current,
            keywords,
            loadingKeywords: false,
          }))
        }
      } catch (error) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            loadingKeywords: false,
            error: error.response?.data?.message || 'Failed to load keywords',
          }))
        }
      }
    }

    loadKeywords()

    return () => {
      isMounted = false
    }
  }, [selectedSubcategoryId])

  const selectedCategory = useMemo(
    () => state.categories.find((category) => String(category._id) === String(selectedCategoryId)),
    [state.categories, selectedCategoryId],
  )

  const selectedSubcategory = useMemo(
    () => state.subcategories.find((subcategory) => String(subcategory._id) === String(selectedSubcategoryId)),
    [state.subcategories, selectedSubcategoryId],
  )

  const selectedPrimaryKws = useMemo(
    () =>
      (state.keywords || []).filter(
        (keyword) =>
          keyword.keywordType !== 'secondary' && selectedKeywordIds.includes(String(keyword._id)),
      ),
    [state.keywords, selectedKeywordIds],
  )

  const selectedSecondaryKws = useMemo(
    () =>
      (state.keywords || []).filter(
        (keyword) =>
          keyword.keywordType === 'secondary' && selectedKeywordIds.includes(String(keyword._id)),
      ),
    [state.keywords, selectedKeywordIds],
  )

  useEffect(() => {
    onSelectionChange?.({
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      keywordIds: selectedKeywordIds,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      keywords: (state.keywords || []).filter((keyword) => selectedKeywordIds.includes(String(keyword._id))),
      primaryKeywords: selectedPrimaryKws,
      secondaryKeywords: selectedSecondaryKws,
      loadingKeywords: state.loadingKeywords,
    })
  }, [
    onSelectionChange,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedKeywordIds,
    selectedCategory,
    selectedSubcategory,
    state.keywords,
    selectedPrimaryKws,
    selectedSecondaryKws,
    state.loadingKeywords,
  ])

  const groupedKeywords = useMemo(() => {
    return (state.keywords || []).reduce(
      (accumulator, keyword) => {
        const type = keyword?.keywordType === 'secondary' ? 'secondary' : 'primary'
        accumulator[type].push(keyword)
        return accumulator
      },
      { primary: [], secondary: [] },
    )
  }, [state.keywords])


  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value)
    setSelectedSubcategoryId('')
    setSelectedKeywordIds([])
  }

  const handleSubcategoryChange = (event) => {
    setSelectedSubcategoryId(event.target.value)
    setSelectedKeywordIds([])
  }

  const toggleKeyword = (keywordId) => {
    setSelectedKeywordIds((current) =>
      current.includes(keywordId)
        ? current.filter((id) => id !== keywordId)
        : [...current, keywordId],
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {state.error && (
        <div className="v2-wf-alert-error">
          <span>⚠️ {state.error}</span>
        </div>
      )}

      {/* Category & Subcategory 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Category */}
        <Select
          label="Category"
          required
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          disabled={state.loadingCategories}
          placeholder={state.loadingCategories ? 'Loading categories...' : '— Select category —'}
          options={state.categories.map((cat) => ({ value: cat._id, label: cat.name }))}
        />

        {/* Sub Category */}
        <Select
          label="Sub Category"
          required
          value={selectedSubcategoryId}
          onChange={handleSubcategoryChange}
          disabled={!selectedCategoryId || state.loadingSubcategories}
          placeholder={
            !selectedCategoryId
              ? '— Select category first —'
              : state.loadingSubcategories
              ? 'Loading subcategories...'
              : '— Select sub category —'
          }
          options={state.subcategories.map((sub) => ({ value: sub._id, label: sub.name }))}
        />
      </div>

      {/* Keywords — shown once a subcategory is picked */}
      {selectedSubcategoryId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          {state.loadingKeywords ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.85rem' }}>
              <span className="v2-btn-spinner" />
              <span>Loading taxonomy keywords…</span>
            </div>
          ) : (
            ['primary', 'secondary'].map((kwType) => (
              <div key={kwType} className="v2-field-group">
                <div className="v2-label-row" style={{ marginBottom: 4 }}>
                  <span className="v2-label" style={{ textTransform: 'capitalize' }}>
                    {kwType === 'primary' ? (
                      <>
                        🌟 Primary Keywords <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>
                      </>
                    ) : (
                      '🏷️ Secondary Keywords'
                    )}
                  </span>
                  {kwType === 'primary' && groupedKeywords.primary.length > 0 && selectedPrimaryKws.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 600 }}>
                      (Required: select at least 1)
                    </span>
                  )}
                  {groupedKeywords[kwType].length > 0 && (
                    <span className="v2-char-counter">
                      {selectedKeywordIds.filter((id) =>
                        groupedKeywords[kwType].some((k) => String(k._id) === id),
                      ).length}{' '}
                      / {groupedKeywords[kwType].length} selected
                    </span>
                  )}
                </div>

                {groupedKeywords[kwType].length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: kwType === 'primary' ? '#e11d48' : '#94a3b8', fontStyle: 'italic' }}>
                    {kwType === 'primary'
                      ? '⚠️ No primary keywords configured for this subcategory. A primary keyword is required to save.'
                      : `No ${kwType} keywords configured for this subcategory.`}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {groupedKeywords[kwType].map((kw) => {
                      const isSelected = selectedKeywordIds.includes(String(kw._id))
                      const isPrimary = kwType === 'primary'
                      return (
                        <button
                          key={kw._id}
                          type="button"
                          onClick={() => toggleKeyword(String(kw._id))}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: isSelected
                              ? (isPrimary ? '1.5px solid #2563eb' : '1.5px solid #475569')
                              : '1px solid #e2e8f0',
                            background: isSelected
                              ? (isPrimary ? '#eff6ff' : '#f1f5f9')
                              : '#ffffff',
                            color: isSelected
                              ? (isPrimary ? '#1d4ed8' : '#0f172a')
                              : '#64748b',
                            fontSize: '0.8125rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                            {isSelected ? '✓' : '+'}
                          </span>
                          <span>{kw.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {!selectedSubcategoryId && selectedCategoryId && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
          💡 Please select a sub category to view and attach relevant SEO keywords.
        </p>
      )}
    </div>
  )
}

export default CategorySelector
