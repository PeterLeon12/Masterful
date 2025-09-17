#!/bin/bash

echo "🚀 Phase 4 Setup: Supabase + Vercel Migration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Setting up Phase 4 migration..."

# Step 1: Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    print_info "Installing Vercel CLI..."
    npm install -g vercel
    print_status "Vercel CLI installed"
else
    print_status "Vercel CLI already installed"
fi

# Step 2: Create environment file for Supabase
print_info "Creating Supabase environment file..."

cat > backend/.env.supabase << 'EOF'
# Supabase Configuration
# Replace these with your actual Supabase credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8081

# Stripe Configuration (keep your existing keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Security
BCRYPT_ROUNDS=12

# Development
ENABLE_DEBUG_MODE=true
ENABLE_SWAGGER=true
ENABLE_CORS_DEBUG=false

# Feature Flags
ENABLE_EMAIL_VERIFICATION=false
ENABLE_PHONE_VERIFICATION=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_SOCIAL_LOGIN=false
ENABLE_FILE_UPLOAD=true
ENABLE_PAYMENTS=true
ENABLE_SUBSCRIPTIONS=false
EOF

print_status "Environment file created: backend/.env.supabase"

# Step 3: Install dependencies
print_info "Installing dependencies..."
cd backend
npm install
print_status "Dependencies installed"

# Step 4: Build the project
print_info "Building TypeScript..."
npm run build
print_status "TypeScript compiled"

# Step 5: Test the Supabase server
print_info "Testing Supabase server..."
print_warning "Make sure to update backend/.env.supabase with your Supabase credentials first!"

# Create a test script
cat > test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.supabase' });

async function testSupabase() {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project-ref')) {
        console.log('❌ Please update .env.supabase with your Supabase credentials');
        console.log('   SUPABASE_URL=https://your-project-ref.supabase.co');
        console.log('   SUPABASE_ANON_KEY=your-supabase-anon-key');
        console.log('   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key');
        return;
    }

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.log('❌ Supabase connection failed:', error.message);
        } else {
            console.log('✅ Supabase connection successful!');
        }
    } catch (err) {
        console.log('❌ Supabase test failed:', err.message);
    }
}

testSupabase();
EOF

print_status "Test script created"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 🌐 Go to https://supabase.com and create a new project"
echo "2. 📋 Copy your Supabase credentials from Settings → API"
echo "3. ✏️  Edit backend/.env.supabase with your real credentials"
echo "4. 🗄️  Run the database schema in Supabase SQL Editor:"
echo "   - Copy contents of backend/supabase-schema.sql"
echo "   - Paste in Supabase SQL Editor and run"
echo "5. 🧪 Test the connection:"
echo "   cd backend && node test-supabase.js"
echo "6. 🚀 Start the server:"
echo "   npm run dev:supabase"
echo "7. 🌍 Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "📖 Full instructions in PHASE4_SETUP.md"
echo ""
print_status "Phase 4 setup script completed!"
