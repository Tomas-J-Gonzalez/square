// Authentication Service for user management
// Provides user authentication, registration, and profile management

const USERS_STORAGE_KEY = 'show-up-or-else-users';
const CURRENT_USER_KEY = 'show-up-or-else-current-user';

// Email validation - now allows any valid email domain

// Admin credentials (in production, this should be in environment variables)
// Note: We deliberately do not use a real password for the admin helper account
// to avoid browser password breach nags. Admin login is handled via a dedicated
// button and session bootstrap in the UI.
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

// Email confirmation tokens storage
const EMAIL_CONFIRMATION_TOKENS_KEY = 'show-up-or-else-email-confirmations';

import { sendConfirmationEmail as sendEmail } from './emailService.js';

/**
 * User structure
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {string} name - User display name
 * @property {string} passwordHash - Hashed password (not plain text)
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} lastLoginAt - Last login timestamp
 * @property {Array} eventIds - Array of event IDs created by user
 * @property {boolean} emailConfirmed - Whether email has been confirmed
 * @property {string} emailConfirmationToken - Token for email confirmation
 */

/**
 * Email confirmation token structure
 * @typedef {Object} EmailConfirmation
 * @property {string} token - Unique confirmation token
 * @property {string} email - Email address to confirm
 * @property {string} userId - User ID
 * @property {string} createdAt - Token creation timestamp
 * @property {boolean} used - Whether token has been used
 */

/**
 * Creates a simple hash for password (in production, use bcrypt or similar)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPassword = (password) => {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(password + 'salt'); // Base64 encoding with salt
};

/**
 * Verifies password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored password hash
 * @returns {boolean} True if password matches
 */
const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

/**
 * Gets all users from localStorage
 * @returns {Array<User>} Array of users
 */
const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
};

// --- Cookie helpers for session redundancy (prevents logout on refresh if storage races) ---
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name, value, days = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

/**
 * Returns all users without sensitive fields
 * @returns {Array<User>} Users without passwordHash
 */
const listUsers = () => {
  const users = getUsers();
  return users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);
};

/**
 * Saves users to localStorage
 * @param {Array<User>} users - Users to save
 */
