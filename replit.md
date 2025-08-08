# ND Sublease - Notre Dame Student Housing Platform

## Overview

ND Sublease is a full-stack web application designed specifically for Notre Dame students to find and post sublease listings for off-campus housing. The platform features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. The application includes user authentication restricted to @nd.edu email addresses, property listings with image uploads, interactive maps using Google Maps API, real-time messaging between users, and a favorites system for saved listings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Shadcn/ui Component Library**: Consistent design system with Radix UI primitives and Tailwind CSS
- **TanStack React Query**: Server state management and caching for API calls
- **Wouter Router**: Lightweight client-side routing
- **Context API**: Global authentication state management

### Backend Architecture
- **Express.js REST API**: Node.js server with TypeScript for type safety
- **JWT Authentication**: Stateless authentication with token-based sessions
- **Multer File Uploads**: Image upload handling with local file storage
- **Bcrypt Password Hashing**: Secure user credential storage
- **Route-based Organization**: Modular API endpoints for users, listings, favorites, and messaging

### Database Design
- **PostgreSQL with Drizzle ORM**: Type-safe database operations and schema management
- **Relational Schema**: 
  - Users table with ND email validation
  - Listings table with geolocation and property details
  - Favorites junction table for user-listing relationships
  - Conversations and messages tables for real-time messaging
- **Migration System**: Version-controlled schema changes via Drizzle Kit

### Authentication & Authorization
- **ND Student Verification**: Restricted to @nd.edu email domains only
- **JWT Token Management**: Secure token storage in localStorage with automatic refresh
- **Route Protection**: API endpoints protected based on user authentication status
- **User Session Persistence**: Maintains login state across browser sessions

### File Management
- **Local Image Storage**: Uploaded property images stored in server uploads directory
- **Static File Serving**: Express static middleware for image delivery
- **File Validation**: Image type and size restrictions for uploads

## External Dependencies

### Google Services
- **Google Maps JavaScript API**: Interactive maps showing property locations and distance to Notre Dame campus
- **Places API**: Address autocomplete and geocoding services

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment Configuration**: Database URL and credentials managed via environment variables

### UI/UX Libraries
- **Radix UI**: Accessible component primitives for modals, dropdowns, and form controls
- **Tailwind CSS**: Utility-first styling with custom Notre Dame color scheme
- **Lucide React**: Consistent icon library throughout the application

### Development Tools
- **TypeScript**: Full-stack type safety with shared schema definitions
- **ESBuild**: Fast production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind integration

### Communication Features
- **Real-time Messaging**: In-app messaging system between property listers and interested students
- **Email Integration**: Contact forms and notification system for property inquiries