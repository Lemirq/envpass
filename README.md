# envpass

**Stop pasting secrets in Discord.**

The secure way to share secrets at hackathons. Fast, ephemeral, encrypted secret sharing designed for teams that move fast.

## 🎯 Project Status

This is a **functional MVP demonstration** with mock data. The UI is fully implemented and showcases the complete user experience. Backend integration with WorkOS AuthKit and Vault is ready to be connected once credentials are provided.

### ✅ What's Working

- **Landing page** - Brand messaging and feature highlights
- **Dashboard** - View your rooms with expiration timers
- **Join room flow** - Enter invite codes to access rooms
- **Room secrets view** - Browse secrets with masked values, tags, and copy functionality
- **Add secret modal** - UI for adding new secrets
- **Real-time updates ready** - Convex schema and queries configured
- **Responsive design** - Mobile-friendly dark theme with envpass branding

### 🚧 What Needs Backend Integration

- WorkOS AuthKit authentication
- WorkOS Vault secret encryption/decryption
- Convex backend deployment
- API routes for CRUD operations
- Actual secret copying (currently mocked)
- Room creation and management
- Member management
- Audit logging

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
- **Auth:** WorkOS AuthKit (ready to integrate)
- **Secret Storage:** WorkOS Vault (ready to integrate)
- **Database:** Convex (real-time reactive database)
- **Hosting:** Vercel + Convex Cloud

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- WorkOS account (for AuthKit and Vault) - _optional for local development_
- Convex account - _optional for local development_

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

3. Set up environment variables (optional for local dev with mocks):
```bash
cp .env.example .env.local
```

Fill in your WorkOS and Convex credentials in `.env.local` if you want to test with real backends.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

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
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/page.tsx  # User dashboard
│   │   ├── join/page.tsx       # Join room flow
│   │   └── room/[roomId]/      # Room pages
│   │       └── page.tsx        # Room secrets view
│   └── lib/             # Utilities
│       ├── utils.ts              # Helper functions
│       └── convex-provider.tsx   # Convex client setup
└── public/              # Static assets
```

## Design System

### Colors

The envpass brand uses a terminal-green palette on dark backgrounds:

| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#10B981` | Buttons, links, accents |
| Primary Dark | `#059669` | Hover states |
| Background | `#0A0E0F` | Main app background |
| Surface | `#111819` | Cards, panels |
| Surface Light | `#1A2324` | Input fields |
| Border | `#1E2E2F` | Subtle borders |
| Text Primary | `#E8EEEC` | Main text |
| Text Secondary | `#6B8A85` | Labels, muted info |
| Success | `#34D399` | Confirmations |
| Warning | `#FBBF24` | Expiring soon |
| Danger | `#EF4444` | Delete, expired |

### Typography

- **UI Text:** System fonts (San Francisco, Segoe UI, etc.)
- **Code/Secrets:** Monospace fonts (Cascadia Code, Menlo, Consolas)

## Development Roadmap

### Phase 1: MVP (Current) ✅
- [x] Project setup and infrastructure
- [x] Convex schema and backend functions
- [x] Landing page with branding
- [x] Dashboard with room cards
- [x] Join room flow
- [x] Room secrets view with copy functionality
- [x] Add secret modal
- [x] Responsive design

### Phase 2: Backend Integration (Next)
- [ ] WorkOS AuthKit integration
- [ ] WorkOS Vault integration
- [ ] API routes for CRUD operations
- [ ] Connect Convex backend
- [ ] Real secret encryption/decryption
- [ ] Room creation flow
- [ ] Member management

### Phase 3: Polish
- [ ] Export as `.env` file
- [ ] Per-secret TTL
- [ ] Secret tags and filtering
- [ ] Audit log viewer
- [ ] Member management UI
- [ ] Room settings page
- [ ] Toast notifications
- [ ] Error boundaries

### Phase 4: Power Features
- [ ] CLI tool (`envpass-cli`)
- [ ] GitHub integration
- [ ] Secret rotation notifications
- [ ] Webhooks
- [ ] Team templates
- [ ] VS Code extension

## Security

- **Encryption:** All secrets encrypted via WorkOS Vault with HSM-backed envelope encryption
- **Access Control:** Role-based permissions (Owner/Member) enforced on every API call
- **Expiration:** Rooms and secrets auto-expire and are permanently deleted
- **Audit Logging:** Every secret operation is logged with user, timestamp, and action
- **Zero Plaintext:** Secret values never stored in database — only encrypted Vault object IDs
- **Clipboard Auto-Clear:** Copied secrets are automatically cleared from clipboard after 30 seconds

## Contributing

This project was built as a demonstration of secure secret sharing for hackathon teams. Contributions are welcome!

## License

MIT

---

Built with ❤️ for hackathon teams everywhere.

**Stop pasting secrets in Discord. Use envpass.**
