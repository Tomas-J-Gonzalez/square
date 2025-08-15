# Vercel Environment Variables Setup

## 🎉 **Great News: 405 Error is Fixed!**

The API is now working correctly. The remaining 500 error is due to missing environment variables in Vercel.

## 🔧 **Required Environment Variables**

You need to set these in your Vercel project settings:

### **1. Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Find your "showuporelse" project
- Click on "Settings" tab

### **2. Add Environment Variables**
Go to "Environment Variables" section and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=https://showuporelse.com
```

### **3. Where to Find These Values**

#### **Supabase URL:**
- Go to your Supabase dashboard
- Click on your project
- Go to Settings → API
- Copy "Project URL"

#### **Supabase Service Role Key:**
- Same page as above
- Copy "service_role" key (not anon key)

#### **Resend API Key:**
- Go to Resend dashboard
- Go to API Keys section
- Copy your API key

#### **Site URL:**
- Use: `https://showuporelse.com`

### **4. Deploy After Adding Variables**
- After adding environment variables, Vercel will automatically redeploy
- Or manually trigger a redeploy from the dashboard

## 🧪 **Test After Setup**

Once environment variables are set:

```bash
node test-production.js
```

Expected result:
- ✅ Site accessible
- ✅ API working (200 status)
- ✅ Event creation works
- ✅ No more 500 errors

## 🎯 **What This Fixes**

- **500 Internal Server Error**: Will be resolved
- **Event Creation**: Will work properly
- **Database Operations**: Will connect to Supabase
- **Email Sending**: Will work with Resend

---

**The 405 error is completely fixed! Just need to set the environment variables in Vercel.** 🚀
