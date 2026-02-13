"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatTimeRemaining } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { KeyRound, Users, LogOut, Plus, Clock } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

export default function DashboardPage() {
  const { userId, user, isLoading: userLoading } = useCurrentUser();
  const { signOut } = useAuth();
  const rooms = useQuery(
    api.rooms.listMyRooms,
    userId ? { userId } : "skip"
  );

  const isLoading = userLoading || rooms === undefined;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[rgba(5,5,5,0.8)] backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg tracking-tight no-underline text-[var(--text-primary)]">envpass</Link>
          <div className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 uppercase" style={{ fontFamily: 'var(--font-pixel)' }}>
            <span className="text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Secure Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {user.email}
            </span>
          )}
          <button
            onClick={() => signOut()}
            className="inline-flex items-center justify-center gap-2 h-7 px-2.5 text-[0.7rem] font-medium uppercase tracking-wide
              bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
              hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px
              active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
              transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>
                Dashboard
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-pixel)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                Your Rooms
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">
                Encrypted vaults for your team secrets
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/join"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.5)] hover:-translate-y-px
                  active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:bg-[#0f0f0f]
                  transition-all duration-200 no-underline"
              >
                Join Room
              </Link>
              <Link
                href="/room/new"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.5)] hover:-translate-y-px
                  active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:bg-[#0f0f0f]
                  transition-all duration-200 no-underline"
              >
                <Plus className="w-3.5 h-3.5" /> Create Room
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-[var(--text-secondary)] text-sm font-mono">Loading...</p>
            </div>
          ) : rooms && rooms.length > 0 ? (
            <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Room</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Code</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Secrets</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Members</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold text-right">TTL</div>
              </div>

              {rooms.map((room) => (
                <Link
                  key={room!._id}
                  href={`/room/${room!._id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center border-b border-[rgba(255,255,255,0.03)] last:border-b-0
                    hover:bg-[var(--bg-card-hover)] transition-colors duration-150 no-underline text-[var(--text-primary)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-glow-green)] shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">{room!.name}</div>
                      <div className="text-[0.65rem] text-[var(--text-dim)]">
                        {room!.role === "OWNER" ? "owner" : "member"}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-sm text-[var(--text-secondary)]">{room!.inviteCode}</div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                    <KeyRound className="w-3 h-3" /> {room!.secretCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                    <Users className="w-3 h-3" /> {room!.memberCount}
                  </div>
                  <div className="text-right font-mono text-sm text-[var(--accent-green)]" style={{ textShadow: '0 0 8px var(--accent-glow-green)' }}>
                    {formatTimeRemaining(room!.expiresAt)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-highlight)] rounded-xl p-16 text-center">
              <div className="text-xl mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>No rooms yet</div>
              <p className="text-sm text-[var(--text-dim)] mb-6">Your Discord DMs are relieved.</p>
              <Link
                href="/room/new"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px transition-all duration-200 no-underline"
              >
                <Plus className="w-3.5 h-3.5" /> Create Your First Room
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
