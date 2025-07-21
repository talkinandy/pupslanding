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
- **Deployment**: Netlify

### Project Structure
```
src/
├── app/
│   ├── page.tsx         # Main landing page (monolithic component)
│   ├── layout.tsx       # Root layout with metadata
│   ├── globals.css      # Global styles, custom fonts (Dion)
│   └── ClientBody.tsx   # Client-side wrapper
├── components/
│   ├── ui/              # shadcn/ui components
│   └── Header.tsx       # Header component (actively used)
└── lib/
    ├── constants.ts     # Images, links, features data
    └── utils.ts         # Utility functions (cn helper)
```

### Design System
- **Primary Color**: #0574f9 (PUPS blue)
- **Success Color**: #24a936 (green)
- **Font**: Dion (custom) for headings, system font for body
- **Components**: New York style shadcn/ui with zinc base

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
2. Icons use emoji strings, not components
3. Maintain 3-column grid on desktop, single column on mobile

### Updating Content
- Hero text: Search for "Instant Runes Trading" in page.tsx
- Features: Edit `features` array in constants.ts
- Links: Update `TELEGRAM_BOT_URL` and `DOCS_URL` in constants.ts

### Modifying Animations
- Floating elements use Framer Motion with `whileInView`
- Clouds have continuous rotation animation
- Form slides in from right on desktop, bottom on mobile

## Deployment

Built and deployed via Netlify:
- Build command: `npm run build`
- Publish directory: `.next`
- Environment: Production uses Next.js optimizations