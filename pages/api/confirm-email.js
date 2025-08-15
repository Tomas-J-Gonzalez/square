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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const token = req.method === 'GET' ? (req.query.token || '') : (req.body?.token || '');
    if (!token) return res.status(400).json({ success: false, error: 'Missing token' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // require service role key
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase service role key missing' });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find token
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('id, token, used')
      .eq('token', token)
      .maybeSingle();

    if (error) return res.status(500).json({ success: false, error: `Token lookup failed: ${error.message || 'unknown error'}` });
    if (!data || data.used === true) return res.status(400).json({ success: false, error: 'Invalid or expired confirmation token' });

    // Update local user storage to mark email as confirmed
    const users = getUsers();
    let userFound = false;
    
    for (let i = 0; i < users.length; i++) {
      if (users[i].emailConfirmationToken === token) {
        users[i].emailConfirmed = true;
        users[i].updatedAt = new Date().toISOString();
        userFound = true;
        break;
      }
    }

    if (!userFound) {
      return res.status(404).json({ success: false, error: 'User not found for this confirmation token' });
    }

    // Save updated users
    saveUsers(users);

    // Mark token as used in Supabase
    await supabase.from('email_confirmations').update({ used: true }).eq('id', data.id);

    return res.status(200).json({ success: true, message: 'Email confirmed successfully! You can now log in.' });
  } catch (e) {
    console.error('Email confirmation error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


