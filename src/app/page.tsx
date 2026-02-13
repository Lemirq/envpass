import { Lock, Zap, Radio } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          envpass
        </h1>
        <p className="text-2xl text-[var(--text-secondary)]">
          Stop pasting secrets in Discord.
        </p>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          The secure way to share secrets at hackathons. Fast, ephemeral, encrypted secret sharing designed for teams that move fast.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <a
            href="/dashboard"
            className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
          >
            Create Room
          </a>
          <a
            href="/join"
            className="px-8 py-4 bg-[var(--surface)] hover:bg-[var(--surface-light)] text-[var(--text-primary)] rounded-lg font-semibold border border-[var(--border)] transition-colors"
          >
            Join Room
          </a>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <h3 className="text-xl font-semibold mb-2 text-[var(--primary)] flex items-center gap-2">
              <Lock className="w-5 h-5" /> Encrypted
            </h3>
            <p className="text-[var(--text-secondary)]">
              WorkOS Vault encryption with unique keys per secret. Zero plaintext at rest.
            </p>
          </div>
          <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <h3 className="text-xl font-semibold mb-2 text-[var(--primary)] flex items-center gap-2">
              <Zap className="w-5 h-5" /> Ephemeral
            </h3>
            <p className="text-[var(--text-secondary)]">
              Rooms auto-expire after 72 hours. Secrets self-destruct. Nothing permanent.
            </p>
          </div>
          <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <h3 className="text-xl font-semibold mb-2 text-[var(--primary)] flex items-center gap-2">
              <Radio className="w-5 h-5" /> Real-time
            </h3>
            <p className="text-[var(--text-secondary)]">
              Live updates across your team. No refresh needed. Just works.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
