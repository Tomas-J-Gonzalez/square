import { useState, useCallback } from 'react';

export function useModal() {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showModal = useCallback((config) => {
    setModal({ ...config, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirmModal = useCallback((title, message, onConfirm, onCancel) => {
    showModal({
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        onConfirm?.();
        hideModal();
      },
      onCancel: () => {
        onCancel?.();
        hideModal();
      }
    });
  }, [showModal, hideModal]);

  const showErrorModal = useCallback((title, message) => {
    showModal({
      title,
      message,
      type: 'error'
    });
  }, [showModal]);

  const showSuccessModal = useCallback((title, message, onConfirm) => {
    showModal({
      title,
      message,
      type: 'success',
      onConfirm: () => {
        onConfirm?.();
        hideModal();
      }
    });
  }, [showModal, hideModal]);

  return {
    modal,
    showModal,
    hideModal,
    showConfirmModal,
    showErrorModal,
    showSuccessModal
  };
}
