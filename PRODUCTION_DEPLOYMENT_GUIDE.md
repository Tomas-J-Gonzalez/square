# Production Deployment Guide for Show Up or Else

## 🚀 **Vercel Deployment**

Your app is now fully configured for production deployment on Vercel. All data is stored in Supabase, eliminating the need for local development servers.

## 📋 **Required Environment Variables**

Make sure these are set in your Vercel project settings:

### **Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Email Service (Resend)**
```
RESEND_API_KEY=your_resend_api_key
```

### **Site Configuration**
```
NEXT_PUBLIC_SITE_URL=https://showuporelse.com
```

## 🔧 **Database Setup**

### **Required Tables**
Your Supabase database should have these tables:

1. **`users`** - User accounts and authentication
2. **`events`** - Event data
3. **`event_rsvps`** - RSVP and participant data
4. **`email_confirmations`** - Email confirmation tokens

### **Row Level Security (RLS)**
Ensure RLS policies are properly configured for data isolation between users.

## 🧹 **Local Development Cleanup**

### **What's Been Removed:**
- ✅ Multiple development server instances
- ✅ localStorage dependencies for event data
- ✅ Async/await compilation errors
- ✅ Optional userEmail parameters (now required)

### **What's Still Available:**
- ✅ User authentication via localStorage (for session management)
- ✅ Email confirmation tokens in localStorage (for security)
- ✅ Admin login flag in localStorage (for development)

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"User email is required" errors**
   - Ensure all event service calls include `currentUser?.email`
   - Check that user is properly authenticated

2. **API 405 errors**
   - Verify you're accessing the correct production URL
   - Check that all API routes are properly deployed

3. **Database connection errors**
   - Verify Supabase environment variables in Vercel
   - Check that database tables exist and have correct schema

4. **Email delivery issues**
   - Verify Resend API key in Vercel
   - Check domain verification in Resend dashboard

### **Testing Production:**
1. Visit: https://showuporelse.com
2. Create a new account
3. Create an event
4. Test RSVP functionality
5. Verify email confirmations work

## 📊 **Monitoring**

### **Vercel Analytics:**
- Monitor API response times
- Check for 500 errors
- Review deployment logs

### **Supabase Dashboard:**
- Monitor database performance
- Check RLS policy effectiveness
- Review authentication logs

## 🔒 **Security Considerations**

1. **Environment Variables**: Never commit sensitive keys to git
2. **Database Access**: Use service role key only on server-side
3. **User Data**: All user data is properly isolated via RLS
4. **Email Security**: Confirmation tokens expire after 24 hours

## 🎯 **Next Steps**

1. **Deploy to Vercel** if not already done
2. **Test all functionality** on production
3. **Monitor performance** and error rates
4. **Set up monitoring** for production issues

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review this guide for common solutions

---

**Your app is now production-ready with full Supabase integration! 🎉**
