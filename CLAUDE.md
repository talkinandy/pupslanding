# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUPS Bot Platform - A Next.js application featuring both a marketing landing page and a comprehensive trading dashboard for a Telegram cryptocurrency trading bot specializing in Runes on the Odin blockchain. The platform includes real-time trader analytics, automated leaderboard updates, and Supabase integration.

## Development Commands

```bash
npm run dev    # Start development server with Turbopack on 0.0.0.0
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

### Data Management Scripts

```bash
# Leaderboard management (requires SUPABASE environment variables)
NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/update-leaderboard.js
NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/verify-leaderboard.js

# Database setup and utilities
node scripts/setup-database.js          # Initialize database schema
node scripts/setup-indexes-and-views.js # Create indexes and views

# Testing and debugging scripts
node scripts/test-real-pnl.js          # Test P&L calculations
node scripts/debug-volume-discrepancy.js # Debug volume issues
node scripts/audit-site.js             # Site audit and performance check
```

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15.2.0 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS + shadcn/ui components (New York style)
- **Animations**: Framer Motion
- **State Management**: React hooks (useState, useEffect)
- **Notifications**: Sonner toast notifications
- **API Integration**: Odin API for blockchain data, Supabase API for leaderboards
- **Automation**: GitHub Actions for daily leaderboard updates
- **Deployment**: Netlify with @netlify/plugin-nextjs

### Project Structure
```
src/
├── app/
│   ├── page.tsx               # Main landing page
│   ├── layout.tsx             # Root layout with metadata
│   ├── globals.css            # Global styles, custom fonts (Dion)
│   ├── ClientBody.tsx         # Client-side wrapper
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard page with metadata
│   │   └── components/
│   │       └── DashboardPage.tsx  # Complete dashboard implementation
│   └── docs/
│       └── page.tsx           # Documentation page
├── components/
│   ├── ui/                    # shadcn/ui components (New York style)
│   ├── Header.tsx             # Navigation with mobile menu
│   ├── Footer.tsx             # Footer with links
│   └── sections/              # Page sections (Hero, Features, etc.)
└── lib/
    ├── constants.ts           # Images, links, features data
    └── utils.ts               # Utility functions (cn helper)

scripts/                       # Data processing and automation scripts
├── update-leaderboard.js      # Main leaderboard update script (GitHub Actions)
├── verify-leaderboard.js      # Leaderboard verification script
├── setup-database.js         # Database initialization
├── test-*.js                 # Testing and debugging scripts
└── audit-site.js             # Site performance audit

supabase/
└── migrations/
    └── 20250122_create_odin_dashboard_schema.sql  # Database schema

.github/workflows/
└── update-leaderboard.yml     # Daily automated leaderboard updates

