import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List audit logs for a room
export const listLogs = query({
  args: {
    roomId: v.id("rooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("auditLogs")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc");

    const logs = await query.collect();
    
    const result = args.limit ? logs.slice(0, args.limit) : logs;

    // Enrich with user info
    return await Promise.all(
      result.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user: user ? { email: user.email, displayName: user.displayName } : null,
        };
      })
    );
  },
});

// Log an action
export const log = mutation({
  args: {
    roomId: v.id("rooms"),
    secretId: v.optional(v.id("secrets")),
    userId: v.id("users"),
    action: v.union(
      v.literal("SECRET_CREATED"),
      v.literal("SECRET_READ"),
      v.literal("SECRET_UPDATED"),
      v.literal("SECRET_DELETED"),
      v.literal("SECRET_EXPORTED"),
      v.literal("MEMBER_JOINED"),
      v.literal("MEMBER_REMOVED"),
      v.literal("ROOM_CREATED"),
      v.literal("ROOM_SETTINGS_UPDATED"),
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", args);
  },
});
