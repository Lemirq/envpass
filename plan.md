# envpass

### The secure way to share secrets at hackathons.

---

## The Problem

Every hackathon team has lived this nightmare: you're 6 hours into a 36-hour build, someone on your team just set up the Stripe sandbox and the OpenAI API key, and now they need to get those keys to 3 other teammates. What happens next?

- `OPENAI_API_KEY=sk-proj-8f3k...` dropped raw into a Discord DM
- A `.env` file screenshot posted in the team group chat
- Someone emails themselves an API key to copy-paste on another machine
- Keys sitting in plaintext in a shared Google Doc titled "KEYS DO NOT SHARE"

These keys are now permanently stored in Discord's servers, in email archives, in chat histories. Anyone who compromises any of those channels gets production (or sandbox) credentials. And sure, tools like Doppler, 1Password, and HashiCorp Vault exist — but they're enterprise tools with onboarding friction that doesn't fit a 36-hour hackathon where you just need to securely hand someone a key and move on.

**envpass** is built for exactly this: fast, secure, ephemeral secret sharing designed for the pace of hackathons and small team sprints.

---

## Branding

**Name:** envpass

**Tagline:** "Stop pasting secrets in Discord."

**Subtitle:** "Secure Workspace" (displayed in header next to logo, pixel font with white glow)

**Logo:** Custom logo at `/public/envpass.png` and `/public/envpass.jpg` — displayed as a 32×32 icon in the authenticated header.

**Voice:** Direct, technical, slightly irreverent. Speaks developer-to-developer. No corporate fluff. Example empty states:
- "No rooms yet. Your Discord DMs are relieved."
- "Encrypted vaults for your team secrets"
- "Sign in with WorkOS to create or join a room"

---

## Design System

### Color Palette

Ultra-dark theme with green/red accents, defined as CSS custom properties in `globals.css`:

| Variable | Hex | Usage |
|---|---|---|
| `--bg-body` | `#050505` | Page background — near-black |
| `--bg-card` | `#0a0a0a` | Cards, panels, elevated surfaces |
| `--bg-card-hover` | `#111111` | Card/row hover state |
| `--border-color` | `#222222` | Default borders and dividers |
| `--border-highlight` | `#333333` | Focus/hover borders, secondary button borders |
| `--text-primary` | `#ffffff` | Main text — pure white |
| `--text-secondary` | `#888888` | Labels, descriptions, muted info |
| `--text-dim` | `#767676` | Placeholders, timestamps, very muted text |
| `--accent-green` | `#4ade80` | Active states, success indicators, member dots |
| `--accent-red` | `#f87171` | Danger, delete actions, shred |
| `--accent-glow-green` | `rgba(74, 222, 128, 0.4)` | Green glow on active room dots, invite code focus |
| `--accent-glow-red` | `rgba(248, 113, 113, 0.4)` | Red glow on danger elements |

### Button System

Two button tiers, both using gradient backgrounds with inset shadows:

**Primary button:**
```
bg-gradient-to-b from-[#2a2a2a] to-[#151515]
border border-[#444]
shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.4)
hover: border-[#555], -translate-y-1px, stronger shadow
active: translate-y-1px, inset shadow
```

**Secondary button:**
```
bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f]
border border-[var(--border-highlight)]
Same hover/active pattern, subtler appearance
```

### Typography

| Role | Font | Source |
|---|---|---|
| Body / UI text | Inter (400, 500, 600, 700) | Google Fonts |
| Secret values / code | JetBrains Mono (400, 500) | Google Fonts |
| Section labels / headings | Silkscreen | Google Fonts (pixel font) |
| Hero title ("envpass") | Instrument Serif (400) | `next/font/google` |

### Radius & Spacing

```
--radius-sm: 4px   (small elements)
--radius-md: 8px   (buttons, inputs)
--radius-lg: 12px  (cards, panels)
```

### Custom Scrollbar

Thin (6px) scrollbar with `#222` thumb, transparent track, `#333` on hover.

---

## Core Concepts

### Mental Model

envpass is organized around three primitives:

1. **Rooms** — A shared workspace for a team (maps to a hackathon team or project). Each room is a WorkOS Organization under the hood. Rooms have a 6-character alphanumeric invite code for frictionless onboarding.

2. **Secrets** — Individual key-value pairs (e.g., `OPENAI_API_KEY` = `sk-proj-...`). Each secret is stored as an encrypted object in WorkOS Vault, cryptographically isolated per room. Secrets support optional descriptions and tags.

3. **Members** — Authenticated users who've joined a room. Auth is handled by WorkOS AuthKit (SSO — Google OAuth, GitHub OAuth, etc.). Members have one of two roles: **Owner** (created the room, can manage members, delete secrets, shred rooms) or **Member** (can view, add, and copy secrets).

