# envpass

**Stop pasting secrets in Discord.**

Encrypted secret sharing for hackathon teams. Create a room, share a 6-character code, and your whole team has a secure vault for API keys and environment variables — synced in real-time.

[Live at envpass.vhaan.me](https://envpass.vhaan.me)

## Features

- **Encrypted** — Every secret is encrypted with a unique key via WorkOS Vault (HSM-backed envelope encryption). The database never sees plaintext.
- **Real-time** — Teammate adds a key, you see it instantly. Convex reactive subscriptions, no polling.
- **Bulk .env import** — Paste a `.env` file and it parses + encrypts each key individually. Export everything back as `KEY=VALUE` with one click.
- **Masked by default** — Values are hidden until you explicitly reveal or copy them. Clipboard auto-clears after 30 seconds.
- **Audit trail** — Every read, write, copy, and export is logged with the user and timestamp.
- **Room shredding** — When you're done, the room owner can shred the room and all its secrets.
- **Role-based access** — Owners can manage members, delete secrets, and shred rooms. Members can view, add, and copy.
- **Authenticated** — WorkOS AuthKit sign-in required. No anonymous access.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | WorkOS AuthKit |
| Encryption | WorkOS Vault (HSM-backed) |
| Database | Convex (real-time reactive) |
| Package Manager | Bun |
| Hosting | Vercel + Convex Cloud |

## Getting Started

### Prerequisites

- Bun (or Node.js 18+)
- [WorkOS](https://workos.com) account (AuthKit + Vault)
- [Convex](https://convex.dev) account

### Installation

```bash
git clone https://github.com/Lemirq/envpass.git
cd envpass
bun install
```

### Environment Variables

Create `.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# WorkOS
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_test_...
WORKOS_COOKIE_PASSWORD=<64-char hex string>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Next.js frontend
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### Secret Encryption

1. User submits a secret value (or bulk-pastes a `.env` file)
2. Each value is encrypted via WorkOS Vault (HSM-backed envelope encryption, unique DEK per secret)
3. Only the opaque Vault object ID is stored in Convex — never plaintext
4. On read/copy, the value is decrypted server-side and returned to the client
5. Every operation is logged in the audit trail

### Room Lifecycle

1. Owner creates a room → gets a 6-character invite code
2. Teammates join by entering the code (share it verbally, no links needed)
3. Everyone in the room can add, view, and copy secrets
4. When you're done, the owner shreds the room — soft-deletes everything

## Project Structure

```
envpass/
├── convex/                          # Backend (Convex)
│   ├── schema.ts                    # Database schema
│   ├── rooms.ts                     # Room CRUD + shredding
│   ├── secrets.ts                   # Secret CRUD (Vault integration)
│   ├── memberships.ts               # Member/role management
│   ├── auditLogs.ts                 # Audit logging
│   └── users.ts                     # User sync (WorkOS → Convex)
├── src/
│   ├── middleware.ts                 # WorkOS auth middleware
│   ├── app/
│   │   ├── layout.tsx               # Root layout + metadata
│   │   ├── page.tsx                 # Landing page (public)
│   │   ├── globals.css              # Design tokens + fonts
│   │   ├── api/
│   │   │   ├── auth/callback/       # WorkOS OAuth callback
│   │   │   └── vault/               # Encrypt, decrypt, delete
│   │   └── (authenticated)/         # Protected route group
│   │       ├── layout.tsx           # AuthKit + Convex providers
│   │       ├── dashboard/page.tsx   # Room list
│   │       ├── join/page.tsx        # Join room by invite code
│   │       └── room/
│   │           ├── new/page.tsx     # Create room
│   │           └── [roomId]/
│   │               ├── page.tsx     # Room vault + audit sidebar
│   │               └── settings/    # Members, danger zone
│   └── lib/
│       ├── utils.ts                 # Invite codes, clipboard helpers
│       ├── useCurrentUser.ts        # Auth hook
│       └── convex-provider.tsx      # Convex client setup
└── public/                          # Logo, OG image
```

## Security

- **Zero plaintext at rest** — Convex stores only opaque Vault object IDs, never secret values
- **HSM-backed encryption** — WorkOS Vault with envelope encryption and unique keys per secret
- **Authenticated access** — WorkOS AuthKit middleware on all protected routes
- **Role-based authorization** — Owner/Member roles enforced on every mutation
- **Audit logging** — Every secret read, write, copy, export, and member change is logged
- **Clipboard auto-clear** — Copied values are cleared from clipboard after 30 seconds
- **Soft-delete** — Secrets and rooms are soft-deleted, not hard-deleted, for auditability

## License

MIT

---

**Stop pasting secrets in Discord. Use [envpass](https://envpass.vhaan.me).**
