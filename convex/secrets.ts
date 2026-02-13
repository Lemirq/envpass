import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List secrets in a room
export const listSecrets = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const secrets = await ctx.db
      .query("secrets")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Return metadata only — never plaintext values
    return secrets.map((s) => ({
      _id: s._id,
      keyName: s.keyName,
      description: s.description,
      tags: s.tags,
      createdById: s.createdById,
      _creationTime: s._creationTime,
    }));
  },
});

// Get secret by ID
export const get = query({
  args: { secretId: v.id("secrets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.secretId);
  },
});

// Get the encrypted value for a specific secret (for client-side decryption)
export const getEncryptedValue = query({
  args: { secretId: v.id("secrets") },
  handler: async (ctx, args) => {
    const secret = await ctx.db.get(args.secretId);
    if (!secret || secret.deletedAt) throw new Error("Secret not found");
    return secret.vaultObjectId;
  },
});

// Create a secret
export const createSecret = mutation({
  args: {
    roomId: v.id("rooms"),
    keyName: v.string(),
    vaultObjectId: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdById: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Enforce unique key names per room (ignore soft-deleted)
    const existing = await ctx.db
      .query("secrets")
      .withIndex("by_room_key", (q) => q.eq("roomId", args.roomId).eq("keyName", args.keyName))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    if (existing) {
      throw new Error(`Key "${args.keyName}" already exists in this room`);
    }

    const secretId = await ctx.db.insert("secrets", args);

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: args.roomId,
      secretId,
      userId: args.createdById,
      action: "SECRET_CREATED",
      metadata: { keyName: args.keyName },
    });

    return secretId;
  },
});

// Delete a secret
export const deleteSecret = mutation({
  args: {
    secretId: v.id("secrets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const secret = await ctx.db.get(args.secretId);
    if (!secret || secret.deletedAt) {
      throw new Error("Secret not found");
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: secret.roomId,
      secretId: args.secretId,
      userId: args.userId,
      action: "SECRET_DELETED",
      metadata: { keyName: secret.keyName },
    });

    // Soft-delete (vault object will be deleted by the client)
    await ctx.db.patch(args.secretId, { deletedAt: Date.now() });

    return secret.vaultObjectId;
  },
});

// Update a secret
export const updateSecret = mutation({
  args: {
    secretId: v.id("secrets"),
    keyName: v.optional(v.string()),
    vaultObjectId: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const secret = await ctx.db.get(args.secretId);
    if (!secret || secret.deletedAt) {
      throw new Error("Secret not found");
    }

    // If renaming, enforce uniqueness
    if (args.keyName !== undefined && args.keyName !== secret.keyName) {
      const existing = await ctx.db
        .query("secrets")
        .withIndex("by_room_key", (q) => q.eq("roomId", secret.roomId).eq("keyName", args.keyName!))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      if (existing) {
        throw new Error(`Key "${args.keyName}" already exists in this room`);
      }
    }

    const updates: Record<string, unknown> = {};
    if (args.keyName !== undefined) updates.keyName = args.keyName;
    if (args.vaultObjectId !== undefined) updates.vaultObjectId = args.vaultObjectId;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.secretId, updates);

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: secret.roomId,
      secretId: args.secretId,
      userId: args.userId,
      action: "SECRET_UPDATED",
      metadata: {
        keyName: args.keyName ?? secret.keyName,
        ...(args.keyName && args.keyName !== secret.keyName ? { oldKeyName: secret.keyName } : {}),
      },
    });

    return secret.vaultObjectId; // Return old vaultObjectId for cleanup
  },
});