public/
├── fonts/                     # Custom fonts (Dion.otf)
├── images/                    # All SVG illustrations and graphics
└── favicon/                   # Favicon files
```

### Key Configuration Files
- **tsconfig.json**: Path alias `@/*` → `./src/*`, strict mode enabled
- **tailwind.config.ts**: Custom colors, fonts, 3xl breakpoint (2000px)
- **components.json**: shadcn/ui config (New York style, zinc base)
- **next.config.ts**: Custom build dir for production, SVG support, image optimization
- **netlify.toml**: Build command and Next.js plugin configuration
- **supabase/migrations/**: Database schema and table definitions
- **.github/workflows/update-leaderboard.yml**: Daily automation for leaderboard updates

### Design System
- **Primary Color**: #0574f9 (PUPS blue)
- **Success Color**: #24a936 (green)
- **Font Stack**: 
  - Dion (custom) for headings
  - Poppins, Outfit, Space Grotesk (Google Fonts)
- **Components**: New York style shadcn/ui with zinc base
- **Breakpoints**: Default Tailwind + custom 3xl (2000px)

## Key Integration Points

### Odin API Integration
- **Base URL**: `https://api.odin.fun/v1`
- **Key Endpoints**: `/statistics/dashboard`, `/trades`, `/user/{principal}/stats`
- **Used For**: Fetching trader data, platform statistics, real-time market data
- **Rate Limiting**: Built-in delays between API calls to avoid rate limits

### Supabase Database
- **Tables**: `traders`, `trader_snapshots`, `trader_positions`, `platform_stats`
- **Authentication**: Service role key for server-side operations, anon key for client
- **Features**: Row Level Security, materialized views, automated timestamps
- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Telegram Bot
- Bot URL: `https://t.me/pupsodinbot`
- Invite code system: Users start with "?start=invitation code:"
- No direct API integration in frontend

### Automation (GitHub Actions)
- **Schedule**: Daily at 6:00 AM UTC
- **Timeout**: 15 minutes maximum execution time
- **Process**: Fetches Odin API data → Calculates P&L → Updates Supabase tables
- **Monitoring**: Verification scripts and failure notifications

### External Resources
- Documentation: GitBook (linked in header/footer)
- Images: Stored in public/assets/
- Icons: Lucide React icons

## Development Guidelines

### Current Implementation
- **Landing Page**: Single-file implementation in `app/page.tsx`
- **Dashboard**: Complete trader analytics in `app/dashboard/components/DashboardPage.tsx`
- **Data Layer**: Comprehensive scripts in `scripts/` directory for data processing
- **Features**: Stored in `lib/constants.ts` for easy content management
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Real-time Updates**: Dashboard shows live leaderboard data from Supabase

### When Making Changes
1. **Styling**: Use Tailwind classes, maintain existing color scheme
2. **Components**: Consider extracting sections if adding complexity
3. **Database**: Always test scripts locally before deployment
4. **API Integration**: Respect rate limits, implement proper error handling
5. **Mobile**: Test responsive behavior, especially on dashboard components
6. **Performance**: Keep animations smooth, optimize database queries

### Important Files
- `app/page.tsx`: Main landing page logic and layout
- `app/dashboard/components/DashboardPage.tsx`: Complete dashboard implementation
- `scripts/update-leaderboard.js`: Core data processing script (750+ lines)
- `lib/constants.ts`: All text content, image paths, and links
- `components/Header.tsx`: Navigation and mobile menu
- `tailwind.config.ts`: Theme customization
- `supabase/migrations/`: Database schema definitions

## Common Tasks

### Working with Dashboard Data
1. **Local Testing**: Use environment variables for Supabase connection
2. **Data Updates**: Run `scripts/update-leaderboard.js` to refresh data
3. **Database Changes**: Create migrations in `supabase/migrations/`
4. **API Testing**: Use `scripts/test-*.js` scripts for debugging

### Adding New Features
1. Update features array in `lib/constants.ts`
2. Features use SVG images from `public/images/features/`
3. Maintain 3-column grid on desktop, single column on mobile

### Updating Content
- Hero text: Search for "Instant Runes Trading" in page.tsx
- Features: Edit `FEATURES` array in `lib/constants.ts`
- External links: Update in `EXTERNAL_LINKS` object in `lib/constants.ts`
- Images: Update paths in `IMAGES` object in `lib/constants.ts`

### Modifying Animations
- Floating elements use Framer Motion with `whileInView`
- Clouds have continuous rotation animation
- Form slides in from right on desktop, bottom on mobile
- Toast notifications use Sonner library

### Environment-Specific Configuration
- Development server binds to `0.0.0.0` for network access
- Production build uses custom directory: `build` instead of `.next`
- Turbopack enabled for faster development builds

## Deployment & Automation

### Netlify Deployment
- Build command: `npm run build`
- Publish directory: `.next` (Netlify handles the custom build directory)
- Environment: Production uses Next.js optimizations
- Plugin: `@netlify/plugin-nextjs` for Next.js support
- Telemetry disabled via `NEXT_TELEMETRY_DISABLED=1`

### GitHub Actions Automation
- **Trigger**: Daily at 6:00 AM UTC (customizable via workflow_dispatch)
- **Process**: Fetches Odin API data → Processes 24h/7d leaderboards → Updates Supabase
- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Monitoring**: Automatic verification and failure notifications
- **Performance**: Optimized for GitHub Actions 15-minute timeout limit

### Data Architecture
- **Primary Data Source**: Odin API (`https://api.odin.fun/v1`)
- **Storage**: Supabase PostgreSQL with materialized views for performance
- **Update Frequency**: Daily automated updates, manual triggers available
- **Data Types**: Trader statistics, P&L calculations, platform metrics

## Image Optimization

- SVG support enabled with `dangerouslyAllowSVG: true`
- Remote patterns configured for:
  - Unsplash images
  - GitHub raw content
  - `*.pupstoken.com` domains
  - `web-assets.same.dev`

## TypeScript Configuration

- Strict mode enabled for type safety
- ES2017 target with bundler module resolution
- Path aliases: `@/*` maps to `./src/*`
- JSX preserved for Next.js processing