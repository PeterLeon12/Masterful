# 🚀 EXPO DEPLOYMENT GUIDE

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **1. SUPABASE SETUP**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your project URL and anon key
3. Update `.env` with your Supabase credentials

### ✅ **2. EXPO DEPLOYMENT**

#### **Option A: Expo Web (Recommended for Web)**
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Login to Expo
expo login

# Deploy web version
expo publish --platform web
```

#### **Option B: Expo EAS Build (For Mobile Apps)**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

#### **Option C: Expo Functions (For Backend API)**
```bash
# Create functions directory
mkdir functions

# Move your backend code to functions/
# Deploy with Expo
expo publish
```

## 🔧 **ENVIRONMENT VARIABLES**

### **Frontend (.env)**
```
EXPO_PUBLIC_API_URL=https://your-app.expo.dev/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **Backend (Expo Functions Environment)**
```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🧪 **TESTING AFTER DEPLOYMENT**

1. **Test Authentication**: Register/Login
2. **Test Job Posting**: Create a job
3. **Test Search**: Search for professionals
4. **Test Chat**: Send messages

## 📱 **MOBILE DEPLOYMENT**

### **Expo Build Service**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## 🔍 **TROUBLESHOOTING**

### **Common Issues:**
1. **CORS Errors**: Check Expo environment variables
2. **Stripe Errors**: Verify API keys are correct
3. **Database Errors**: Check Supabase connection
4. **Build Errors**: Check Node.js version compatibility

### **Debug Commands:**
```bash
# Check Expo logs
expo logs

# Check build status
expo build:list

# Redeploy
expo publish --clear
```

## 📊 **MONITORING**

1. **Expo Analytics**: Monitor app performance
2. **Stripe Dashboard**: Monitor payments
3. **Supabase Dashboard**: Monitor database
4. **Expo Dashboard**: Monitor mobile app

## 🎯 **NEXT STEPS**

1. Set up custom domain
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement CI/CD pipeline
5. Set up staging environment

---

**Need Help?** Check the [Expo Documentation](https://docs.expo.dev/) or [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 🚀 **QUICK START (5 MINUTES)**

```bash
# 1. Install Expo CLI
npm install -g @expo/cli

# 2. Login to Expo
expo login

# 3. Deploy web version
expo publish --platform web

# 4. Your app will be available at:
# https://expo.dev/@your-username/your-app-name
```

## 📱 **MOBILE QUICK START (10 MINUTES)**

```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Login to Expo
eas login

# 3. Configure build
eas build:configure

# 4. Build for production
eas build --platform all

# 5. Download and install on your device
```
