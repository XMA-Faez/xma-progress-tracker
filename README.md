# XMA Progress Tracker

A modern progress tracking system for advertising agencies to manage client projects through production stages.

## Features

- **Admin Dashboard**: Manage all clients and their projects
- **Client Progress Pages**: Unique URLs for each client to track their project progress
- **Task Management**: Add, edit, delete, and update task progress
- **Task Types**: 
  - Calls (Red)
  - Project tasks (Blue)
  - Revision rounds (Yellow)
- **4 Production Stages**: Onboarding, Pre-production, Production, Launch
- **Progress Visualization**: Linear progress bar with milestone markers
- **External Links**: Frame and Google Drive integration
- **Dark Mode**: Modern aesthetic with blue primary color

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd xma-progress-tracker
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy the SQL from `supabase-schema.sql` and run it in the Supabase SQL editor
3. Get your project URL and anon key from the project settings

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

### 5. Create admin user

In Supabase dashboard:
1. Go to Authentication → Users
2. Click "Invite user"
3. Enter admin email and password

### 6. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Admin Login**: Navigate to `/login` and sign in with your admin credentials
2. **Create Client**: Click "Add New Client" and enter client details
3. **Manage Tasks**: Click on a client to manage their tasks (check/uncheck, edit, add, delete)
4. **Share Progress**: Share the unique client URL with clients to view their progress

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and Supabase client
- `/src/types` - TypeScript type definitions
- `/src/utils` - Helper functions and default data

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Framer Motion
- Lucide Icons