### Key Principles

- **Zero plaintext at rest.** All secret values are encrypted via WorkOS Vault's envelope encryption (unique DEK per secret). Convex only stores opaque Vault object IDs, never plaintext values.

- **Copy, don't display.** Secret values are masked by default (`••••••••`). Users can reveal values or copy to clipboard — the plaintext is fetched from Vault on-demand.

- **Clipboard auto-clear.** Copied values are automatically cleared from clipboard after 30 seconds (best-effort).

- **Soft-delete over hard-delete.** Secrets use a `deletedAt` timestamp for soft deletion. Rooms use a `status: "deleted"` flag. This enables the "shred" metaphor — owner can shred an entire room.

- **Audit everything.** Every secret access (create, read/copy, update, delete, export) and membership change is logged with timestamp and user.

- **Real-time by default.** All data flows through Convex reactive queries — when a teammate adds a secret, every member's UI updates instantly via WebSocket subscriptions.

---

## Technical Architecture

### Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 + CSS custom properties | 4.x |
| Icons | Lucide React | 0.564.0 |
| Auth | WorkOS AuthKit | @workos-inc/authkit-nextjs 2.14.0 |
| Secret Storage | WorkOS Vault | @workos-inc/node 8.3.1 |
| Database | Convex (real-time reactive) | 1.31.7 |
| Hosting | Vercel (frontend) + Convex Cloud (backend) | — |
| Package Manager | Bun | — |

No shadcn/ui — all components are custom-built with Tailwind utility classes.

### Route Structure

```
src/app/
├── layout.tsx                          # Root layout (Instrument Serif font, metadata)
├── globals.css                         # CSS variables, fonts, scrollbar
├── page.tsx                            # Landing page (public)
├── middleware.ts                       # WorkOS auth middleware
├── (authenticated)/                    # Protected route group
│   ├── layout.tsx                      # AuthKitProvider + ConvexClientProvider
│   ├── dashboard/page.tsx              # Room list
│   ├── join/page.tsx                   # Join room by invite code
│   └── room/
│       ├── new/page.tsx                # Create room form
│       └── [roomId]/
│           ├── page.tsx                # Room vault view (secrets + sidebar)
│           └── settings/page.tsx       # Room settings, members, danger zone
└── api/
    ├── auth/callback/route.ts          # WorkOS OAuth callback
    └── vault/
        ├── route.ts                    # POST: encrypt + store, DELETE: remove
        └── read/route.ts              # POST: decrypt + return value
```

### Authentication

- **Provider:** WorkOS AuthKit (SSO — Google, GitHub, email)
- **Middleware:** `authkitMiddleware` protects all routes except `/` and `/api/auth/callback`
- **Session:** Cookie-based via WorkOS
- **User sync:** `useCurrentUser` hook calls `getOrCreateUser` mutation on first visit, syncing WorkOS user data (email, name, avatar) into Convex

### Database Schema (Convex)

```typescript
// convex/schema.ts

users: {
  workosUserId: string       // indexed
  email: string              // indexed
  displayName?: string
  avatarUrl?: string
}

rooms: {
  name: string
  inviteCode: string         // 6-char alphanumeric, indexed
  workosOrgId: string        // indexed
  createdById: Id<"users">
  status?: "active" | "deleted"   // soft-delete flag
}

memberships: {
  userId: Id<"users">
  roomId: Id<"rooms">
  role: "OWNER" | "MEMBER"
  // composite index: by_user_room
}

secrets: {
  roomId: Id<"rooms">
  keyName: string
  vaultObjectId: string      // opaque WorkOS Vault reference
  description?: string
  tags?: string[]
  createdById: Id<"users">
  deletedAt?: number         // soft-delete timestamp
  // composite index: by_room_key
}

auditLogs: {
  roomId: Id<"rooms">
  secretId?: Id<"secrets">
  userId: Id<"users">
  action: SECRET_CREATED | SECRET_READ | SECRET_UPDATED | SECRET_DELETED
         | SECRET_EXPORTED | MEMBER_JOINED | MEMBER_REMOVED
         | ROOM_CREATED | ROOM_SETTINGS_UPDATED | ROOM_SHREDDED
  metadata?: any
}
```

### Vault Integration

All secret values are encrypted via WorkOS Vault. The app never stores or logs plaintext values.

```
POST /api/vault         → Create encrypted object → returns { id }
POST /api/vault/read    → Decrypt by vault ID → returns { value }
DELETE /api/vault?id=    → Delete vault object
```

Convex stores only the `vaultObjectId`. Decryption happens server-side in Next.js API routes before returning to the client.

---

## Pages & Features (Implemented)