const saveUsers = (users) => {
  try {
    if (!Array.isArray(users)) {
      throw new Error('Users must be an array');
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
    throw new Error('Failed to save events');
  }
};

/**
 * Gets email confirmation tokens from localStorage
 * @returns {Array<EmailConfirmation>} Array of confirmation tokens
 */
const getEmailConfirmations = () => {
  try {
    const confirmations = localStorage.getItem(EMAIL_CONFIRMATION_TOKENS_KEY);
    return confirmations ? JSON.parse(confirmations) : [];
  } catch (error) {
    console.error('Error reading email confirmations from localStorage:', error);
    return [];
  }
};

/**
 * Saves email confirmation tokens to localStorage
 * @param {Array<EmailConfirmation>} confirmations - Confirmations to save
 */
const saveEmailConfirmations = (confirmations) => {
  try {
    if (!Array.isArray(confirmations)) {
      throw new Error('Confirmations must be an array');
    }
    localStorage.setItem(EMAIL_CONFIRMATION_TOKENS_KEY, JSON.stringify(confirmations));
  } catch (error) {
    console.error('Error saving email confirmations to localStorage:', error);
    throw new Error('Failed to save email confirmations');
  }
};

/**
 * Generates a random confirmation token
 * @returns {string} Random token
 */
const generateConfirmationToken = () => {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
};

/**
 * Sends an email confirmation using the backend API
 * @param {string} email - Email address
 * @param {string} token - Confirmation token
 * @param {string} name - User name
 * @param {string} userId - User ID
 */
const sendConfirmationEmail = async (email, token, name, userId) => {
  try {
    const result = await sendEmail({ email, name, token });
    if (result?.confirmationUrl) {
      console.log('Email confirmation URL:', result.confirmationUrl);
    }

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      // Fallback to console logging for demo
      const confirmationUrl = `${window.location.origin}/confirm-email?token=${token}`;
      console.log('=== EMAIL CONFIRMATION (FALLBACK) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: Confirm your Show Up or Else account`);
      console.log(`Hi ${name},`);
      console.log(`Please click the following link to confirm your account:`);
      console.log(confirmationUrl);
      console.log('================================');
    } else {
      console.log('Email sent successfully via Resend:', result.data);
    }

    // Store the confirmation token
    const confirmations = getEmailConfirmations();
    confirmations.push({
      token,
      email,
      name,
      userId,
      confirmationUrl: `${window.location.origin}/confirm-email?token=${token}`,
      createdAt: new Date().toISOString(),
      used: false
    });
    saveEmailConfirmations(confirmations);

  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback to console logging
    const confirmationUrl = `${window.location.origin}/confirm-email?token=${token}`;
    console.log('=== EMAIL CONFIRMATION (FALLBACK) ===');
    console.log(`To: ${email}`);
          console.log(`Subject: Confirm your Show Up or Else account`);
    console.log(`Hi ${name},`);
    console.log(`Please click the following link to confirm your account:`);
    console.log(confirmationUrl);
    console.log('================================');
    
    // Store the confirmation token
    const confirmations = getEmailConfirmations();
    confirmations.push({
      token,
      email,
      name,
      userId,
      confirmationUrl,
      createdAt: new Date().toISOString(),
      used: false
    });
    saveEmailConfirmations(confirmations);
  }
};

/**
 * Validates email format (allows any valid email domain)
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: 'Email is valid' };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @returns {User} Created user (without password)
 * @throws {Error} If validation fails or user already exists
 */
const registerUser = (userData) => {
  // Validate input
  if (!userData.email?.trim()) {
    throw new Error('Email is required');
  }
  if (!userData.name?.trim()) {
    throw new Error('Name is required');
  }
  if (!userData.password) {
    throw new Error('Password is required');
  }

  const email = userData.email.trim().toLowerCase();
  const name = userData.name.trim();

  // Validate email format and whitelist
  const emailValidation = isValidEmail(email);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.message);
  }

  // Validate password strength
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }

  // Check if user already exists
  const users = getUsers();
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    // If the account is already confirmed, block duplicate registration
    if (existingUser.emailConfirmed) {
      throw new Error('An account with this email already exists');
    }

    // Allow re-registration for unconfirmed accounts: refresh credentials and token
    const refreshedToken = generateConfirmationToken();
    const existingUserIndex = users.findIndex(u => u.id === existingUser.id);

    const updatedUnconfirmedUser = {
      ...existingUser,
      name,
      passwordHash: hashPassword(userData.password),
      updatedAt: new Date().toISOString(),
      emailConfirmed: false,
      emailConfirmationToken: refreshedToken
    };

    users[existingUserIndex] = updatedUnconfirmedUser;
    saveUsers(users);

    // Resend confirmation email (async)
    sendConfirmationEmail(email, refreshedToken, name, updatedUnconfirmedUser.id).catch(error => {
      console.error('Failed to send confirmation email:', error);
    });

    const { passwordHash, ...userWithoutPassword } = updatedUnconfirmedUser;
    return userWithoutPassword;
  }

  // Create new user (unconfirmed)
  const confirmationToken = generateConfirmationToken();
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    passwordHash: hashPassword(userData.password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    eventIds: [],
    emailConfirmed: false,
    emailConfirmationToken: confirmationToken
  };

  // Save user
  users.push(newUser);
  saveUsers(users);

  // Send confirmation email (async but don't wait for it)
  sendConfirmationEmail(email, confirmationToken, name, newUser.id).catch(error => {
    console.error('Failed to send confirmation email:', error);
  });

  // Return user without password
  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Checks if credentials match admin credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean} True if admin credentials
 */
const isAdminCredentials = (username, password) => {
  // Keep for backwards compatibility but discourage using password inputs for admin
  const isAdminUser = username === ADMIN_CREDENTIALS.username || username === 'admin@example.com';
  return isAdminUser && password === ADMIN_CREDENTIALS.password;
};

