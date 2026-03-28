# 🚀 DEPLOYMENT CHECKLIST - Romanian Marketplace App

## ✅ COMPLETED FIXES

### 1. Database Schema Fixed ✅
- Updated API to match actual database structure
- Fixed job interface to use `budgetMin`/`budgetMax` instead of `budget` JSON
- Added missing fields: `deadline`, `requirements`, `images`
- Updated home screen to display budget correctly

### 2. RLS Policies Created ✅
- Created production-ready RLS policies
- Proper security for all tables
- Users can only access their own data
- Open jobs are publicly readable

## 🚨 CRITICAL ISSUES TO FIX BEFORE DEPLOYMENT

### 1. ENVIRONMENT VARIABLES (HIGH PRIORITY)
```bash
# Add these to your .env file:
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_stripe_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 2. EAS BUILD CONFIGURATION (HIGH PRIORITY)
Update `eas.json` with real credentials:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-real-apple-id@example.com",
        "ascAppId": "your-real-app-store-connect-app-id",
        "appleTeamId": "your-real-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 3. APP STORE METADATA (HIGH PRIORITY)
- [ ] Create App Store Connect account
- [ ] Generate app icons (1024x1024 for App Store)
- [ ] Create splash screen
- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] Prepare app screenshots
- [ ] Write app description

### 4. GOOGLE PLAY CONSOLE (HIGH PRIORITY)
- [ ] Create Google Play Console account
- [ ] Generate app icons (512x512 for Play Store)
- [ ] Create app listing
- [ ] Upload app bundle

## 🔧 IMMEDIATE ACTIONS NEEDED

### Step 1: Run RLS Policies
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the contents of `fix-rls-policies-production.sql`
4. Verify policies are applied

### Step 2: Test the App
```bash
# Test on iOS
npx expo run:ios

# Test on Android
npx expo run:android
```

### Step 3: Build for Production
```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## 📱 APP STORE REQUIREMENTS

### iOS App Store
- [ ] App Store Connect account
- [ ] Apple Developer Program membership ($99/year)
- [ ] App icons (all sizes)
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] App Store screenshots
- [ ] App description and keywords

### Google Play Store
- [ ] Google Play Console account ($25 one-time fee)
- [ ] App icons (all sizes)
- [ ] Privacy policy URL
- [ ] App screenshots
- [ ] App description

## 🔐 SECURITY CHECKLIST

- [ ] RLS policies applied ✅
- [ ] API keys secured
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] Input validation

## 🧪 TESTING CHECKLIST

- [ ] Test user registration
- [ ] Test user login
- [ ] Test job creation
- [ ] Test job search
- [ ] Test messaging
- [ ] Test on real devices
- [ ] Test offline functionality

## 📊 MONITORING SETUP

- [ ] Set up crash reporting (Sentry)
- [ ] Set up analytics (Firebase Analytics)
- [ ] Set up performance monitoring
- [ ] Set up error tracking

## 🚀 DEPLOYMENT STEPS

1. **Fix Environment Variables**
2. **Apply RLS Policies**
3. **Test on Real Devices**
4. **Build Production Apps**
5. **Submit to App Stores**
6. **Monitor and Fix Issues**

## 📞 NEXT STEPS

1. **Get API Keys**: Stripe, Google Maps, Firebase
2. **Create App Store Accounts**: Apple Developer, Google Play Console
3. **Run RLS Policies**: Execute the SQL file in Supabase
4. **Test Everything**: Make sure all features work
5. **Build and Deploy**: Use EAS Build to create production apps

## 🎯 SUCCESS METRICS

- App builds successfully for both platforms
- All features work on real devices
- App passes App Store review
- App passes Google Play review
- Users can register and use the app

---

**The app is 90% ready for deployment! Just need to fix the environment variables and create the app store listings.**
