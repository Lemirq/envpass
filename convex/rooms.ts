import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List rooms the current user belongs to
export const listMyRooms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const rooms = await Promise.all(
      memberships.map(async (m) => {
        const room = await ctx.db.get(m.roomId);
        if (!room || room.status === "deleted") return null;

        const secrets = await ctx.db
          .query("secrets")
          .withIndex("by_room", (q) => q.eq("roomId", m.roomId))
          .collect();

        const members = await ctx.db
          .query("memberships")
          .withIndex("by_room", (q) => q.eq("roomId", m.roomId))
          .collect();

        return {
          ...room,
          role: m.role,
          secretCount: secrets.length,
          memberCount: members.length,
        };
      })
    );

    return rooms.filter(Boolean);
  },
});

// Get room by ID
export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status === "deleted") return null;
    return room;
  },
});

// Get room by invite code
export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
    if (!room || room.status === "deleted") return null;
    return room;
  },
});

// Create a room
export const createRoom = mutation({
  args: {
    name: v.string(),
    inviteCode: v.string(),
    workosOrgId: v.string(),
    createdById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      ...args,
      status: "active",
    });

    // Auto-create owner membership
    await ctx.db.insert("memberships", {
      userId: args.createdById,
      roomId,
      role: "OWNER",
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId,
      userId: args.createdById,
      action: "ROOM_CREATED",
    });

    return roomId;
  },
});

// Shred a room — soft delete + return vault object IDs for cleanup
export const shredRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status === "deleted") {
      throw new Error("Room not found");
    }

    // Collect vault object IDs and soft-delete secrets
    const secrets = await ctx.db
      .query("secrets")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const vaultObjectIds = secrets.map((s) => s.vaultObjectId);

    // Soft-delete all secrets (vault objects will be deleted by the client)
    const now = Date.now();
    for (const secret of secrets) {
      await ctx.db.patch(secret._id, { deletedAt: now });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: args.roomId,
      userId: args.userId,
      action: "ROOM_SHREDDED",
      metadata: { secretCount: secrets.length },
    });

    // Soft delete the room
    await ctx.db.patch(args.roomId, { status: "deleted" });

    return vaultObjectIds;
  },
});

// Delete a room (hard delete — kept for cleanup)
export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Delete memberships
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete secrets
    const secrets = await ctx.db
      .query("secrets")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const secret of secrets) {
      await ctx.db.delete(secret._id);
    }

    // Delete audit logs
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    // Delete room
    await ctx.db.delete(args.roomId);
  },
});
