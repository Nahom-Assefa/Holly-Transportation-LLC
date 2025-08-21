# Holly Transportation - NEMT Ambulatory Services Website

## Project Overview
A professional website for Holly Transportation providing NEMT ambulatory services. The platform includes a public landing page, user account management, booking system, and admin portal with messaging capabilities.

## Architecture
- **Frontend**: React with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with in-memory storage
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Storage**: In-memory storage (MemStorage)

## Key Features
### Public Website
- Landing page with company information
- About section
- Services overview
- Contact form
- Professional design with ambulatory service focus

### User Features
- Account creation and management
- Booking system for transportation services
- Messaging system to contact admin
- User dashboard

### Admin Portal
- Booking management
- User account oversight
- Message handling
- Service management

## User Preferences
- Company name: Holly Transportation
- Focus on ambulatory services (not full-scale NEMT)
- Professional, trustworthy design
- Comprehensive admin management features

## Recent Changes
- **August 21, 2025**: Complete accessibility overhaul for older adults
  - Systematically enlarged all typography throughout entire website for enhanced readability
  - Enhanced all section headings to text-2xl lg:text-3xl font-bold minimum
  - Enlarged all description text to text-lg (18px) minimum across all sections
  - Improved Why Choose, About, Services, Service Areas, Payment, Billing, Booking, and Contact sections
  - Enhanced all CTA buttons with text-xl font-bold py-6 px-8 and w-6 h-6 icons
  - Prioritized accessibility for older adults seeking ambulatory transportation services
  - Website deployment-ready with comprehensive accessibility improvements

- **August 21, 2025**: Admin portal preview and deployment preparation
  - Created comprehensive admin portal with booking management, messaging, and analytics
  - Added admin preview at `/admin-preview` showing full dashboard functionality
  - Contact form now uses mailto protocol to hollytransport04@gmail.com
  - Updated "Accessibility Ready" to "Walking Assistance" for ambulatory services
  - Verified booking functionality with complete test scenarios
  - Prepared admin setup instructions for production deployment

- **August 20, 2025**: Complete Holly Transportation platform implemented
  - PostgreSQL database with full schema (users, bookings, messages, contact)
  - Replit authentication with user management
  - Comprehensive booking system for ambulatory transportation
  - Admin portal with booking management and messaging
  - Real-time messaging system between users and admin
  - Professional landing page with contact form
  - Phone booking feature with click-to-call functionality (651) 500-6198
  - Business hours updated to 6AM - 6PM daily
  - Contact email: hollytransport04@gmail.com
  - Mobile-responsive design throughout
  - All TypeScript errors resolved and application fully functional

## Admin Setup Instructions
After deployment, set yourself as admin by:
1. Log in to your deployed website using Replit Auth
2. Use the Database pane in Replit to access your production database
3. Run SQL: `UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';`
4. Refresh the website - you'll now have access to the Admin Portal

## Technical Stack
- React 18 with TypeScript
- Express.js backend
- Drizzle ORM with Zod schemas
- Tailwind CSS with shadcn/ui
- TanStack Query for data fetching
- React Hook Form for forms