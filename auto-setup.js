#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Auto Phase 4 Setup Script');
console.log('=============================');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  log('❌ Please run this script from the project root directory', 'red');
  process.exit(1);
}

// Step 1: Create Supabase project instructions
log('\n📋 STEP 1: Create Supabase Project', 'blue');
log('=====================================', 'blue');
log('1. Go to https://supabase.com');
log('2. Click "New Project"');
log('3. Fill in:');
log('   - Name: masterful-romanian-marketplace');
log('   - Database Password: [generate strong password]');
log('   - Region: eu-west-1 (Europe)');
log('4. Click "Create new project"');
log('5. Wait 2-3 minutes for project creation');

// Step 2: Get credentials
log('\n🔑 STEP 2: Get Your Credentials', 'blue');
log('=================================', 'blue');
log('1. In Supabase dashboard, go to Settings → API');
log('2. Copy these values:');
log('   - Project URL (https://[project-ref].supabase.co)');
log('   - anon public key (eyJ... long string)');
log('   - service_role key (eyJ... long string)');

// Interactive setup
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupCredentials() {
  log('\n⚙️  STEP 3: Enter Your Supabase Credentials', 'yellow');
  log('============================================', 'yellow');
  
  const supabaseUrl = await askQuestion('Enter your Supabase URL: ');
  const supabaseAnonKey = await askQuestion('Enter your anon public key: ');
  const supabaseServiceKey = await askQuestion('Enter your service_role key: ');
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    log('❌ All credentials are required!', 'red');
    process.exit(1);
  }
  
  // Update environment file
  const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

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
ENABLE_SUBSCRIPTIONS=false`;

  fs.writeFileSync('backend/.env.supabase', envContent);
  log('✅ Environment file updated!', 'green');
  
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
}

async function setupDatabase() {
  log('\n🗄️  STEP 4: Set Up Database Schema', 'blue');
  log('====================================', 'blue');
  log('1. In Supabase dashboard, go to SQL Editor');
  log('2. Copy the contents of backend/supabase-schema.sql');
  log('3. Paste in SQL Editor and click "Run"');
  log('4. Wait for schema creation to complete');
  
  const ready = await askQuestion('Press Enter when database schema is ready...');
  return true;
}

async function testConnection() {
  log('\n🧪 STEP 5: Test Connection', 'blue');
  log('==========================', 'blue');
  
  try {
    // Test the simple server
    log('Starting test server...', 'yellow');
    
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: 'backend/.env.supabase' });
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      log('❌ Supabase credentials not found in environment file', 'red');
      return false;
    }
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      log(`❌ Supabase connection failed: ${error.message}`, 'red');
      log('Make sure the database schema was created properly', 'yellow');
      return false;
    }
    
    log('✅ Supabase connection successful!', 'green');
    return true;
    
  } catch (err) {
    log(`❌ Test failed: ${err.message}`, 'red');
    return false;
  }
}

async function startServer() {
  log('\n🚀 STEP 6: Start the Server', 'blue');
  log('============================', 'blue');
  
  try {
    log('Starting Supabase server...', 'yellow');
    
    // Start the server in background
    const { spawn } = require('child_process');
    
    const server = spawn('npm', ['run', 'dev:supabase'], {
      cwd: 'backend',
      stdio: 'pipe'
    });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running')) {
        log('✅ Server started successfully!', 'green');
        log('📊 Health check: http://localhost:3000/health', 'blue');
        log('🧪 Test endpoint: http://localhost:3000/api/test', 'blue');
      }
    });
    
    server.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('error')) {
        log(`❌ Server error: ${error}`, 'red');
      }
    });
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test the server
    try {
      const http = require('http');
      
      const testHealth = () => {
        return new Promise((resolve) => {
          const req = http.get('http://localhost:3000/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                const result = JSON.parse(data);
                resolve(result.status === 'OK');
              } catch (e) {
                resolve(false);
              }
            });
          });
          req.on('error', () => resolve(false));
          req.setTimeout(5000, () => resolve(false));
        });
      };
      
      const isHealthy = await testHealth();
      
      if (isHealthy) {
        log('✅ Server is healthy and running!', 'green');
        log('\n🎉 Phase 4 Setup Complete!', 'green');
        log('============================', 'green');
        log('Your app is now running on:');
        log('• Supabase (database + auth)');
        log('• Vercel (ready for deployment)');
        log('• Stripe (payments)');
        log('\n📱 Update your iPhone app to use:');
        log('EXPO_PUBLIC_API_URL=http://192.168.1.3:3000/api');
        log('\n🚀 To deploy to Vercel:');
        log('cd backend && vercel --prod');
      } else {
        log('❌ Server health check failed', 'red');
      }
      
    } catch (err) {
      log(`❌ Server test failed: ${err.message}`, 'red');
    }
    
  } catch (err) {
    log(`❌ Failed to start server: ${err.message}`, 'red');
  }
}

async function main() {
  try {
    log('Welcome to Phase 4 Auto Setup!', 'green');
    log('This will set up Supabase + Vercel for your Romanian marketplace app.', 'blue');
    
    const credentials = await setupCredentials();
    await setupDatabase();
    
    const connectionOk = await testConnection();
    if (!connectionOk) {
      log('❌ Setup failed. Please check your credentials and database schema.', 'red');
      process.exit(1);
    }
    
    await startServer();
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

main();
