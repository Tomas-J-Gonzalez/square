// localStorage Service - Best Practices Implementation
// Only stores non-sensitive preferences and UX improvements

const STORAGE_KEYS = {
  // UX Preferences (safe to store)
  DARK_MODE: 'show-up-or-else-dark-mode',
  LAST_VIEWED_TAB: 'show-up-or-else-last-tab',
  EVENT_FILTERS: 'show-up-or-else-event-filters',
  NOTIFICATION_PREFERENCES: 'show-up-or-else-notifications',
  
  // Development flags (safe for dev only)
  ADMIN_LOGIN_ENABLED: 'show-up-or-else-admin-login-enabled',
  
  // Temporary UI state (safe to store)
  MODAL_STATE: 'show-up-or-else-modal-state',
  FORM_DRAFTS: 'show-up-or-else-form-drafts'
};

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Parsed value or default
 */
const getItem = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
const setItem = (key, value) => {
  try {
    if (typeof window === 'undefined') return;
    
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 */
const removeItem = (key) => {
  try {
    if (typeof window === 'undefined') return;
    
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
};

/**
 * Clear all app-related localStorage items
 */
const clearAll = () => {
  try {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
};

// UX Preferences
export const getDarkMode = () => getItem(STORAGE_KEYS.DARK_MODE, false);
export const setDarkMode = (enabled) => setItem(STORAGE_KEYS.DARK_MODE, enabled);

export const getLastViewedTab = () => getItem(STORAGE_KEYS.LAST_VIEWED_TAB, 'home');
export const setLastViewedTab = (tab) => setItem(STORAGE_KEYS.LAST_VIEWED_TAB, tab);

export const getEventFilters = () => getItem(STORAGE_KEYS.EVENT_FILTERS, {});
export const setEventFilters = (filters) => setItem(STORAGE_KEYS.EVENT_FILTERS, filters);

export const getNotificationPreferences = () => getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, { email: true, push: false });
export const setNotificationPreferences = (preferences) => setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, preferences);

// Development flags
export const isAdminLoginEnabled = () => getItem(STORAGE_KEYS.ADMIN_LOGIN_ENABLED, false);
export const setAdminLoginEnabled = (enabled) => setItem(STORAGE_KEYS.ADMIN_LOGIN_ENABLED, enabled);

// Temporary UI state
export const getModalState = () => getItem(STORAGE_KEYS.MODAL_STATE, {});
export const setModalState = (state) => setItem(STORAGE_KEYS.MODAL_STATE, state);

export const getFormDrafts = () => getItem(STORAGE_KEYS.FORM_DRAFTS, {});
export const setFormDrafts = (drafts) => setItem(STORAGE_KEYS.FORM_DRAFTS, drafts);
export const saveFormDraft = (formId, data) => {
  const drafts = getFormDrafts();
  drafts[formId] = { data, timestamp: Date.now() };
  setFormDrafts(drafts);
};
export const getFormDraft = (formId) => {
  const drafts = getFormDrafts();
  return drafts[formId] || null;
};
export const clearFormDraft = (formId) => {
  const drafts = getFormDrafts();
  delete drafts[formId];
  setFormDrafts(drafts);
};

// Utility functions
export const localStorageService = {
  getItem,
  setItem,
  removeItem,
  clearAll,
  STORAGE_KEYS
};

export default localStorageService;
