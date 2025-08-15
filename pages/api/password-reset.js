import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper functions to manage local user storage (similar to authService)
const getUsersFilePath = () => path.join(process.cwd(), 'users.json');

const getUsers = () => {
  try {
    if (!fs.existsSync(getUsersFilePath())) return [];
    const data = fs.readFileSync(getUsersFilePath(), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(getUsersFilePath(), JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
    throw new Error('Failed to save users');
  }
};

const hashPassword = (password) => {
  // Simple hash for demo - matches the one in authService
  return btoa(password + 'salt'); // Base64 encoding with salt
};

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { token, email, newPassword } = req.body || {};
    if (!token || !email || !newPassword) return res.status(400).json({ success: false, error: 'Missing fields' });

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ success: false, error: passwordValidation.message });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase not configured' });
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate token
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('id, token, used')
      .eq('token', token)
      .maybeSingle();
    if (error) return res.status(500).json({ success: false, error: 'Token lookup failed' });
    if (!data || data.used) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    // Update user password in local storage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email.trim().toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update password
    users[userIndex].passwordHash = hashPassword(newPassword);
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);

    // Mark token as used
    await supabase.from('email_confirmations').update({ used: true }).eq('id', data.id);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    console.error('Password reset error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


