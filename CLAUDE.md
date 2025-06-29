# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Package Manager**: This project uses `bun`, not npm or yarn
- Install dependencies: `bun install`
- Development server: `bun run dev` (runs with Turbopack)
- Build: `bun run build`
- Lint: `bun run lint`
- Production: `bun run start`

**Database**: Supabase PostgreSQL with schema in `supabase-schema.sql`

## Architecture Overview

**Framework**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4

**Authentication Flow**:
- Admin-only application using Supabase Auth
- Middleware (`middleware.ts`) protects `/admin` routes
- Public access to client progress pages at `/client/[unique_link]`
- Dual Supabase clients: `lib/supabase.ts` (client-side) and `lib/supabase-server.ts` (server-side SSR)

**Data Architecture**:
- `clients` table: Client info with unique_link for public access
- `client_tasks` table: Tasks with 4 stages, 3 types, touchpoint ordering
- RLS policies: Authenticated admin access + public read for client pages

**Task System**:
- 4 stages: onboarding → pre-production → production → launch
- 3 task types: call (red), project (blue), revision (yellow)
- Touchpoint numbering system for ordering within clients
- Default tasks template in `utils/defaultTasks.ts`

**Key Pages**:
- `/admin`: Admin dashboard listing all clients
- `/admin/clients/[id]`: Task management interface
- `/admin/clients/new`: Client creation with template tasks
- `/client/[unique_link]`: Public client progress view
- `/login`: Admin authentication

**UI Architecture**:
- shadcn/ui components with custom theming
- Dark theme with blue-purple base colors in `globals.css`
- Glass-morphism design system with backdrop-blur effects
- Responsive design with mobile-first approach

**State Management**:
- Server-side data fetching with Supabase
- Client-side state for admin task management
- Real-time updates via database operations

## Important Implementation Details

**Supabase Configuration**:
- Uses new SSR API (`@supabase/ssr`) with cookie handling
- RLS policies allow public read access for client-facing pages
- Admin operations require authentication

**Progress Visualization**:
- Linear progress bar with milestone markers based on task distribution
- Stage-based milestone calculation in client progress pages
- Hover effects and animations for task cards

**Task Management**:
- Order preservation via `order_index` field
- Touchpoint auto-increment for new tasks
- Modal-based editing with form validation

**Routing Strategy**:
- Admin routes protected by middleware
- Client routes use unique_link instead of database IDs for security
- Dynamic params handling for Next.js 15 async requirements