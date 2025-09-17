# Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the environment template and configure it:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
- Set `DATABASE_URL` for your PostgreSQL database
- Set `JWT_SECRET` for authentication
- Configure other services as needed

### 3. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL and Redis
docker compose up -d

# The database will be available at:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# pgAdmin: http://localhost:5050 (admin@masterful.app / admin123)
# Redis Commander: http://localhost:8081
```

#### Option B: Local PostgreSQL
- Install PostgreSQL 15+
- Create database: `masterful_db`
- Update `DATABASE_URL` in `.env`

### 4. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📊 Database Schema

The Prisma schema includes:
- **Users**: Authentication and basic info
- **Profiles**: Extended user information
- **Professionals**: Professional-specific data
- **Clients**: Client-specific data
- **Jobs**: Job postings and management
- **Applications**: Job applications
- **Messages**: Real-time communication
- **Payments**: Payment processing
- **Reviews**: Rating and feedback system
- **Notifications**: User notifications

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/switch-role` - Switch user role

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Professionals
- `GET /api/professionals` - List professionals
- `GET /api/professionals/:id` - Get professional details
- `PUT /api/professionals/profile` - Update professional profile

### File Upload
- `POST /api/upload/avatar` - Upload profile picture
- `POST /api/upload/document` - Upload documents

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting (5 requests/15min for auth, 100 requests/15min for general)
- Input validation with express-validator
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- Role-based access control

## 📱 Real-time Features

- Socket.IO integration for real-time communication
- Live chat between clients and professionals
- Real-time job updates and notifications
- Typing indicators
- Online/offline status

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Enable HTTPS
5. Configure logging
6. Set up monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **JWT Errors**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

4. **Prisma Errors**
   - Run `npm run db:generate`
   - Check database schema
   - Verify database connection

### Getting Help

- Check the logs for detailed error messages
- Verify environment variables
- Ensure all dependencies are installed
- Check database connectivity

## 📚 Next Steps

1. **Complete the Controllers**: Implement the auth, user, job, and professional controllers
2. **Add Business Logic**: Implement job matching, payment processing, etc.
3. **Testing**: Add comprehensive test coverage
4. **Documentation**: Generate API documentation with Swagger
5. **Monitoring**: Add health checks and monitoring
6. **Deployment**: Set up CI/CD pipeline
