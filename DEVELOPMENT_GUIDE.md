# 🛠️ Development Guide

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Git
- Code editor (VS Code recommended)

### **Development Environment Setup**

1. **Clone and Install**
```bash
git clone https://github.com/PeterLeon12/Masterful.git
cd Masterful
npm install
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your development credentials
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Start Development Servers**
```bash
# Terminal 1: Start Expo development server
npm start

# Terminal 2: Start backend server (if running locally)
cd backend
npm install
npm run dev
```

## 📁 **Project Structure**

```
Masterful/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Registration screen
│   │   └── forgot-password.tsx  # Password reset
│   ├── (tabs)/                  # Main app tabs
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home screen
│   │   ├── search.tsx           # Search screen
│   │   ├── post-job.tsx         # Job posting
│   │   ├── messages.tsx         # Messages
│   │   └── profile.tsx          # User profile
│   ├── chat/                    # Chat functionality
│   │   └── [jobId].tsx          # Chat room
│   ├── professional/            # Professional features
│   │   ├── onboarding.tsx       # Basic onboarding
│   │   └── onboarding-enhanced.tsx # Enhanced onboarding
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── ChatInput.tsx            # Chat input component
│   ├── ChatMessage.tsx          # Message display
│   ├── JobApplicationCard.tsx   # Job application UI
│   ├── PaymentForm.tsx          # Payment form
│   └── ...                      # Other components
├── services/                     # API and external services
│   ├── api.ts                   # Main API client
│   ├── enhancedApi.ts           # Enhanced API client
│   ├── supabaseRealtimeService.ts # Real-time features
│   └── socketService.ts         # WebSocket service
├── hooks/                        # Custom React hooks
│   ├── useApi.ts                # API hook
│   ├── useRealtimeChat.ts       # Chat hook
│   └── useNetworkStatus.ts      # Network status hook
├── contexts/                     # React contexts
│   └── OptimalAuthContext.tsx   # Authentication context
├── constants/                    # App constants
│   ├── romanian-locations.ts    # Location data
│   └── service-categories.ts    # Service categories
├── utils/                        # Utility functions
│   ├── errorHandler.ts          # Error handling
│   ├── logger.ts                # Logging utility
│   └── typeGuards.ts            # Type checking
├── backend/                      # Backend API server
│   ├── src/                     # Source code
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Backend utilities
│   ├── prisma/                  # Database schema
│   └── package.json             # Backend dependencies
└── config/                       # Configuration files
    └── environment.ts            # Environment config
```

## 🔧 **Development Workflow**

### **1. Feature Development**

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**
- Follow the existing code structure
- Use TypeScript for type safety
- Write clean, readable code
- Add comments for complex logic

3. **Test Changes**
```bash
# Run the app
npm start

# Test on web
npm run start-web

# Test on mobile (with Expo Go app)
# Scan QR code with Expo Go
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

### **2. Code Style Guidelines**

#### **TypeScript**
- Use strict typing
- Define interfaces for data structures
- Use enums for constants
- Avoid `any` type

#### **React Components**
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Use proper prop types
- Follow naming conventions (PascalCase)

#### **File Naming**
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Constants: `kebab-case.ts`

#### **Code Organization**
- Group related functionality
- Keep components small and focused
- Extract business logic into services
- Use proper imports and exports

### **3. Testing**

#### **Manual Testing**
```bash
# Test authentication flow
# Test job posting
# Test search functionality
# Test messaging
# Test payment flow
```

#### **Component Testing**
```bash
# Run component tests
npm test

# Run with coverage
npm run test:coverage
```

## 🗄️ **Database Development**

### **Supabase Setup**

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project
   - Note down URL and anon key

2. **Run Database Migrations**
```bash
# Run the schema setup
psql -h your-db-host -U postgres -d postgres -f backend/supabase-schema.sql
```

