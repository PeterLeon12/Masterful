import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
// Simple logger replacement
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  debug: (message: string, meta?: any) => console.debug(`[DEBUG] ${message}`, meta || '')
};

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
    
    res.json({
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
    res.status(500).json({
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
      res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      });
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

// Professionals endpoint
app.get('/api/professionals', async (req, res): Promise<void> => {
  try {
    const {
      categories,
      minRating,
      maxHourlyRate,
      isAvailable,
      limit = 20,
      offset = 0
    } = req.query;

    // Build the query
    let query = supabase
      .from('professionals')
      .select(`
        *,
        user:users!professionals_user_id_fkey (
          id,
          name,
          email,
          avatar,
          phone
        )
      `)
      .eq('is_available', true);

    // Apply filters
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      query = query.overlaps('categories', categoryArray);
    }

    if (minRating) {
      query = query.gte('rating', parseFloat(minRating as string));
    }

    if (maxHourlyRate) {
      query = query.lte('hourly_rate', parseFloat(maxHourlyRate as string));
    }

    if (isAvailable !== undefined) {
      query = query.eq('is_available', isAvailable === 'true');
    }

    // Apply pagination
    query = query
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)
      .order('rating', { ascending: false });

    const { data: professionals, error, count } = await query;

    if (error) {
      logger.error('Error fetching professionals:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare la încărcarea meșterilor',
        error: error.message
      });
    }

    // Calculate average ratings and review counts
    const professionalsWithStats = professionals?.map(professional => {
      return {
        id: professional.id,
        user: professional.user,
        categories: professional.categories,
        service_areas: professional.service_areas,
        hourly_rate: professional.hourly_rate,
        rating: professional.rating || 0,
        review_count: 0,
        completed_jobs: professional.completed_jobs || 0,
        is_available: professional.is_available,
        bio: professional.bio,
        experience_years: professional.experience_years,
        languages: professional.languages,
        created_at: professional.created_at,
        updated_at: professional.updated_at
      };
    }) || [];

    res.json({
      success: true,
      data: {
        professionals: professionalsWithStats,
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
    return;

  } catch (error) {
    logger.error('Error in getProfessionals:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res): Promise<void> => {
  try {
    const { limit = 20, offset = 0, category, status = 'OPEN' } = req.query;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:users!jobs_client_id_fkey (
          id,
          name,
          email,
          avatar
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    query = query
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      logger.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare la încărcarea joburilor',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        jobs: jobs || [],
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
    return;

  } catch (error) {
    logger.error('Error in getJobs:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/jobs', async (req, res): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      location,
      budget_min,
      budget_max,
      deadline,
      requirements,
      images = []
    } = req.body;

    // For now, we'll use a hardcoded client_id since we don't have auth middleware
    // In a real app, this would come from the authenticated user
    const clientId = '7c2ba961-c16e-499e-83c9-a01abc0ea30a'; // test@example.com

    if (!title || !description || !category || !location) {
      res.status(400).json({
        success: false,
        message: 'Toate câmpurile obligatorii trebuie completate'
      });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        client_id: clientId,
        title,
        description,
        category,
        location: JSON.stringify(location),
        budget_min: budget_min ? parseFloat(budget_min) : null,
        budget_max: budget_max ? parseFloat(budget_max) : null,
        deadline: deadline || null,
        requirements: requirements || null,
        images: images || [],
        status: 'OPEN'
      })
      .select(`
        *,
        client:users!jobs_client_id_fkey (
          id,
          name,
          email,
          avatar
        )
      `)
      .single();

    if (error) {
      logger.error('Error creating job:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare la crearea jobului',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: job
    });
    return;

  } catch (error) {
    logger.error('Error in createJob:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului',
      error: error instanceof Error ? error.message : 'Unknown error'
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
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user!.id)
      .single();

    if (userError || !user) {
      res.status(404).json({
        success: false,
        message: 'Profilul utilizatorului nu a fost găsit'
      });
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
    logger.error('Login error:', error);
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
  logger.info(`🚀 Supabase server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  logger.info(`🔗 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:8081'}`);
  logger.info(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
});

export default app;