/**
 * Logs in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {User} Logged in user (without password)
 * @throws {Error} If credentials are invalid
 */
const loginUser = (email, password) => {
  if (!email?.trim()) {
    throw new Error('Email is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }

  const emailLower = email.trim().toLowerCase();

  // Admin bypass: allow login without an existing account or confirmation
  // For admin, prefer using the dedicated button (no password submission).
  // If someone still submits admin/admin, allow it for dev parity but this may
  // trigger browser breach warnings.
  if (isAdminCredentials(emailLower, password)) {
    const adminUser = {
      id: 'admin',
      email: 'admin@example.com',
      name: 'Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eventIds: [],
      emailConfirmed: true
    };
    setCurrentUser(adminUser);
    return adminUser;
  }
  const users = getUsers();
  const user = users.find(u => u.email === emailLower);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password');
  }

  // Require email confirmation before login
  if (!user.emailConfirmed) {
    try {
      // Fire-and-forget resend to help user get a fresh link
      resendConfirmationEmail(user.email);
    } catch (_) {}
    throw new Error('Please confirm your email address before signing in. We just sent you a new confirmation email.');
  }

  // Update last login time
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const userIndex = users.findIndex(u => u.id === user.id);
  users[userIndex] = user;
  saveUsers(users);

  // Set current user
  const { passwordHash, ...userWithoutPassword } = user;
  setCurrentUser(userWithoutPassword);

  // Events are now stored in Supabase, no need to clear localStorage
  // Removed the problematic async import that was causing compilation errors

  return userWithoutPassword;
};

/**
 * Logs out current user
 */
const logoutUser = () => {
  setCurrentUser(null);
};

/**
 * Updates user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {User} Updated user (without password)
 * @throws {Error} If user not found or validation fails
 */
const updateUserProfile = (userId, updates) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const user = users[userIndex];

  // Validate email if being updated
  if (updates.email) {
    const emailValidation = isValidEmail(updates.email.trim().toLowerCase());
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }
    
    // Check if email is already taken by another user
    const existingUser = users.find(u => u.email === updates.email.trim().toLowerCase() && u.id !== userId);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }
    
    user.email = updates.email.trim().toLowerCase();
  }

  // Validate name if being updated
  if (updates.name) {
    const name = updates.name.trim();
    if (!name) {
      throw new Error('Name is required');
    }
    user.name = name;
  }

  // Update timestamps
  user.updatedAt = new Date().toISOString();

  // Save updated user
  users[userIndex] = user;
  saveUsers(users);

  // Update current user if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const { passwordHash, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Changes user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 * @throws {Error} If validation fails
 */
const changePassword = (userId, currentPassword, newPassword) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!currentPassword) {
    throw new Error('Current password is required');
  }
  if (!newPassword) {
    throw new Error('New password is required');
  }

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const user = users[userIndex];

  // Verify current password
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }

  // Update password
  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();

  // Save updated user
  users[userIndex] = user;
  saveUsers(users);

  return true;
};

/**
 * Deletes user account
 * @param {string} userId - User ID
 * @param {string} password - User password for confirmation
 * @returns {boolean} Success status
 * @throws {Error} If validation fails
 */
const deleteAccount = (userId, password) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!password) {
    throw new Error('Password is required for account deletion');
  }

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const user = users[userIndex];

  // Verify password
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('Password is incorrect');
  }

  // Remove user
  users.splice(userIndex, 1);
  saveUsers(users);

  // Logout if it's the current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logoutUser();
  }

  return true;
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if user is logged in
 */
const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Gets user by ID
 * @param {string} userId - User ID
 * @returns {User|null} User or null if not found
 */
