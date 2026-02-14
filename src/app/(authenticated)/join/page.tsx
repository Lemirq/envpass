"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowLeft } from "lucide-react";

export default function JoinRoomPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { userId } = useCurrentUser();

  const room = useQuery(
    api.rooms.getByInviteCode,
    inviteCode.length === 6 ? { inviteCode } : "skip"
  );

  const addMember = useMutation(api.memberships.addMember);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length !== 6 || !userId) return;

    setIsJoining(true);
    setError("");

    try {
      if (!room) {
        setError("Room not found. Check the invite code and try again.");
        setIsJoining(false);
        return;
      }

      await addMember({
        userId,
        roomId: room._id,
        role: "MEMBER",
      });
      window?.datafast?.("join_room");
      router.push(`/room/${room._id}`);
    } catch {
      setError("Failed to join room. You may already be a member.");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[rgba(5,5,5,0.8)] backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg tracking-tight no-underline text-[var(--text-primary)]">envpass</Link>
          <div className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 uppercase" style={{ fontFamily: 'var(--font-pixel)' }}>
            <span className="text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Secure Workspace</span>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 h-7 px-2.5 text-[0.7rem] font-medium uppercase tracking-wide
            bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
            hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 no-underline"
        >
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="p-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>
              Join Room
            </div>
            <h1 className="text-xl mb-1" style={{ fontFamily: 'var(--font-pixel)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
              Enter Invite Code
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-mono mb-8">
              6-character code to access shared secrets
            </p>

            <form onSubmit={handleJoin}>
              <div className="mb-6">
                <label htmlFor="inviteCode" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  maxLength={6}
                  placeholder="X7K2P9"
                  className="w-full px-4 py-3 bg-[#111] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono text-lg text-center tracking-[0.3em]
                    outline-none focus:border-[var(--border-highlight)] transition-colors placeholder:text-[var(--text-dim)]"
                  required
                />
                <p className="text-[0.65rem] text-[var(--text-dim)] mt-2 font-mono">
                  Case-insensitive, letters and numbers only
                </p>
                {inviteCode.length === 6 && room && (
                  <p className="text-[0.65rem] mt-2 font-mono text-[var(--accent-green)]" style={{ textShadow: '0 0 8px var(--accent-glow-green)' }}>
                    Found: {room.name}
                  </p>
                )}
                {inviteCode.length === 6 && room === null && (
                  <p className="text-[0.65rem] text-[var(--accent-red)] mt-2 font-mono">
                    No room found with this code
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-[var(--accent-red)] mb-4 font-mono">{error}</p>
              )}

              <button
                type="submit"
                disabled={inviteCode.length !== 6 || isJoining || !room}
                className="w-full inline-flex items-center justify-center h-10 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-[var(--text-dim)]">
            <p className="mb-1">Don&apos;t have a room yet?</p>
            <Link href="/room/new" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline font-mono">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