### Landing Page (`/` — Public)

- Header with "envpass" wordmark + "Secure Workspace" pixel label + Sign In button
- Hero section: Instrument Serif "envpass" title, tagline, description, Get Started CTA
- Three feature cards: **Encrypted** (Lock icon), **Instant** (Zap icon), **Real-time** (Radio icon)

### Dashboard (`/dashboard` — Protected)

- Header: logo, "envpass" link, "Secure Workspace" label, user email, Sign Out button
- Page title: "Your Rooms" with "Encrypted vaults for your team secrets" subtitle
- Two CTAs: "Join Room" (secondary) + "Create Room" (primary with + icon)
- Room list table: Room Name (with green active dot + owner/member role), Invite Code (monospace), Secrets count, Members count
- Empty state: "No rooms yet. Your Discord DMs are relieved." with Create button
- Loading state with monospace text

### Create Room (`/room/new` — Protected)

- Room name input (placeholder: "HackMIT 2026 — Team Sigma")
- Submit button
- Back navigation to dashboard

### Join Room (`/join` — Protected)

- 6-character invite code input (uppercase, monospace)
- Live room name validation (green when found, red when not)
- Join button (disabled until valid code)
- Duplicate membership detection

### Room Vault (`/room/[roomId]` — Protected)

**Main content area:**
- Header: "Environment Variables" with Copy .env + Add Secret buttons
- Secrets table: Key Name, Value (masked `••••••••` or revealed), Created timestamp, Actions
- Per-secret actions: Reveal/hide toggle (eye icon), Copy value, Edit (pencil), Delete (trash, owner-only)
- Add Secret modal with bulk `.env` paste support (parses `KEY=VALUE` lines) + preview
- Copy .env exports all secrets as `KEY=VALUE` format to clipboard
- Footer: "Invite Team" section with invite code display + overlapping member avatar stack

**Sidebar (320px):**
- Audit Trail: scrollable timeline (20 items max) with colored dots (green = create/join, red = read/delete/shred, gray = other), user email, action description, relative timestamps ("Just now", "5m ago", "2h ago")
- Room Stats: secret count + user count (pinned to bottom)
- Settings button
- Shred Room button (owner-only, danger styling with flame icon)

### Room Settings (`/room/[roomId]/settings` — Protected)

- Invite Code section: display + copy button with green glow effect
- Room Details: displays user's role (OWNER/MEMBER)
- Members list: scrollable, avatars, names, emails, role badges (green = Owner, gray = Member), Remove button (owner-only, non-owner members only)
- Danger Zone (owner-only): "Shred this room" with explanation, two-step confirmation toggle

---

## Feature Status

### Implemented ✅

- WorkOS AuthKit integration (SSO sign up/in, session management)
- Room creation with auto-generated 6-char invite codes
- Join room by invite code with live validation
- Encrypted secret storage via WorkOS Vault (HSM-backed envelope encryption)
- Individual secret CRUD (create, read, edit key+value, soft-delete)
- Bulk `.env` import with preview parsing
- Copy .env export (all secrets as KEY=VALUE to clipboard)
- Copy-to-clipboard with 30-second auto-clear
- Value reveal/hide toggle
- Audit trail with user enrichment and relative timestamps
- Role-based access control (Owner/Member)
- Member management (list, remove)
- Room shredding (soft-delete room + all secrets, returns vault IDs for cleanup)
- User profile sync from WorkOS → Convex (email, name, avatar)
- Real-time reactive UI via Convex subscriptions
- Ultra-dark theme with CSS custom properties
- Custom gradient buttons with inset shadows
- Loading states and error handling

### Not Yet Implemented ❌

- Room expiration / TTL (removed in favor of manual shred)
- Per-secret TTL / expiration
- Secret tags and filtering UI
- Rate limiting on secret reads
- Export as downloadable `.env` file (currently copies to clipboard)
- Responsive mobile layout
- Toast notifications (no Sonner installed)
- Cron jobs for automated cleanup

### Stretch Goals

- CLI tool (`envpass-cli`)
- GitHub integration
- Secret rotation notifications
- Webhooks for secret updates
- Team templates
- VS Code extension

---

## Deployment

```bash
# Prerequisites: Bun installed

# 1. Install dependencies
bun install

# 2. Environment variables (.env.local)
CONVEX_DEPLOYMENT="dev:your-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
WORKOS_CLIENT_ID="client_..."
WORKOS_API_KEY="sk_test_..."
WORKOS_COOKIE_PASSWORD="<64-char hex string>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 3. Run (two terminals)
npx convex dev          # Terminal 1: syncs Convex functions
bun dev                 # Terminal 2: Next.js dev server
```

---

*envpass — stop pasting secrets in Discord.*
