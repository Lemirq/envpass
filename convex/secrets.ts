import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List secrets in a room
export const listSecrets = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const secrets = await ctx.db
      .query("secrets")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Return metadata only — never plaintext values
    return secrets.map((s) => ({
      _id: s._id,
      keyName: s.keyName,
      description: s.description,
      tags: s.tags,
      expiresAt: s.expiresAt,
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

// Create a secret
export const createSecret = mutation({
  args: {
    roomId: v.id("rooms"),
    keyName: v.string(),
    vaultObjectId: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    createdById: v.id("users"),
  },
  handler: async (ctx, args) => {
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
    if (!secret) {
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

    await ctx.db.delete(args.secretId);
    
    return secret.vaultObjectId;
  },
});

// Update a secret
export const updateSecret = mutation({
  args: {
    secretId: v.id("secrets"),
    vaultObjectId: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const secret = await ctx.db.get(args.secretId);
    if (!secret) {
      throw new Error("Secret not found");
    }

    const updates: any = {};
    if (args.vaultObjectId !== undefined) updates.vaultObjectId = args.vaultObjectId;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.expiresAt !== undefined) updates.expiresAt = args.expiresAt;

    await ctx.db.patch(args.secretId, updates);

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: secret.roomId,
      secretId: args.secretId,
      userId: args.userId,
      action: "SECRET_UPDATED",
      metadata: { keyName: secret.keyName },
    });

    return secret.vaultObjectId; // Return old vaultObjectId for cleanup
  },
});
