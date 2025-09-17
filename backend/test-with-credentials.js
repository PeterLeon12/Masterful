const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Supabase Connection with Your Credentials...');
console.log('====================================================');

// Your actual credentials - but we need the correct URL format
// The URL should be: https://[project-ref].supabase.co
// NOT: https://timis.petre51@gmail.com.supabase.co

console.log('❌ The URL format is incorrect!');
console.log('📊 Current URL:', 'https://timis.petre51@gmail.com.supabase.co');
console.log('✅ Correct format should be:', 'https://[your-project-ref].supabase.co');
console.log('\n🎯 To get the correct URL:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Go to Settings → API');
console.log('3. Copy the "Project URL" (it should look like: https://abcdefghijklmnop.supabase.co)');
console.log('4. The anon key should start with "eyJ" and be very long');
console.log('\n📋 Your credentials should look like:');
console.log('SUPABASE_URL=https://abcdefghijklmnop.supabase.co');
console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');