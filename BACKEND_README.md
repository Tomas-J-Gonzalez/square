# Vercel Backend for Be There or Be Square

This is a serverless backend deployed on Vercel that provides API endpoints for the Be There or Be Square app.

## 🏗️ Architecture

- **Platform**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Resend API
- **Language**: JavaScript (ES6 modules)

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── create-plan.js     # POST /api/create-plan
│   ├── join-plan.js       # POST /api/join-plan
│   ├── get-plans.js       # GET /api/get-plans
│   └── send-email.js      # POST /api/send-email
├── lib/                   # Shared utilities
│   ├── supabaseClient.js  # Supabase client configuration
│   └── cors.js           # CORS helper function
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── env.example           # Environment variables template
```

## 🚀 API Endpoints

### 1. POST /api/create-plan
Creates a new plan in the database.

**Request Body:**
```json
{
  "title": "Movie Night",
  "description": "Watching the latest Marvel movie",
  "date": "2024-01-15T19:00:00Z",
  "location": "AMC Theater",
  "creator_id": "user123",
  "max_members": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "plan": { /* plan object */ }
}
```

### 2. POST /api/join-plan
Adds a user to a plan.

**Request Body:**
```json
{
  "plan_id": "plan123",
  "user_id": "user456",
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined plan",
  "member": { /* member object */ }
}
```

### 3. GET /api/get-plans
Retrieves all plans for a user.

**Query Parameters:**
- `user_id` (required): The user's ID

**Response:**
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "plans": [
    {
      "id": "plan123",
      "title": "Movie Night",
      "description": "Watching the latest Marvel movie",
      "date": "2024-01-15T19:00:00Z",
      "location": "AMC Theater",
      "creator_id": "user123",
      "member_count": 5,
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### 4. POST /api/send-email
Sends emails via Resend API.

**Request Body:**
```json
{
  "to_email": "friend@example.com",
  "to_name": "Friend Name",
  "plan_title": "Movie Night",
  "plan_description": "Watching the latest Marvel movie",
  "plan_date": "2024-01-15T19:00:00Z",
  "plan_location": "AMC Theater",
  "creator_name": "John Doe",
  "action_type": "invitation"
}
```

**Action Types:**
- `invitation`: Invite someone to join a plan
- `reminder`: Send a reminder about an upcoming plan
- `update`: Notify about plan changes

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `env.example` to `.env.local` and fill in your values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Resend API Configuration
RESEND_API_KEY=re_your_resend_api_key_here

# Public site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

### 2. Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add each environment variable from your `.env.local`

### 3. Supabase Database Setup

Create these tables in your Supabase database:

**plans table:**
```sql
CREATE TABLE plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  creator_id TEXT NOT NULL,
  max_members INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**plan_members table:**
```sql
CREATE TABLE plan_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);
```

## 🔒 CORS Configuration

The backend is configured to accept requests from any origin (including your Netlify frontend). If you want to restrict this, modify the `cors.js` file:

```javascript
// Restrict to specific domain
res.setHeader('Access-Control-Allow-Origin', 'https://dontbesquare.netlify.app');
```

## 🧪 Testing

You can test the endpoints using curl or Postman:

```bash
# Test create-plan
curl -X POST https://your-vercel-app.vercel.app/api/create-plan \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Plan","creator_id":"user123"}'

# Test get-plans
curl "https://your-vercel-app.vercel.app/api/get-plans?user_id=user123"

# Test send-email
curl -X POST https://your-vercel-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to_email":"test@example.com","plan_title":"Test Plan","action_type":"invitation"}'
```

## 📧 Email Templates

The email service includes three types of templates:
- **Invitation**: Pink theme, invites users to join plans
- **Reminder**: Orange theme, reminds about upcoming plans
- **Update**: Green theme, notifies about plan changes

All emails include:
- Responsive design
- Plan details (title, description, date, location)
- Call-to-action button
- Branded footer

## 🚨 Error Handling

All endpoints include comprehensive error handling:
- Input validation
- Database error handling
- Email service error handling
- Proper HTTP status codes
- Detailed error messages

## 🔄 Integration with Frontend

Update your frontend API calls to use the Vercel backend:

```javascript
// Replace localhost URLs with Vercel URLs
const API_BASE_URL = 'https://your-vercel-app.vercel.app/api';

// Example: Create a plan
const response = await fetch(`${API_BASE_URL}/create-plan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(planData)
});
```

## 📊 Monitoring

Monitor your Vercel functions in the Vercel dashboard:
- Function execution logs
- Performance metrics
- Error tracking
- Environment variable management
