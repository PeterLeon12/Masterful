# 🚀 Masterful - Romanian Marketplace App

A comprehensive marketplace application connecting clients with professional service providers across Romania.

## 📱 **APP OVERVIEW**

Masterful is a full-stack marketplace application built with React Native and Expo, designed to connect clients with professional service providers across Romania. The app features real-time messaging, job posting, professional profiles, and integrated payment processing.

## ✨ **KEY FEATURES**

### 🔐 **Authentication & User Management**
- **User Registration/Login** with email validation
- **Role-based Access** (Client vs Professional)
- **Profile Management** with photo upload
- **Secure Authentication** with JWT tokens

### 💼 **Job Marketplace**
- **Job Posting** with detailed descriptions
- **Service Categories** (Plumbing, Electrical, Cleaning, etc.)
- **Location-based Search** with Romanian cities
- **Job Application System**

### 👨‍💼 **Professional Profiles**
- **Comprehensive Onboarding** (6-step process)
- **Service Categories** selection
- **Working Hours** configuration
- **Service Areas** specification
- **Certifications** and insurance details
- **Portfolio** and image uploads

### 💬 **Real-time Communication**
- **Instant Messaging** between clients and professionals
- **Typing Indicators** for real-time feedback
- **Message History** with persistence
- **File Sharing** (coming soon)
- **Location Sharing** (coming soon)

### 🔍 **Advanced Search & Filtering**
- **Text Search** across profiles and services
- **Category Filtering** by service type
- **Location Filtering** by city/county
- **Rating Filtering** by professional ratings
- **Availability** filtering

### 💳 **Subscription Model**
- **7-day Free Trial** for all users
- **Monthly/Yearly Plans** for premium access
- **Unlimited Job Posting** for subscribers
- **Priority Support** for subscribers

### 🗺️ **Location Services**
- **Romanian Cities** database (15,000+ locations)
- **County-based** organization
- **Population-based** filtering
- **Enhanced Location Picker** with search

## 🛠️ **TECHNICAL STACK**

### **Frontend**
- **React Native** with Expo
- **Expo Router** for navigation
- **NativeWind** for styling
- **Zustand** for state management
- **React Query** for data fetching

### **Backend**
- **Node.js** with Express
- **Supabase** for database and authentication
- **PostgreSQL** database
- **WebSocket** for real-time features

### **Services**
- **Stripe** for payment processing
- **Supabase** for database and real-time features
- **Expo** for deployment and build services

## 📁 **PROJECT STRUCTURE**

```
Masterful/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── chat/              # Chat functionality
│   └── professional/      # Professional onboarding
├── components/            # Reusable UI components
├── services/              # API and external services
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── constants/             # App constants and data
├── utils/                 # Utility functions
├── backend/               # Backend API server
└── config/                # Configuration files
```

## 🚀 **QUICK START**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- Stripe account

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/PeterLeon12/Masterful.git
cd Masterful
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. **Start the development server**
```bash
# For web
npm run start-web

# For mobile
npm start
```

## 📱 **DEPLOYMENT**

### **Expo Web Deployment**
```bash
# Install Expo CLI
npm install -g @expo/cli

# Login to Expo
expo login

# Deploy web version
expo publish --platform web
```

### **Mobile App Deployment**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform all
```

## 🔧 **CONFIGURATION**

### **Environment Variables**
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `EXPO_PUBLIC_API_URL`: Backend API URL

### **Supabase Setup**
1. Create a new Supabase project
2. Run the SQL scripts in `backend/supabase-schema.sql`
3. Set up Row Level Security (RLS) policies
4. Configure authentication settings

### **Stripe Setup**
1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up webhooks for payment processing
4. Configure Stripe Connect for professionals

## 🧪 **TESTING**

### **Run Tests**
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Authentication"
```

### **Test Coverage**
```bash
# Generate coverage report
npm run test:coverage
```

## 📊 **MONITORING & ANALYTICS**

- **Expo Analytics**: App performance and usage
- **Supabase Dashboard**: Database and authentication monitoring
- **Stripe Dashboard**: Payment processing analytics
- **Custom Logging**: Application-specific metrics

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **SUPPORT**

- **Documentation**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/PeterLeon12/Masterful/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PeterLeon12/Masterful/discussions)

## 🎯 **ROADMAP**

### **Phase 1** ✅
- [x] Core marketplace functionality
- [x] User authentication
- [x] Job posting and search
- [x] Real-time messaging
- [x] Payment integration

### **Phase 2** 🚧
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Mobile app optimization
- [ ] Performance improvements

### **Phase 3** 📋
- [ ] Multi-language support
- [ ] Advanced payment features
- [ ] AI-powered recommendations
- [ ] Advanced search algorithms

## 📞 **CONTACT**

- **Developer**: Peter Leon
- **Email**: timis.petre51@gmail.com
- **GitHub**: [@PeterLeon12](https://github.com/PeterLeon12)

---

**Built with ❤️ for the Romanian market**