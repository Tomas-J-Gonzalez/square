'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success',
  showIcon = true,
  autoClose = false,
  autoCloseDelay = 3000,
  showCloseButton = true,
  actions
}: NotificationModalProps) {
  // Auto-close functionality
  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  const variantConfig = {
    success: {
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    error: {
      icon: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    }
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      showCloseButton={showCloseButton}
      className={`${config.bgColor} ${config.borderColor}`}
    >
      <div className="text-center">
        {/* Icon */}
        {showIcon && (
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} mb-4`}>
            {config.icon}
          </div>
        )}

        {/* Message */}
        <p className={`text-sm ${config.textColor} mb-6 leading-relaxed`}>
          {message}
        </p>

        {/* Actions */}
        {actions ? (
          <div className="flex justify-center space-x-3">
            {actions}
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={onClose}
              className="px-6"
            >
              OK
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
