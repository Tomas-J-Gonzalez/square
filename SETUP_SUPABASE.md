# Supabase Setup Guide

This guide will help you set up Supabase for your "Be there or be square" app.

## 🔧 Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `be-there-or-be-square` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

## 🔑 Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll see two important sections:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **API Keys**: 
     - `anon public` (for client-side)
     - `service_role` (for server-side)

## 📝 Step 3: Update Your .env File

Add these lines to your `.env` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Keep your existing variables
RESEND_API_KEY=re_iEkiEEsX_8FsnbQ7idPkVWgFkKcjipQVB
FRONTEND_URL=http://localhost:5173
PORT=3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Replace the placeholder values with your actual Supabase credentials.**

## 🗄️ Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-rsvp-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- `users` table (for user accounts)
- `email_confirmations` table (for email verification)
- `events` table (for events)
- `event_rsvps` table (for RSVPs)
- All necessary indexes and RLS policies

## 🧪 Step 5: Test the Connection

Run the database connection test:

```bash
node test-db-connection.js
```

This will verify:
- ✅ Environment variables are set correctly
- ✅ Database connection works
- ✅ All required tables exist

## 🚀 Step 6: Test Registration

1. Start your development server: `npm run dev`
2. Go to your app and try to register a new account
3. You should see the registration work without the "Database error" message

## 🔍 Troubleshooting

### "Database error while checking existing user"

This usually means:
1. **Missing environment variables** - Check your `.env` file
2. **Tables don't exist** - Run the schema setup
3. **Wrong API keys** - Verify your Supabase credentials

### "relation 'users' does not exist"

This means the database schema hasn't been set up:
1. Go to Supabase dashboard → SQL Editor
2. Run the schema from `supabase-rsvp-schema.sql`

### "Invalid API key"

This means your API keys are incorrect:
1. Go to Supabase dashboard → Settings → API
2. Copy the correct keys
3. Update your `.env` file

## 📋 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client-side | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side | ✅ |
| `RESEND_API_KEY` | For sending emails | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Your app's public URL | ✅ |

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- **Keep your service role key secret** - it has admin privileges
- **Use the anon key for client-side** operations
- **Use the service role key only for server-side** operations

## 🎉 You're Ready!

Once you've completed these steps, your app should work with:
- ✅ User registration and login
- ✅ Email confirmation
- ✅ Event creation and management
- ✅ RSVP system for both users and guests
- ✅ Real-time participant updates

If you encounter any issues, run the test script and check the troubleshooting section above.
