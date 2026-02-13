# envpass

**Stop pasting secrets in Discord.**

The secure way to share secrets at hackathons. Fast, ephemeral, encrypted secret sharing designed for teams that move fast.

## Features

- **Encrypted** - WorkOS Vault encryption with unique keys per secret. Zero plaintext at rest.
- **Ephemeral** - Rooms auto-expire (24h to 1 week). Secrets self-destruct. Nothing permanent.
- **Real-time** - Live updates across your team via Convex. No refresh needed.
- **Authenticated** - WorkOS AuthKit sign-in required. No anonymous access.
- **Audit trail** - Every secret access logged with timestamp, user, and action.
- **Copy, don't display** - Secret values masked by default. Click to copy to clipboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** WorkOS AuthKit
- **Secret Storage:** WorkOS Vault (HSM-backed envelope encryption)
- **Database:** Convex (real-time reactive)
- **Package Manager:** Bun
- **Hosting:** Vercel + Convex Cloud

## Getting Started

### Prerequisites

- Bun (or Node.js 18+)
- WorkOS account (AuthKit + Vault credentials)
- Convex account

### Installation

```bash
git clone https://github.com/Lemirq/envpass.git
cd envpass
bun install
```

### Environment Variables

Create `.env.local` with:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# WorkOS
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_test_...
WORKOS_COOKIE_PASSWORD=<64-char hex string>
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start Convex dev server
npx convex dev

# Start Next.js dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
envpass/
├── convex/                          # Convex backend
│   ├── schema.ts                    # Database schema
│   ├── rooms.ts                     # Room CRUD
│   ├── secrets.ts                   # Secret operations (Vault integration)
│   ├── memberships.ts               # Member management
│   ├── auditLogs.ts                 # Audit logging
│   ├── users.ts                     # User management
│   ├── cleanup.ts                   # Expiration cleanup
│   └── crons.ts                     # Scheduled jobs
├── src/
│   ├── middleware.ts                 # WorkOS auth middleware
│   ├── app/
│   │   ├── layout.tsx               # Root layout (bare)
│   │   ├── page.tsx                 # Landing page (public)
│   │   ├── globals.css              # CSS variables + Tailwind config
│   │   └── (authenticated)/         # Protected route group
│   │       ├── layout.tsx           # AuthKit + Convex providers
│   │       ├── dashboard/page.tsx   # Room list dashboard
│   │       ├── join/page.tsx        # Join room by invite code
│   │       └── room/
│   │           ├── new/page.tsx     # Create room
│   │           └── [roomId]/
│   │               ├── page.tsx     # Room view (secrets + audit sidebar)
│   │               └── settings/page.tsx  # Room settings
│   └── lib/
│       ├── utils.ts                 # Helpers (invite codes, TTL, clipboard)
│       ├── useCurrentUser.ts        # Auth hook (WorkOS → Convex user)
│       └── convex-provider.tsx      # Convex client setup
└── public/                          # Static assets
```

## Design System

### Colors

Ultra-dark theme with green accent:

| Role | Value | Usage |
|------|-------|-------|
| Body BG | `#050505` | Page background |
| Card BG | `#0a0a0a` | Cards, panels |
| Border | `#222222` | Subtle borders |
| Border Highlight | `#333333` | Focus/hover borders |
| Text Primary | `#ffffff` | Main text |
| Text Secondary | `#888888` | Labels, muted |
| Text Dim | `#444444` | Placeholders |
| Accent Green | `#4ade80` | Active states, TTL, success |
| Accent Red | `#f87171` | Danger, delete, errors |

### Typography

- **Headings:** Silkscreen (pixel font)
- **Body:** Inter
- **Code/Secrets:** JetBrains Mono

### Button Style

Gradient dark buttons with inset shadows, uppercase tracking, and hover translate effects:
```
bg-gradient-to-b from-[#2a2a2a] to-[#151515]
border border-[#444]
shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
```

## Architecture

### Authentication Flow

1. Landing page (`/`) is public — no auth required
2. All other routes are protected by WorkOS AuthKit middleware
3. Unauthenticated users are redirected to WorkOS sign-in
4. On callback, session is established and user is synced to Convex
5. Route groups separate public layout from authenticated layout (with providers)

### Secret Encryption

1. User submits a secret value
2. Value is encrypted via WorkOS Vault (HSM-backed envelope encryption)
3. Only the Vault object ID is stored in Convex — never plaintext
4. On read, the Vault object ID is decrypted server-side and returned
5. Every read/write is logged in the audit trail

### Room Lifecycle

1. Owner creates a room with a name and expiry (24h–1 week)
2. A unique invite code is generated for team sharing
3. Members join via invite code
4. Secrets are shared within the room
5. Room and all secrets are permanently deleted on expiry (Convex cron)

## Security

- **Encryption:** WorkOS Vault with HSM-backed envelope encryption
- **Auth:** WorkOS AuthKit — no anonymous access to protected routes
- **Access Control:** Role-based (Owner/Member) enforced on every mutation
- **Expiration:** Automatic cleanup via Convex cron jobs
- **Audit Logging:** Every operation logged with user, timestamp, and action
- **Zero Plaintext:** Only encrypted Vault object IDs stored in database

## License

MIT

---

**Stop pasting secrets in Discord. Use envpass.**
