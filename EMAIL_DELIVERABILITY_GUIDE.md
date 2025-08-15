# Email Deliverability & Anti-Spam Guide

This guide helps prevent your emails from being flagged as suspicious or spam.

## 🚨 **Why Emails Get Flagged as Suspicious**

### **Common Triggers:**
- **Poor sender reputation** - New domains have low trust scores
- **Generic "from" addresses** - `noreply@domain.com` looks suspicious
- **Poor email content** - Missing branding, generic templates
- **No authentication** - Missing SPF, DKIM, DMARC records
- **High volume** - Sending too many emails too quickly
- **Poor engagement** - Low open/click rates

## ✅ **Fixes Applied**

### **1. Improved Email Content**
- ✅ **Professional HTML templates** with proper branding
- ✅ **Better "from" address**: `Show Up or Else <noreply@showuporelse.com>`
- ✅ **Clear subject lines** that explain the purpose
- ✅ **Plain text alternatives** for better deliverability
- ✅ **Security notes** explaining why the email was sent
- ✅ **Professional footer** with company information

### **2. Email Authentication Setup**

#### **Required DNS Records for showuporelse.com:**

**SPF Record (TXT):**
```
v=spf1 include:_spf.resend.com ~all
```

**DKIM Record (TXT):**
```
resend._domainkey.showuporelse.com IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```
*Note: Get the actual DKIM key from your Resend dashboard*

**DMARC Record (TXT):**
```
_dmarc.showuporelse.com IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@showuporelse.com; ruf=mailto:dmarc@showuporelse.com; sp=quarantine; adkim=r; aspf=r;"
```

## 🔧 **How to Set Up Email Authentication**

### **Step 1: Get DKIM Key from Resend**
1. Go to your [Resend Dashboard](https://resend.com/domains)
2. Click on your domain `showuporelse.com`
3. Copy the DKIM public key

### **Step 2: Add DNS Records**
Add these records to your domain's DNS (GoDaddy, Vercel, etc.):

#### **SPF Record:**
- **Type**: TXT
- **Name**: @ (or leave blank)
- **Value**: `v=spf1 include:_spf.resend.com ~all`
- **TTL**: 3600

#### **DKIM Record:**
- **Type**: TXT
- **Name**: `resend._domainkey`
- **Value**: `v=DKIM1; k=rsa; p=YOUR_ACTUAL_DKIM_KEY_FROM_RESEND`
- **TTL**: 3600

#### **DMARC Record:**
- **Type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@showuporelse.com; ruf=mailto:dmarc@showuporelse.com; sp=quarantine; adkim=r; aspf=r;`
- **TTL**: 3600

### **Step 3: Verify Setup**
1. Wait 24-48 hours for DNS propagation
2. Check your domain status in Resend dashboard
3. Test email deliverability

## 📧 **Email Best Practices**

### **Content Guidelines:**
- ✅ **Clear purpose** - Explain why the email was sent
- ✅ **Professional branding** - Consistent logo and colors
- ✅ **Personalization** - Use recipient's name
- ✅ **Clear call-to-action** - Obvious buttons/links
- ✅ **Security context** - Explain security measures
- ✅ **Unsubscribe option** - For marketing emails (not needed for transactional)

### **Technical Guidelines:**
- ✅ **Proper HTML structure** - DOCTYPE, meta tags
- ✅ **Responsive design** - Works on mobile
- ✅ **Alt text for images** - Accessibility
- ✅ **Plain text version** - Fallback for email clients
- ✅ **Consistent formatting** - Professional appearance

## 🧪 **Testing Email Deliverability**

### **Test Your Setup:**
```bash
# Test email sending
curl -X POST http://localhost:3002/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","name":"Test User","token":"test-token-123"}'
```

### **Check Email Headers:**
Look for these headers in received emails:
- ✅ `Authentication-Results: spf=pass`
- ✅ `Authentication-Results: dkim=pass`
- ✅ `Authentication-Results: dmarc=pass`

## 📊 **Monitor Email Performance**

### **Key Metrics to Track:**
- **Delivery Rate**: Should be >95%
- **Open Rate**: Should be >20%
- **Click Rate**: Should be >5%
- **Bounce Rate**: Should be <2%
- **Spam Complaints**: Should be <0.1%

### **Tools to Monitor:**
- **Resend Dashboard**: Built-in analytics
- **Gmail Postmaster**: Domain reputation
- **MXToolbox**: DNS and deliverability checks

## 🚀 **Additional Improvements**

### **1. Warm Up Your Domain**
- Start with low volume (10-20 emails/day)
- Gradually increase over 2-4 weeks
- Monitor deliverability metrics

### **2. Build Sender Reputation**
- Send consistent, valuable emails
- Maintain low bounce rates
- Encourage engagement (opens/clicks)

### **3. Monitor and Respond**
- Check spam reports regularly
- Respond to user feedback
- Adjust content based on engagement

## ⚠️ **Common Mistakes to Avoid**

- ❌ **Generic subject lines** ("Click here", "Important")
- ❌ **Poor HTML structure** (missing DOCTYPE, broken tags)
- ❌ **No plain text version**
- ❌ **Missing sender information**
- ❌ **Too many images or links**
- ❌ **Aggressive language** ("URGENT", "ACT NOW")

## 🔍 **Troubleshooting**

### **If emails still go to spam:**
1. **Check DNS records** - Use MXToolbox to verify
2. **Monitor domain reputation** - Check Gmail Postmaster
3. **Review email content** - Avoid spam trigger words
4. **Test with different email providers** - Gmail, Outlook, Yahoo
5. **Contact Resend support** - They can help with deliverability issues

### **Spam Trigger Words to Avoid:**
- "Free", "Act now", "Limited time", "Urgent"
- "Click here", "Buy now", "Special offer"
- "Guaranteed", "No risk", "Money back"

## 📞 **Support Resources**

- **Resend Documentation**: https://resend.com/docs
- **Gmail Postmaster**: https://postmaster.google.com
- **MXToolbox**: https://mxtoolbox.com
- **Email Deliverability Testing**: https://www.mail-tester.com

---

**Remember**: Email deliverability is a journey, not a destination. Monitor your metrics and continuously improve your email practices! 📧✨