3. **Set up Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
-- (See supabase-schema.sql for examples)
```

### **Database Schema**

#### **Core Tables**
- `users`: User accounts and profiles
- `jobs`: Job postings
- `job_applications`: Professional applications
- `messages`: Chat messages
- `conversations`: Chat conversations
- `reviews`: User reviews and ratings

#### **Relationships**
- Users can have multiple jobs (one-to-many)
- Jobs can have multiple applications (one-to-many)
- Users can have multiple conversations (many-to-many)
- Conversations can have multiple messages (one-to-many)

## 🔌 **API Development**

### **Backend Server**

1. **Start Development Server**
```bash
cd backend
npm install
npm run dev
```

2. **API Endpoints**
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Jobs: `/api/jobs/*`
- Professionals: `/api/professionals/*`
- Messages: `/api/messages/*`
- Payments: `/api/payments/*`

3. **Testing API**
```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### **Real-time Features**

1. **WebSocket Connection**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: { token: userToken }
});
```

2. **Event Handling**
```javascript
socket.on('message:new', (message) => {
  // Handle new message
});

socket.on('message:typing', (data) => {
  // Handle typing indicator
});
```

## 🎨 **UI/UX Development**

### **Styling Guidelines**

1. **Use NativeWind (Tailwind CSS)**
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">
    Hello World
  </Text>
</View>
```

2. **Component Styling**
- Use consistent spacing (4, 8, 16, 24px)
- Follow color palette
- Use proper typography hierarchy
- Ensure accessibility

3. **Responsive Design**
- Test on different screen sizes
- Use responsive classes
- Handle orientation changes

### **Component Development**

1. **Create New Component**
```tsx
// components/NewComponent.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface NewComponentProps {
  title: string;
  onPress?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onPress
}) => {
  return (
    <View className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-semibold">{title}</Text>
    </View>
  );
};
```

2. **Use Component**
```tsx
import { NewComponent } from '@/components/NewComponent';

// In your screen
<NewComponent title="Hello" onPress={handlePress} />
```

## 🔍 **Debugging**

### **Common Issues**

1. **Metro Bundler Issues**
```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx expo r -c
```

2. **TypeScript Errors**
```bash
# Check TypeScript
npx tsc --noEmit

# Fix type issues
# Add proper type definitions
```

3. **Network Issues**
- Check API URL configuration
- Verify CORS settings
- Check network connectivity

### **Debug Tools**

1. **React Native Debugger**
- Install React Native Debugger
- Connect to Metro bundler
- Inspect component state

2. **Expo Dev Tools**
- Use Expo Dev Tools in browser
- Check logs and errors
- Test on different devices

3. **Console Logging**
```javascript
// Use logger utility
import { logger } from '@/utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('API error', error);
```

## 📱 **Mobile Development**

### **iOS Development**

1. **Prerequisites**
- macOS with Xcode
- iOS Simulator
- Apple Developer Account (for device testing)

2. **Run on iOS**
```bash
# Start iOS simulator
npm run ios

# Or use Expo Go app
npm start
# Scan QR code with Expo Go
```

### **Android Development**

1. **Prerequisites**
- Android Studio
- Android SDK
- Android Emulator or device

2. **Run on Android**
```bash
# Start Android emulator
npm run android

# Or use Expo Go app
npm start
# Scan QR code with Expo Go
```

## 🚀 **Deployment**

### **Development Deployment**

1. **Expo Web**
```bash
# Deploy to Expo web
expo publish --platform web
```

2. **Mobile Development Build**
```bash
# Create development build
eas build --profile development --platform all
```

### **Production Deployment**

1. **Expo Web Production**
```bash
# Deploy to production
expo publish --platform web --release-channel production
```

2. **Mobile App Store**
```bash
# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --platform all
```

## 🧪 **Testing Strategy**

### **Unit Testing**
- Test individual components
- Test utility functions
- Test custom hooks

### **Integration Testing**
- Test API endpoints
- Test authentication flow
- Test real-time features

### **E2E Testing**
- Test complete user journeys
- Test cross-platform functionality
- Test performance

## 📊 **Performance Optimization**

### **Frontend Optimization**
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use lazy loading where appropriate

### **Backend Optimization**
- Implement proper caching
- Use database indexes
- Optimize queries
- Implement rate limiting

## 🔒 **Security Best Practices**

### **Frontend Security**
- Validate all inputs
- Sanitize user data
- Use secure storage for tokens
- Implement proper error handling

### **Backend Security**
- Use JWT for authentication
- Implement proper CORS
- Validate all requests
- Use environment variables for secrets

## 📝 **Documentation**

### **Code Documentation**
- Add JSDoc comments
- Document complex functions
- Keep README updated
- Document API changes

### **Commit Messages**
- Use conventional commits
- Be descriptive and clear
- Reference issues when applicable

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**
3. **Make changes**
4. **Test thoroughly**
5. **Submit pull request**

## 📞 **Support**

- **Documentation**: This guide and API docs
- **Issues**: [GitHub Issues](https://github.com/PeterLeon12/Masterful/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PeterLeon12/Masterful/discussions)
- **Email**: timis.petre51@gmail.com
