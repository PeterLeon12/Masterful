const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Supabase Connection...');
console.log('================================');

// Test with placeholder credentials first
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

console.log('Testing with placeholder credentials...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('✅ Supabase client created successfully');
  console.log('📊 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
  
  console.log('\n❌ This will fail because credentials are placeholders');
  console.log('📋 Please update your credentials in backend/.env.supabase');
  console.log('\n🎯 Next steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Copy your real credentials');
  console.log('3. Update backend/.env.supabase');
  console.log('4. Run: node test-supabase.js');
  
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}
