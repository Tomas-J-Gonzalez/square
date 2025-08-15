# Show Up or Else - Anti-Flake App

A fun, social web application designed to prevent people from flaking on events. Built with React, Vite, Tailwind CSS, and Resend for email handling.

## 🚀 Features

- **User Authentication**: Secure registration and login with email confirmation
- **Event Management**: Create, manage, and track events
- **Anti-Flake System**: Multiple decision modes (Vote, Chance, Game, No Group Decision)
- **Email Integration**: Real email sending via Resend
- **Admin Access**: Admin bypass for testing (admin/admin)
- **Responsive Design**: Mobile-first design with 8px grid system
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Express.js (for email handling)
- **Email Service**: Resend
- **Routing**: React Router DOM
- **State Management**: React Context + Local Storage
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Resend API key (free at [resend.com](https://resend.com))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd square
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "RESEND_API_KEY=your_resend_api_key_here" > .env
   echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local
   echo "PORT=3001" >> .env
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   # Terminal 1: Backend server
   npm run server
   
   # Terminal 2: Frontend development server
   npm run dev
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 👤 User Flows

### Regular User Registration
1. Visit http://localhost:5175/register
2. Enter name, email (whitelisted domain), and password
3. Check email for confirmation link
4. Click confirmation link to activate account
5. Login and start using the app

### Admin Access
- **Username**: `admin`
- **Password**: `admin`
- **Bypass**: No email confirmation required

### Email Whitelist
Only these email domains are allowed:
- gmail.com, yahoo.com, hotmail.com, outlook.com
- icloud.com, me.com, mac.com, aol.com
- protonmail.com, tutanota.com, zoho.com
- yandex.com, mail.com, live.com, msn.com

## 📧 Email Configuration

### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

### Email Templates
The app sends beautifully formatted HTML emails with:
- Branded styling matching the app design
- Clear call-to-action buttons
- Fallback text links
- Professional layout

## 🎯 Core Features

### Event Creation
- **Title & Description**: Clear event details
- **Date & Time**: Flexible scheduling
- **Location**: Event venue information
- **Decision Mode**: Choose how to handle flakes
  - **Vote**: Group decides on punishment
  - **Chance**: Random selection
  - **Game**: Interactive decision
  - **No Group Decision**: Manual handling

### Event Management
- **Active Events**: Only one active event at a time
- **Friend Management**: Add friends with required info
- **Attendance Tracking**: Mark who attended vs flaked
- **Event Completion**: Archive completed events
- **History**: View past events with statistics

### Social Features
- **Event Sharing**: Multiple sharing options
- **Invitation Links**: Direct event access
- **Social Media Integration**: Facebook, Instagram, Twitter
- **Friend Management**: Track friend relationships

## 🔒 Security Features

- **Password Hashing**: Secure password storage
- **Email Validation**: Domain whitelist protection
- **Token-based Confirmation**: Secure email verification
- **Protected Routes**: Authentication required for app access
- **Admin Protection**: Secure admin credential validation

## 🎨 Design System

### Design Tokens
- **Colors**: Pink primary (#ec4899), semantic color palette
- **Spacing**: 8px grid system throughout
- **Typography**: Consistent font hierarchy
- **Components**: Reusable Button, Card, Modal components

### Responsive Breakpoints
- **Mobile**: 320px+ (16px margins)
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Large**: 1280px+

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with email confirmation
- [ ] Admin login bypass
- [ ] Event creation and management
- [ ] Email sending (check Resend dashboard)
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, screen readers)

### Email Testing
1. Register with a real email address
2. Check your inbox for confirmation email
3. Verify email styling and links work
4. Test confirmation flow

## 🚀 Deployment
## 📦 Supabase Schema (Server-backed RSVP)

Run these SQL snippets in your Supabase project (SQL editor):

```sql
-- Events table (minimal fields needed for invites)
create table if not exists public.events (
  id text primary key,
  title text not null,
  date text not null,
  time text not null,
  location text,
  decision_mode text not null,
  punishment text not null,
  invited_by text,
  created_at timestamptz default now()
);

-- RSVPs table
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  will_attend boolean not null,
  created_at timestamptz default now()
);

-- RLS policies (public read/write for RSVP without account; tighten later as needed)
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Allow read of events for anyone (to render invite page)
create policy if not exists "Events are readable" on public.events
for select using (true);

-- Allow inserting RSVPs for anyone (no auth)
create policy if not exists "Anyone can RSVP" on public.event_rsvps
for insert with check (true);

-- Allow reading RSVPs per event (optional; useful for organizer views)
create policy if not exists "RSVPs readable" on public.event_rsvps
for select using (true);
```

Environment variables required:

```
SUPABASE_URL=...your supabase URL...
SUPABASE_ANON_KEY=...your supabase anon key...
RESEND_API_KEY=...your resend api key...
CUSTOM_DOMAIN=https://your-domain.com   # Netlify function uses this for confirmation links
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
# Deploy server.js with environment variables
```

### Environment Variables for Production
```
RESEND_API_KEY=your_production_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
PORT=3001
```

## 📝 API Endpoints

### Email Service
- `POST /api/send-confirmation-email` - Send confirmation email
- `GET /api/health` - Health check

### Request Format
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "token": "confirmation-token"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Email not sending:**
- Check Resend API key in .env
- Verify email domain is whitelisted
- Check server logs for errors

**Server not starting:**
- Ensure port 3001 is available
- Check .env file exists
- Verify all dependencies installed

**Frontend not loading:**
- Check if backend is running
- Verify Vite is serving on correct port
- Clear browser cache

### Debug Mode
Enable detailed logging by checking browser console and server logs for error messages.

---

**Built with ❤️ for preventing flakes everywhere!**
