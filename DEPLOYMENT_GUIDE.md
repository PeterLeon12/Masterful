# 🚀 DEPLOYMENT GUIDE

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **1. STRIPE SETUP**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your test keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`
3. Update `backend/env.local` with your keys
4. Test payments locally

### ✅ **2. SUPABASE SETUP**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your project URL and anon key
3. Update `.env` with your Supabase credentials

### ✅ **3. VERCEL DEPLOYMENT**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables:
   ```
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy!

#### **Option B: Deploy via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

## 🔧 **ENVIRONMENT VARIABLES**

### **Frontend (.env)**
```
EXPO_PUBLIC_API_URL=https://your-app.vercel.app/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **Backend (Vercel Environment Variables)**
```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

## 🧪 **TESTING AFTER DEPLOYMENT**

1. **Test Authentication**: Register/Login
2. **Test Job Posting**: Create a job
3. **Test Search**: Search for professionals
4. **Test Payments**: Try Stripe integration
5. **Test Chat**: Send messages

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
1. **CORS Errors**: Check Vercel environment variables
2. **Stripe Errors**: Verify API keys are correct
3. **Database Errors**: Check Supabase connection
4. **Build Errors**: Check Node.js version compatibility

### **Debug Commands:**
```bash
# Check Vercel logs
vercel logs

# Check build status
vercel ls

# Redeploy
vercel --prod
```

## 📊 **MONITORING**

1. **Vercel Analytics**: Monitor app performance
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

**Need Help?** Check the [Vercel Documentation](https://vercel.com/docs) or [Expo Documentation](https://docs.expo.dev/)
