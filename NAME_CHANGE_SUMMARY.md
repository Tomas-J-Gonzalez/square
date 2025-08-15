# Name Change Summary: "Be there or be square" → "Show up or else"

This document summarizes all the changes made when updating the app name from "Be there or be square" to "Show up or else".

## 📋 **Files Updated**

### **Core Application Files**
- ✅ `package.json` - Updated package name
- ✅ `package-lock.json` - Updated package name
- ✅ `README.md` - Updated title and description
- ✅ `src/layouts/MainLayout.jsx` - Updated logo alt text and footer
- ✅ `src/pages/Home.jsx` - Updated main title
- ✅ `src/styles/main.css` - Updated stylesheet comment

### **Service Files**
- ✅ `src/services/authService.js` - Updated localStorage keys and email subjects
- ✅ `src/services/eventService.js` - Updated localStorage key
- ✅ `src/services/participationService.js` - Updated localStorage key

### **API Endpoints**
- ✅ `pages/api/send-confirmation-email.js` - Updated email sender name and subjects
- ✅ `pages/api/password-reset-request.js` - Updated email sender name and subjects
- ✅ `pages/api/send-email.js` - Updated email sender name

### **Documentation Files**
- ✅ `BACKEND_README.md` - Updated title and description
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Updated app name references
- ✅ `SETUP_SUPABASE.md` - Updated app name and project name
- ✅ `supabase-schema.sql` - Updated schema comment

### **Utility Files**
- ✅ `test-email-service.js` - Updated email sender name
- ✅ `clear-all-data.html` - Updated title and localStorage keys
- ✅ `clear-data.html` - Updated localStorage keys
- ✅ `public/clear-data.html` - Updated localStorage keys
- ✅ `public/seed-demo.html` - Updated localStorage keys
- ✅ `src/pages/Profile.jsx` - Updated localStorage keys
- ✅ `src/pages/CreateEvent.jsx` - Updated localStorage key reference

## 🔄 **Key Changes Made**

### **1. Package Names**
- `be-there-or-be-square-backend` → `show-up-or-else-backend`

### **2. LocalStorage Keys**
- `be-there-or-be-square-users` → `show-up-or-else-users`
- `be-there-or-be-square-current-user` → `show-up-or-else-current-user`
- `be-there-or-be-square-email-confirmations` → `show-up-or-else-email-confirmations`
- `be-there-or-be-square-events` → `show-up-or-else-events`
- `be-there-or-be-square-participations` → `show-up-or-else-participations`

### **3. Email Configuration**
- Sender name: `Be There or Be Square` → `Show Up or Else`
- Email subjects updated to include new app name
- Logo alt text updated

### **4. UI Text**
- Main page title: "Be there or be square" → "Show up or else"
- Footer copyright: "Be There or Be Square" → "Show Up or Else"
- Logo alt text updated

### **5. Documentation**
- All README files updated
- Setup guides updated
- Schema comments updated

## ⚠️ **Important Notes**

### **Data Migration**
- **Existing users**: LocalStorage data with old keys will not be accessible
- **Solution**: Users will need to re-register or clear their browser data
- **Production**: Supabase data is unaffected (uses different storage)

### **Email Service**
- Email sender name changed to "Show Up or Else"
- All email templates updated with new branding
- Confirmation and password reset emails updated

### **Deployment**
- Package name changed - may affect deployment if using package name in scripts
- Environment variables remain the same
- Supabase configuration unchanged

## 🧪 **Testing Checklist**

After the name change, verify:

- ✅ App builds without errors
- ✅ Registration flow works
- ✅ Email confirmation works
- ✅ Login/logout works
- ✅ Event creation works
- ✅ RSVP system works
- ✅ All pages load correctly
- ✅ Email templates display new name
- ✅ LocalStorage keys use new naming

## 🚀 **Next Steps**

1. **Deploy changes**:
   ```bash
   git add .
   git commit -m "Update app name from 'Be there or be square' to 'Show up or else'"
   git push origin main
   ```

2. **Test production deployment**:
   - Verify all functionality works
   - Check email templates
   - Test user registration flow

3. **Update external references** (if any):
   - Vercel project name
   - GitHub repository name
   - Domain names
   - Social media links

The name change is now complete! 🎉
