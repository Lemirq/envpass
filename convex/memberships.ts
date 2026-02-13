import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get membership by user and room
export const getByUserAndRoom = query({
  args: {
    userId: v.id("users"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memberships")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", args.userId).eq("roomId", args.roomId)
      )
      .first();
  },
});

// List members of a room
export const listMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return user ? { ...user, role: m.role, membershipId: m._id } : null;
      })
    );
  },
});

// Add member to room
export const addMember = mutation({
  args: {
    userId: v.id("users"),
    roomId: v.id("rooms"),
    role: v.union(v.literal("OWNER"), v.literal("MEMBER")),
  },
  handler: async (ctx, args) => {
    const membershipId = await ctx.db.insert("memberships", {
      userId: args.userId,
      roomId: args.roomId,
      role: args.role,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: args.roomId,
      userId: args.userId,
      action: "MEMBER_JOINED",
    });

    return membershipId;
  },
});

// Remove member from room
export const removeMember = mutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Membership not found");
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      roomId: membership.roomId,
      userId: membership.userId,
      action: "MEMBER_REMOVED",
    });

    await ctx.db.delete(args.membershipId);
  },
});
