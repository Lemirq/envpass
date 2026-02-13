"use client";

import Link from "next/link";
import { formatTimeRemaining } from "@/lib/utils";

// Mock data for demonstration (will be replaced with real Convex queries)
const mockRooms = [
  {
    _id: "room1" as any,
    name: "HackMIT 2026 — Team Sigma",
    inviteCode: "X7K2P9",
    expiresAt: Date.now() + 47 * 60 * 60 * 1000, // 47 hours from now
    role: "OWNER" as const,
    secretCount: 8,
    memberCount: 3,
  },
  {
    _id: "room2" as any,
    name: "Project Phoenix - API Keys",
    inviteCode: "B4N7M2",
    expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours from now
    role: "MEMBER" as const,
    secretCount: 5,
    memberCount: 2,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">envpass</h1>
            <p className="text-[var(--text-secondary)]">Your secret rooms</p>
          </div>
          <Link
            href="/room/new"
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
          >
            + Create Room
          </Link>
        </div>

        {mockRooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-4">No secrets yet.</p>
            <p className="text-[var(--text-secondary)] mb-8">
              Your Discord DMs are relieved.
            </p>
            <Link
              href="/room/new"
              className="inline-block px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
            >
              Create Your First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockRooms.map((room) => (
              <Link
                key={room._id}
                href={`/room/${room._id}`}
                className="block p-6 bg-[var(--surface)] hover:bg-[var(--surface-light)] rounded-lg border border-[var(--border)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Code: <span className="font-mono">{room.inviteCode}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      room.role === "OWNER"
                        ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                        : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {room.role}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mb-3">
                  <span>🔑 {room.secretCount} secrets</span>
                  <span>👥 {room.memberCount} members</span>
                </div>

                <div className="text-sm">
                  <span className="text-[var(--text-secondary)]">Expires in </span>
                  <span className="text-[var(--warning)] font-medium">
                    {formatTimeRemaining(room.expiresAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            Have an invite code?
          </p>
          <Link
            href="/join"
            className="inline-block px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface-light)] border border-[var(--border)] rounded-lg font-semibold transition-colors"
          >
            Join Room
          </Link>
        </div>
      </div>
    </div>
  );
}