const getUserById = (userId) => {
  if (!userId) return null;
  
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Confirms user email with token
 * @param {string} token - Confirmation token
 * @returns {Object} Result with success status and message
 */
const confirmEmail = (token) => {
  console.log('🔍 confirmEmail: Called with token:', token);
  
  if (!token) {
    console.log('❌ confirmEmail: No token provided');
    return { success: false, message: 'Invalid confirmation token' };
  }

  const confirmations = getEmailConfirmations();
  console.log('🔍 confirmEmail: All confirmations:', confirmations);
  
  const confirmation = confirmations.find(c => c.token === token && !c.used);
  console.log('🔍 confirmEmail: Found confirmation:', confirmation);

  if (!confirmation) {
    console.log('❌ confirmEmail: No valid confirmation found');
    return { success: false, message: 'Invalid or expired confirmation token' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === confirmation.userId);

  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }

  // Mark user as confirmed
  users[userIndex].emailConfirmed = true;
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);

  // Mark confirmation as used
  const confirmationIndex = confirmations.findIndex(c => c.token === token);
  confirmations[confirmationIndex].used = true;
  saveEmailConfirmations(confirmations);

  return { success: true, message: 'Email confirmed successfully! You can now log in.' };
};

/**
 * Resends confirmation email
 * @param {string} email - User email
 * @returns {Object} Result with success status and message
 */
const resendConfirmationEmail = (email) => {
  if (!email?.trim()) {
    return { success: false, message: 'Email is required' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email.trim().toLowerCase());

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  if (user.emailConfirmed) {
    return { success: false, message: 'Email is already confirmed' };
  }

  // Generate new confirmation token
  const newToken = generateConfirmationToken();
  user.emailConfirmationToken = newToken;
  user.updatedAt = new Date().toISOString();

  const userIndex = users.findIndex(u => u.id === user.id);
  users[userIndex] = user;
  saveUsers(users);

  // Send new confirmation email
  sendConfirmationEmail(user.email, newToken, user.name, user.id);

  return { success: true, message: 'Confirmation email sent successfully!' };
};

/**
 * Gets current logged-in user
 * @returns {User|null} Current user or null
 */
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    if (user) return JSON.parse(user);
    // Fallback to cookie session if storage is empty (e.g., SSR hydration race)
    const cookieUser = getCookie(CURRENT_USER_KEY);
    return cookieUser ? JSON.parse(cookieUser) : null;
  } catch (error) {
    console.error('Error reading current user from localStorage:', error);
    return null;
  }
};

/**
 * Sets current logged-in user
 * @param {User|null} user - User to set as current
 */
const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      setCookie(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      deleteCookie(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
    throw new Error('Failed to set current user');
  }
};

/**
 * Validates event data
 * @param {Object} eventData - Event data to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
const validateEventData = (eventData) => {
  if (!eventData) {
    throw new Error('Event data is required');
  }
  
  if (!eventData.title?.trim()) {
    throw new Error('Event title is required');
  }
  
  if (!eventData.date) {
    throw new Error('Event date is required');
  }
  
  if (!eventData.time) {
    throw new Error('Event time is required');
  }
  
  if (!eventData.decisionMode) {
    throw new Error('Decision mode is required');
  }
  
  if (!eventData.punishment?.trim()) {
    throw new Error('Punishment is required');
  }
  
  return true;
};

export const authService = {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  changePassword,
  deleteAccount,
  getCurrentUser,
  setCurrentUser,
  isAuthenticated,
  getUserById,
  validatePassword,
  isValidEmail,
  confirmEmail,
  resendConfirmationEmail,
  isAdminCredentials,
  listUsers
};

// Export isValidEmail function directly for use in other files
export { isValidEmail };

/**
 * Sets a new password for a user identified by email (used by reset flow)
 * @param {string} email
 * @param {string} newPassword
 */
export const setPasswordForEmail = (email, newPassword) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === (email || '').trim().toLowerCase());
  if (idx === -1) throw new Error('User not found');
  const validation = validatePassword(newPassword);
  if (!validation.isValid) throw new Error(validation.message);
  users[idx].passwordHash = hashPassword(newPassword);
  users[idx].updatedAt = new Date().toISOString();
  saveUsers(users);
  // Update current user cache if matches
  const current = getCurrentUser();
  if (current && current.email === users[idx].email) {
    const { passwordHash, ...userWithout } = users[idx];
    setCurrentUser(userWithout);
  }
  return true;
};
