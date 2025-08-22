# Holly Transportation - Development vs Production Guide

## Authentication System Differences

### Production Environment
- **Authentication Method**: Replit OpenID Connect (OAuth)
- **Session Storage**: PostgreSQL database via `connect-pg-simple`
- **User Creation**: Automatic via Replit user claims
- **Login Flow**: `/api/login` → Replit OAuth → `/api/callback`
- **Environment Detection**: `process.env.REPLIT_DOMAINS` exists
- **Security**: HTTPS required, secure cookies, 1-week session TTL

### Development Environment  
- **Authentication Method**: Local username/password system
- **Session Storage**: In-memory store (faster for local development)
- **User Creation**: Manual registration or pre-created test accounts
- **Login Flow**: `/auth` → Local login form → Session creation
- **Environment Detection**: `NODE_ENV === 'development'` AND no `REPLIT_DOMAINS`
- **Security**: HTTP allowed, non-secure cookies for localhost

## Database Schema Differences

### Production Schema
```sql
-- Users table (Replit Auth fields)
users (
  id VARCHAR PRIMARY KEY,           -- Replit user ID
  email VARCHAR UNIQUE,             -- From Replit claims
  firstName VARCHAR,                -- From Replit claims  
  lastName VARCHAR,                 -- From Replit claims
  profileImageUrl VARCHAR,          -- From Replit claims
  phone VARCHAR,                    -- User-provided
  medicalNotes TEXT,               -- User-provided
  isAdmin BOOLEAN DEFAULT false,    -- Manually set
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Development Schema (Additional Fields)
```sql
-- Users table (includes local auth fields)
users (
  -- All production fields PLUS:
  username VARCHAR UNIQUE,          -- For local login
  password VARCHAR,                 -- Hashed password (scrypt)
  -- Note: username/password are NULL in production
);
```

## Code Structure Differences

### File Organization

#### Production-Only Files
- `server/replitAuth.ts` - Replit OpenID Connect setup
- Session configuration with PostgreSQL store

#### Development-Only Files  
- `server/localAuth.ts` - Local username/password authentication
- `client/src/pages/auth.tsx` - Local login/registration forms

#### Shared Files (Environment-Aware)
- `server/storage.ts` - Includes both Replit and local user methods
- `client/src/App.tsx` - Routes to different auth pages based on environment
- `shared/schema.ts` - Database schema supports both auth methods

### Environment Detection Logic

```typescript
// server/replitAuth.ts
const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.REPLIT_DOMAINS;

export async function setupAuth(app: Express) {
  if (isLocalDevelopment) {
    console.log("🔧 Using local development authentication");
    setupLocalAuth(app);
    return;
  }
  
  console.log("🔒 Using Replit authentication");
  // ... Replit auth setup
}
```

## API Endpoints

### Production Endpoints (Replit Auth)
- `GET /api/login` - Redirects to Replit OAuth
- `GET /api/callback` - Handles OAuth callback
- `GET /api/logout` - Logs out and redirects to Replit
- `GET /api/auth/user` - Returns current user from session

### Development Endpoints (Local Auth)
- `POST /api/register` - Creates new local user account
- `POST /api/login` - Authenticates with username/password
- `POST /api/logout` - Destroys local session
- `GET /api/auth/user` - Returns current user from session

### Shared Business Logic Endpoints
- `POST /api/bookings` - Create transportation booking
- `GET /api/bookings` - Get user's bookings
- `POST /api/messages` - Send message to admin
- `GET /api/admin/*` - Admin portal endpoints (both environments)

## Environment Variables

### Production Environment Variables
```bash
# Replit-provided (automatic)
REPLIT_DOMAINS=hollytransportation.replit.app
REPL_ID=abc123-def456-ghi789
SESSION_SECRET=auto-generated-secure-secret
DATABASE_URL=postgresql://...
ISSUER_URL=https://replit.com/oidc

# Optional business features
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Development Environment Variables (.env file)
```bash
# Required for local development
DATABASE_URL=postgresql://neondb_owner:...
NODE_ENV=development

# Local auth (no REPLIT_DOMAINS = local mode)
SESSION_SECRET=local-dev-session-secret-key-123

# Optional for testing Replit integration locally
# REPLIT_DOMAINS=localhost:5000
# REPL_ID=local-dev-holly-transport
# ISSUER_URL=https://replit.com/oidc
```

## User Experience Differences

### Production User Flow
1. Visit Holly Transportation website
2. Click "Get Started" → Redirects to Replit login
3. Login with Replit account (GitHub, Google, etc.)
4. Automatic account creation with Replit profile data
5. Access dashboard with full features

### Development User Flow
1. Visit Holly Transportation website  
2. Click "Get Started" → Local auth page at `/auth`
3. Choose "Login" or "Register" tab
4. Use test accounts or create new account:
   - **Admin**: username=`admin`, password=`admin123`
   - **User**: username=`testuser`, password=`test123`
5. Access dashboard with full features

## Default Test Data

### Development Test Accounts (Auto-Created)
```typescript
// Created automatically in localAuth.ts
const adminUser = {
  username: "admin",
  password: "admin123",
  email: "admin@hollytransportation.com", 
  firstName: "Holly",
  lastName: "Admin",
  isAdmin: true
};

const testUser = {
  username: "testuser", 
  password: "test123",
  email: "test@example.com",
  firstName: "Test", 
  lastName: "User",
  isAdmin: false
};
```

## Security Considerations

### Production Security
- OAuth 2.0 / OpenID Connect standard
- No password storage required
- Managed by Replit's secure infrastructure
- HTTPS enforcement
- Secure session cookies
- PostgreSQL session persistence

### Development Security
- Passwords hashed with scrypt + salt
- HTTP allowed for localhost convenience
- In-memory sessions (reset on restart)
- Test accounts with known passwords
- **Warning**: Never use local auth in production

## Deployment Process

### Production Deployment
1. Push code to Replit
2. Environment automatically detects Replit context
3. Uses Replit authentication seamlessly
4. Sessions stored in PostgreSQL
5. No manual user setup required

### Local Development Setup
1. Clone repository
2. Run `npm install`
3. Create `.env` file with local environment variables
4. Run `npm run db:push` to setup database schema
5. Run `npm run dev` to start local server
6. Default test accounts created automatically

## Switching Between Environments

The codebase automatically detects the environment and switches authentication methods without any code changes needed. The detection logic ensures:

- **Local Development**: No `REPLIT_DOMAINS` environment variable
- **Production**: `REPLIT_DOMAINS` exists (set by Replit platform)

This allows the same codebase to work in both environments without modification.