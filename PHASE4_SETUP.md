# Phase 4 Setup Guide: Supabase + Vercel Migration

This guide will help you migrate from the current Prisma + JWT setup to Supabase + Vercel as outlined in Phase 4.

## 🎯 Phase 4 Goals

- **Supabase**: Database + Auth + Real-time (FREE up to 50K users)
- **Vercel**: Hosting and deployment (FREE up to 100GB bandwidth)  
- **Stripe**: Already implemented ✅

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Stripe Account**: Already configured ✅

## 🚀 Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `masterful-romanian-marketplace`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., `eu-west-1` for Europe)
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 1.3 Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `backend/supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all tables, indexes, and RLS policies

### 1.4 Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:8081` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Templates**: Customize as needed

## 🚀 Step 2: Set Up Vercel

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Configure Environment Variables

Create a `.env.production` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Security
BCRYPT_ROUNDS=12
```

## 🚀 Step 3: Deploy to Vercel

### 3.1 Deploy Backend

```bash
cd backend
vercel --prod
```

### 3.2 Update Frontend Configuration

Update your frontend `.env` file:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://your-backend-domain.vercel.app/api
```

## 🚀 Step 4: Test the Migration

### 4.1 Test Backend

```bash
# Test health endpoint
curl https://your-backend-domain.vercel.app/health

# Test registration
curl -X POST https://your-backend-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 4.2 Test Frontend

1. Update your app to use the new API URL
2. Test all features:
   - User registration/login
   - Job posting
   - Professional profiles
   - Messaging
   - Payments

## 🔄 Migration Strategy

### Option A: Gradual Migration (Recommended)

1. **Keep current system running** (Prisma + JWT)
2. **Deploy Supabase version** to a separate Vercel project
3. **Test thoroughly** with the new system
4. **Switch frontend** to point to new backend when ready
5. **Migrate data** from old system to Supabase
6. **Decommission** old system

### Option B: Direct Migration

1. **Set up Supabase** and Vercel
2. **Migrate data** from current database to Supabase
3. **Deploy new backend** to Vercel
4. **Update frontend** to use new backend
5. **Test everything** thoroughly

## 📊 Data Migration

### Export Current Data

```bash
# Export from current SQLite database
sqlite3 backend/prisma/dev.db ".dump" > data_export.sql
```

### Import to Supabase

1. Go to Supabase **SQL Editor**
2. Run the exported SQL (may need modifications)
3. Or use Supabase's data import tools

## 🔧 Development Commands

### Run Supabase Version Locally

```bash
cd backend
npm run dev:supabase
```

### Deploy to Vercel

```bash
cd backend
npm run deploy:vercel
```

## 🎉 Benefits of Phase 4

### Supabase Benefits
- ✅ **Free up to 50K users**
- ✅ **Built-in authentication**
- ✅ **Real-time subscriptions**
- ✅ **Automatic API generation**
- ✅ **Row Level Security (RLS)**
- ✅ **PostgreSQL database**

### Vercel Benefits
- ✅ **Free up to 100GB bandwidth**
- ✅ **Automatic deployments**
- ✅ **Global CDN**
- ✅ **Serverless functions**
- ✅ **Easy scaling**

### Stripe Benefits
- ✅ **Already implemented**
- ✅ **Production ready**
- ✅ **Secure payments**

## 🚨 Important Notes

1. **Backup your data** before migration
2. **Test thoroughly** in staging environment
3. **Update all API calls** in frontend
4. **Configure CORS** properly
5. **Set up monitoring** and logging
6. **Update documentation**

## 📞 Support

If you encounter issues:

1. Check Supabase logs in dashboard
2. Check Vercel function logs
3. Review environment variables
4. Test API endpoints individually
5. Check CORS configuration

## 🎯 Next Steps

1. **Set up Supabase project**
2. **Deploy to Vercel**
3. **Test all functionality**
4. **Update frontend**
5. **Go live!**

---

**Phase 4 Complete!** 🎉

Your Romanian marketplace app is now running on:
- **Supabase** for database and auth
- **Vercel** for hosting
- **Stripe** for payments
