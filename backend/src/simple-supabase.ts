import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Supabase client
const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || "http://localhost:8081",
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
app.get('/health', async (_req, res) => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('users').select('count').limit(1);
    
    return res.json({
      status: error ? 'ERROR' : 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: '1.0.0',
      database: error ? 'disconnected' : 'connected',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    return res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Test Supabase connection
app.get('/api/test', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      });
    }

    return res.json({
      success: true,
      message: 'Supabase connection successful',
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error
    });
  }
});

// Simple auth endpoints
app.post('/api/auth/register', async (req, res): Promise<void> => {
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
    logger.error('Register error:', error);
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
      return res.status(400).json({
        success: false,
        message: 'Email și parola sunt obligatorii'
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă'
      });
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'Profilul utilizatorului nu a fost găsit'
      });
    }

    return res.json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        user,
        session: authData.session
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
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
  logger.info(`🚀 Supabase server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  logger.info(`🔗 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:8081'}`);
  logger.info(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
});

export default app;
