# Backend - Classroom Management API

Express.js backend with Firebase Firestore, SMS authentication, and real-time features.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT + SMS (Twilio)
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Validation**: Zod
- **Package Manager**: pnpm

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env
```

### 3. Configure Firebase

1. Download your Firebase service account key JSON file
2. Encode it to base64:

```bash
# Linux/Mac
base64 -i path/to/your-service-account-key.json

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path/to/your-service-account-key.json"))
```

3. Add the base64 string to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdC1pZCIsLi4u
```

### 4. Configure Twilio

For SMS authentication, add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### 5. Run Development Server

```bash
pnpm run dev
```

Server will start on `http://localhost:5000`

## Authentication Flow

### Dual Authentication System

**1. Phone + SMS Authentication (Instructors)**

- Instructors use phone number + SMS verification
- Self-registration allowed for instructors
- JWT token returned upon successful verification

**2. Username + Password Authentication (Students)**

- Students are added by instructors via `/api/instructor/addStudent`
- Email sent to student with account setup link
- Student creates username/password via `/api/student-auth/setup`
- Student logs in with username/password via `/api/student-auth/login`

### Student Registration Process

1. Instructor adds student → Student created with `isActive: false`
2. Email sent to student with setup link
3. Student clicks link → Account setup page
4. Student creates username/password → Account activated
5. Student can now log in with credentials

## API Endpoints

### Authentication (Phone + SMS)

- `POST /api/auth/createAccessCode` - Send SMS verification code
- `POST /api/auth/validateAccessCode` - Verify SMS code and login (phone + SMS)

### Student Authentication (Username + Password)

- `POST /api/student-auth/setup` - Student account setup (email + username + password)
- `POST /api/student-auth/login` - Student login (username + password)
- `GET /api/student-auth/by-email/:email` - Get student by email

### Instructor Routes

- `POST /api/instructor/addStudent` - Add new student (name, phone, email)
- `GET /api/instructor/students` - Get all students
- `GET /api/instructor/student/:phone` - Get student details with lessons
- `PUT /api/instructor/editStudent/:phone` - Update student
- `DELETE /api/instructor/student/:phone` - Delete student
- `POST /api/instructor/assignLesson` - Assign lesson to multiple students

### Student Routes

- `GET /api/student/myLessons?phone=xxx` - Get assigned lessons
- `POST /api/student/markLessonDone` - Mark lesson as completed
- `PUT /api/student/editProfile` - Update student profile

### Health Check

- `GET /health` - Server status

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Phone + SMS authentication
│   ├── instructor/   # Instructor features
│   ├── student/      # Student features
│   │   └── student-auth/ # Student username/password auth
│   └── chat/         # Real-time chat (planned)
├── shared/           # Shared utilities
│   ├── config/       # Configuration files
│   ├── middleware/    # Express middleware
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Development

### Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint issues

### TypeScript

The project uses strict TypeScript configuration with:

- Path mapping for clean imports
- Strict type checking
- Firebase type definitions
- Custom enum types for better type safety

### Firebase Collections

- `users` - User accounts and profiles (instructors and students)
- `accessCodes` - SMS verification codes
- `lessons` - Course lessons and assignments (one-to-many)
- `conversations` - Chat conversations (planned)
- `messages` - Chat messages (planned)

## Docker

Run with Docker Compose:

```bash
# From project root
docker-compose up backend
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Base64 encoded service account key | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No (mock mode) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No (mock mode) |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No (mock mode) |
| `EMAIL_HOST` | SMTP host for emails | No |
| `EMAIL_PORT` | SMTP port | No |
| `EMAIL_USER` | SMTP username | No |
| `EMAIL_PASS` | SMTP password | No |
| `FRONTEND_URL` | Frontend URL for email links | No (default: localhost:3000) |
| `JWT_SECRET` | JWT signing secret | Yes |
