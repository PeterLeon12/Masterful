const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client with your real credentials
const supabaseUrl = 'https://cjvrtumhlvbmuryremlw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdnJ0dW1obHZibXVyeXJlbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDA1MDEsImV4cCI6MjA3MzY3NjUwMX0.UcTB6xreDPpuMCEsU-FT_3jMRnhG-2VjK0o6hbx4h_g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8081",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Prea multe cereri de la această adresă IP',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('users').select('count').limit(1);
    
    res.json({
      status: error ? 'ERROR' : 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: error ? 'disconnected' : 'connected',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Test Supabase connection
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      });
      return;
    }

    res.json({
      success: true,
      message: 'Supabase connection successful',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Simple auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'CLIENT' } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password și numele sunt obligatorii'
      });
      return;
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (authError) {
      res.status(400).json({
        success: false,
        message: authError.message
      });
      return;
    }

    if (!authData.user) {
      res.status(400).json({
        success: false,
        message: 'User creation failed'
      });
      return;
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        is_active: true,
        is_verified: false
      })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      res.status(400).json({
        success: false,
        message: profileError.message
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Utilizator creat cu succes',
      data: {
        user: profileData,
        session: authData.session
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la crearea utilizatorului'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email și parola sunt obligatorii'
      });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă'
      });
      return;
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      res.status(404).json({
        success: false,
        message: 'Profilul utilizatorului nu a fost găsit'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        user,
        session: authData.session
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la autentificare'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta nu a fost găsită',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Supabase server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
