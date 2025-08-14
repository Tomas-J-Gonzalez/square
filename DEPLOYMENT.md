# Deployment Guide for Netlify

## Email Confirmation Issue Fix

Your email confirmation wasn't working because Netlify only hosts static files, not Node.js servers. This guide will help you set up email functionality using Netlify Functions.

## Setup Steps

### 1. Environment Variables in Netlify

Go to your Netlify dashboard → Site settings → Environment variables and add:

```
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

### 2. Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. Domain Configuration

You've configured your Vercel domain in Resend with the correct DNS records:
- MX record: `send.dontbesquare` → `feedback-smtp.ap-northeast-1.amazonses.com`
- SPF record: `send.dontbesquare` → `v=spf1 include:amazonses.com ~all`
- DKIM record: `resend._domainkey.dontbesquare` → (your DKIM key)
- DMARC record: `_dmarc` → `v=DMARC1; p=none;`

### 4. Verify Deployment

After deployment, your email confirmation should work at:
- `/api/send-confirmation-email`

## How It Works

- **Development**: Uses your local server at `localhost:3001` if available, otherwise Vercel API route
- **Production**: Uses Vercel API route `/api/send-confirmation-email`

## Troubleshooting

### If emails still don't work:

1. Check Netlify Function logs in the dashboard
2. Verify your Resend API key is correct
3. Make sure the function is deployed (check Functions tab in Netlify)

### Alternative: Deploy Backend Separately

If you prefer to keep your Express server, deploy it to:
- **Render** (recommended, free tier)
- **Railway**
- **Heroku**

Then update the `EMAIL_API_BASE_URL` in `src/services/emailService.js` to point to your deployed backend URL.

## Local Development

To test locally with the new setup:

```bash
# Terminal 1: Start your React dev server
npm run dev

# Terminal 2: Start your Express server (for local testing)
npm run server
```

The app will automatically use the local server in development and Netlify functions in production.
