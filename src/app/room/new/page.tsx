"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { generateInviteCode, getExpirationTimestamp } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowLeft } from "lucide-react";

export default function CreateRoomPage() {
  const [name, setName] = useState("");
  const [expiryHours, setExpiryHours] = useState(72);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { userId } = useCurrentUser();
  const createRoom = useMutation(api.rooms.createRoom);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !userId) return;

    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name,
        inviteCode: generateInviteCode(),
        workosOrgId: "anonymous", // placeholder until WorkOS is integrated
        expiresAt: getExpirationTimestamp(expiryHours),
        createdById: userId,
      });
      router.push(`/room/${roomId}`);
    } catch {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/dashboard" className="text-2xl font-bold">
            envpass
          </Link>
        </div>

        <div className="p-8 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h1 className="text-3xl font-bold mb-2">Create Room</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Set up a new room to share secrets with your team.
          </p>

          <form onSubmit={handleCreate}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Room Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="HackMIT 2026 — Team Sigma"
                className="w-full px-4 py-3 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="expiry" className="block text-sm font-medium mb-2">
                Expires after
              </label>
              <select
                id="expiry"
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours (default)</option>
                <option value={168}>1 week</option>
              </select>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Room and all secrets will be permanently deleted after expiry.
              </p>
            </div>

            <button
              type="submit"
              disabled={!name || isCreating}
              className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-[var(--surface-light)] disabled:text-[var(--text-secondary)] text-white rounded-lg font-semibold transition-colors"
            >
              {isCreating ? "Creating..." : "Create Room"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
