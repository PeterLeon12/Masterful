const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Supabase Connection with Real Credentials...');
console.log('====================================================');

// Your real credentials
const supabaseUrl = 'https://cjvrtumhlvbmuryremlw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdnJ0dW1obHZibXVyeXJlbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDA1MDEsImV4cCI6MjA3MzY3NjUwMX0.UcTB6xreDPpuMCEsU-FT_3jMRnhG-2VjK0o6hbx4h_g';

console.log('Testing with your real credentials...');
console.log('📊 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey.substring(0, 30) + '...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('✅ Supabase client created successfully');
  
  // Test connection
  console.log('\n🔍 Testing database connection...');
  
  supabase.from('users').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Database connection failed:', error.message);
        console.log('\n💡 This might be because:');
        console.log('1. The database schema hasn\'t been created yet');
        console.log('2. The table "users" doesn\'t exist');
        console.log('3. RLS policies are blocking access');
        console.log('\n🎯 Next steps:');
        console.log('1. Run the SQL schema in your Supabase dashboard');
        console.log('2. Check if the "users" table exists');
        console.log('3. Verify RLS policies');
      } else {
        console.log('✅ Database connection successful!');
        console.log('📊 Data:', data);
        console.log('\n🎉 Ready to start the server!');
      }
    })
    .catch(err => {
      console.log('❌ Connection error:', err.message);
    });
  
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}
