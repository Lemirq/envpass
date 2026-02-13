"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { copyToClipboard } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Lock, Settings, Copy, Check, Trash2, Plus, X, Flame, ClipboardList, Pencil, Eye, EyeOff } from "lucide-react";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdStr } = use(params);
  const roomId = roomIdStr as Id<"rooms">;
  const router = useRouter();

  const { userId, user } = useCurrentUser();
  const room = useQuery(api.rooms.get, { roomId });
  const secrets = useQuery(api.secrets.listSecrets, { roomId });
  const membership = useQuery(
    api.memberships.getByUserAndRoom,
    userId ? { userId, roomId } : "skip"
  );
  const members = useQuery(api.memberships.listMembers, { roomId });
  const auditLogs = useQuery(api.auditLogs.listLogs, { roomId });

  const convex = useConvex();
  const createSecret = useMutation(api.secrets.createSecret);
  const deleteSecret = useMutation(api.secrets.deleteSecret);
  const updateSecret = useMutation(api.secrets.updateSecret);
  const shredRoom = useMutation(api.rooms.shredRoom);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showAddSecret, setShowAddSecret] = useState(false);
  const [bulkEnv, setBulkEnv] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [confirmShred, setConfirmShred] = useState(false);
  const [isShredding, setIsShredding] = useState(false);
  const [isCopyingEnv, setIsCopyingEnv] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [addError, setAddError] = useState("");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeyName, setEditKeyName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const handleRevealSecret = async (secretId: string) => {
    if (revealedSecrets[secretId]) {
      setRevealedSecrets((prev) => {
        const next = { ...prev };
        delete next[secretId];
        return next;
      });
      return;
    }
    setRevealingId(secretId);
    try {
      const vaultObjectId = await convex.query(api.secrets.getEncryptedValue, { secretId: secretId as Id<"secrets"> });
      const res = await fetch("/api/vault/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vaultObjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRevealedSecrets((prev) => ({ ...prev, [secretId]: data.value }));
    } catch (err) {
      console.error("Failed to reveal secret:", err);
    } finally {
      setRevealingId(null);
    }
  };

  const handleCopyInviteCode = async () => {
    if (room) {
      await copyToClipboard(room.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleCopyEnv = async () => {
    if (!secrets || secrets.length === 0) return;
    setIsCopyingEnv(true);
    try {
      const lines: string[] = [];
      for (const secret of secrets) {
        const vaultObjectId = await convex.query(api.secrets.getEncryptedValue, { secretId: secret._id as Id<"secrets"> });
        const res = await fetch("/api/vault/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: vaultObjectId }),
        });
        const data = await res.json();
        if (res.ok) {
          lines.push(`${secret.keyName}=${data.value}`);
        }
      }
      await copyToClipboard(lines.join("\n"));
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } catch (err) {
      console.error("Failed to copy .env:", err);
    } finally {
      setIsCopyingEnv(false);
    }
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


  const parseEnvContent = (content: string): { key: string; value: string }[] => {
    const entries: { key: string; value: string }[] = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
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
        await createSecret({ roomId, keyName: key, vaultObjectId, createdById: userId });
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
    if (vaultObjectId) {
      fetch(`/api/vault?id=${encodeURIComponent(vaultObjectId)}`, { method: "DELETE" }).catch(() => {});
    }
  };

  const handleStartEdit = async (secret: { _id: string; keyName: string }) => {
    setEditingId(secret._id);
    setEditKeyName(secret.keyName);
    setEditValue("");
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !userId || !editKeyName.trim()) return;
    setIsSavingEdit(true);
    setEditError("");
    try {
      let newVaultObjectId: string | undefined;
      if (editValue.trim()) {
        // Store new value in vault
        newVaultObjectId = await storeInVault(editKeyName, editValue);
      }
      const oldVaultObjectId = await updateSecret({
        secretId: editingId as Id<"secrets">,
        keyName: editKeyName.trim(),
        ...(newVaultObjectId ? { vaultObjectId: newVaultObjectId } : {}),
        userId,
      });
      // Clean up old vault object if value was changed
      if (newVaultObjectId && oldVaultObjectId) {
        fetch(`/api/vault?id=${encodeURIComponent(oldVaultObjectId as string)}`, { method: "DELETE" }).catch(() => {});
      }
      setEditingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      setEditError(message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleShredRoom = async () => {
    if (!confirmShred) {
      setConfirmShred(true);
      return;
    }
    if (!userId) return;
    setIsShredding(true);
    try {
      const vaultObjectIds = await shredRoom({ roomId, userId });
      // Delete all secrets from WorkOS Vault
      await Promise.allSettled(
        (vaultObjectIds as string[]).map((id) =>
          fetch(`/api/vault?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        )
      );
      router.push("/dashboard");
    } catch {
      setIsShredding(false);
      setConfirmShred(false);
    }
  };

  if (room === undefined || secrets === undefined) {
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

  const role = membership?.role ?? "MEMBER";
  const memberCount = members?.filter(Boolean).length ?? 0;

  const formatLogTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getLogDotColor = (action: string) => {
    if (action.includes("CREATED") || action.includes("JOINED")) return "green";
    if (action.includes("READ") || action.includes("DELETED") || action.includes("REMOVED") || action.includes("EXPORTED") || action.includes("SHREDDED")) return "red";
    return "";
  };

  const formatLogAction = (log: { action: string; metadata?: Record<string, unknown>; user?: { email: string; displayName?: string | null } | null }) => {
    const who = log.user?.email || "system";
    const meta = log.metadata as Record<string, string> | undefined;
    switch (log.action) {
      case "SECRET_CREATED": return { who, msg: <>added <span className="font-mono text-xs">{meta?.keyName}</span></> };
      case "SECRET_READ": return { who, msg: <>copied <span className="font-mono text-xs">{meta?.keyName}</span></> };
      case "SECRET_DELETED": return { who, msg: <>deleted <span className="font-mono text-xs">{meta?.keyName}</span></> };
      case "SECRET_EXPORTED": return { who, msg: <>exported secrets</> };
      case "MEMBER_JOINED": return { who, msg: <>joined the room</> };
      case "MEMBER_REMOVED": return { who, msg: <>was removed</> };
      case "ROOM_CREATED": return { who: "system", msg: <>created room</> };
      case "ROOM_SHREDDED": return { who, msg: <>shredded the room</> };
      default: return { who, msg: <>{log.action.toLowerCase().replace(/_/g, " ")}</> };
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[rgba(5,5,5,0.8)] backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight no-underline text-[var(--text-primary)]">envpass</Link>
          <div className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5 uppercase" style={{ fontFamily: 'var(--font-pixel)' }}>
            <span className="text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Secure Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#111] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-2 py-1 text-xs flex items-center gap-2">
            <span className="text-[var(--text-secondary)] uppercase tracking-wide">Room</span>
            <span className="text-[var(--text-primary)] font-semibold font-mono">{room.inviteCode}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-glow-green)]" />
          </div>

        </div>
      </header>

      {/* Layout: main + sidebar */}
      <div className="grid grid-cols-[1fr_320px] flex-1 overflow-hidden">
        {/* Main content */}
        <main className="p-8 overflow-y-auto flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-pixel)' }}>
                Vault Content
              </div>
              <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-pixel)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                Environment Variables
              </h1>
              <div className="text-xs text-[var(--text-secondary)] font-mono">
                Encrypted &bull; Scope: Room &bull; {secrets.length} secret{secrets.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyEnv}
                disabled={isCopyingEnv || secrets.length === 0}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {copiedEnv ? <><Check className="w-3.5 h-3.5" /> Copied</> : isCopyingEnv ? "Decrypting..." : <><ClipboardList className="w-3.5 h-3.5" /> Copy .env</>}
              </button>
              <button
                onClick={() => { setShowAddSecret(true); setBulkEnv(""); setAddError(""); }}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.5)] hover:-translate-y-px
                  active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:bg-[#0f0f0f]
                  transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Secret
              </button>
            </div>
          </div>

          {/* Secrets table */}
          {secrets.length === 0 ? (
            <div className="border border-dashed border-[var(--border-highlight)] rounded-xl p-16 text-center">
              <div className="text-lg mb-2" style={{ fontFamily: 'var(--font-pixel)' }}>No secrets yet</div>
              <p className="text-sm text-[var(--text-dim)] mb-6">Add your first secret to get started.</p>
              <button
                onClick={() => setShowAddSecret(true)}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[0.8rem] font-medium uppercase tracking-wide
                  bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                  hover:border-[#555] hover:-translate-y-px transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Secret
              </button>
            </div>
          ) : (
            <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_3fr_1fr_120px] px-5 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Key Name</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Value</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold">Created</div>
                <div className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-semibold text-right">Actions</div>
              </div>

              {secrets.map((secret) => editingId === secret._id ? (
                <div
                  key={secret._id}
                  className="px-5 py-4 border-b border-[rgba(255,255,255,0.03)] last:border-b-0 bg-[var(--bg-card-hover)]"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-[0.6rem] uppercase tracking-wide text-[var(--text-secondary)] mb-1">Key Name</label>
                      <input
                        type="text"
                        value={editKeyName}
                        onChange={(e) => { setEditKeyName(e.target.value); setEditError(""); }}
                        className="w-full px-3 py-2 bg-[#111] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] font-mono text-sm
                          outline-none focus:border-[var(--border-highlight)] transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[0.6rem] uppercase tracking-wide text-[var(--text-secondary)] mb-1">New Value (leave blank to keep)</label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-[#111] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] font-mono text-sm
                          outline-none focus:border-[var(--border-highlight)] transition-colors placeholder:text-[var(--text-dim)]"
                      />
                    </div>
                  </div>
                  {editError && (
                    <p className="text-xs text-[var(--accent-red)] mb-2 font-mono">{editError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit || !editKeyName.trim()}
                      className="inline-flex items-center justify-center h-7 px-3 text-[0.7rem] font-medium uppercase tracking-wide
                        bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-md text-[var(--text-primary)]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                        hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSavingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={isSavingEdit}
                      className="inline-flex items-center justify-center h-7 px-3 text-[0.7rem] font-medium uppercase tracking-wide
                        bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                        hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={secret._id}
                  className="group grid grid-cols-[2fr_3fr_1fr_120px] px-5 py-4 items-center border-b border-[rgba(255,255,255,0.03)] last:border-b-0
                    hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 font-mono text-[0.85rem]">
                    <Lock className="w-3 h-3 text-[#666] shrink-0" />
                    {secret.keyName}
                  </div>
                  <div className="font-mono text-[0.85rem] text-[var(--text-dim)] flex items-center gap-2">
                    <button
                      onClick={() => handleRevealSecret(secret._id)}
                      disabled={revealingId === secret._id}
                      className="inline-flex items-center justify-center w-6 h-6 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                      title={revealedSecrets[secret._id] ? "Hide value" : "Reveal value"}
                    >
                      {revealingId === secret._id ? (
                        <span className="w-3 h-3 border border-[var(--text-dim)] border-t-transparent rounded-full animate-spin" />
                      ) : revealedSecrets[secret._id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {revealedSecrets[secret._id] ? (
                      <span className="text-[var(--text-secondary)] break-all text-xs">{revealedSecrets[secret._id]}</span>
                    ) : (
                      <span className="tracking-wider">••••••••••••••••••••</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(secret._creationTime).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopySecret(secret._id)}
                      className="inline-flex items-center justify-center h-7 px-2 text-[0.7rem] font-medium uppercase tracking-wide
                        bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-primary)]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                        hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                      title="Copy value"
                    >
                      {copiedId === secret._id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleStartEdit(secret)}
                      className="inline-flex items-center justify-center h-7 px-2 text-[0.7rem] font-medium
                        bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-dim)]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                        hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    {role === "OWNER" && (
                      <button
                        onClick={() => handleDeleteSecret(secret._id)}
                        className="inline-flex items-center justify-center h-7 px-2 text-[0.7rem] font-medium
                          bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-dim)]
                          shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                          hover:border-[var(--accent-red)] hover:text-[var(--accent-red)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite team footer */}
          <div className="mt-auto border border-dashed border-[var(--border-highlight)] p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-1">Invite Team</div>
                  <div className="text-sm text-[var(--text-dim)]">Share this code to let others join.</div>
                </div>
                {/* Member avatars */}
                {members && members.filter(Boolean).length > 0 && (
                  <div className="flex -space-x-2">
                    {members.filter(Boolean).map((member) => (
                      <div
                        key={member!._id}
                        title={member!.displayName ?? member!.email}
                        className="relative"
                      >
                        {member!.avatarUrl ? (
                          <img
                            src={member!.avatarUrl}
                            alt={member!.displayName ?? member!.email}
                            className="w-8 h-8 rounded-full border-2 border-[var(--bg-body)] object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-body)] bg-[#1a1a1a] flex items-center justify-center text-xs font-mono text-[var(--text-secondary)]">
                            {(member!.displayName ?? member!.email)?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="font-mono bg-[#111] px-3 py-2 rounded border border-[var(--border-highlight)] text-sm">{room.inviteCode}</div>
                <button
                  onClick={handleCopyInviteCode}
                  className="inline-flex items-center justify-center h-9 px-3 text-[0.7rem] font-medium uppercase tracking-wide
                    bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-primary)]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                    hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                >
                  {copiedInvite ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="border-l border-[var(--border-color)] bg-[#080808] flex flex-col overflow-hidden">
          {/* Audit Trail — scrollable */}
          <div className="flex-1 overflow-y-auto p-6 pb-2">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-5" style={{ fontFamily: 'var(--font-pixel)' }}>
              Audit Trail
            </div>

            <div className="flex flex-col gap-4">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.slice(0, 20).map((log) => {
                  const { who, msg } = formatLogAction(log);
                  const dotColor = getLogDotColor(log.action);
                  return (
                    <div key={log._id} className="flex flex-col gap-1 relative pl-4">
                      {/* Timeline line */}
                      <div className="absolute left-0 top-1.5 bottom-[-20px] w-px bg-[var(--border-color)]" />
                      {/* Dot */}
                      <span className={`absolute left-[-2.5px] top-1.5 w-1.5 h-1.5 rounded-full shrink-0
                        ${dotColor === "green" ? "bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-glow-green)]" :
                          dotColor === "red" ? "bg-[var(--accent-red)] shadow-[0_0_8px_var(--accent-glow-red)]" :
                          "bg-[#444]"}`}
                      />
                      <div className="text-xs text-[var(--text-secondary)] leading-snug">
                        <strong className="text-[var(--text-primary)] font-medium">{who}</strong>{" "}
                        {msg}
                      </div>
                      <div className="text-[0.65rem] text-[var(--text-dim)] font-mono">{formatLogTime(log._creationTime)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[var(--text-dim)]">No activity yet</div>
              )}
            </div>
          </div>

          {/* Room Stats + Actions — pinned to bottom */}
          <div className="shrink-0 p-6 pt-4 border-t border-[var(--border-color)]">
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3" style={{ fontFamily: 'var(--font-pixel)' }}>
              Room Stats
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)] uppercase">Secrets</span>
                <span className="text-sm font-mono">{secrets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)] uppercase">Users</span>
                <span className="text-sm font-mono">{memberCount}</span>
              </div>
            </div>

            {/* Settings link */}
            <Link
              href={`/room/${roomIdStr}/settings`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 h-8 px-3 text-[0.7rem] font-medium uppercase tracking-wide
                bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 no-underline"
            >
              <Settings className="w-3 h-3" /> Settings
            </Link>

            {/* Shred button (Owner only) */}
            {role === "OWNER" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleShredRoom}
                  disabled={isShredding}
                  className={`flex-1 inline-flex items-center justify-center gap-2 h-8 px-3 text-[0.7rem] font-medium uppercase tracking-wide rounded-md
                    transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                    ${confirmShred
                      ? "bg-[var(--accent-red)] text-white border border-[var(--accent-red)] hover:brightness-110"
                      : "bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] text-[var(--accent-red)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)] hover:border-[var(--accent-red)]/50 hover:-translate-y-px active:translate-y-px"
                    }`}
                >
                  <Flame className="w-3 h-3" />
                  {isShredding ? "Shredding..." : confirmShred ? "Confirm Shred" : "Shred Room"}
                </button>
                {confirmShred && !isShredding && (
                  <button
                    onClick={() => setConfirmShred(false)}
                    className="inline-flex items-center justify-center h-8 px-3 text-[0.7rem] font-medium uppercase tracking-wide
                      bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-md text-[var(--text-secondary)]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                      hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Add Secret Modal */}
      {showAddSecret && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full p-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-pixel)' }}>Add Secrets</h2>
              <button
                onClick={() => setShowAddSecret(false)}
                className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkImport}>
                <div className="mb-4">
                  <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                    Paste your .env file contents
                  </label>
                  <textarea
                    placeholder={`# Comments are ignored\nDATABASE_URL=postgres://...\nAPI_KEY=sk-proj-...\nSTRIPE_SECRET=whsec_...`}
                    value={bulkEnv}
                    onChange={(e) => setBulkEnv(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-2.5 bg-[#111] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono text-sm
                      outline-none focus:border-[var(--border-highlight)] transition-colors placeholder:text-[var(--text-dim)] resize-none"
                    required
                  />
                </div>
                {bulkPreview.length > 0 && (
                  <div className="mb-4 p-3 bg-[#111] rounded-lg border border-[var(--border-color)]">
                    <p className="text-[0.65rem] text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                      {bulkPreview.length} secret{bulkPreview.length !== 1 ? "s" : ""} detected:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bulkPreview.map((entry) => (
                        <span key={entry.key} className="px-2 py-0.5 text-xs font-mono bg-[var(--bg-card)] rounded border border-[var(--border-color)]">
                          {entry.key}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isAdding || bulkPreview.length === 0}
                    className="flex-1 inline-flex items-center justify-center h-10 text-[0.8rem] font-medium uppercase tracking-wide
                      bg-gradient-to-b from-[#2a2a2a] to-[#151515] border border-[#444] rounded-lg text-[var(--text-primary)]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                      hover:border-[#555] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isAdding ? `Importing ${bulkProgress}...` : `Import ${bulkPreview.length} Secret${bulkPreview.length !== 1 ? "s" : ""}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSecret(false)}
                    disabled={isAdding}
                    className="inline-flex items-center justify-center h-10 px-6 text-[0.8rem] font-medium uppercase tracking-wide
                      bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[var(--border-highlight)] rounded-lg text-[var(--text-secondary)]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]
                      hover:border-[#555] hover:text-[var(--text-primary)] hover:-translate-y-px active:translate-y-px transition-all duration-200 cursor-pointer
                      disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
