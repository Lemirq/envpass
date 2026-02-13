"use client";

import { useState, use } from "react";
import Link from "next/link";
import { formatTimeRemaining, copyToClipboard } from "@/lib/utils";

// Mock room data
const mockRoom = {
  _id: "room1",
  name: "HackMIT 2026 — Team Sigma",
  inviteCode: "X7K2P9",
  expiresAt: Date.now() + 47 * 60 * 60 * 1000,
  role: "OWNER" as const,
};

// Mock secrets data
const mockSecrets = [
  {
    _id: "secret1",
    keyName: "OPENAI_API_KEY",
    description: "OpenAI API key for GPT-4",
    tags: ["ai", "api"],
    createdById: "user1",
    _creationTime: Date.now() - 2 * 60 * 60 * 1000,
    expiresAt: undefined,
  },
  {
    _id: "secret2",
    keyName: "STRIPE_SECRET_KEY",
    description: "Stripe sandbox secret key",
    tags: ["payment", "stripe"],
    createdById: "user2",
    _creationTime: Date.now() - 1 * 60 * 60 * 1000,
    expiresAt: undefined,
  },
  {
    _id: "secret3",
    keyName: "DATABASE_URL",
    description: "PostgreSQL connection string",
    tags: ["database"],
    createdById: "user1",
    _creationTime: Date.now() - 30 * 60 * 1000,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24h
  },
];

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddSecret, setShowAddSecret] = useState(false);

  const handleCopySecret = async (secretId: string) => {
    // TODO: Replace with actual API call to fetch decrypted value
    const mockValue = `sk-proj-${Math.random().toString(36).substring(2, 15)}`;
    await copyToClipboard(mockValue);
    
    setCopiedId(secretId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyInviteCode = async () => {
    await copyToClipboard(mockRoom.inviteCode);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            ← Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{mockRoom.name}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-[var(--text-secondary)]">Invite Code: </span>
                  <button
                    onClick={handleCopyInviteCode}
                    className="font-mono text-lg text-[var(--primary)] hover:text-[var(--primary-dark)]"
                  >
                    {mockRoom.inviteCode}
                  </button>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Expires in </span>
                  <span className="text-[var(--warning)] font-medium">
                    {formatTimeRemaining(mockRoom.expiresAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">🔑 {mockSecrets.length} secrets</span>
                </div>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded ${
                mockRoom.role === "OWNER"
                  ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                  : "bg-[var(--surface-light)] text-[var(--text-secondary)]"
              }`}
            >
              {mockRoom.role}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowAddSecret(true)}
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
            href={`/room/${roomId}/settings`}
            className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface-light)] border border-[var(--border)] rounded-lg font-semibold transition-colors"
          >
            Settings ⚙
          </Link>
        </div>

        {/* Secrets List */}
        {mockSecrets.length === 0 ? (
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
            {mockSecrets.map((secret) => (
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
                  
                  <button
                    onClick={() => handleCopySecret(secret._id)}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
                  >
                    {copiedId === secret._id ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Secret Modal (Simple version) */}
        {showAddSecret && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full p-8 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
              <h2 className="text-2xl font-bold mb-6">Add Secret</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); setShowAddSecret(false); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Key Name</label>
                  <input
                    type="text"
                    placeholder="OPENAI_API_KEY"
                    className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Secret Value</label>
                  <textarea
                    placeholder="sk-proj-..."
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
                    className="w-full px-4 py-2 bg-[var(--surface-light)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold transition-colors"
                  >
                    Add Secret
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
