import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;
const NODE_ENV = process.env['NODE_ENV'] || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env['FRONTEND_URL'] || "http://localhost:8081",
    "http://localhost:8082",
    "exp://192.168.1.3:8081",
    "exp://192.168.1.3:8082"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// More strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env['npm_package_version'] || '1.0.0'
  });
});

// Simple auth routes for testing
app.post('/api/auth/register', (req, res): any => {
  const { email, password, name, role } = req.body;
  
  // Simple validation
  if (!email || !password || !name || !role) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'Toate câmpurile sunt obligatorii'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password too short',
      message: 'Parola trebuie să aibă cel puțin 8 caractere'
    });
  }

  // Mock user creation
  const mockUser = {
    id: Date.now().toString(),
    email,
    name,
    role,
    isActive: true,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock JWT token
  const mockToken = `mock-jwt-token-${Date.now()}`;
  const mockRefreshToken = `mock-refresh-token-${Date.now()}`;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    }
  });
});

app.post('/api/auth/login', (req, res): any => {
  const { email, password } = req.body;
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing credentials',
      message: 'Email și parola sunt obligatorii'
    });
  }

  // Mock authentication
  const mockUser = {
    id: '1',
    email,
    name: email.split('@')[0],
    role: 'CLIENT',
    isActive: true,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock JWT token
  const mockToken = `mock-jwt-token-${Date.now()}`;
  const mockRefreshToken = `mock-refresh-token-${Date.now()}`;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    }
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Mock data endpoints
app.get('/api/jobs', (_req, res) => {
  const mockJobs = [
    {
      id: '1',
      title: 'Asamblare dulap IKEA',
      description: 'Am nevoie de ajutor pentru asamblarea unui dulap IKEA',
      category: 'furniture',
      location: JSON.stringify({ county: 'București', city: 'Sectorul 1' }),
      budget: JSON.stringify({ type: 'fixed', amount: 150, currency: 'RON' }),
      status: 'ACTIVE',
      clientId: '1',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Montare TV pe perete',
      description: 'Caut pe cineva să-mi monteze TV-ul pe perete',
      category: 'electronics',
      location: JSON.stringify({ county: 'Cluj', city: 'Cluj-Napoca' }),
      budget: JSON.stringify({ type: 'fixed', amount: 200, currency: 'RON' }),
      status: 'ACTIVE',
      clientId: '1',
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: {
      jobs: mockJobs,
      total: mockJobs.length,
      page: 1,
      totalPages: 1
    }
  });
});

app.get('/api/professionals', (_req, res) => {
  const mockProfessionals = [
    {
      id: '1',
      userId: '2',
      categories: 'furniture,electronics',
      hourlyRate: 50,
      currency: 'RON',
      rating: 4.8,
      reviewCount: 12,
      isVerified: true,
      isAvailable: true,
      experience: 5
    },
    {
      id: '2',
      userId: '3',
      categories: 'plumbing,electrical',
      hourlyRate: 60,
      currency: 'RON',
      rating: 4.9,
      reviewCount: 8,
      isVerified: true,
      isAvailable: true,
      experience: 7
    }
  ];

  res.json({
    success: true,
    data: {
      professionals: mockProfessionals,
      total: mockProfessionals.length,
      page: 1,
      totalPages: 1
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'Ruta nu a fost găsită',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📱 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:8081'}`);
  console.log(`🔌 API available at: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
