# ND Sublease 🏠

A modern, responsive sublease listing platform designed specifically for Notre Dame students to find and post off-campus housing opportunities.

## 🌟 Features

### 🔐 Secure Authentication
- Restricted to Notre Dame students with `@nd.edu` email verification
- JWT-based authentication with secure session management
- Role-based access control for listing management

### 🏘️ Property Listings
- **Advanced Search & Filtering**: Filter by price, bedrooms, bathrooms, distance to campus, amenities, and more
- **Interactive Maps**: Google Maps integration showing property locations and distance to Notre Dame campus
- **Rich Property Details**: Comprehensive listing information with image galleries, amenities, and availability dates
- **Smart Distance Calculation**: Automatic distance calculation from Notre Dame campus

### 💬 Real-time Messaging
- **Direct Communication**: In-app messaging system between property owners and interested renters
- **Conversation Management**: Organized inbox with conversation history and unread message indicators
- **Contact Integration**: One-click contact buttons on listing cards for seamless communication

### ⭐ User Experience
- **Favorites System**: Save and manage preferred listings for quick access
- **My Listings Management**: Property owners can easily manage their own listings
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Visual Indicators**: Clear distinction between user's own posts and other listings

### 🎨 Modern Interface
- **Notre Dame Branding**: Custom color scheme matching Notre Dame's identity
- **Intuitive Navigation**: Clean, organized interface with easy-to-use navigation
- **Loading States**: Smooth loading animations and skeleton screens for better UX
- **Error Handling**: Comprehensive error messages and fallback states

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom Notre Dame theme
- **Shadcn/ui** component library built on Radix UI primitives
- **TanStack React Query** for efficient server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js for robust API development
- **TypeScript** for full-stack type safety
- **JWT** for secure authentication and authorization
- **Bcrypt** for password hashing and security
- **Multer** for handling file uploads

### Database
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for database migrations and schema management
- Optimized schema with proper relationships and indexes

### External Services
- **Google Maps API** for location services and distance calculations
- **Google Places API** for address autocomplete and geocoding

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nd-sublease.git
   cd nd-sublease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
nd-sublease/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts for state management
│   │   └── lib/           # Utility functions and configurations
├── server/                # Express.js backend API
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and type definitions
└── uploads/              # File upload storage directory
```

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## 🏗️ Architecture Highlights

### Type Safety
- **End-to-end TypeScript** with shared schemas between frontend and backend
- **Drizzle ORM** for type-safe database operations
- **Zod validation** for runtime type checking and form validation

### Performance Optimizations
- **Code splitting** with dynamic imports for better load times
- **Image optimization** with proper sizing and lazy loading
- **Efficient caching** with TanStack Query for API responses
- **Optimized builds** with Vite's modern bundling

### Security Features
- **Input validation** on both client and server sides
- **SQL injection protection** through parameterized queries
- **XSS protection** with proper data sanitization
- **CORS configuration** for secure cross-origin requests

## 🎯 Key Features Demo

### Smart Filtering System
The platform includes an advanced filtering system that allows students to find exactly what they're looking for:
- Price range selection
- Bedroom and bathroom requirements
- Distance from Notre Dame campus
- Specific amenities (WiFi, Parking, AC, etc.)
- Furnished/unfurnished options

### Interactive Property Maps
Integration with Google Maps provides:
- Visual property locations
- Distance calculation to Notre Dame campus
- Interactive map view alongside grid view
- Address autocomplete for easy listing creation

### Comprehensive Messaging System
Built-in communication features include:
- Real-time messaging between users
- Conversation management and history
- Unread message indicators
- Direct contact from listing cards

## 🤝 Contributing

This project was built as a portfolio demonstration of modern web development practices. The codebase showcases:

- **Clean Architecture**: Separation of concerns with clear data flow
- **Modern React Patterns**: Hooks, context, and functional components
- **Type Safety**: Comprehensive TypeScript usage throughout the stack
- **User Experience**: Responsive design and intuitive interface
- **Performance**: Optimized queries and efficient state management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Notre Dame University for inspiration
- The open-source community for the amazing tools and libraries
- Google Maps Platform for location services

---

**Built with ❤️ for the Notre Dame community**

*This project demonstrates full-stack web development skills including React, TypeScript, Node.js, PostgreSQL, and modern web development best practices.*