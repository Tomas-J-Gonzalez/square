# RSVP System Migration Guide

This document outlines the migration from a hybrid localStorage/Supabase RSVP system to a fully Supabase-based system for production use.

## Overview

The RSVP system has been completely refactored to use Supabase as the single source of truth, eliminating the unreliable merge logic that was causing participants to not appear on the host's manage event page.

## Key Changes

### ✅ **1. Single Source of Truth**
- **Before**: RSVPs stored in both localStorage and Supabase with complex merge logic
- **After**: All RSVPs stored only in Supabase `event_rsvps` table
- **Benefit**: No more sync issues, real-time updates, production-ready

### ✅ **2. Improved API Endpoint**
- **Before**: Basic insert-only API with potential duplicates
- **After**: Smart upsert API that prevents duplicates and returns participant data
- **Benefit**: Reliable RSVP submissions, no duplicate participants

### ✅ **3. Real-time Participant Updates**
- **Before**: Complex merge logic with localStorage dependencies
- **After**: Direct Supabase queries with 10-second polling for live updates
- **Benefit**: Hosts see new RSVPs immediately

### ✅ **4. Enhanced Guest Experience**
- **Before**: Guests could only provide name
- **After**: Guests can provide name and optional email
- **Benefit**: Better contact information for hosts

## Database Schema Updates

### Run the Updated Schema

Execute the SQL in `supabase-rsvp-schema.sql` in your Supabase SQL editor:

```sql
-- Updated events table
create table if not exists public.events (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    date date not null,
    time text,
    location text,
    decision_mode text default 'none',
    punishment text default '',
    invited_by text,
    created_at timestamptz default now()
);

-- Updated RSVPs table with email and message fields
create table if not exists public.event_rsvps (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid references public.events(id) on delete cascade,
    name text not null,
    email text,
    will_attend boolean not null,
    message text,
    created_at timestamptz default now()
);

-- Unique index to prevent duplicate RSVPs
create unique index if not exists unique_event_participant
on public.event_rsvps (event_id, lower(name));
```

## API Changes

### Updated `/api/rsvp` Endpoint

**New Features**:
- Accepts `email` and `message` fields
- Performs upsert (update if exists, insert if new)
- Returns participant data on success
- Prevents duplicate RSVPs for same event + name

**Request Format**:
```json
{
  "eventId": "uuid",
  "name": "John Doe",
  "email": "john@example.com", // optional
  "willAttend": true,
  "message": "Can't wait!", // optional
  "event": { /* event data for upsert */ }
}
```

**Response Format**:
```json
{
  "success": true,
  "participant": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "willAttend": true,
    "message": "Can't wait!",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

## Frontend Changes

### 1. RSVP Page (`/rsvp/[eventId]`) - Logged-in Users

**Changes**:
- Removed localStorage writes
- Added proper error handling with modals
- Pre-fills name and email from user account
- Shows success/error messages

**Flow**:
1. User clicks invitation link
2. Page loads event details from Supabase
3. User fills RSVP form (name/email pre-filled)
4. Form submits to `/api/rsvp`
5. Success modal shows, redirects to event page

### 2. Invite Page (`/invite/[eventId]`) - Guests

**Changes**:
- Added email field (optional)
- Removed localStorage dependencies
- Enhanced error handling
- Better user experience

**Flow**:
1. Guest clicks invitation link
2. Page loads event details from Supabase
3. Guest fills form (name required, email optional)
4. Form submits to `/api/rsvp`
5. Success message shows

### 3. ViewEvent Page (`/event/[eventId]`) - Host's Manage Page

**Major Changes**:
- **Removed**: Complex merge logic with localStorage
- **Added**: Direct Supabase participant fetching
- **Added**: Real-time updates with 10-second polling
- **Added**: Proper participant management

**New Features**:
- Fetches participants directly from `event_rsvps` table
- Shows only confirmed attendees (`will_attend = true`)
- Real-time updates for new RSVPs
- Proper participant removal (sets `will_attend = false`)
- Enhanced participant form with email field

## Migration Steps

### 1. Database Setup
```bash
# Run the schema in supabase-rsvp-schema.sql
```

### 2. Environment Variables
Ensure these are set:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy Updated Files
- `pages/api/rsvp.js` - Updated API endpoint
- `src/pages/RSVP.jsx` - Updated RSVP page
- `src/pages/Invite.jsx` - Updated invite page
- `src/pages/ViewEvent.jsx` - Updated manage page

### 4. Test the Flow

**Test User RSVP**:
1. Create an event
2. Share invitation link
3. Log in as different user
4. RSVP via `/rsvp/[eventId]`
5. Verify participant appears on host's manage page

**Test Guest RSVP**:
1. Create an event
2. Share invitation link
3. Open link in incognito window
4. RSVP as guest via `/invite/[eventId]`
5. Verify participant appears on host's manage page

## Benefits of Migration

### ✅ **Production Ready**
- No more localStorage sync issues
- Reliable participant tracking
- Real-time updates

### ✅ **Better User Experience**
- Immediate feedback on RSVP submission
- No more missing participants
- Enhanced error handling

### ✅ **Scalable Architecture**
- Single source of truth
- Proper database constraints
- Efficient queries

### ✅ **Enhanced Features**
- Guest email collection
- RSVP messages
- Duplicate prevention
- Real-time updates

## Troubleshooting

### Common Issues

1. **"Participant not appearing on manage page"**
   - Check if RSVP was submitted successfully
   - Verify `will_attend` is `true` in database
   - Check browser console for errors

2. **"Duplicate participants"**
   - The unique index should prevent this
   - Check if names are exactly the same (case-insensitive)

3. **"Real-time updates not working"**
   - Verify Supabase connection
   - Check if polling is enabled (10-second intervals)
   - Look for console errors

### Debug Mode

Enable detailed logging by checking:
- Browser console for frontend errors
- Server logs for API errors
- Supabase dashboard for database issues

## Performance Considerations

- **Polling**: 10-second intervals for real-time updates
- **Indexing**: Proper indexes on `event_id`, `name`, and `will_attend`
- **Caching**: Consider implementing client-side caching for better performance
- **Subscriptions**: Future enhancement could use Supabase real-time subscriptions

## Future Enhancements

1. **Real-time Subscriptions**: Replace polling with Supabase subscriptions
2. **Email Notifications**: Notify hosts of new RSVPs
3. **RSVP Reminders**: Send reminder emails to pending RSVPs
4. **Bulk Operations**: Allow hosts to manage multiple participants at once

This migration ensures your RSVP system is production-ready and provides a reliable, scalable foundation for your multi-user web app.
