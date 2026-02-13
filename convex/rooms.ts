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
        if (!room || room.expiresAt <= Date.now()) return null;

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
    return await ctx.db.get(args.roomId);
  },
});

// Get room by invite code
export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});

// Create a room
export const createRoom = mutation({
  args: {
    name: v.string(),
    inviteCode: v.string(),
    workosOrgId: v.string(),
    expiresAt: v.number(),
    createdById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", args);

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

// Delete a room
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
