import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import {
  createCategoryRequest,
  createKeywordRequest,
  createSubcategoryRequest,
  deleteCategoryRequest,
  deleteKeywordRequest,
  deleteSubcategoryRequest,
  fetchCategoriesRequest,
  fetchKeywordsRequest,
  fetchSubcategoriesRequest,
  updateCategoryRequest,
  updateKeywordRequest,
  updateSubcategoryRequest,
} from '../../../services/api/categoryApi.js'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  Select,
  Table,
} from '../../../components/ui/CustomerComponents.jsx'
import { useConfirm } from '../../../context/ConfirmationContext.jsx'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'

const emptyCategoryForm = {
  name: '',
  description: '',
}

const emptySubcategoryForm = {
  categoryId: '',
  name: '',
  description: '',
}

const emptyKeywordForm = {
  categoryId: '',
  subcategoryId: '',
  name: '',
  keywordType: 'primary',
  description: '',
}

const VALID_TABS = ['categories', 'subcategories', 'keywords']

const CategoriesPage = () => {
  const hasFetchedRef = useRef(false)
  const { user } = useSelector((state) => state.auth)
  const { confirm, alert } = useConfirm()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(VALID_TABS.includes(urlTab) ? urlTab : 'categories')

  useEffect(() => {
    const currentParam = searchParams.get('tab')
    if (VALID_TABS.includes(currentParam) && currentParam !== activeTab) {
      setActiveTab(currentParam)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab }, { replace: true })
  }
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [scopeFilter, setScopeFilter] = useState('ALL')
  const [selectedParentCategoryFilter, setSelectedParentCategoryFilter] = useState('')
  const [selectedKeywordCategoryFilter, setSelectedKeywordCategoryFilter] = useState('')
  const [selectedKeywordSubcategoryFilter, setSelectedKeywordSubcategoryFilter] = useState('')
  const [selectedKeywordTypeFilter, setSelectedKeywordTypeFilter] = useState('')

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState(emptyCategoryForm)
  const [editingCategoryId, setEditingCategoryId] = useState('')

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false)
  const [subcategoryFormData, setSubcategoryFormData] = useState(emptySubcategoryForm)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState('')

  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)
  const [keywordFormData, setKeywordFormData] = useState(emptyKeywordForm)
  const [editingKeywordId, setEditingKeywordId] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [catsRes, subsRes, kwsRes] = await Promise.all([
        fetchCategoriesRequest(),
        fetchSubcategoriesRequest(),
        fetchKeywordsRequest(),
      ])
      setCategories(catsRes.data?.data?.categories || [])
      setSubcategories(subsRes.data?.data?.subcategories || [])
      setKeywords(kwsRes.data?.data?.keywords || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load taxonomy data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    loadData()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (scopeFilter === 'MINE') return cat.isOwner
        if (scopeFilter === 'GLOBAL') return cat.scope === 'GLOBAL'
        if (scopeFilter === 'TEAM') return cat.scope === 'TEAM'
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, scopeFilter])

  const filteredSubcategories = useMemo(() => {
    return subcategories
      .filter((sub) => {
        if (selectedParentCategoryFilter) {
          const parentId = String(sub.category?._id || sub.category || '')
          if (parentId !== selectedParentCategoryFilter) return false
        }
        if (scopeFilter === 'MINE') return sub.isOwner
        if (scopeFilter === 'GLOBAL') return sub.scope === 'GLOBAL'
        if (scopeFilter === 'TEAM') return sub.scope === 'TEAM'
        return true
      })
      .sort((a, b) => {
        const catA = a.category?.name || ''
        const catB = b.category?.name || ''
        if (catA !== catB) return catA.localeCompare(catB)
        return a.name.localeCompare(b.name)
      })
  }, [subcategories, scopeFilter, selectedParentCategoryFilter])

  const filteredKeywords = useMemo(() => {
    return keywords
      .filter((kw) => {
        if (selectedKeywordCategoryFilter) {
          const catId = String(kw.category?._id || kw.category || '')
          if (catId !== selectedKeywordCategoryFilter) return false
        }
        if (selectedKeywordSubcategoryFilter) {
          const subId = String(kw.subcategory?._id || kw.subcategory || '')
          if (subId !== selectedKeywordSubcategoryFilter) return false
        }
        if (selectedKeywordTypeFilter) {
          if (kw.keywordType !== selectedKeywordTypeFilter) return false
        }
        if (scopeFilter === 'MINE') return kw.isOwner
        if (scopeFilter === 'GLOBAL') return kw.scope === 'GLOBAL'
        if (scopeFilter === 'TEAM') return kw.scope === 'TEAM'
        return true
      })
      .sort((a, b) => {
        const catA = a.category?.name || ''
        const catB = b.category?.name || ''
        if (catA !== catB) return catA.localeCompare(catB)
        const subA = a.subcategory?.name || ''
        const subB = b.subcategory?.name || ''
        if (subA !== subB) return subA.localeCompare(subB)
        return a.name.localeCompare(b.name)
      })
  }, [keywords, scopeFilter, selectedKeywordCategoryFilter, selectedKeywordSubcategoryFilter, selectedKeywordTypeFilter])

  const handleOpenCreateCategory = () => {
    setEditingCategoryId('')
    setCategoryFormData(emptyCategoryForm)
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat) => {
    setEditingCategoryId(cat._id)
    setCategoryFormData({
      name: cat.name || '',
      description: cat.description || '',
    })
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingCategoryId) {
        await updateCategoryRequest(editingCategoryId, categoryFormData)
        setMessage('Category updated successfully')
      } else {
        await createCategoryRequest(categoryFormData)
        setMessage('Category created successfully')
      }
      setIsCategoryModalOpen(false)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (cat) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? This will also remove all subcategories linked under it.`,
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!isConfirmed) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteCategoryRequest(cat._id)
      setMessage('Category deleted successfully')
      await loadData()
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete category'
      setError(errMsg)
      await alert(errMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenCreateSubcategory = () => {
    setEditingSubcategoryId('')
    setSubcategoryFormData({
      categoryId: categories[0]?._id || '',
      name: '',
      description: '',
    })
    setIsSubcategoryModalOpen(true)
  }

  const handleOpenEditSubcategory = (sub) => {
    setEditingSubcategoryId(sub._id)
    setSubcategoryFormData({
      categoryId: String(sub.category?._id || sub.category || ''),
      name: sub.name || '',
      description: sub.description || '',
    })
    setIsSubcategoryModalOpen(true)
  }

  const handleSaveSubcategory = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingSubcategoryId) {
        await updateSubcategoryRequest(editingSubcategoryId, subcategoryFormData)
        setMessage('Subcategory updated successfully')
      } else {
        await createSubcategoryRequest(subcategoryFormData)
        setMessage('Subcategory created successfully')
      }
      setIsSubcategoryModalOpen(false)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subcategory')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubcategory = async (sub) => {
    const isConfirmed = await confirm({
      title: 'Delete Subcategory',
      message: `Are you sure you want to delete "${sub.name}"?`,
      confirmText: 'Delete Subcategory',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!isConfirmed) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteSubcategoryRequest(sub._id)
      setMessage('Subcategory deleted successfully')
      await loadData()
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete subcategory'
      setError(errMsg)
      await alert(errMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenCreateKeyword = () => {
    const defaultCatId = categories[0]?._id || ''
    const relevantSubs = subcategories.filter(
      (s) => String(s.category?._id || s.category || '') === String(defaultCatId)
    )
    setEditingKeywordId('')
    setKeywordFormData({
      categoryId: defaultCatId,
      subcategoryId: relevantSubs[0]?._id || '',
      name: '',
      keywordType: 'primary',
      description: '',
    })
    setIsKeywordModalOpen(true)
  }

  const handleOpenEditKeyword = (kw) => {
    const catId = String(kw.category?._id || kw.category || '')
    const subId = String(kw.subcategory?._id || kw.subcategory || '')
    setEditingKeywordId(kw._id)
    setKeywordFormData({
      categoryId: catId,
      subcategoryId: subId,
      name: kw.name || '',
      keywordType: kw.keywordType || 'primary',
      description: kw.description || '',
    })
    setIsKeywordModalOpen(true)
  }

  const handleSaveKeyword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingKeywordId) {
        await updateKeywordRequest(editingKeywordId, keywordFormData)
        setMessage('Keyword updated successfully')
      } else {
        await createKeywordRequest(keywordFormData)
        setMessage('Keyword created successfully')
      }
      setIsKeywordModalOpen(false)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save keyword')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKeyword = async (kw) => {
    const isConfirmed = await confirm({
      title: 'Delete Keyword',
      message: `Are you sure you want to delete keyword "${kw.name}"?`,
      confirmText: 'Delete Keyword',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!isConfirmed) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteKeywordRequest(kw._id)
      setMessage('Keyword deleted successfully')
      await loadData()
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete keyword'
      setError(errMsg)
      await alert(errMsg)
    } finally {
      setSaving(false)
    }
  }

  const getScopeBadge = (item) => {
    const scope = item.scope || 'GLOBAL'
    if (scope === 'GLOBAL') {
      return <Badge variant="success">Platform Global</Badge>
    }
    if (scope === 'TEAM') {
      const creatorName = item.createdBy?.name || item.createdBy?.username || 'Team'
      return (
        <Badge variant="info">
          Team {item.isOwner ? '(Yours)' : `(${creatorName})`}
        </Badge>
      )
    }
    if (scope === 'INDIVIDUAL') {
      return (
        <Badge variant="neutral">
          {item.isOwner ? 'Custom (Yours)' : 'User Custom'}
        </Badge>
      )
    }
    return <Badge variant="neutral">{scope}</Badge>
  }

  const categoryOptions = categories.map((c) => ({
    label: `${c.name} ${c.scope === 'TEAM' ? '(Team)' : c.scope === 'INDIVIDUAL' ? '(Personal)' : '(Global)'}`,
    value: c._id,
  }))

  const modalSubcategoryOptions = subcategories
    .filter((s) => String(s.category?._id || s.category || '') === String(keywordFormData.categoryId))
    .map((s) => ({
      label: `${s.name} ${s.scope === 'TEAM' ? '(Team)' : s.scope === 'INDIVIDUAL' ? '(Personal)' : '(Global)'}`,
      value: s._id,
    }))

  const filterKeywordSubcategories = subcategories
    .filter((s) => !selectedKeywordCategoryFilter || String(s.category?._id || s.category || '') === String(selectedKeywordCategoryFilter))

  const isTeamUser = user?.accountType === 'TEAM'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        background: '#ffffff',
        border: '1px solid #e3e7e4',
        borderRadius: '20px',
        padding: '22px 26px',
        boxShadow: '0 1px 3px rgba(19, 26, 21, 0.04)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#155a37', background: '#a1f5bd', padding: '2px 10px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Taxonomy Explorer
            </span>
            <span style={{ fontSize: '0.75rem', color: '#bfc9bf' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#404942' }}>
              Categories & Tags
            </span>
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: '1.75rem', color: '#004124', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Taxonomy & Content Tags
          </h1>
          <p style={{ margin: '3px 0 0', color: '#404942', fontSize: '0.88rem' }}>
            Browse and manage categories, subcategories, and keywords across personal, team, and global levels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'categories' ? (
            <Button variant="primary" size="md" onClick={handleOpenCreateCategory} startIcon={<AddIcon />}>
              Create Category
            </Button>
          ) : activeTab === 'subcategories' ? (
            <Button variant="primary" size="md" onClick={handleOpenCreateSubcategory} disabled={!categories.length} startIcon={<AddIcon />}>
              Create Subcategory
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleOpenCreateKeyword} disabled={!subcategories.length} startIcon={<AddIcon />}>
              Create Keyword
            </Button>
          )}
        </div>
      </div>

      {error   && <div style={{ background: '#ffdad6', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#93000a', fontSize: '0.88rem' }}>{error}</div>}
      {message && <div style={{ background: '#e3f2e9', border: '1px solid #a1f5bd', borderRadius: '12px', padding: '12px 16px', color: '#155a37', fontSize: '0.88rem' }}>{message}</div>}

      {/* Tabs and Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        padding: '12px 18px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e3e7e4',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleTabChange('categories')}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'categories' ? 'linear-gradient(180deg, #155a37 0%, #0d3a23 100%)' : '#f2f4f2',
              color: activeTab === 'categories' ? '#ffffff' : '#404942',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FolderOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('subcategories')}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'subcategories' ? 'linear-gradient(180deg, #155a37 0%, #0d3a23 100%)' : '#f2f4f2',
              color: activeTab === 'subcategories' ? '#ffffff' : '#404942',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Subcategories ({subcategories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('keywords')}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'keywords' ? 'linear-gradient(180deg, #155a37 0%, #0d3a23 100%)' : '#f2f4f2',
              color: activeTab === 'keywords' ? '#ffffff' : '#404942',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Keywords ({keywords.length})</span>
          </button>
        </div>

        {/* Scope and Taxonomy Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {activeTab === 'subcategories' && categories.length > 0 && (
            <div style={{ minWidth: 190 }}>
              <Select
                value={selectedParentCategoryFilter}
                onChange={(e) => setSelectedParentCategoryFilter(e.target.value)}
                placeholder="All Parent Categories"
                options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
              />
            </div>
          )}

          {activeTab === 'keywords' && categories.length > 0 && (
            <>
              <div style={{ minWidth: 160 }}>
                <Select
                  value={selectedKeywordCategoryFilter}
                  onChange={(e) => {
                    setSelectedKeywordCategoryFilter(e.target.value)
                    setSelectedKeywordSubcategoryFilter('')
                  }}
                  placeholder="All Categories"
                  options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
                />
              </div>

              <div style={{ minWidth: 160 }}>
                <Select
                  value={selectedKeywordSubcategoryFilter}
                  onChange={(e) => setSelectedKeywordSubcategoryFilter(e.target.value)}
                  placeholder="All Subcategories"
                  options={filterKeywordSubcategories.map((sub) => ({ value: sub._id, label: sub.name }))}
                />
              </div>

              <div style={{ minWidth: 150 }}>
                <Select
                  value={selectedKeywordTypeFilter}
                  onChange={(e) => setSelectedKeywordTypeFilter(e.target.value)}
                  placeholder="All Types"
                  options={[
                    { value: 'primary', label: 'Primary Anchor' },
                    { value: 'secondary', label: 'Secondary Modifier' }
                  ]}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'MINE', isTeamUser ? 'TEAM' : null, 'GLOBAL'].filter(Boolean).map((filterVal) => (
              <button
                key={filterVal}
                type="button"
                onClick={() => setScopeFilter(filterVal)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: scopeFilter === filterVal ? '#2563eb' : '#e2e8f0',
                  background: scopeFilter === filterVal ? '#eff6ff' : '#ffffff',
                  color: scopeFilter === filterVal ? '#2563eb' : '#64748b',
                }}
              >
                {filterVal === 'ALL'
                  ? 'All'
                  : filterVal === 'MINE'
                  ? 'Created by Me'
                  : filterVal === 'TEAM'
                  ? 'Team'
                  : 'Platform Global'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <LoadingState message="Loading taxonomy records..." />
      ) : activeTab === 'categories' ? (
        <Card
          title="Categories"
          subtitle={`${filteredCategories.length} categories available`}
        >
          {filteredCategories.length > 0 ? (
            <Table headers={['Category Name', 'Scope / Ownership', 'Description', 'Actions']}>
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {category.name}
                  </td>
                  <td>{getScopeBadge(category)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {category.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    {category.canEdit || category.canDelete ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {category.canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditCategory(category)}>
                            <EditOutlinedIcon fontSize="small" />
                          </Button>
                        )}
                        {category.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteCategory(category)}
                            disabled={saving}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Read Only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No categories found"
              description="No categories match the active filter. Click 'Create Category' to add a new one."
              action={
                <Button size="sm" variant="primary" onClick={handleOpenCreateCategory}>
                  Create Category
                </Button>
              }
            />
          )}
        </Card>
      ) : activeTab === 'subcategories' ? (
        <Card
          title="Subcategories"
          subtitle={`${filteredSubcategories.length} subcategories available`}
        >
          {filteredSubcategories.length > 0 ? (
            <Table headers={['Subcategory Name', 'Parent Category', 'Scope / Ownership', 'Description', 'Actions']}>
              {filteredSubcategories.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {sub.name}
                  </td>
                  <td>
                    <Badge variant="info">{sub.category?.name || 'Unknown'}</Badge>
                  </td>
                  <td>{getScopeBadge(sub)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {sub.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    {sub.canEdit || sub.canDelete ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {sub.canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditSubcategory(sub)}>
                            <EditOutlinedIcon fontSize="small" />
                          </Button>
                        )}
                        {sub.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteSubcategory(sub)}
                            disabled={saving}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Read Only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No subcategories found"
              description="No subcategories match your active selection."
              action={
                <Button size="sm" variant="primary" onClick={handleOpenCreateSubcategory}>
                  Create Subcategory
                </Button>
              }
            />
          )}
        </Card>
      ) : (
        <Card
          title="Keywords & Content Tags"
          subtitle={`${filteredKeywords.length} keywords available`}
        >
          {filteredKeywords.length > 0 ? (
            <Table headers={['Keyword Name', 'Category', 'Subcategory', 'Type', 'Scope / Ownership', 'Description', 'Actions']}>
              {filteredKeywords.map((kw) => (
                <tr key={kw._id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {kw.name}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                      {kw.category?.name || '—'}
                    </span>
                  </td>
                  <td>
                    <Badge variant="info">{kw.subcategory?.name || '—'}</Badge>
                  </td>
                  <td>
                    <Badge variant={kw.keywordType === 'primary' ? 'primary' : 'neutral'} size="sm">
                      {kw.keywordType === 'primary' ? 'Primary' : 'Secondary'}
                    </Badge>
                  </td>
                  <td>{getScopeBadge(kw)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {kw.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td>
                    {kw.canEdit || kw.canDelete ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {kw.canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditKeyword(kw)}>
                            <EditOutlinedIcon fontSize="small" />
                          </Button>
                        )}
                        {kw.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteKeyword(kw)}
                            disabled={saving}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Read Only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No keywords found"
              description="No keywords match your active selection. Click 'Create Keyword' to add a new taxonomy keyword."
              action={
                <Button size="sm" variant="primary" onClick={handleOpenCreateKeyword}>
                  Create Keyword
                </Button>
              }
            />
          )}
        </Card>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategoryId ? 'Edit Category' : 'Create New Category'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCategory} isLoading={saving}>
              {editingCategoryId ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Category Name"
            value={categoryFormData.name}
            onChange={(e) => setCategoryFormData((curr) => ({ ...curr, name: e.target.value }))}
            placeholder="e.g. Artificial Intelligence"
            required
          />
          <div className="v2-field-group">
            <label className="v2-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Description</label>
            <textarea
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData((curr) => ({ ...curr, description: e.target.value }))}
              placeholder="Brief description of this category topic"
              rows="3"
              className="v2-input"
            />
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        title={editingSubcategoryId ? 'Edit Subcategory' : 'Create New Subcategory'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setIsSubcategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSubcategory} isLoading={saving}>
              {editingSubcategoryId ? 'Save Changes' : 'Create Subcategory'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Parent Category"
            value={subcategoryFormData.categoryId}
            onChange={(e) => setSubcategoryFormData((curr) => ({ ...curr, categoryId: e.target.value }))}
            options={categoryOptions}
            required
          />
          <Input
            label="Subcategory Name"
            value={subcategoryFormData.name}
            onChange={(e) => setSubcategoryFormData((curr) => ({ ...curr, name: e.target.value }))}
            placeholder="e.g. LLM Fine-Tuning"
            required
          />
          <div className="v2-field-group">
            <label className="v2-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Description</label>
            <textarea
              value={subcategoryFormData.description}
              onChange={(e) => setSubcategoryFormData((curr) => ({ ...curr, description: e.target.value }))}
              placeholder="Brief description of this subcategory"
              rows="3"
              className="v2-input"
            />
          </div>
        </form>
      </Modal>

      {/* Keyword Modal */}
      <Modal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        title={editingKeywordId ? 'Edit Keyword' : 'Create New Keyword'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setIsKeywordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveKeyword} isLoading={saving}>
              {editingKeywordId ? 'Save Changes' : 'Create Keyword'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveKeyword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Category"
            value={keywordFormData.categoryId}
            onChange={(e) => {
              const newCatId = e.target.value
              const subsForCat = subcategories.filter(
                (s) => String(s.category?._id || s.category || '') === String(newCatId)
              )
              setKeywordFormData((curr) => ({
                ...curr,
                categoryId: newCatId,
                subcategoryId: subsForCat[0]?._id || '',
              }))
            }}
            options={categoryOptions}
            required
          />
          <Select
            label="Subcategory"
            value={keywordFormData.subcategoryId}
            onChange={(e) => setKeywordFormData((curr) => ({ ...curr, subcategoryId: e.target.value }))}
            options={modalSubcategoryOptions}
            required
          />
          <Input
            label="Keyword Name"
            value={keywordFormData.name}
            onChange={(e) => setKeywordFormData((curr) => ({ ...curr, name: e.target.value }))}
            placeholder="e.g. Prompt Engineering, LoRA, Quantization"
            required
          />
          <Select
            label="Keyword Type"
            value={keywordFormData.keywordType}
            onChange={(e) => setKeywordFormData((curr) => ({ ...curr, keywordType: e.target.value }))}
            options={[
              { label: 'Primary Anchor', value: 'primary' },
              { label: 'Secondary Modifier', value: 'secondary' },
            ]}
            required
          />
          <div className="v2-field-group">
            <label className="v2-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Description</label>
            <textarea
              value={keywordFormData.description}
              onChange={(e) => setKeywordFormData((curr) => ({ ...curr, description: e.target.value }))}
              placeholder="Brief description or usage context of this keyword"
              rows="3"
              className="v2-input"
            />
          </div>
        </form>
      </Modal>

    </div>
  )
}

export default CategoriesPage
