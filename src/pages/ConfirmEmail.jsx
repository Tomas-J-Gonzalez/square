import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/authService';
import { useModal } from '../hooks/useModal';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

const ConfirmEmail = () => {
  const router = useRouter();
  const { modal, showSuccessModal } = useModal();
  
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    console.log('🔍 ConfirmEmail: Token from URL:', token);
    
    if (!token) {
      setError('No confirmation token provided');
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        const resp = await fetch(`/api/confirm-email?token=${encodeURIComponent(token)}`);
        const json = await resp.json();
        if (resp.ok && json.success) {
          // Email confirmation is now handled entirely by the server
          // The user's email_confirmed status is updated in Supabase
          // No localStorage updates needed
          console.log('✅ Email confirmed successfully via server');
          
          setConfirmed(true);
          showSuccessModal(
            'Email Confirmed!',
            'Your email has been confirmed successfully. You can now log in to your account.',
            () => router.push('/login')
          );
        } else {
          setError(json.error || 'Invalid or expired confirmation token');
        }
      } catch (e) {
        setError('Unable to confirm email');
      } finally {
        setLoading(false);
      }
    };
  }, [router, showSuccessModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4" style={{ width: 64, height: 64 }}>
            <img src="/logo.svg?v=1" alt="Logo" width="64" height="64" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {confirmed ? 'Email Confirmed!' : 'Confirm Your Email'}
          </h1>
          <p className="text-gray-600">
            {confirmed 
              ? 'Your account is now active' 
              : 'Please confirm your email address to continue'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {confirmed ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" style="solid" size="lg" className="text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Your email has been confirmed successfully. You can now log in to your account.
              </p>
              <Button
                onClick={() => router.push('/login')}
                variant="primary"
                size="lg"
                fullWidth
                className="rounded-full"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="text-center">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="exclamation-triangle" style="solid" size="lg" className="text-yellow-600" />
              </div>
              <p className="text-gray-600 mb-6">
                The confirmation link is invalid or has expired.
              </p>

              <Button
                onClick={() => router.push('/login')}
                variant="primary"
                size="lg"
                fullWidth
                className="rounded-full"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal {...modal} />
    </div>
  );
};

export default ConfirmEmail;
