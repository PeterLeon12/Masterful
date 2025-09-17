# Masterful - Romanian Marketplace App

A React Native marketplace application connecting clients with skilled professionals for various services in Romania.

## 🚀 Features

- **User Authentication**: Secure login/register with role-based access (Client/Professional)
- **Job Posting**: Clients can post jobs with detailed requirements
- **Professional Search**: Find professionals by category, location, rating, and more
- **Real-time Communication**: Chat system between clients and professionals
- **Payment Integration**: Secure payment processing with Stripe
- **Location Services**: Enhanced location picker with Romanian cities
- **Multi-language Support**: Romanian and English localization
- **Push Notifications**: Real-time updates for job status and messages

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + Custom Hooks
- **API**: RESTful API with TypeScript
- **Authentication**: JWT tokens with secure storage
- **Database**: PostgreSQL (recommended) or Firebase
- **Payments**: Stripe integration
- **Notifications**: Expo Push Notifications
- **Maps**: Google Maps API

## 📱 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd Masterful
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true

# Payment Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EXPO_PUBLIC_ENABLE_IN_APP_PURCHASES=true

# Maps & Location
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true

# Social Login
EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN=true
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_ENABLE_APPLE_LOGIN=true
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id

# Push Notifications
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id

# Development
EXPO_PUBLIC_ENABLE_DEBUG_MODE=true
```

### 4. Start the development server
```bash
npx expo start
```

### 5. Run on your preferred platform
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web**: Press `w`
- **Physical Device**: Scan the QR code with Expo Go app

## 🏗 Project Structure

```
Masterful/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── professional/      # Professional-specific screens
├── components/             # Reusable UI components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── services/               # API services and utilities
├── utils/                  # Helper functions and utilities
├── config/                 # Configuration files
├── constants/              # App constants and data
└── assets/                 # Images, fonts, and other assets
```

## 🔧 Development

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### API Integration
- All API calls go through the `services/api.ts` file
- Use the custom hooks in `hooks/useApi.ts` for data fetching
- Implement proper error handling with user-friendly messages
- Add retry mechanisms for failed requests

### State Management
- Use React Context for global state (auth, user preferences)
- Use local state for component-specific data
- Implement proper loading and error states
- Use React Query patterns for server state

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Building for Production

### 1. Configure EAS Build
```bash
npx eas build:configure
```

### 2. Build for different platforms
```bash
# Development build
npx eas build --platform ios --profile development
npx eas build --platform android --profile development

# Preview build
npx eas build --platform all --profile preview

# Production build
npx eas build --platform all --profile production
```

### 3. Submit to app stores
```bash
# iOS App Store
npx eas submit --platform ios

# Google Play Store
npx eas submit --platform android
```

## 🔒 Security Considerations

- Never commit sensitive data to version control
- Use environment variables for API keys and secrets
- Implement proper input validation
- Use HTTPS for all API communications
- Implement rate limiting on API endpoints
- Store sensitive data securely using Expo SecureStore
- Implement proper session management

## 📱 Platform-Specific Setup

### iOS
- Configure App Store Connect
- Set up Apple Developer account
- Configure push notification certificates
- Set up in-app purchase products

### Android
- Configure Google Play Console
- Set up Firebase project
- Configure signing keys
- Set up Google Play Billing

## 🌐 Internationalization (i18n)

The app supports both Romanian and English:
- Romanian is the primary language
- English is available as a secondary option
- All user-facing text should be localized
- Use the i18n utilities for dynamic text

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

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
- `GET /api/professionals` - List professionals with filters
- `GET /api/professionals/:id` - Get professional details
- `PUT /api/professionals/profile` - Update professional profile

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Package compatibility warnings**
   ```bash
   npm install react-native@0.79.5 react-native-safe-area-context@5.4.0
   ```

3. **iOS build errors**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android build errors**
   ```bash
   npx expo run:android --clear
   ```

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Native documentation](https://reactnative.dev/)
- Search existing issues in the repository
- Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Email: support@masterful.app
- Documentation: [docs.masterful.app](https://docs.masterful.app)
- Community: [community.masterful.app](https://community.masterful.app)

---

**Note**: This is a development version. For production use, ensure all security measures are properly implemented and tested.
