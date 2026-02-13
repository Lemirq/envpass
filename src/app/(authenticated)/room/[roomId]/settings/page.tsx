"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { formatTimeRemaining, copyToClipboard } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowLeft, Copy, Check, Trash2 } from "lucide-react";

export default function RoomSettingsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId: roomIdStr } = use(params);
  const roomId = roomIdStr as Id<"rooms">;
  const router = useRouter();

  const { userId } = useCurrentUser();
  const room = useQuery(api.rooms.get, { roomId });
  const members = useQuery(api.memberships.listMembers, { roomId });
  const membership = useQuery(
    api.memberships.getByUserAndRoom,
    userId ? { userId, roomId } : "skip"
  );

  const deleteRoom = useMutation(api.rooms.deleteRoom);
  const removeMember = useMutation(api.memberships.removeMember);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isOwner = membership?.role === "OWNER";

  const handleCopyInviteCode = async () => {
    if (!room) return;
    await copyToClipboard(room.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveMember = async (membershipId: Id<"memberships">) => {
    await removeMember({ membershipId });
  };

  const handleDeleteRoom = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    await deleteRoom({ roomId });
    router.push("/dashboard");
  };

  if (room === undefined || members === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)] text-sm font-mono">Loading...</p>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>Room not found</div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">This room may have expired or been deleted.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
              bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
              hover:border-[#555] hover:-translate-y-px transition-all duration-200 no-underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
          href={`/room/${roomIdStr}`}
          className="inline-flex items-center justify-center gap-2 h-7 px-2.5 text-[0.7rem] font-medium uppercase tracking-wide
            bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
            hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 no-underline"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Room
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>
              Configuration
            </div>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-pixel)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
              Room Settings
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">{room.name}</p>
          </div>

          {/* Invite Code */}
          <section className="mb-6 p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4" style={{ fontFamily: 'var(--font-pixel)' }}>
              Invite Code
            </div>
            <div className="flex items-center gap-3">
              <code className="text-xl font-mono tracking-[0.2em] text-[var(--accent-green)]" style={{ textShadow: '0 0 8px var(--accent-glow-green)' }}>
                {room.inviteCode}
              </code>
              <button
                onClick={handleCopyInviteCode}
                className="inline-flex items-center justify-center gap-1.5 h-7 px-2.5 text-[0.7rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
              >
                {copiedCode ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <p className="text-[0.65rem] text-[var(--text-dim)] mt-2 font-mono">
              Share this code with teammates so they can join the room.
            </p>
          </section>

          {/* Room Details */}
          <section className="mb-6 p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4" style={{ fontFamily: 'var(--font-pixel)' }}>
              Room Details
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)] uppercase">Expires in</span>
                <span className="text-sm font-mono text-[var(--accent-green)]" style={{ textShadow: '0 0 8px var(--accent-glow-green)' }}>
                  {formatTimeRemaining(room.expiresAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)] uppercase">Your role</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1a1a1a] border border-[var(--border-color)]">
                  {membership?.role ?? "MEMBER"}
                </span>
              </div>
            </div>
          </section>

          {/* Members */}
          <section className="mb-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="p-6 pb-4">
              <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-pixel)' }}>
                Members ({members.filter(Boolean).length})
              </div>
            </div>
            <div>
              {members.filter(Boolean).map((member) => (
                <div
                  key={member!._id}
                  className="flex items-center justify-between px-6 py-3 border-t border-[rgba(255,255,255,0.03)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[var(--border-color)] flex items-center justify-center text-xs font-mono text-[var(--text-secondary)]">
                      {(member!.displayName ?? member!.email)?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member!.displayName ?? member!.email}</p>
                      <p className="text-[0.65rem] text-[var(--text-dim)] font-mono">{member!.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded border ${
                      member!.role === "OWNER"
                        ? "text-[var(--accent-green)] border-[var(--accent-green)]/20 bg-[var(--accent-green)]/5"
                        : "text-[var(--text-secondary)] border-[var(--border-color)] bg-[#1a1a1a]"
                    }`}>
                      {member!.role}
                    </span>
                    {isOwner && member!.role !== "OWNER" && member!._id !== userId && (
                      <button
                        onClick={() => handleRemoveMember(member!.membershipId as Id<"memberships">)}
                        className="text-[0.65rem] text-[var(--text-dim)] hover:text-[var(--accent-red)] transition-colors cursor-pointer font-mono uppercase"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          {isOwner && (
            <section className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--accent-red)]/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--accent-red)] mb-3" style={{ fontFamily: 'var(--font-pixel)' }}>
                Danger Zone
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4 font-mono">
                Permanently delete this room and all its secrets. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteRoom}
                  disabled={isDeleting}
                  className={`inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide rounded-lg
                    transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                    ${confirmDelete
                      ? "bg-[var(--accent-red)] text-white border border-[var(--accent-red)] hover:brightness-110"
                      : "bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] text-[var(--accent-red)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)] hover:border-[var(--accent-red)]/50 hover:-translate-y-px active:translate-y-px"
                    }`}
                >
                  <Trash2 className="w-3 h-3" />
                  {isDeleting ? "Deleting..." : confirmDelete ? "Confirm Delete" : "Delete Room"}
                </button>
                {confirmDelete && !isDeleting && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center justify-center h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                      bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-lg text-[var(--text-secondary)]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                      hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
