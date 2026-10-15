import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const ConfirmationContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options: {
          title: options.title || 'Confirm',
          message: options.message || 'Are you sure?',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          isAlert: options.isAlert || false,
          variant: options.variant || 'primary',
        },
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options) => {
    let alertOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options: {
          title: alertOptions.title || 'Alert',
          message: alertOptions.message || '',
          confirmText: alertOptions.confirmText || 'OK',
          isAlert: true,
          variant: alertOptions.variant || 'primary',
        },
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, alert }}>
      {children}
      {modalState.isOpen && modalState.options && (
        <ConfirmModal
          {...modalState.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
};
