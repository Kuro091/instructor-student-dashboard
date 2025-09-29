# Classroom Management App

A real-time classroom management tool that enables instructors to efficiently manage students, assign lessons, and communicate via live chat. Built with React, Node.js, Express, and Firebase.

## Screenshots

### Authentication Flow






| Instructor | Student |
|---------------------|-------------------|
| <img width="1639" height="973" alt="image" src="https://github.com/user-attachments/assets/7e90b1aa-3612-4e0b-a9dc-f1b067c5d513" /> | <img width="1079" height="1044" alt="image" src="https://github.com/user-attachments/assets/bc051b6d-9001-427b-a8b8-d5b0e494200a" />|
| <img width="1060" height="982" alt="image" src="https://github.com/user-attachments/assets/99d2b6f5-bdcc-436e-a92f-e77fe744512b" /> | <img width="684" height="551" alt="image" src="https://github.com/user-attachments/assets/8632a02f-2a1b-46e4-9079-d87487b6b2d8" /> |
| <img width="462" height="800" alt="image" src="https://github.com/user-attachments/assets/7b1855de-0879-4267-a689-c7004bd88444" /> | <img width="1485" height="865" alt="image" src="https://github.com/user-attachments/assets/2ec1f16b-0ea2-4f03-8880-4b6feef858ff" /> |
| | <img width="1523" height="912" alt="image" src="https://github.com/user-attachments/assets/66348964-7d8e-41b0-b6a9-bda872ed8b66" />|
| | <img width="930" height="418" alt="image" src="https://github.com/user-attachments/assets/3bebce39-4d17-46a7-93a3-6d4aecdef934" /> |

### Instructor Dashboard
<img width="1916" height="994" alt="image" src="https://github.com/user-attachments/assets/f4c34849-0cfd-42a3-bad6-a75b5964413a" />

<img width="1919" height="831" alt="image" src="https://github.com/user-attachments/assets/a19a6b99-9489-47e8-b5ea-334390ab9f92" />

<img width="1914" height="1026" alt="image" src="https://github.com/user-attachments/assets/f48378e2-6469-46a7-8bca-271e0405bc9d" />

<img width="1919" height="1021" alt="image" src="https://github.com/user-attachments/assets/991a578a-f39d-4f98-a715-f139d6c0f07e" />

<img width="1919" height="1042" alt="image" src="https://github.com/user-attachments/assets/b284696a-ec97-42cc-a72b-9bf9bab58567" />


### Student Dashboard
<img width="1914" height="893" alt="image" src="https://github.com/user-attachments/assets/a2d51aac-9eb7-435c-affd-7b1932f9b065" />

<img width="1917" height="572" alt="image" src="https://github.com/user-attachments/assets/965e7164-d070-4914-9074-6899561fa9d5" />

<img width="1912" height="825" alt="image" src="https://github.com/user-attachments/assets/76b025fe-19bc-4879-bd86-5641baeddd27" />

<img width="1917" height="588" alt="image" src="https://github.com/user-attachments/assets/e7d8736a-d4ce-4204-851b-e84c5d9cf725" />

<img width="1919" height="890" alt="image" src="https://github.com/user-attachments/assets/685cae4a-b946-4ef0-a0a3-3fc2f805db5d" />


### Real-time Chat
<img width="1707" height="1007" alt="image" src="https://github.com/user-attachments/assets/3cf4664f-cafe-4206-8def-05ebfcd8ad6b" />


## Project Structure

```
skipli/
├── frontend/                 # React application (Vite)
│   ├── src/
│   │   ├── app/             # Application layer
│   │   │   ├── routes/     # Application routes
│   │   │   ├── app.tsx     # Main application component
│   │   │   ├── provider.tsx # Global providers
│   │   │   └── router.tsx  # Router configuration
│   │   ├── components/     # Shared components
│   │   ├── features/       # Feature-based modules
│   │   │   ├── auth/       # Authentication feature
│   │   │   ├── instructor/ # Instructor dashboard
│   │   │   ├── student/    # Student dashboard
│   │   │   └── chat/       # Real-time chat
│   │   ├── lib/            # Reusable libraries
│   │   └── config/         # Global configurations
│   ├── public/
│   └── package.json
├── backend/                 # Express.js server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── instructor/ # Instructor routes
│   │   │   ├── student/    # Student routes
│   │   │   └── chat/       # Chat functionality
│   │   ├── shared/         # Shared utilities
│   │   │   ├── config/     # Configuration files
│   │   │   ├── middleware/ # Custom middleware
│   │   │   ├── socket/     # Socket.io handlers
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── dist/               # Compiled JavaScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Docker configuration
└── README.md
```

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (for better performance)
- **State Management**: React Context API + useReducer
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Real-time Communication**: Socket.io-client
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time Communication**: Socket.io
- **SMS Service**: Twilio
- **Email Service**: Nodemailer
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Security**: Helmet, CORS

### Database

- **Primary Database**: Firebase Firestore
- **Authentication**: Firebase Auth (for JWT)

### DevOps

