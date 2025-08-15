# Vercel Deployment Guide

This guide helps you fix common Vercel deployment issues for your "Show up or else" app.

## 🔧 **Issue 1: Build Warning - Missing `isValidEmail` Export**

### **Problem**
```
Attempted import error: 'isValidEmail' is not exported from '../src/services/authService'
```

### **Solution**
✅ **FIXED** - I've added the missing export to `authService.js`:
```javascript
// Export isValidEmail function directly for use in other files
export { isValidEmail };
```

## 🔧 **Issue 2: Email Service 500 Error**

### **Problem**
```
Failed to send confirmation email: Error: Email service returned 500
```

### **Solution**

1. **Check Environment Variables in Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

2. **Verify Resend API Key**:
   - Go to [https://resend.com/api-keys](https://resend.com/api-keys)
   - Check if your API key is valid
   - Make sure it has permission to send emails

3. **Test Email Service**:
   ```bash
   node test-email-service.js
   ```

## 🔧 **Issue 3: Database Connection Issues**

### **Problem**
```
Database error while checking existing user
```

### **Solution**

1. **Verify Supabase Environment Variables**:
   - Make sure all Supabase variables are set in Vercel
   - Test locally first: `node test-db-connection.js`

2. **Check Database Schema**:
   - Run the schema in your Supabase dashboard
   - Use the safe schema: `supabase-rsvp-schema-safe.sql`

## 📋 **Complete Deployment Checklist**

### **Before Deploying**

1. **✅ Fix Build Issues**:
   - All imports/exports working
   - No TypeScript errors
   - No missing dependencies

2. **✅ Environment Variables**:
   - All variables set in Vercel
   - Test locally with `.env` file

3. **✅ Database Setup**:
   - Supabase project created
   - Schema deployed
   - Tables and policies created

4. **✅ Email Service**:
   - Resend account created
   - API key generated
   - Domain verified (if needed)

### **Deployment Steps**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Vercel will automatically deploy from GitHub
   - Monitor the build logs for any errors

3. **Verify Deployment**:
   - Check all pages load correctly
   - Test registration flow
   - Test email confirmation
   - Test RSVP functionality

## 🧪 **Testing Scripts**

Run these scripts to verify everything works:

```bash
# Test database connection
node test-db-connection.js

# Test registration API
node test-registration.js

# Test email confirmation
node test-email-confirmation.js

# Test email service
node test-email-service.js
```

## 🔍 **Common Issues and Solutions**

### **Build Fails**
- Check for missing imports/exports
- Verify all dependencies are installed
- Check TypeScript configuration

### **Runtime Errors**
- Verify environment variables are set
- Check database connection
- Test API endpoints individually

### **Email Not Sending**
- Verify Resend API key
- Check domain verification
- Test email service directly

### **Database Errors**
- Verify Supabase credentials
- Check RLS policies
- Ensure tables exist

## 📞 **Getting Help**

If you encounter issues:

1. **Check the logs**: Vercel provides detailed build and runtime logs
2. **Test locally**: Use the test scripts to identify issues
3. **Verify configuration**: Double-check all environment variables
4. **Check documentation**: Refer to Supabase and Resend docs

## 🎉 **Success Indicators**

Your deployment is successful when:

- ✅ Build completes without warnings
- ✅ All pages load correctly
- ✅ Registration works
- ✅ Email confirmation works
- ✅ RSVP system works
- ✅ No 500 errors in logs

This guide should help you resolve the deployment issues and get your app running smoothly on Vercel!
