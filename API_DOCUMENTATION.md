# 📚 API Documentation

## 🔗 **Base URL**
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.masterful.app/api`

## 🔐 **Authentication**

All API endpoints require authentication via JWT tokens in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## 📋 **Endpoints**

### **Authentication Endpoints**

#### **POST /auth/register**
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "CLIENT" | "PROFESSIONAL"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  },
  "token": "jwt_token"
}
```

#### **POST /auth/login**
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  },
  "token": "jwt_token"
}
```

### **User Endpoints**

#### **GET /users/profile**
Get current user profile.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT",
    "profile": {
      "bio": "User bio",
      "phone": "+40123456789",
      "location": "Bucharest, Romania"
    }
  }
}
```

#### **PUT /users/profile**
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "phone": "+40123456789",
  "location": "Bucharest, Romania"
}
```

### **Job Endpoints**

#### **GET /jobs**
Get list of jobs with optional filtering.

**Query Parameters:**
- `category`: Service category filter
- `location`: Location filter
- `minBudget`: Minimum budget filter
- `maxBudget`: Maximum budget filter
- `status`: Job status filter
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "uuid",
      "title": "Plumbing Repair",
      "description": "Fix leaking pipe",
      "category": "Plumbing",
      "location": "Bucharest, Romania",
      "budget": 150,
      "status": "OPEN",
      "client": {
        "id": "uuid",
        "name": "John Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### **POST /jobs**
Create a new job posting.

**Request Body:**
```json
{
  "title": "Plumbing Repair",
  "description": "Fix leaking pipe in kitchen",
  "category": "Plumbing",
  "location": "Bucharest, Romania",
  "budget": 150,
  "urgency": "HIGH" | "MEDIUM" | "LOW"
}
```

#### **GET /jobs/:id**
Get specific job details.

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "title": "Plumbing Repair",
    "description": "Fix leaking pipe",
    "category": "Plumbing",
    "location": "Bucharest, Romania",
    "budget": 150,
    "status": "OPEN",
    "client": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "applications": [
      {
        "id": "uuid",
        "professional": {
          "id": "uuid",
          "name": "Jane Smith",
          "rating": 4.8
        },
        "message": "I can help with this",
        "proposedPrice": 120,
        "status": "PENDING"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### **Professional Endpoints**

#### **GET /professionals**
Get list of professionals with filtering.

**Query Parameters:**
- `categories`: Service categories filter
- `location`: Location filter
- `minRating`: Minimum rating filter
- `maxHourlyRate`: Maximum hourly rate filter
- `isAvailable`: Availability filter
- `searchQuery`: Text search filter
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "professionals": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "bio": "Professional plumber with 10 years experience",
      "categories": ["Plumbing", "Heating"],
      "rating": 4.8,
      "hourlyRate": 50,
      "location": "Bucharest, Romania",
      "isAvailable": true,
      "profileImage": "https://example.com/image.jpg"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### **POST /professionals/onboarding**
Complete professional onboarding.

**Request Body:**
```json
{
  "categories": ["Plumbing", "Heating"],
  "bio": "Professional plumber with 10 years experience",
  "hourlyRate": 50,
  "serviceAreas": ["Bucharest", "Cluj-Napoca"],
  "workingHours": {
    "monday": { "start": "09:00", "end": "17:00", "available": true },
    "tuesday": { "start": "09:00", "end": "17:00", "available": true }
  },
  "certifications": [
    {
      "name": "Plumbing License",
      "issuer": "Romanian Plumbing Association",
      "expiryDate": "2025-12-31"
    }
  ],
  "insurance": {
    "provider": "Insurance Company",
    "policyNumber": "POL123456",
    "expiryDate": "2025-12-31"
  }
}
```

### **Message Endpoints**

#### **GET /messages/conversations**
Get list of conversations for current user.

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "participants": [
        {
          "id": "uuid",
          "name": "John Doe",
          "role": "CLIENT"
        },
        {
          "id": "uuid",
          "name": "Jane Smith",
          "role": "PROFESSIONAL"
        }
      ],
      "lastMessage": {
        "id": "uuid",
        "content": "Hello, I can help with your plumbing issue",
        "senderId": "uuid",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### **GET /messages/conversations/:id**
Get messages in a specific conversation.

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "content": "Hello, I can help with your plumbing issue",
      "senderId": "uuid",
      "senderName": "Jane Smith",
      "timestamp": "2024-01-01T12:00:00Z",
      "type": "TEXT"
    }
  ],
  "hasMore": true
}
```

#### **POST /messages/conversations/:id/messages**
Send a message in a conversation.

**Request Body:**
```json
{
  "content": "Thank you for your interest!",
  "type": "TEXT"
}
```

### **Payment Endpoints**

#### **POST /payments/create-intent**
Create Stripe payment intent.

**Request Body:**
```json
{
  "amount": 15000,
  "currency": "ron",
  "jobId": "uuid",
  "professionalId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_1234567890"
}
```

#### **POST /payments/confirm**
Confirm payment completion.

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "jobId": "uuid"
}
```

## 🔒 **Error Handling**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### **Error Codes**
- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 📊 **Rate Limiting**

- **Authentication endpoints**: 5 requests per 15 minutes
- **General endpoints**: 100 requests per hour
- **Message endpoints**: 200 requests per hour

## 🔄 **WebSocket Events**

### **Connection**
```javascript
const socket = io('ws://localhost:3000', {
  auth: { token: 'jwt_token' }
});
```

### **Events**
- `message:new`: New message received
- `message:typing`: User is typing
- `message:read`: Message was read
- `job:status_changed`: Job status updated
- `notification:new`: New notification

## 📝 **Examples**

### **Complete Authentication Flow**
```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword',
    name: 'John Doe',
    role: 'CLIENT'
  })
});

// 2. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword'
  })
});

const { token } = await loginResponse.json();

// 3. Use token for authenticated requests
const profileResponse = await fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Create Job and Search Professionals**
```javascript
// 1. Create job
const jobResponse = await fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Plumbing Repair',
    description: 'Fix leaking pipe',
    category: 'Plumbing',
    location: 'Bucharest, Romania',
    budget: 150
  })
});

// 2. Search professionals
const professionalsResponse = await fetch('/api/professionals?category=Plumbing&location=Bucharest', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🧪 **Testing**

### **Test Endpoints**
```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📞 **Support**

For API support and questions:
- **Documentation**: This file
- **Issues**: [GitHub Issues](https://github.com/PeterLeon12/Masterful/issues)
- **Email**: timis.petre51@gmail.com
