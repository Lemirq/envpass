"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { generateInviteCode } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { ArrowLeft } from "lucide-react";

export default function CreateRoomPage() {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { user, organizationId } = useAuth();
  const createRoom = useMutation(api.rooms.createRoom);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !userId || !user) return;

    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name,
        inviteCode: generateInviteCode(),
        workosOrgId: organizationId ?? user.id,
        createdById: userId,
      });
      router.push(`/room/${roomId}`);
    } catch {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[rgba(5,5,5,0.8)] backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight no-underline text-[var(--text-primary)]">envpass</Link>
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
              New Room
            </div>
            <h1 className="text-xl mb-1" style={{ fontFamily: 'var(--font-pixel)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
              Create Room
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-mono mb-8">
              Set up a new vault to share secrets with your team
            </p>

            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                  Room Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="HackMIT 2026 — Team Sigma"
                  className="w-full px-4 py-3 bg-[#111] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm
                    outline-none focus:border-[var(--border-highlight)] transition-colors placeholder:text-[var(--text-dim)]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!name || isCreating}
                className="w-full inline-flex items-center justify-center h-10 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
