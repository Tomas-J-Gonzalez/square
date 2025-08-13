import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'confirm', 'success', 'error'
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: 'text-green-500' };
      case 'error':
        return { name: 'exclamation-triangle', color: 'text-red-500' };
      case 'confirm':
        return { name: 'question-circle', color: 'text-blue-500' };
      default:
        return { name: 'info-circle', color: 'text-blue-500' };
    }
  };

  const icon = getIcon();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div 
        ref={modalRef}
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="flex items-center space-x-12">
            <Icon 
              name={icon.name} 
              style="solid" 
              size="md" 
              className={icon.color} 
              aria-hidden="true"
            />
            <h3 id="modal-title" className="modal-title">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="modal-close"
            aria-label="Close modal"
            type="button"
          >
            <Icon name="times" style="solid" size="sm" aria-hidden="true" />
          </button>
        </div>
        
        <div className="modal-body">
          <p id="modal-message" className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button 
              onClick={handleCancel}
              className="modal-btn modal-btn-secondary"
              type="button"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`modal-btn ${
              type === 'error' ? 'modal-btn-danger' : 'modal-btn-primary'
            }`}
            type="button"
            autoFocus={!showCancel}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
