# Holly Transportation - Development Guide

## Authentication System

### Current Implementation
- **Authentication Method**: Local username/password system
- **Session Storage**: PostgreSQL database via `connect-pg-simple`
- **User Creation**: Manual registration or pre-created test accounts
- **Login Flow**: `/auth` → Local login form → Session creation
- **Environment**: Local development with PostgreSQL database
- **Security**: HTTP allowed for localhost, 1-week session TTL

## Database Schema

### Users Table
```sql
users (
  id VARCHAR PRIMARY KEY,           -- Local user ID
  email VARCHAR UNIQUE,             -- User email
  firstName VARCHAR,                -- User first name
  lastName VARCHAR,                 -- User last name
  profileImageUrl VARCHAR,          -- Profile image URL
  phone VARCHAR,                    -- User-provided
  medicalNotes TEXT,               -- User-provided
  isAdmin BOOLEAN DEFAULT false,    -- Manually set
  username VARCHAR UNIQUE,          -- For local login
  password VARCHAR,                 -- Hashed password (scrypt)
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## Code Structure

### File Organization

#### Authentication Files
- `server/localAuth.ts` - Local username/password authentication
- `client/src/pages/auth.tsx` - Local login/registration forms

#### Shared Files
- `server/storage.ts` - User management and database operations
- `client/src/App.tsx` - Application routing
- `shared/schema.ts` - Database schema definitions

## API Endpoints

### Authentication Endpoints
- `POST /api/register` - Creates new local user account
- `POST /api/login` - Authenticates with username/password
- `POST /api/logout` - Destroys local session
- `GET /api/auth/user` - Returns current user from session

### Business Logic Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings (or all for admins)
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Delete booking (admin only)
- `DELETE /api/bookings/:id/user` - Delete user's own booking
- `PUT /api/profile` - Update user profile
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/audit-logs` - Get audit logs (admin only)
- `DELETE /api/admin/audit-logs/bulk` - Bulk delete audit logs (admin only)

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/holly_transportation

# Session
SESSION_SECRET=your-secure-session-secret

# Server
PORT=3001
NODE_ENV=development
```

### Default Users
The system automatically creates these test accounts:
- **Admin**: username=admin, password=admin123
- **User**: username=testuser, password=test123

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
```

## Features

### User Management
- Local user registration and authentication
- Profile management with audit logging
- Admin user creation and management

### Booking System
- Create, view, and manage transportation bookings
- Status tracking (pending, confirmed, in progress, completed, denied)
- Service type selection (one-way, round-trip, wait-and-return)
- Mobility assistance options

### Admin Features
- View all bookings across all users
- Update booking statuses
- View audit logs of user actions
- Bulk operations for audit logs
- Statistics dashboard

### Audit Logging
- Tracks profile updates
- Tracks booking deletions
- Provides admin visibility into user actions