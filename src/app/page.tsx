import { Lock, Zap, Radio, ArrowRight, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[rgba(5,5,5,0.8)] backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg tracking-tight">envpass</div>
          <div className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 uppercase" style={{ fontFamily: 'var(--font-pixel)' }}>
            <span className="text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Secure Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Lemirq/envpass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
              bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-lg text-[var(--text-secondary)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
              hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px
              active:translate-y-px transition-all duration-200 no-underline"
          >
            <Github className="w-3.5 h-3.5" /> Source
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
              bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
              hover:border-[#555] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.5)] hover:-translate-y-px
              active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:bg-[#0f0f0f]
              transition-all duration-200 no-underline"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-pixel)' }}>
            Secure Environment Manager
          </div>
          <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-instrument-serif)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            envpass
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            Stop pasting secrets in Discord.
          </p>
          <p className="text-sm text-[var(--text-dim)] font-mono max-w-xl mx-auto">
            The secure way to share secrets at hackathons. Fast, ephemeral, encrypted secret sharing designed for teams that move fast.
          </p>

          {/* Open Source Trust Banner */}
          <a
            href="https://github.com/Lemirq/envpass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mx-auto mt-2 px-5 py-3 rounded-xl
              border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/[0.04]
              hover:border-[var(--accent-green)]/50 hover:bg-[var(--accent-green)]/[0.07]
              transition-all duration-200 no-underline group"
          >
            <Github className="w-5 h-5 text-[var(--accent-green)] shrink-0" />
            <div className="text-left">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                100% open source
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Every line of code is public. Verify we never touch your keys.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--accent-green)] transition-colors shrink-0" />
          </a>

          <div className="flex gap-3 justify-center pt-4">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 text-[0.85rem] font-medium uppercase tracking-wide
                bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                hover:border-[#555] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.5)] hover:-translate-y-px
                active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:bg-[#0f0f0f]
                transition-all duration-200 no-underline"
            >
              Get Started
            </a>
          </div>

          <p className="text-xs text-[var(--text-dim)] font-mono">
            Sign in with WorkOS to create or join a room
          </p>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <h3 className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-pixel)' }}>Encrypted</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              WorkOS Vault encryption with unique keys per secret. Zero plaintext at rest.
            </p>
          </div>
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <h3 className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-pixel)' }}>Instant</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Paste your .env, invite your team, and everyone&apos;s synced in seconds. No setup needed.
            </p>
          </div>
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <h3 className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-pixel)' }}>Real-time</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Live updates across your team. No refresh needed. Just works.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
