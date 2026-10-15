import React, { useState, useEffect, useMemo, useRef } from 'react';
import './CustomerComponents.css';

// Material Icons
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// ─── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost | icon
  size = 'md',        // sm | md | lg
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  startIcon,
  endIcon,
  style,
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`v2-btn v2-btn-${variant} v2-btn-${size} ${className}`}
      style={style}
      {...props}
    >
      {isLoading ? (
        <span className="v2-btn-spinner">
          <CircularProgress size={16} color="inherit" thickness={5} />
        </span>
      ) : startIcon ? (
        <span className="v2-btn-icon-start">{startIcon}</span>
      ) : null}
      <span className="v2-btn-content">{children}</span>
      {!isLoading && endIcon && <span className="v2-btn-icon-end">{endIcon}</span>}
    </button>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  placeholder,
  startAdornment,
  endAdornment,
  required = false,
  maxLength,
  showCharCount = false,
  value,
  onChange,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`v2-field-group ${className}`}>
      {label && (
        <div className="v2-label-row">
          <label htmlFor={inputId} className="v2-label">
            {label} {required && <span className="v2-required-star">*</span>}
          </label>
          {showCharCount && maxLength && (
            <span className="v2-char-counter">
              {typeof value === 'string' ? value.length : 0} / {maxLength}
            </span>
          )}
        </div>
      )}
      <div className={`v2-input-wrapper ${error ? 'has-error' : ''}`}>
        {startAdornment && <span className="v2-input-adornment start">{startAdornment}</span>}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={`v2-input ${startAdornment ? 'has-start' : ''} ${endAdornment ? 'has-end' : ''}`}
          {...props}
        />
        {endAdornment && <span className="v2-input-adornment end">{endAdornment}</span>}
      </div>
      {(error || helperText) && (
        <p className={`v2-field-message ${error ? 'is-error' : 'is-helper'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ─── Password Input with Reveal Eye ──────────────────────────────────────────
export const PasswordInput = ({
  label,
  error,
  helperText,
  className = '',
  id,
  placeholder = '••••••••',
  required = false,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      className={className}
      id={id}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      endAdornment={
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="v2-password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
        </button>
      }
      {...props}
    />
  );
};

// ─── Search Input with Shortcut Badge ────────────────────────────────────────
export const SearchInput = ({
  placeholder = 'Search articles, tags, authors... (⌘K)',
  value,
  onChange,
  onClear,
  shortcut = '⌘K',
  className = '',
  ...props
}) => {
  return (
    <div className={`v2-search-container ${className}`}>
      <span className="v2-search-icon">
        <SearchIcon fontSize="small" />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="v2-search-input"
        {...props}
      />
      {value ? (
        <button type="button" onClick={onClear} className="v2-search-clear" aria-label="Clear search">
          <CloseIcon fontSize="small" />
        </button>
      ) : shortcut ? (
        <span className="v2-search-shortcut">{shortcut}</span>
      ) : null}
    </div>
  );
};

// ─── Custom Select Dropdown ──────────────────────────────────────────────────
export const Select = ({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  name,
  required = false,
  disabled = false,
  value = '',
  onChange,
  placeholder = 'Select option...',
  searchable = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectId = id || name;

  // Normalize options array into { value, label } objects
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? String(opt.value) : '',
          label: opt.label !== undefined ? String(opt.label) : String(opt.value || ''),
          disabled: Boolean(opt.disabled),
          icon: opt.icon,
          badge: opt.badge
        };
      }
      return {
        value: String(opt),
        label: String(opt),
        disabled: false
      };
    });
  }, [options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
    );
  }, [normalizedOptions, searchQuery]);

  // Selected item
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    if (option.disabled) return;
    setIsOpen(false);
    setSearchQuery('');
    if (onChange) {
      onChange({
        target: {
          name: name || id,
          value: option.value,
          id: selectId
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[focusedIndex]);
      }
    }
  };

  const showSearch = searchable || normalizedOptions.length > 6;

  return (
    <div className={`v2-field-group ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="v2-label" onClick={() => !disabled && setIsOpen(!isOpen)}>
          {label} {required && <span className="v2-required-star">*</span>}
        </label>
      )}

      <div className="v2-custom-select-container">
        {/* Trigger Button */}
        <div
          id={selectId}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`v2-custom-select-trigger ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
        >
          <span className={`v2-custom-select-value ${!selectedOption ? 'is-placeholder' : ''}`}>
            {selectedOption?.icon && <span className="v2-custom-select-icon">{selectedOption.icon}</span>}
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="v2-custom-select-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        {/* Options Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="v2-custom-select-dropdown" role="listbox">
            {showSearch && (
              <div className="v2-custom-select-search" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="v2-custom-select-search-input"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div className="v2-custom-select-options-list">
              {placeholder && !normalizedOptions.some((o) => o.value === '') && (
                <div
                  role="option"
                  aria-selected={!selectedOption}
                  className={`v2-custom-select-option ${!selectedOption ? 'is-selected' : ''}`}
                  onClick={() => handleSelect({ value: '', label: placeholder })}
                >
                  <span className="v2-custom-select-option-content">
                    <span className="v2-custom-select-option-label" style={{ color: '#94a3b8' }}>
                      {placeholder}
                    </span>
                  </span>
                  {!selectedOption && (
                    <span className="v2-custom-select-checkmark">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  )}
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
                  const isFocused = focusedIndex === idx;

                  return (
                    <div
                      key={opt.value + idx}
                      role="option"
                      aria-selected={isSelected}
                      className={`v2-custom-select-option ${isSelected ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      <span className="v2-custom-select-option-content">
                        {opt.icon && <span className="v2-custom-select-option-icon">{opt.icon}</span>}
                        <span className="v2-custom-select-option-label">{opt.label}</span>
                        {opt.badge && <span className="v2-custom-select-option-badge">{opt.badge}</span>}
                      </span>

                      {isSelected && (
                        <span className="v2-custom-select-checkmark">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="v2-custom-select-empty">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`v2-field-message ${error ? 'is-error' : 'is-helper'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ─── Textarea ────────────────────────────────────────────────────────────────
export const Textarea = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  placeholder,
  required = false,
  maxLength,
  showCharCount = false,
  value,
  onChange,
  ...props
}) => {
  const textareaId = id || props.name;

  return (
    <div className={`v2-field-group ${className}`}>
      {label && (
        <div className="v2-label-row">
          <label htmlFor={textareaId} className="v2-label">
            {label} {required && <span className="v2-required-star">*</span>}
          </label>
          {showCharCount && maxLength && (
            <span className="v2-char-counter">
              {typeof value === 'string' ? value.length : 0} / {maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className={`v2-textarea ${error ? 'has-error' : ''}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`v2-field-message ${error ? 'is-error' : 'is-helper'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ─── Card & Container ─────────────────────────────────────────────────────────
export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  noPadding = false,
  style,
  ...props
}) => {
  return (
    <div className={`v2-card ${noPadding ? 'v2-card-no-padding' : ''} ${className}`} style={style} {...props}>
      {(title || action) && (
        <div className="v2-card-header">
          <div>
            {title && <h3 className="v2-card-title">{title}</h3>}
            {subtitle && <p className="v2-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="v2-card-action">{action}</div>}
        </div>
      )}
      <div className="v2-card-body">{children}</div>
    </div>
  );
};

// ─── Stat Card (KPI Pod) ─────────────────────────────────────────────────────
export const StatCard = ({
  title,
  value,
  delta,
  deltaType = 'positive', // positive | negative | neutral
  icon,
  description,
  className = '',
}) => {
  return (
    <div className={`v2-stat-card ${className}`}>
      <div className="v2-stat-header">
        <span className="v2-stat-title">{title}</span>
        {icon && <span className="v2-stat-icon">{icon}</span>}
      </div>
      <div className="v2-stat-body">
        <span className="v2-stat-value">{value}</span>
        {delta && (
          <span className={`v2-stat-delta ${deltaType}`}>
            {deltaType === 'positive' ? '↑ ' : deltaType === 'negative' ? '↓ ' : ''}
            {delta}
          </span>
        )}
      </div>
      {description && <p className="v2-stat-description">{description}</p>}
    </div>
  );
};

// ─── Badges & Status Pills ───────────────────────────────────────────────────
export const Badge = ({
  children,
  variant = 'default', // default | primary | success | warning | error | info
  size = 'md',         // sm | md
  className = '',
}) => {
  return <span className={`v2-badge v2-badge-${variant} v2-badge-${size} ${className}`}>{children}</span>;
};

export const StatusBadge = ({ status, className = '' }) => {
  const norm = String(status || '').toUpperCase();
  let variant = 'default';
  let label = norm;

  switch (norm) {
    case 'PUBLISHED':
      variant = 'success';
      label = 'Published';
      break;
    case 'IN_REVIEW':
      variant = 'warning';
      label = 'In Review';
      break;
    case 'IN_WRITING':
      variant = 'primary';
      label = 'In Writing';
      break;
    case 'RE_ASSIGN':
      variant = 'error';
      label = 'Re-Assign';
      break;
    case 'IN_PUBLISHING':
      variant = 'info';
      label = 'In Publishing';
      break;
    case 'DRAFT':
      variant = 'default';
      label = 'Draft';
      break;
    case 'ACTIVE':
      variant = 'success';
      label = 'Active';
      break;
    case 'SUSPENDED':
      variant = 'error';
      label = 'Suspended';
      break;
    default:
      variant = 'default';
      label = norm;
  }

  return (
    <span className={`v2-status-badge v2-status-${variant} ${className}`}>
      <span className="v2-status-dot"></span>
      <span>{label}</span>
    </span>
  );
};

// ─── Modal Dialog ────────────────────────────────────────────────────────────
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '560px',
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="v2-modal-overlay" onClick={onClose}>
      <div
        className={`v2-modal-container ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="v2-modal-header">
          <div>
            {title && <h3 className="v2-modal-title">{title}</h3>}
            {subtitle && <p className="v2-modal-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="v2-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="v2-modal-body">{children}</div>
        {footer && <div className="v2-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`v2-empty-state ${className}`}>
      {icon && <div className="v2-empty-icon">{icon}</div>}
      {title && <h3 className="v2-empty-title">{title}</h3>}
      {description && <p className="v2-empty-description">{description}</p>}
      {action && <div className="v2-empty-action">{action}</div>}
    </div>
  );
};

// ─── Loading Skeletons ───────────────────────────────────────────────────────
export const LoadingState = ({ message = 'Loading records...', rows = 4, className = '' }) => {
  return (
    <div className={`v2-loading-state ${className}`}>
      <CircularProgress size={32} thickness={4} sx={{ color: '#2563eb', mb: 2 }} />
      <p className="v2-loading-text">{message}</p>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="v2-table-skeleton">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="v2-skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="v2-skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Table ───────────────────────────────────────────────────────────────────
export const Table = ({
  headers = [],
  children,
  className = '',
}) => {
  return (
    <div className="v2-table-container">
      <table className={`v2-table ${className}`}>
        {headers && headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

// ─── Pagination ──────────────────────────────────────────────────────────────
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`v2-pagination ${className}`}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="v2-page-btn"
      >
        ‹ Prev
      </button>
      <span className="v2-page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="v2-page-btn"
      >
        Next ›
      </button>
    </div>
  );
};

export const Avatar = ({ name = '', src, size = 36, className = '', style = {} }) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  let dimension = 36;
  if (typeof size === 'number') {
    dimension = size;
  } else if (size === 'xs') {
    dimension = 24;
  } else if (size === 'sm') {
    dimension = 30;
  } else if (size === 'md') {
    dimension = 38;
  } else if (size === 'lg') {
    dimension = 48;
  } else if (size === 'xl') {
    dimension = 64;
  } else if (typeof size === 'string') {
    dimension = parseInt(size, 10) || 36;
  }

  const imageUrl = typeof src === 'object' ? src?.url : src;

  return (
    <div
      className={`v2-avatar ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        minWidth: `${dimension}px`,
        minHeight: `${dimension}px`,
        maxWidth: `${dimension}px`,
        maxHeight: `${dimension}px`,
        fontSize: `${Math.max(11, Math.round(dimension * 0.42))}px`,
        aspectRatio: '1 / 1',
        ...style,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'Avatar'}
          className="v2-avatar-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <span
        className="v2-avatar-initials"
        style={{
          display: imageUrl ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          lineHeight: 1,
        }}
      >
        {initial}
      </span>
    </div>
  );
};

// ─── Tabs & Tab ──────────────────────────────────────────────────────────────
export const Tabs = ({ activeTab, onChange, tabs = [], className = '' }) => {
  return (
    <div className={`v2-tabs-container ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const count = typeof tab === 'object' ? tab.count : null;
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`v2-tab-btn ${isActive ? 'active' : ''}`}
          >
            <span>{label}</span>
            {count !== null && count !== undefined && (
              <span className={`v2-tab-badge ${isActive ? 'active' : ''}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
