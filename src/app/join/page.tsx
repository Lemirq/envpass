"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinRoomPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length !== 6) return;

    setIsJoining(true);
    
    // TODO: Replace with actual API call
    // For now, just redirect to a mock room
    setTimeout(() => {
      router.push(`/room/room1`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold">
            envpass
          </Link>
        </div>

        <div className="p-8 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h1 className="text-3xl font-bold mb-2">Join Room</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Enter the 6-character invite code to access shared secrets.
          </p>

          <form onSubmit={handleJoin}>
            <div className="mb-6">
              <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
                Invite Code
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="X7K2P9"
                className="w-full px-4 py-3 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-lg text-center tracking-wider"
                required
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                The code is case-insensitive and contains only letters and numbers
              </p>
            </div>

            <button
              type="submit"
              disabled={inviteCode.length !== 6 || isJoining}
              className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-[var(--surface-light)] disabled:text-[var(--text-secondary)] text-white rounded-lg font-semibold transition-colors"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          <p>Don't have a room yet?</p>
          <Link
            href="/dashboard"
            className="text-[var(--primary)] hover:underline"
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
