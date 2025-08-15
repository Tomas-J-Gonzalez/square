# IMMEDIATE FIX: 500 Error - Missing Environment Variables

## 🚨 **URGENT: 500 Error Confirmed**

The 500 error is caused by **missing environment variables in Vercel**. Here's how to fix it RIGHT NOW:

## 🔧 **Step-by-Step Fix**

### **1. Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Find your "showuporelse" project
- Click on the project

### **2. Add Environment Variables**
- Click "Settings" tab
- Click "Environment Variables" in the left sidebar
- Add these variables one by one:

#### **Variable 1: NEXT_PUBLIC_SUPABASE_URL**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL
- **Environment**: Production, Preview, Development
- **Example**: `https://your-project.supabase.co`

#### **Variable 2: SUPABASE_SERVICE_ROLE_KEY**
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service role key
- **Environment**: Production, Preview, Development
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **Variable 3: RESEND_API_KEY**
- **Name**: `RESEND_API_KEY`
- **Value**: Your Resend API key
- **Environment**: Production, Preview, Development
- **Example**: `re_123456789...`

#### **Variable 4: NEXT_PUBLIC_SITE_URL**
- **Name**: `NEXT_PUBLIC_SITE_URL`
- **Value**: `https://showuporelse.com`
- **Environment**: Production, Preview, Development

### **3. Where to Find These Values**

#### **Supabase Values:**
1. Go to https://supabase.com/dashboard
2. Click your project
3. Go to Settings → API
4. Copy "Project URL" and "service_role" key

#### **Resend API Key:**
1. Go to https://resend.com/api-keys
2. Copy your API key

### **4. Redeploy**
- After adding all variables, Vercel will auto-redeploy
- Or click "Redeploy" button manually

## 🧪 **Test After Fix**

```bash
node test-production.js
```

**Expected Result:**
- ✅ Site accessible
- ✅ API working (200 status)
- ✅ No more 500 errors

## 🎯 **What This Fixes**

- **500 Internal Server Error**: ✅ Resolved
- **Event Creation**: ✅ Will work
- **Database Operations**: ✅ Will connect to Supabase
- **Email Sending**: ✅ Will work with Resend

## ⚡ **Quick Checklist**

- [ ] Added NEXT_PUBLIC_SUPABASE_URL
- [ ] Added SUPABASE_SERVICE_ROLE_KEY
- [ ] Added RESEND_API_KEY
- [ ] Added NEXT_PUBLIC_SITE_URL
- [ ] Redeployed project
- [ ] Tested API endpoint

---

**This will fix the 500 error immediately!** 🚀
