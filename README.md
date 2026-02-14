# GamerMatch - Gamer Dating App

Find your player two. A dating app built for gamers, by gamers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Storage, Realtime)
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gamer-dating-app.git
   cd gamer-dating-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm type-check` | Run TypeScript compiler check |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup, etc.)
│   ├── (main)/            # Main app pages (discover, matches, etc.)
│   ├── (admin)/           # Admin dashboard
│   ├── auth/              # Auth callback route
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client configuration
│   ├── validations/      # Zod schemas
│   └── ...
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── stores/               # State management (if needed)

supabase/
└── migrations/           # Database migrations

tests/
├── unit/                 # Unit tests
└── e2e/                  # End-to-end tests
```

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Enable Email Auth and Google OAuth in Authentication settings

3. Run the database migrations (coming in Phase 2)

4. Configure Storage buckets for profile photos

## Development Phases

- [x] **Phase 0**: Project setup, tooling, CI/CD
- [ ] **Phase 1**: Auth + skeleton UI + deploy
- [ ] **Phase 2**: Profile CRUD + photo upload
- [ ] **Phase 3**: Discovery + like/pass + matching
- [ ] **Phase 4**: Real-time chat
- [ ] **Phase 5**: Safety (block/report) + admin dashboard
- [ ] **Phase 6**: Polish, testing, GDPR, PWA

## Contributing

This is currently a private project. Contributions guidelines coming soon.

## License

Private - All rights reserved.
