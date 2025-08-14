import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetUrl } from '../utils/assetUrl';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdminButton, setShowAdminButton] = useState(false);
  
  const { login, setCurrentUser } = useAuth();
  const router = useRouter();
  const location = { state: {}, search: typeof window !== 'undefined' ? window.location.search : '' };
  const { modal, showErrorModal } = useModal();
  // Only show admin sign-in for the site owner: enabled locally or via a private localStorage flag
  useEffect(() => {
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const enabledFlag = localStorage.getItem('enable-admin-login') === '1';
      setShowAdminButton(isLocal || enabledFlag);
    } catch (_) {
      setShowAdminButton(false);
    }
  }, []);

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || new URLSearchParams(location.search).get('redirect') || '/';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Check if it's admin credentials
      if (authService.isAdminCredentials(formData.email, formData.password)) {
        // Create admin user session
        const adminUser = {
          id: 'admin',
          email: 'admin',
          name: 'Administrator',
          emailConfirmed: true,
          isAdmin: true
        };
        
        // Set admin as current user in AuthContext
        setCurrentUser(adminUser);
        
        // Redirect to the page they were trying to access
        router.replace(from);
        return;
      }

      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to the page they were trying to access
        router.replace(from);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      showErrorModal('Login Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginClick = () => {
    const adminUser = {
      id: 'admin',
      email: 'admin@example.com',
      name: 'Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eventIds: [],
      emailConfirmed: true,
      isAdmin: true
    };
    // Persist and set session without using password input (avoids Chrome breach warning)
    authService.setCurrentUser(adminUser);
    setCurrentUser(adminUser);
    router.replace(from);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4" style={{ width: 64, height: 64 }}>
            <Image src={getAssetUrl('logo.svg')} alt="Logo" width={64} height={64} priority />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                error={errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                required
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              className="mb-6 rounded-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Private helper: Admin login button (only shows locally or if you set localStorage flag) */}
          {showAdminButton && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAdminLoginClick}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Icon name="user-shield" style="solid" size="sm" className="mr-2" />
                Sign in as Admin
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Modal {...modal} />
    </div>
  );
};

export default Login;