- **Containerization**: Docker
- **Package Manager**: pnpm
- **Environment**: Development & Production ready

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Firebase account** ([Sign up here](https://firebase.google.com))
- **Twilio account** ([Sign up here](https://www.twilio.com))
- **Email service** (Gmail, SendGrid, etc.)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd skipli
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 3. Environment Setup

Create environment files for both frontend and backend:

#### Backend Environment (.env)

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-encoded-service-account-key

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env)

```bash
# Copy the example file
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Convert to base64: `base64 -i service-account-key.json`
   - Add the base64 string to `FIREBASE_SERVICE_ACCOUNT_KEY`

### 5. Twilio Setup

1. Sign up at [Twilio Console](https://console.twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number for SMS
4. Add credentials to your `.env` file

### 6. Email Service Setup

For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use your Gmail address and app password in `.env`

## Running the Application

### Development Mode

#### Option 1: Run Both Services Separately

```bash
# Terminal 1: Start Backend
cd backend
pnpm run dev

# Terminal 2: Start Frontend
cd frontend
pnpm run dev
```

#### Option 2: Run with Docker Compose

```bash
# From root directory
docker-compose up --build
```

### Production Mode

```bash
# Build backend
cd backend
pnpm run build

# Build frontend
cd ../frontend
pnpm run build

# Start production server
cd ../backend
pnpm start
```

## Application Features

### Authentication System

- **SMS-based Login**: Phone number + 6-digit verification code
- **Email-based Login**: Email + 6-digit verification code
- **Secure Student Setup**: JWT token-based account creation
- **Role-based Access**: Automatic routing to appropriate dashboard

### Instructor Dashboard

- **Student Management**: Add, edit, delete student profiles
- **Lesson Assignment**: Create and assign lessons to multiple students
- **Student Overview**: View all students with lesson progress
- **Real-time Chat**: One-on-one messaging with students
- **Statistics**: Dashboard with key metrics and quick actions

### Student Dashboard

- **Lesson Management**: View assigned lessons and mark as completed
- **Progress Tracking**: Visual progress indicators and completion rates
- **Profile Management**: Edit personal information
- **Real-time Chat**: Two-way communication with instructor

### Real-time Communication

- **Socket.io Integration**: Instant messaging between users
- **Typing Indicators**: Real-time typing status
- **Message Read Receipts**: Track message delivery
- **Online Status**: See who's currently online
- **Message Persistence**: Optional Firebase storage

## API Endpoints

### Authentication Routes

- `POST /api/auth/createAccessCode` - Generate and send SMS code
- `POST /api/auth/validateAccessCode` - Verify SMS/email code
- `POST /api/auth/loginEmail` - Send email verification code

### Instructor Routes

- `POST /api/instructor/addStudent` - Add new student
- `GET /api/instructor/students` - Get all students
- `GET /api/instructor/student/:phone` - Get student details
- `PUT /api/instructor/editStudent/:phone` - Update student
- `DELETE /api/instructor/student/:phone` - Delete student
- `POST /api/instructor/assignLesson` - Assign lesson to students

### Student Routes

- `GET /api/student/myLessons` - Get assigned lessons
- `POST /api/student/markLessonDone` - Mark lesson as completed
- `PUT /api/student/editProfile` - Update student profile

### Student Authentication Routes

- `POST /api/student-auth/setup` - Setup student account with token
- `POST /api/student-auth/login` - Student login with username/password
- `GET /api/student-auth/validate-token/:token` - Validate setup token

### Chat Routes

- `POST /api/chat/send` - Send message
- `GET /api/chat/conversation/:participantId` - Get conversation
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/mark-read` - Mark message as read

## Docker Deployment

### Build Images

```bash
# Build backend image
docker build -t classroom-backend ./backend

# Build frontend image
docker build -t classroom-frontend ./frontend
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## Database Schema

### Firebase Collections

```
users/
  - id: string
  - phone: string
  - email: string
  - name: string
  - username?: string
  - password?: string (hashed)
  - role: 'INSTRUCTOR' | 'STUDENT'
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

accessCodes/
  - id: string
  - identifier: string (phone/email)
  - code: string
  - expiresAt: timestamp
  - type: 'SMS' | 'EMAIL'
  - createdAt: timestamp

lessons/
  - id: string
  - title: string
  - description: string
  - assignedTo: string[] (student phones)
  - assignedBy: string (instructor phone)
  - createdAt: timestamp
  - status: 'pending' | 'completed'

studentLessons/
  - id: string
  - lessonId: string
  - studentPhone: string
  - status: 'pending' | 'completed'
  - completedAt?: timestamp
  - createdAt: timestamp

conversations/
  - id: string
  - participants: {
      instructorId: string
      instructorName: string
      studentId: string
      studentName: string
    }
  - lastMessage?: string
  - lastMessageAt?: timestamp
  - createdAt: timestamp

messages/
  - id: string
  - conversationId: string
  - senderId: string
  - senderName: string
  - senderRole: 'INSTRUCTOR' | 'STUDENT'
  - receiverId: string
  - receiverName: string
  - receiverRole: 'INSTRUCTOR' | 'STUDENT'
  - content: string
  - timestamp: timestamp
  - isRead: boolean
```

## Deployment

### Frontend Deployment

1. Connect your GitHub repository
2. Set build command: `pnpm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_SOCKET_URL`: Your Socket.io URL

### Backend Deployment

1. Connect your GitHub repository
2. Set build command: `pnpm run build`
3. Set start command: `pnpm start`
4. Add all environment variables from your `.env` file

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-service-account-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
EMAIL_HOST=your-email-host
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
FRONTEND_URL=https://your-frontend-domain.com
```
