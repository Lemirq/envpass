# envpass

**Stop pasting secrets in Discord.**

The secure way to share secrets at hackathons. Fast, ephemeral, encrypted secret sharing designed for teams that move fast.

## Features

- 🔒 **Encrypted** - WorkOS Vault encryption with unique keys per secret. Zero plaintext at rest.
- ⚡ **Ephemeral** - Rooms auto-expire after 72 hours. Secrets self-destruct. Nothing permanent.
- 🚀 **Real-time** - Live updates across your team. No refresh needed. Just works.
- 📋 **Copy, don't display** - Secret values are masked by default. Click to copy to clipboard.
- 📊 **Audit trail** - Every secret access is logged with timestamp, user, and action.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** WorkOS AuthKit
- **Secret Storage:** WorkOS Vault
- **Database:** Convex (real-time reactive database)
- **Hosting:** Vercel + Convex Cloud

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- WorkOS account (for AuthKit and Vault)
- Convex account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lemirq/envpass.git
cd envpass
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your WorkOS and Convex credentials in `.env.local`

4. Initialize Convex:
```bash
npx convex dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
envpass/
├── convex/              # Convex backend (queries, mutations, schema)
│   ├── schema.ts        # Database schema
│   ├── rooms.ts         # Room operations
│   ├── secrets.ts       # Secret operations
│   ├── memberships.ts   # Member management
│   ├── auditLogs.ts     # Audit logging
│   ├── cleanup.ts       # Expiration cleanup
│   └── crons.ts         # Scheduled jobs
├── src/
│   ├── app/             # Next.js app router pages
│   └── lib/             # Utilities
└── public/              # Static assets
```

## Security

- **Encryption:** All secrets encrypted via WorkOS Vault with HSM-backed envelope encryption
- **Access Control:** Role-based permissions enforced on every API call
- **Expiration:** Rooms and secrets auto-expire and are permanently deleted
- **Audit Logging:** Every secret operation is logged
- **Zero Plaintext:** Secret values never stored in database

## License

MIT

---

Built with ❤️ for hackathon teams everywhere.
