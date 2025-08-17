'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '../../lib/validations';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import Button from '../Button';
import NotificationModal from '../Modal';
import { useModal } from '../../hooks/useModal';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const successModal = useModal();
  const errorModal = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.name);
      
      if (error) {
        errorModal.open();
      } else {
        successModal.open();
        reset();
      }
    } catch (error) {
      errorModal.open();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Enter your full name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email address"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Create a password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="Confirm your password"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          Create Account
        </Button>

        <p className="text-sm text-gray-600 text-center">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-pink-600 hover:text-pink-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-pink-600 hover:text-pink-500">
            Privacy Policy
          </a>
        </p>
      </form>

      {/* Success Modal */}
      <NotificationModal
        isOpen={successModal.isOpen}
        onClose={successModal.close}
        title="Account Created Successfully!"
        message="Please check your email to confirm your account before logging in."
        variant="success"
        autoClose={true}
        autoCloseDelay={5000}
      />

      {/* Error Modal */}
      <NotificationModal
        isOpen={errorModal.isOpen}
        onClose={errorModal.close}
        title="Account Creation Failed"
        message="There was an error creating your account. Please try again."
        variant="danger"
        autoClose={true}
        autoCloseDelay={5000}
      />
    </>
  );
}
