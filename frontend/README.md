# Classroom Management App - Frontend

A modern React application built with TypeScript, Vite, and Tailwind CSS, following a modular architecture pattern for scalability and maintainability.

## Architecture

This frontend follows a **feature-based modular architecture** that promotes:

- **Separation of concerns** - Each feature is self-contained
- **Scalability** - Easy to add new features without affecting existing ones
- **Maintainability** - Clear boundaries and unidirectional data flow
- **Team collaboration** - Multiple developers can work on different features

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── routes/            # Application routes
│   ├── app.tsx           # Main application component
│   ├── provider.tsx      # Global providers (React Query, etc.)
│   └── router.tsx        # Router configuration
├── assets/               # Static files (images, fonts, etc.)
├── components/           # Shared components across entire app
├── config/               # Global configurations, env variables
├── features/             # Feature-based modules
│   ├── auth/             # Authentication feature
│   │   ├── api/          # Auth API calls and React Query hooks
│   │   ├── components/   # Auth-specific components
│   │   ├── hooks/        # Auth-specific hooks
│   │   ├── stores/      # Auth state management
│   │   ├── types/       # Auth TypeScript types
│   │   └── utils/      # Auth utility functions
│   ├── instructor/       # Instructor dashboard feature
│   ├── student/          # Student dashboard feature
│   └── chat/            # Real-time chat feature
├── hooks/               # Shared hooks across entire app
├── lib/                 # Reusable libraries (React Query, Socket.io)
├── stores/              # Global state stores
├── testing/             # Test utilities and mocks
├── types/               # Shared types across entire app
└── utils/               # Shared utility functions
```

## Architecture Rules (Enforced by ESLint)

### No Cross-Feature Imports

```typescript
// This will be caught by ESLint
import { AuthButton } from '../auth/components/AuthButton';

// Instead, compose at app level
import { AuthButton } from '../../features/auth/components/AuthButton';
```

### Unidirectional Data Flow

```
Shared (components, hooks, lib, types, utils)
    ↓
Features (auth, instructor, student, chat)
    ↓
App (routes, providers, main app)
```

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR and builds)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Real-time**: Socket.io-client
- **Code Quality**: ESLint + Prettier
- **Architecture**: Modular feature-based structure

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Available Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Fix ESLint issues
pnpm run type-check   # Run TypeScript checks
```

## Features

### Authentication

- SMS-based login with phone number verification
- Email-based student account setup
- JWT token management
- Role-based access control

### Instructor Dashboard

- Student management (add, edit, delete)
- Lesson assignment and tracking
- Real-time chat with students
- Student profile access

### Student Dashboard

- View assigned lessons
- Mark lessons as completed
- Edit personal profile
- Real-time chat with instructor

### Real-time Communication

- Socket.io-powered messaging
- Typing indicators
- Message history persistence
- Instant updates across devices

## Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

## Build & Deploy

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### ESLint Configuration

The project uses ESLint with custom rules to enforce the modular architecture:

- Prevents cross-feature imports
- Enforces unidirectional data flow
- Maintains consistent code style

### Tailwind CSS

Configured with the modern `@tailwindcss/vite` plugin for optimal performance.

## Contributing

1. Follow the modular architecture patterns
2. Keep features self-contained
3. Use shared components and utilities
4. Write tests for new features
5. Follow the ESLint rules (they enforce architecture)

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
