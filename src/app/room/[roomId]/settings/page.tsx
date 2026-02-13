"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { formatTimeRemaining, copyToClipboard } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Room not found</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/room/${roomIdStr}`}
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Room
          </Link>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1">{room.name}</p>
        </div>

        {/* Invite Code */}
        <section className="mb-8 p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Invite Code</h2>
          <div className="flex items-center gap-4">
            <code className="text-2xl font-mono tracking-wider text-[var(--primary)]">
              {room.inviteCode}
            </code>
            <button
              onClick={handleCopyInviteCode}
              className="px-4 py-2 bg-[var(--surface-light)] hover:bg-[var(--border)] rounded-lg text-sm font-medium transition-colors"
            >
              {copiedCode ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Share this code with teammates so they can join the room.
          </p>
        </section>

        {/* Room Info */}
        <section className="mb-8 p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Room Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Expires in</span>
              <span className="text-[var(--warning)] font-medium">
                {formatTimeRemaining(room.expiresAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Your role</span>
              <span className="font-medium">{membership?.role ?? "MEMBER"}</span>
            </div>
          </div>
        </section>

        {/* Members */}
        <section className="mb-8 p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">
            Members ({members.filter(Boolean).length})
          </h2>
          <div className="space-y-3">
            {members.filter(Boolean).map((member) => (
              <div
                key={member!._id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-light)] flex items-center justify-center text-sm font-medium">
                    {(member!.displayName ?? member!.email)?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {member!.displayName ?? member!.email}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {member!.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      member!.role === "OWNER"
                        ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                        : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {member!.role}
                  </span>
                  {isOwner &&
                    member!.role !== "OWNER" &&
                    member!._id !== userId && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member!.membershipId as Id<"memberships">
                          )
                        }
                        className="text-xs text-red-400 hover:text-red-300"
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
          <section className="p-6 bg-[var(--surface)] rounded-lg border border-red-900/50">
            <h2 className="text-lg font-semibold text-red-400 mb-4">
              Danger Zone
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Permanently delete this room and all its secrets. This cannot be
              undone.
            </p>
            <button
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                confirmDelete
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[var(--surface-light)] hover:bg-red-900/30 text-red-400"
              }`}
            >
              {isDeleting
                ? "Deleting..."
                : confirmDelete
                  ? "Confirm Delete Room"
                  : "Delete Room"}
            </button>
            {confirmDelete && !isDeleting && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="ml-3 px-6 py-3 bg-[var(--surface-light)] hover:bg-[var(--border)] rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
