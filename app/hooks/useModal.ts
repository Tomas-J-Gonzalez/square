import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Utility functions for replacing browser alerts
export const showAlert = (message: string, title = 'Notice') => {
  // This will be used with the NotificationModal
  return { message, title };
};

export const showConfirm = (message: string, title = 'Confirm') => {
  // This will be used with the ConfirmModal
  return { message, title };
};
