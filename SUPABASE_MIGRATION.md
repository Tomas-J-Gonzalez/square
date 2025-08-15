# Supabase Migration Guide

This document outlines the migration from localStorage-based user management to Supabase as the single source of truth for authentication and user data.

## Overview

The application has been refactored to use Supabase for all user authentication, registration, and email confirmation flows. This provides better security, scalability, and data consistency.

## Database Schema

### Required Tables

Run the SQL in `supabase-schema.sql` in your Supabase SQL editor to create the necessary tables:

1. **`users`** - Stores user account information
2. **`email_confirmations`** - Stores email confirmation tokens
3. **`events`** - Stores event information (existing)
4. **`event_rsvps`** - Stores RSVP responses (existing)

### Key Features

- **Secure password hashing** using bcrypt
- **Token expiration** (24 hours for confirmation tokens)
- **Automatic cleanup** of expired tokens
- **Row Level Security (RLS)** policies for data protection
- **Proper indexing** for performance

## Environment Variables

Ensure these environment variables are set:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# Application URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## API Endpoints

### 1. User Registration
- **Endpoint**: `POST /api/register`
- **Purpose**: Create new user accounts
- **Features**:
  - Validates email format and password strength
  - Checks for existing users
  - Generates confirmation tokens
  - Sends confirmation emails
  - Handles re-registration for unconfirmed accounts

### 2. Email Confirmation
- **Endpoint**: `GET /api/confirm-email?token=xyz`
- **Purpose**: Confirm user email addresses
- **Features**:
  - Validates confirmation tokens
  - Checks token expiration
  - Updates user confirmation status
  - Cleans up used tokens
  - Returns proper HTTP status codes

### 3. User Login
- **Endpoint**: `POST /api/login`
- **Purpose**: Authenticate users
- **Features**:
  - Validates credentials
  - Checks email confirmation status
  - Updates last login time
  - Supports admin login
  - Returns user data (without password)

### 4. Email Sending
- **Endpoint**: `POST /api/send-confirmation-email`
- **Purpose**: Send confirmation emails
- **Features**:
  - Uses Resend for email delivery
  - Beautiful HTML templates
  - Center-aligned content
  - Fallback text links

## Client-Side Changes

### Registration Flow
1. User fills registration form
2. Client calls `/api/register`
3. Server creates user in Supabase
4. Server generates confirmation token
5. Server sends confirmation email
6. User receives email with confirmation link

### Confirmation Flow
1. User clicks confirmation link
2. Link points to `/confirm-email?token=xyz`
3. Client calls `/api/confirm-email?token=xyz`
4. Server validates token and confirms user
5. User is redirected to login page

### Login Flow
1. User enters credentials
2. Client calls `/api/login`
3. Server validates credentials against Supabase
4. Server returns user data
5. Client stores user in session

## Security Features

- **Password hashing** with bcrypt (12 rounds)
- **Token expiration** (24 hours)
- **Secure token generation** using crypto-safe methods
- **Row Level Security** policies
- **Input validation** and sanitization
- **Proper error handling** without information leakage

## Migration Steps

### 1. Database Setup
```sql
-- Run the schema in supabase-schema.sql
```

### 2. Environment Configuration
```bash
# Add Supabase environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies
```bash
npm install bcryptjs
```

### 4. Deploy API Endpoints
The new API endpoints are:
- `/pages/api/register.js`
- `/pages/api/confirm-email.js`
- `/pages/api/login.js`

### 5. Update Client Code
The client-side code has been updated to use the new APIs:
- `src/contexts/AuthContext.jsx`
- `src/pages/ConfirmEmail.jsx`

## Example Confirmation Link

When a user registers, they receive an email with a confirmation link like:
```
https://yourdomain.com/confirm-email?token=abc123def456ghi789
```

After clicking the link:
1. The token is validated in Supabase
2. The user's `email_confirmed` field is set to `true`
3. The `confirmed_at` timestamp is set
4. The token is marked as used
5. The user is redirected to the login page

## Error Handling

All endpoints return consistent JSON responses:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "user": { /* user object */ } // Only on success
}
```

HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (email not confirmed)
- `404` - Not found
- `409` - Conflict (user already exists)
- `500` - Internal server error

## Testing

### Registration Test
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Confirmation Test
```bash
curl "http://localhost:3000/api/confirm-email?token=your_token_here"
```

### Login Test
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## Troubleshooting

### Common Issues

1. **"Database configuration error"**
   - Check Supabase environment variables
   - Ensure service role key has proper permissions

2. **"Invalid or expired confirmation token"**
   - Token may have expired (24-hour limit)
   - Token may have already been used
   - Check if token exists in `email_confirmations` table

3. **"Email not confirmed"**
   - User needs to click confirmation link
   - Check if confirmation email was sent
   - Verify email service configuration

4. **"User already exists"**
   - Email is already registered and confirmed
   - Use different email or reset password flow

### Debug Mode

Enable detailed logging by checking:
- Server console logs
- Browser network tab
- Supabase dashboard logs

## Benefits of Migration

1. **Security**: Centralized authentication with proper password hashing
2. **Scalability**: Database-backed user management
3. **Reliability**: No more localStorage data loss
4. **Consistency**: Single source of truth for user data
5. **Maintainability**: Clean separation of concerns
6. **Monitoring**: Better logging and error tracking
