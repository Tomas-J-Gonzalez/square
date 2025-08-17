# Social Sharing Setup Guide

## 🎯 **Problem Solved**

Event invitation links now display properly on Facebook and other social media platforms with:
- ✅ **Full pink social share image** (1200x630 PNG)
- ✅ **Dynamic descriptions** showing host name and event details
- ✅ **Professional branding** with "Show Up or Else" logo
- ✅ **Proper Open Graph meta tags** for rich previews

## 🖼️ **Social Share Image Setup**

### **Step 1: Generate the Social Share Image**

1. **Open the generator**: Navigate to `http://localhost:3000/social-share.html`
2. **Take a screenshot**: Capture the pink area (1200x630 pixels)
3. **Save the image**: Save as `social-share.png` in `public/assets/` folder

### **Step 2: Image Requirements**

The social share image should be:
- **Dimensions**: 1200x630 pixels (Facebook recommended size)
- **Format**: PNG (better compatibility than SVG)
- **Background**: Full pink gradient (#ec4899 to #db2777)
- **Content**: "Show Up or Else" branding with invitation text
- **File location**: `public/assets/social-share.png`

## 🔧 **Technical Implementation**

### **Updated Files:**

1. **`app/invite/[eventId]/layout.tsx`**
   - Uses PNG image instead of SVG
   - Proper Open Graph meta tags
   - Better Facebook compatibility

2. **`app/invite/[eventId]/page.tsx`**
   - Dynamic meta tag updates when event loads
   - Shows actual host name and event details
   - Format: "[Host Name] has invited you to [Event Title]"

3. **`public/social-share.html`**
   - Image generator for creating the social share image
   - Pink gradient background with branding

## 📱 **How It Works**

### **Facebook Sharing Flow:**

1. **User shares event link** on Facebook
2. **Facebook crawls the URL** and reads meta tags
3. **Displays rich preview** with:
   - Pink social share image
   - Title: "[Host Name] has invited you to [Event Title]"
   - Description: Event details with date and location
   - URL: Direct link to RSVP page

### **Example Preview:**
```
┌─────────────────────────────────────┐
│ [Pink Image with "Show Up or Else"] │
├─────────────────────────────────────┤
│ John has invited you to Game Night  │
│ John has invited you to Game Night  │
│ on Saturday, January 20, 2024 at    │
│ 123 Main St. Join us for this       │
│ in-person event!                    │
│                                     │
│ showuporelse.com                    │
└─────────────────────────────────────┘
```

## 🧪 **Testing Social Sharing**

### **Method 1: Facebook Debugger**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your event URL: `https://yourdomain.com/invite/[eventId]`
3. Click "Debug" to see the preview
4. Click "Scrape Again" to refresh cache

### **Method 2: Local Testing**
```bash
# Run the test script
node test-social-sharing.js
```

### **Method 3: Manual Testing**
1. Create an event in your app
2. Copy the invitation link
3. Share it on Facebook
4. Verify the preview displays correctly

## 🎨 **Customization Options**

### **Image Design:**
- **Background**: Pink gradient (#ec4899 to #db2777)
- **Logo**: "Show Up or Else" in white text
- **Tagline**: "Make event planning fun and flake-proof"
- **Accent elements**: Subtle circles for visual interest

### **Meta Tag Content:**
- **Title**: "[Host Name] has invited you to [Event Title]"
- **Description**: Includes event date, location, and type
- **Image**: Full pink branding image
- **URL**: Direct link to RSVP page

## 🚀 **Deployment Checklist**

### **Before Deploying:**
- [ ] Generate and save `social-share.png` image
- [ ] Test with Facebook Debugger
- [ ] Verify meta tags are working
- [ ] Check image loads properly

### **After Deploying:**
- [ ] Test sharing on Facebook
- [ ] Verify preview displays correctly
- [ ] Check mobile sharing
- [ ] Test with different event types

## 🔍 **Troubleshooting**

### **If image doesn't show:**
1. Check file path: `public/assets/social-share.png`
2. Verify image dimensions: 1200x630
3. Use Facebook Debugger to refresh cache
4. Check image format: PNG (not SVG)

### **If meta tags don't update:**
1. Verify event data is loading
2. Check browser console for errors
3. Ensure host_name field exists
4. Test with different event IDs

### **If Facebook cache issues:**
1. Use Facebook Debugger
2. Click "Scrape Again"
3. Wait 24 hours for cache refresh
4. Test with new event links

## 📊 **Expected Results**

After implementation:
- **Facebook sharing**: Rich previews with pink image
- **Twitter sharing**: Large image cards with event details
- **WhatsApp sharing**: Proper link previews
- **Email sharing**: Rich previews in email clients

---

**Note**: The social share image is crucial for professional appearance on social media. Make sure to generate and test the image before deploying to production.
