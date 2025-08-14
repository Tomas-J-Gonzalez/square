import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);



  // Initialize auth state on app load (client-side only)
  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if current user is admin
  const isAdmin = currentUser?.isAdmin || false;

  const login = async (email, password) => {
    try {
      const user = authService.loginUser(email, password);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const user = authService.registerUser(userData);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logoutUser();
    setCurrentUser(null);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = authService.updateUserProfile(currentUser.id, updates);
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await authService.changePassword(currentUser.id, currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async (password) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await authService.deleteAccount(currentUser.id, password);
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    isAuthenticated: !!currentUser,
    isAdmin,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
