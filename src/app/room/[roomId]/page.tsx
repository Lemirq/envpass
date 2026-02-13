"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { formatTimeRemaining, copyToClipboard } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { KeyRound, Settings, Copy, Check, Trash2, ArrowLeft } from "lucide-react";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdStr } = use(params);
  const roomId = roomIdStr as Id<"rooms">;

  const { userId } = useCurrentUser();
  const room = useQuery(api.rooms.get, { roomId });
  const secrets = useQuery(api.secrets.listSecrets, { roomId });
  const membership = useQuery(
    api.memberships.getByUserAndRoom,
    userId ? { userId, roomId } : "skip"
  );

  const convex = useConvex();
  const createSecret = useMutation(api.secrets.createSecret);
  const deleteSecret = useMutation(api.secrets.deleteSecret);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddSecret, setShowAddSecret] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [newKeyName, setNewKeyName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [bulkEnv, setBulkEnv] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");

  const handleCopySecret = async (secretId: string) => {
    try {
      const vaultObjectId = await convex.query(api.secrets.getEncryptedValue, { secretId: secretId as Id<"secrets"> });
      const res = await fetch("/api/vault/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vaultObjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await copyToClipboard(data.value);
      setCopiedId(secretId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to decrypt secret:", err);
    }
  };

  const handleCopyInviteCode = async () => {
    if (room) await copyToClipboard(room.inviteCode);
  };

  const storeInVault = async (name: string, value: string): Promise<string> => {
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.id;
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newKeyName || !newSecretValue) return;

    setIsAdding(true);
    try {
      const vaultObjectId = await storeInVault(newKeyName, newSecretValue);
      await createSecret({
        roomId,
        keyName: newKeyName,
        vaultObjectId,
        description: newDescription || undefined,
        createdById: userId,
      });
      setShowAddSecret(false);
      setNewKeyName("");
      setNewSecretValue("");
      setNewDescription("");
    } finally {
      setIsAdding(false);
    }
  };

  const parseEnvContent = (content: string): { key: string; value: string }[] => {
    const entries: { key: string; value: string }[] = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key) entries.push({ key, value });
    }
    return entries;
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !bulkEnv.trim()) return;

    const entries = parseEnvContent(bulkEnv);
    if (entries.length === 0) return;

    setIsAdding(true);
    setBulkProgress(`0 / ${entries.length}`);

    try {
      for (let i = 0; i < entries.length; i++) {
        const { key, value } = entries[i];
        const vaultObjectId = await storeInVault(key, value);
        await createSecret({
          roomId,
          keyName: key,
          vaultObjectId,
          createdById: userId,
        });
        setBulkProgress(`${i + 1} / ${entries.length}`);
      }
      setShowAddSecret(false);
      setBulkEnv("");
      setBulkProgress("");
    } finally {
      setIsAdding(false);
    }
  };

  const bulkPreview = bulkEnv.trim() ? parseEnvContent(bulkEnv) : [];

  const handleDeleteSecret = async (secretId: Id<"secrets">) => {
    if (!userId) return;
    const vaultObjectId = await deleteSecret({ secretId, userId });
    // Clean up the vault object
    if (vaultObjectId) {
      fetch(`/api/vault?id=${encodeURIComponent(vaultObjectId)}`, { method: "DELETE" }).catch(() => {});
    }
  };

  if (room === undefined || secrets === undefined) {
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
          <p className="text-[var(--text-secondary)] mb-8">
            This room may have expired or been deleted.
          </p>
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

  const role = membership?.role ?? "MEMBER";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{room.name}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-[var(--text-secondary)]">Invite Code: </span>
                  <button
                    onClick={handleCopyInviteCode}
                    className="font-mono text-lg text-[var(--primary)] hover:text-[var(--primary-dark)]"
                  >
                    {room.inviteCode}
                  </button>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Expires in </span>
                  <span className="text-[var(--warning)] font-medium">
                    {formatTimeRemaining(room.expiresAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] flex items-center gap-1"><KeyRound className="w-4 h-4" /> {secrets.length} secrets</span>
                </div>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded ${
                role === "OWNER"
                  ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                  : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
              }`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setShowAddSecret(true); setAddMode("single"); setBulkEnv(""); }}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
          >
            + Add Secret
          </button>
          <button
            className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface-light)] border border-[var(--border)] rounded-lg font-semibold transition-colors"
          >
            Export .env
          </button>
          <Link
            href={`/room/${roomIdStr}/settings`}
            className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface-light)] border border-[var(--border)] rounded-lg font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 inline" /> Settings
          </Link>
        </div>

        {/* Secrets List */}
        {secrets.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <p className="text-2xl mb-4">No secrets yet.</p>
            <p className="text-[var(--text-secondary)] mb-8">
              Add your first secret to get started.
            </p>
            <button
              onClick={() => setShowAddSecret(true)}
              className="inline-block px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
            >
              + Add Secret
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {secrets.map((secret) => (
              <div
                key={secret._id}
                className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-mono font-semibold">
                        {secret.keyName}
                      </h3>
                      {secret.tags && secret.tags.length > 0 && (
                        <div className="flex gap-2">
                          {secret.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-[var(--surface-light)] text-[var(--text-secondary)] rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {secret.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        {secret.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className="font-mono text-[var(--text-secondary)]">
                        ••••••••••••••••••••••••••••
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)]">
                      <span>Added {new Date(secret._creationTime).toLocaleDateString()}</span>
                      {secret.expiresAt && (
                        <span className="text-[var(--warning)]">
                          Expires in {formatTimeRemaining(secret.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopySecret(secret._id)}
                      className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
                    >
                      {copiedId === secret._id ? <><Check className="w-4 h-4 inline" /> Copied!</> : <><Copy className="w-4 h-4 inline" /> Copy</>}
                    </button>
                    {role === "OWNER" && (
                      <button
                        onClick={() => handleDeleteSecret(secret._id)}
                        className="px-4 py-2 bg-[var(--surface-light)] hover:bg-red-900/30 text-[var(--text-secondary)] hover:text-red-400 rounded-lg font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Secret Modal */}
        {showAddSecret && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full p-8 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Secrets</h2>
                <div className="flex bg-[var(--surface-light)] rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setAddMode("single")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      addMode === "single"
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode("bulk")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      addMode === "bulk"
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Paste .env
                  </button>
                </div>
              </div>

              {addMode === "single" ? (
                <form onSubmit={handleAddSecret}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Key Name</label>
                    <input
                      type="text"
                      placeholder="OPENAI_API_KEY"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Secret Value</label>
                    <textarea
                      placeholder="sk-proj-..."
                      value={newSecretValue}
                      onChange={(e) => setNewSecretValue(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="What this secret is for..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isAdding}
                      className="flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                    >
                      {isAdding ? "Adding..." : "Add Secret"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSecret(false)}
                      className="px-6 py-3 bg-[var(--surface-light)] hover:bg-[var(--border)] rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBulkImport}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Paste your .env file contents
                    </label>
                    <textarea
                      placeholder={`# Comments are ignored\nDATABASE_URL=postgres://...\nAPI_KEY=sk-proj-...\nSTRIPE_SECRET=whsec_...`}
                      value={bulkEnv}
                      onChange={(e) => setBulkEnv(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                      required
                    />
                  </div>

                  {bulkPreview.length > 0 && (
                    <div className="mb-4 p-3 bg-[var(--surface-light)] rounded-lg border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-secondary)] mb-2">
                        {bulkPreview.length} secret{bulkPreview.length !== 1 ? "s" : ""} detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {bulkPreview.map((entry) => (
                          <span
                            key={entry.key}
                            className="px-2 py-1 text-xs font-mono bg-[var(--surface)] rounded border border-[var(--border)]"
                          >
                            {entry.key}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isAdding || bulkPreview.length === 0}
                      className="flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                    >
                      {isAdding
                        ? `Importing ${bulkProgress}...`
                        : `Import ${bulkPreview.length} Secret${bulkPreview.length !== 1 ? "s" : ""}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSecret(false)}
                      disabled={isAdding}
                      className="px-6 py-3 bg-[var(--surface-light)] hover:bg-[var(--border)] disabled:opacity-50 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
