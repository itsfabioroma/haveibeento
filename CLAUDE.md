# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plan & Review

### Before starting work
- Always in plan mode to make a plan
- After get the plan, make sure you Write the plan to .claude/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Project Overview

**Have I Been To** - An interactive 3D globe application where users can track and visualize countries they've visited.

Built with Next.js 15, Next-Auth authentication (Google OAuth + Email), Supabase database, Stripe payments, and email functionality via Nodemailer. Features an interactive 3D globe using react-globe.gl and Three.js.

## Development Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start dev server with Turbopack
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:ts              # TypeScript type checking (tsc --noEmit)

# Email Development
pnpm email                # Email dev server

# Stripe
pnpm stripe:listen        # Listen to Stripe webhooks locally
```

## Authentication Architecture

This project uses **Next-Auth v5 (beta.25)** with a custom Supabase adapter integration:

- **Auth Configuration**: [lib/auth.config.ts](lib/auth.config.ts) contains provider setup
- **Auth Handler**: [lib/auth.ts](lib/auth.ts) extends config with Nodemailer provider
- **Middleware**: [middleware.ts](middleware.ts) protects `/app` routes, redirects unauthenticated users to `/api/auth/signin`
- **Session Extension**: Session includes `supabaseAccessToken` for RLS (see [types/next-auth.d.ts](types/next-auth.d.ts))

### Key Pattern: Supabase Access Token in Session
The session object is extended with `supabaseAccessToken` to enable Row Level Security (RLS) with Supabase. This token is passed in the Authorization header when creating Supabase clients.

## Supabase Client Pattern

Two distinct client types based on security context:

### 1. Authenticated User Client ([utils/supabase/server.ts](utils/supabase/server.ts))
```typescript
const supabase = await getSupabaseClient();
```
- Uses `supabaseAccessToken` from session
- **Respects RLS policies** - users can only access their own data
- Use for user-facing features (notes, profile data)
- Automatically redirects if no valid session

### 2. Admin Client ([utils/supabase/server.ts](utils/supabase/server.ts))
```typescript
const supabaseAdmin = createSupabaseAdminClient();
```
- Uses `SUPABASE_SECRET_KEY`
- **Bypasses RLS** - full database access
- Use for system operations (Stripe webhooks, admin tasks)
- Never expose to client-side

### Type Safety
All Supabase clients use `Database` type from [types/database.types.ts](types/database.types.ts). Regenerate types with:
```bash
npx supabase gen types typescript --project-id $PROJECT_REF --schema public > types/database.types.ts
```

## Database Schema & RLS

### Existing Tables
- `notes` - User notes with RLS
- `stripe_customers` - Stripe subscription data with RLS
- `visited_countries` - Countries visited by users with RLS (uses ISO 3166-1 alpha-2 country codes)

### RLS Function
All tables use `next_auth.uid()` function to match the current user's ID:
```sql
next_auth.uid() = user_id
```

### Creating New Tables
Save SQL files to `/supabase/xxx_table_{date}.sql` (format: `yyyy-mm-ddThh`). Always:
- Use `id` column as `identity generated always`
- Add `user_id uuid not null default next_auth.uid()`
- Create RLS policies for SELECT, INSERT, UPDATE, DELETE using `next_auth.uid()`
- Enable row level security: `alter table tablename enable row level security`
- Use singular column names, lowercase
- Add table comment (max 1024 chars)

## Stripe Integration

### Configuration
Plan details in [config.ts](config.ts): free, basic, pro with month/year pricing and Stripe IDs.

### Webhook Handler ([app/api/webhook/stripe/route.ts](app/api/webhook/stripe/route.ts))
Handles subscription lifecycle:
- `checkout.session.completed` - New subscription, upserts to `stripe_customers`
- `customer.subscription.updated` - Plan changes (upgrade/downgrade/cancellation)
- `customer.subscription.deleted` - Revoke access
- `invoice.payment_succeeded/failed` - Payment status
- `charge.refunded` - Refund processing

Uses `createSupabaseAdminClient()` to bypass RLS when updating subscription data.

### Local Webhook Testing
```bash
pnpm stripe:listen
```

## Path Aliases

TypeScript configured with `@/*` alias mapping to project root:
```typescript
import { auth } from "@/lib/auth"
import config from "@/config"
```

## Email System

Provider: **Nodemailer** (configured in [config.ts](config.ts))
- Templates: React Email components in [components/email/](components/email/)
- Verification emails rendered via `@react-email/render`
- Email dev server: `pnpm email`

## Environment Variables

Required variables (see [.env.example](.env.example)):
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Email: `EMAIL_SERVER_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM`
- Auth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`

## Git Conventions

Use conventional commits format:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, chore
```

## App Structure

- `/app` - Next.js App Router (public pages at root)
- `/app/app` - Protected application area (requires auth via middleware)
  - Main page features the interactive 3D globe component
- `/app/api` - API routes (auth, payments, webhooks, countries)
- `/lib` - Core utilities (auth, email)
- `/utils` - Helper functions (Supabase clients, Stripe)
- `/components` - React components
  - `/components/app/InteractiveGlobe.tsx` - 3D globe visualization
- `/types` - TypeScript definitions
- `/supabase` - Database schema SQL files

## Interactive Globe Feature

### Architecture
The main app at `/app/app` displays an interactive 3D globe where users can:
- Click countries to mark them as visited (green)
- Click again to unmark
- View statistics (visited count)
- See visual feedback with color coding

### Components
- **InteractiveGlobe** ([components/app/InteractiveGlobe.tsx](components/app/InteractiveGlobe.tsx))
  - Client component using react-globe.gl
  - Dynamically imported with `ssr: false` to avoid SSR issues
  - Fetches GeoJSON data from Natural Earth for country boundaries
  - Uses ISO 3166-1 alpha-2 country codes
  - Color scheme: green for visited, gray for unvisited, primary color on selection

### API Endpoints ([app/api/countries/route.ts](app/api/countries/route.ts))
- `GET /api/countries` - Fetch all visited countries for current user
- `POST /api/countries` - Mark country as visited (body: `{ country_code, country_name, notes? }`)
- `DELETE /api/countries?country_code=XX` - Unmark country as visited

### Database
Table: `visited_countries` (schema: [supabase/visited_countries_table_2025-09-30T09.sql](supabase/visited_countries_table_2025-09-30T09.sql))
- Stores user visits with country_code, country_name, visited_date, notes
- Unique constraint on (user_id, country_code) to prevent duplicates
- Full RLS policies using `next_auth.uid()`

### Dependencies
- `react-globe.gl` - 3D globe visualization
- `three` - 3D graphics library
- Natural Earth GeoJSON data for country boundaries