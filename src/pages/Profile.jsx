import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

const Profile = () => {
  const { currentUser, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const router = useRouter();
  const { modal, showErrorModal, showSuccessModal, showConfirmModal } = useModal();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Delete account state
  const [deleteForm, setDeleteForm] = useState({
    password: ''
  });
  const [deleteErrors, setDeleteErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileErrors({});

    try {
      const result = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      });

      if (result.success) {
        showSuccessModal('Profile Updated', 'Your profile has been updated successfully.');
        setProfileForm({
          name: result.user.name,
          email: result.user.email
        });
      } else {
        setProfileErrors({ general: result.error });
      }
    } catch (error) {
      showErrorModal('Update Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const validation = authService.validatePassword(passwordForm.newPassword);
      if (!validation.isValid) {
        errors.newPassword = validation.message;
      }
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    setPasswordErrors({});

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

      if (result.success) {
        showSuccessModal('Password Changed', 'Your password has been changed successfully.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength(null);
      } else {
        setPasswordErrors({ general: result.error });
      }
    } catch (error) {
      showErrorModal('Password Change Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!deleteForm.password) {
      setDeleteErrors({ password: 'Password is required for account deletion' });
      return;
    }

    setLoading(true);
    setDeleteErrors({});

    try {
      const result = await deleteAccount(deleteForm.password);

      if (result.success) {
        showSuccessModal('Account Deleted', 'Your account has been deleted successfully.');
        logout();
        router.push('/');
      } else {
        setDeleteErrors({ general: result.error });
      }
    } catch (error) {
      showErrorModal('Delete Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword' && value) {
      const validation = authService.validatePassword(value);
      setPasswordStrength(validation);
    } else if (name === 'newPassword') {
      setPasswordStrength(null);
    }

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    
    switch (formType) {
      case 'profile':
        setProfileForm(prev => ({ ...prev, [name]: value }));
        if (profileErrors[name]) {
          setProfileErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
      case 'delete':
        setDeleteForm(prev => ({ ...prev, [name]: value }));
        if (deleteErrors[name]) {
          setDeleteErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
    }
  };

  const confirmDeleteAccount = () => {
    showConfirmModal(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      handleDeleteAccount,
      () => {}
    );
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'text-gray-400';
    return passwordStrength.isValid ? 'text-green-600' : 'text-red-600';
  };

  const isAdmin = currentUser?.id === 'admin' || currentUser?.email === 'admin@example.com';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'password', label: 'Password', icon: 'lock' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Tools', icon: 'wrench' }] : []),
    { id: 'delete', label: 'Delete Account', icon: 'trash' }
  ];

  return (
    <div className="section">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon name={tab.icon} style="solid" size="sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileSubmit}>
              {profileErrors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{profileErrors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              {passwordErrors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{passwordErrors.general}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  {passwordStrength && (
                    <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                      {passwordStrength.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Tools</h2>
            <div className="space-y-6">
              {/* Users List */}
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4">All Users</h3>
                <UsersTable />
              </div>
              {/* Runtime environment info */}
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Environment</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>Site URL: {import.meta.env.VITE_FRONTEND_URL || import.meta.env.VITE_SITE_URL || import.meta.env.VITE_VERCEL_API_BASE || window.location.origin}</li>
                  <li>Environment: {import.meta.env.MODE}</li>
                  <li>Platform: Vercel</li>
                  <li>Email Provider: Resend</li>
                </ul>
              </div>

              {/* Connected APIs */}
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Connected APIs</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>Resend Email API: {import.meta.env.VITE_RESEND_ENABLED === 'false' ? 'Disabled' : 'Enabled'}</li>
                  <li>Email endpoint: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/send-confirmation-email</code></li>
                </ul>
              </div>

              {/* Backends/services */}
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Services</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>LocalStorage: Users, Events, Email Confirmations</li>
                  <li>API: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/*</code> (Vercel)</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Clear Local Data</h3>
                <p className="text-gray-600 mb-4">Removes users, sessions, confirmations and events from this browser.</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => window.open('/clear-data.html', '_blank')}>Open Clear Data</Button>
                  <Button variant="danger" onClick={() => {
                    try {
                      const keys = [
                        'be-there-or-be-square-users',
                        'be-there-or-be-square-current-user',
                        'be-there-or-be-square-email-confirmations',
                        'be-there-or-be-square-events'
                      ];
                      keys.forEach(k => localStorage.removeItem(k));
                      showSuccessModal('Cleared', 'All local data was cleared for this site.');
                    } catch (e) {
                      showErrorModal('Error', 'Failed to clear local data.');
                    }
                  }}>Clear Now</Button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Seed Demo Data</h3>
                <p className="text-gray-600 mb-4">Creates a demo user and sample events to preview the UI.</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => window.open('/seed-demo.html', '_blank')}>Open Seed Demo</Button>
                  <Button variant="primary" onClick={() => {
                    try {
                      const usersKey = 'be-there-or-be-square-users';
                      const eventsKey = 'be-there-or-be-square-events';
                      const confirmationsKey = 'be-there-or-be-square-email-confirmations';
                      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      const demoUsers = [{
                        id: userId,
                        email: 'demo@example.com',
                        name: 'Demo User',
                        passwordHash: btoa('password' + 'salt'),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastLoginAt: new Date().toISOString(),
                        eventIds: [],
                        emailConfirmed: true,
                        emailConfirmationToken: null
                      }];
                      const now = Date.now();
                      const demoEvents = [
                        {
                          id: `event_${now}_a`,
                          title: 'Movie Night',
                          date: new Date(now + 86400000).toISOString().split('T')[0],
                          time: '19:00',
                          decisionMode: 'democracy',
                          punishment: 'Buy snacks',
                          createdBy: userId,
                          createdAt: new Date().toISOString(),
                        },
                        {
                          id: `event_${now}_b`,
                          title: 'Hike',
                          date: new Date(now + 172800000).toISOString().split('T')[0],
                          time: '08:30',
                          decisionMode: 'democracy',
                          punishment: 'Carry water',
                          createdBy: userId,
                          createdAt: new Date().toISOString(),
                        }
                      ];
                      localStorage.setItem(usersKey, JSON.stringify(demoUsers));
                      localStorage.setItem(eventsKey, JSON.stringify(demoEvents));
                      localStorage.setItem(confirmationsKey, JSON.stringify([]));
                      showSuccessModal('Seeded', 'Demo user and events have been created.');
                    } catch (e) {
                      showErrorModal('Error', 'Failed to seed demo data.');
                    }
                  }}>Seed Now</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="exclamation-triangle" style="solid" size="lg" className="text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            
            <form onSubmit={confirmDeleteAccount}>
              {deleteErrors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{deleteErrors.general}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm your password
                </label>
                <input
                  type="password"
                  id="deletePassword"
                  name="password"
                  value={deleteForm.password}
                  onChange={(e) => handleInputChange(e, 'delete')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your password to confirm"
                  required
                />
                {deleteErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{deleteErrors.password}</p>
                )}
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="danger"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Deleting Account...' : 'Delete Account'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Modal {...modal} />
    </div>
  );
};

export default Profile;

// UsersTable subcomponent
const UsersTable = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        
        // Get local users
        const localUsers = authService.listUsers();
        
        // Try to get users from Supabase as well
        let serverUsers = [];
        try {
          const { supabase } = await import('../../lib/supabaseClient');
          if (supabase) {
            const { data: rsvps } = await supabase
              .from('event_rsvps')
              .select('name, email, created_at')
              .not('name', 'is', null);
            
            if (Array.isArray(rsvps)) {
              // Convert RSVPs to user-like objects
              serverUsers = rsvps.map((rsvp, index) => ({
                id: `server_user_${index}`,
                name: rsvp.name,
                email: rsvp.email || `${rsvp.name}@guest.local`,
                createdAt: rsvp.created_at,
                updatedAt: rsvp.created_at,
                lastLoginAt: null,
                emailConfirmed: true,
                source: 'server'
              }));
            }
          }
        } catch (error) {
          console.warn('Could not fetch server users:', error);
        }
        
        // Combine local and server users, removing duplicates by email
        const emailMap = new Map();
        
        // Add local users first
        localUsers.forEach(user => {
          emailMap.set(user.email.toLowerCase(), { ...user, source: 'local' });
        });
        
        // Add server users, only if not already in local
        serverUsers.forEach(user => {
          if (!emailMap.has(user.email.toLowerCase())) {
            emailMap.set(user.email.toLowerCase(), user);
          }
        });
        
        setUsers(Array.from(emailMap.values()));
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
        <span className="ml-2 text-sm text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (!users.length) {
    return <p className="text-sm text-gray-600">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4">Updated</th>
            <th className="py-2 pr-4">Last Login</th>
            <th className="py-2 pr-4">Email Confirmed</th>
            <th className="py-2 pr-4">Source</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-100">
              <td className="py-2 pr-4 whitespace-nowrap">{u.name}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{u.email}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-'}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '-'}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{u.emailConfirmed ? 'Yes' : 'No'}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  u.source === 'server' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {u.source === 'server' ? 'Server' : 'Local'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
