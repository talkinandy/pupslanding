# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUPS Bot Landing Page - A Next.js landing page for a Telegram cryptocurrency trading bot specializing in Runes on the Odin blockchain.

## Development Commands

```bash
npm run dev    # Start development server with Turbopack on 0.0.0.0
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15.2.0 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React hooks (useState, useEffect)
- **Notifications**: Sonner toast notifications
- **Deployment**: Netlify with @netlify/plugin-nextjs

### Project Structure
```
src/
├── app/
│   ├── page.tsx         # Main landing page (monolithic component)
│   ├── layout.tsx       # Root layout with metadata
│   ├── globals.css      # Global styles, custom fonts (Dion)
│   └── ClientBody.tsx   # Client-side wrapper
├── components/
│   ├── ui/              # shadcn/ui components (New York style)
│   ├── Header.tsx       # Navigation with mobile menu
│   ├── Footer.tsx       # Footer with links
│   └── sections/        # Page sections (Hero, Features, etc.)
└── lib/
    ├── constants.ts     # Images, links, features data
    └── utils.ts         # Utility functions (cn helper)

public/
├── fonts/               # Custom fonts (Dion.otf)
├── images/              # All SVG illustrations and graphics
└── favicon/             # Favicon files
```

### Key Configuration Files
- **tsconfig.json**: Path alias `@/*` → `./src/*`, strict mode enabled
- **tailwind.config.ts**: Custom colors, fonts, 3xl breakpoint (2000px)
- **components.json**: shadcn/ui config (New York style, zinc base)
- **next.config.ts**: Custom build dir for production, SVG support, image optimization
- **netlify.toml**: Build command and Next.js plugin configuration

### Design System
- **Primary Color**: #0574f9 (PUPS blue)
- **Success Color**: #24a936 (green)
- **Font Stack**: 
  - Dion (custom) for headings
  - Poppins, Outfit, Space Grotesk (Google Fonts)
- **Components**: New York style shadcn/ui with zinc base
- **Breakpoints**: Default Tailwind + custom 3xl (2000px)

## Key Integration Points

### Telegram Bot
- Bot URL: `https://t.me/pupsodinbot`
- Invite code system: Users start with "?start=invitation code:"
- No direct API integration in frontend

### External Resources
- Documentation: GitBook (linked in header/footer)
- Images: Stored in public/assets/
- Icons: Lucide React icons

## Development Guidelines

### Current Implementation
- All landing page content is in a single `app/page.tsx` file
- Features data stored in `lib/constants.ts`
- Responsive design with mobile-first approach
- Floating form appears on scroll past hero section

### When Making Changes
1. **Styling**: Use Tailwind classes, maintain existing color scheme
2. **Components**: Consider extracting sections from page.tsx if adding complexity
3. **Images**: Store in public/assets/, update constants.ts
4. **Mobile**: Test responsive behavior, especially floating forms
5. **Performance**: Keep animations smooth, optimize images

### Important Files
- `app/page.tsx`: Main landing page logic and layout
- `lib/constants.ts`: All text content, image paths, and links
- `components/Header.tsx`: Navigation and mobile menu
- `tailwind.config.ts`: Theme customization

## Common Tasks

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

## Deployment

Built and deployed via Netlify:
- Build command: `npm run build`
- Publish directory: `.next` (Netlify handles the custom build directory)
- Environment: Production uses Next.js optimizations
- Plugin: `@netlify/plugin-nextjs` for Next.js support
- Telemetry disabled via `NEXT_TELEMETRY_DISABLED=1`

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