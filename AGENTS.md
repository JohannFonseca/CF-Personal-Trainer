# CF Personal Trainer - Project Context

## Technical Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS + Custom CSS (Glassmorphism, Dark Theme)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Core Concepts
- **Admin**: Coach dashboard to manage clients, exercises, and routines.
- **Client**: Athlete dashboard to view assigned routines and track progress.
- **Exercises**: A library of exercises with names, muscle groups, and media (video/images).
- **Routines**: Assignments of exercises to specific clients with details like sets and reps.

## File Structure
- `/src/app/admin`: Coach management interface.
- `/src/app/dashboard`: Client-facing interface.
- `/src/components`: Reusable UI components (admin, dashboard, layout, ui).
- `/src/lib/supabase`: Supabase client configuration.
- `/supabase/migrations`: Database schema definitions.

## Database Schema
- `profiles`: role (admin/client), full_name, weight, height, training_days, goals.
- `exercises`: name, muscle_group, media_url, difficulty.
- `client_routines`: client_id, exercise_id, assigned_date, notes (to be expanded with sets/reps).

## Design Philosophy
- **Aesthetic**: Premium dark mode, glassmorphism, high contrast (primary color: Blue/Green), heavy typography (black/extra-bold).
- **Interactions**: Smooth transitions with Framer Motion, interactive hover states.
