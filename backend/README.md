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

## API Endpoints

### Authentication

- `POST /api/auth/createAccessCode` - Send SMS verification code
- `POST /api/auth/validateAccessCode` - Verify SMS code and login
- `POST /api/auth/loginEmail` - Send email verification code
- `POST /api/auth/validateEmailCode` - Verify email code and login

### Health Check

- `GET /health` - Server status

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   ├── instructor/   # Instructor features
│   ├── student/      # Student features
│   └── chat/         # Real-time chat
├── shared/           # Shared utilities
│   ├── config/       # Configuration files
│   ├── middleware/    # Express middleware
│   └── types/         # TypeScript types
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

- `users` - User accounts and profiles
- `accessCodes` - SMS/email verification codes
- `lessons` - Course lessons and assignments
- `studentLessons` - Student lesson progress
- `conversations` - Chat conversations
- `messages` - Chat messages

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
| `JWT_SECRET` | JWT signing secret | Yes |
