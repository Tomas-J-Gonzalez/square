# Domain Setup Guide: showuporelse.com

This guide helps you complete the setup of your new domain `showuporelse.com` for your "Show Up or Else" app.

## 🎯 **Current Status**

✅ **Domain Added to Vercel**: `showuporelse.com` and `www.showuporelse.com`  
⚠️ **SSL Certificate**: DNS zone not enabled - needs configuration  
⚠️ **Email Domain**: Not verified in Resend yet  

## 🔧 **Step 1: Fix DNS Certificate Issues**

### **Problem**: "DNS zone not enabled for showuporelse.com"

**Solution**: You need to configure your domain's DNS settings:

1. **Go to your domain registrar** (where you bought showuporelse.com)
2. **Find DNS settings** or "Manage DNS"
3. **Add these DNS records**:

```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.19

Type: A  
Name: www
Value: 76.76.19.19

Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

4. **Wait 24-48 hours** for DNS propagation
5. **Refresh in Vercel** - the certificate should generate automatically

## 🔧 **Step 2: Verify Domain in Resend**

### **For Email Functionality**

1. **Go to [Resend Domains](https://resend.com/domains)**
2. **Click "Add Domain"**
3. **Enter**: `showuporelse.com`
4. **Add DNS records** that Resend provides:
   - TXT records for verification
   - MX records for email routing
   - SPF/DKIM records for deliverability

5. **Wait for verification** (usually 24-48 hours)

## 🔧 **Step 3: Update Environment Variables**

### **In Vercel Dashboard**:

1. Go to your project → **Settings** → **Environment Variables**
2. **Add/Update**:

```bash
NEXT_PUBLIC_SITE_URL=https://showuporelse.com
```

3. **Redeploy** your application

## 🔧 **Step 4: Test Everything**

### **After DNS propagation and domain verification**:

```bash
# Test email service with new domain
node test-email-service.js

# Test registration flow
node test-registration.js

# Test email confirmation
node test-email-confirmation.js
```

## 📧 **Email Configuration**

### **Current Email Senders** (Updated):
- ✅ `noreply@showuporelse.com` (for production)
- ✅ `onboarding@resend.dev` (fallback for testing)

### **Email Templates Updated**:
- ✅ Confirmation emails
- ✅ Password reset emails
- ✅ General notification emails

## 🌐 **Domain Configuration**

### **Primary Domain**: `showuporelse.com`
### **WWW Redirect**: `www.showuporelse.com` → `showuporelse.com`
### **SSL**: Will auto-generate once DNS is configured
### **Email**: `noreply@showuporelse.com`

## ⚠️ **Important Notes**

1. **DNS Propagation**: Can take 24-48 hours
2. **SSL Certificate**: Will auto-generate after DNS is correct
3. **Email Verification**: Required for sending to any email address
4. **Testing**: Use your verified email for testing until domain is verified

## 🚀 **Next Steps**

1. **Configure DNS records** at your domain registrar
2. **Verify domain in Resend** for email functionality
3. **Update environment variables** in Vercel
4. **Test all functionality** after propagation
5. **Monitor email deliverability**

## 📞 **Troubleshooting**

### **If SSL certificate fails**:
- Check DNS records are correct
- Wait for propagation
- Contact domain registrar if needed

### **If emails don't send**:
- Verify domain in Resend
- Check DNS records for email
- Test with verified email address

### **If site doesn't load**:
- Check DNS A records
- Verify Vercel domain configuration
- Check for redirect loops

Your domain setup is almost complete! 🎉
