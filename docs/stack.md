<!-- markdownlint-disable -->


# Technology Stack

## Core Framework & Build Tools

### **Vite** (Build Tool & Dev Server)
- **Version**: v5.1.0
- **Role**: Development server, build tool, HMR
- **Config**: `vite.config.ts`
- **Commands**: 
  - `npm run dev` - Starts Vite dev server on localhost:3000
  - `npm run build` - Production build
  - `npm run preview` - Preview production build
- **Features**: Fast startup, Hot Module Replacement, TypeScript support

### **React** (Frontend Framework)
- **Version**: 18.2.0
- **Mode**: Strict Mode enabled
- **Entry Point**: `src/main.tsx`
- **Plugin**: `@vitejs/plugin-react` for JSX transformation

### **TypeScript** (Language)
- **Version**: 5.2.2
- **Config**: Strict mode enabled in `tsconfig.json`
- **Features**: Full type safety, strict null checks, no implicit any
- **Environment Types**: Custom Vite env types in `src/vite-env.d.ts`

## UI & Components

### **Mantine** (UI Component Library)
- **Core**: @mantine/core v7.5.0
- **Hooks**: @mantine/hooks v7.5.0
- **Icons**: @tabler/icons-react v2.47.0
- **Features**: Complete component system, theming, responsive design

### **Mantine React Table** (Data Table)
- **Version**: 2.0.0-beta.6
- **Features**:
  - Drag & drop row reordering
  - Drag & drop column reordering  
  - Inline editing
  - Column filtering & global search
  - Real-time updates
  - Responsive design

## Database & Backend

### **Supabase** (Backend as a Service)
- **Client**: @supabase/supabase-js
- **Features**:
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication ready
  - RESTful APIs

**Database Schema:**
```sql
-- Main data table (linked-list ordering)
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  next_course_id TEXT NULL,  -- Linked-list pointer
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Linked list metadata (tracks first node)
CREATE TABLE course_order_metadata (
  id TEXT PRIMARY KEY DEFAULT 'main',
  first_course_id TEXT REFERENCES courses(id)
);

-- User preferences (future multi-user)
CREATE TABLE user_layouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  column_order JSONB,
  column_visibility JSONB,
  row_order JSONB,
  filter_preferences JSONB,
  sort_preferences JSONB
);
```

## Mobile & Deployment

### **Capacitor** (Mobile App Framework)
- **Version**: 5.7.0
- **Config**: `capacitor.config.ts`
- **Platforms**: Android ready (iOS ready)
- **Command**: `npm run android` - Build and sync for Android

## Development Tools

### **ESLint** (Code Linting)
- **Version**: 8.56.0
- **TypeScript**: @typescript-eslint/* plugins
- **React**: eslint-plugin-react-hooks, eslint-plugin-react-refresh

### **Environment Management**
- **Files**: `.env`, `.env.example`
- **Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Security**: `.env` gitignored, credentials not hardcoded

## Architecture

### **Project Structure**
```bash
src/
├── components/          # Reusable UI components
│   ├── DraggableTable.tsx    # Local table component
│   └── DatabaseTable.tsx     # Database-connected table
├── services/            # API & database services
│   └── courseService.ts      # Supabase operations
├── lib/                 # Utilities & configurations
│   └── supabase.ts          # Supabase client setup
├── pages/              # Page components
│   └── CoursesPage.tsx      # Main application page
├── types/              # TypeScript type definitions
│   └── Course.ts            # Data models
└── data/               # Local data (fallback)
    └── courses.json         # Sample course data
```

### **Data Flow**
1. **UI Components** → **Services** → **Supabase Database**
2. **Real-time Updates** ← **Supabase Subscriptions** ← **Database Changes**
3. **User Interactions** → **Local State** → **Database Persistence**

### **Key Features**
- **Real-time sync** across devices
- **Persistent user preferences** (column order, filters)
- **Drag & drop** row and column reordering
- **Inline editing** with database persistence
- **Search & filtering** with multiple modes
- **Mobile-ready** via Capacitor
- **Type-safe** throughout the application
- **Error handling** with graceful fallbacks

## Commands Reference

```bash
# Development
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint

# Mobile
npm run android  # Build and sync Android

# Setup
cp .env.example .env  # Copy environment template
```

## Future Expansion Ready

- **Authentication**: Supabase Auth integration ready
- **Role-based Access**: Database schema supports user roles
- **Multi-table**: Service architecture supports multiple data tables
- **Production Deployment**: Ready for Vercel/Netlify deployment
- **Mobile Apps**: Capacitor setup complete for iOS/Android
