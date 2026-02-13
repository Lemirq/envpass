import { internalMutation } from "./_generated/server";

// Cleanup expired rooms
export const expireRooms = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredRooms = await ctx.db
      .query("rooms")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    for (const room of expiredRooms) {
      // Delete memberships
      const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const membership of memberships) {
        await ctx.db.delete(membership._id);
      }

      // Get secrets for cleanup (will need to be handled by action)
      const secrets = await ctx.db
        .query("secrets")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      // Delete secrets from DB (Vault cleanup must be done in action)
      for (const secret of secrets) {
        await ctx.db.delete(secret._id);
      }

      // Delete audit logs
      const logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const log of logs) {
        await ctx.db.delete(log._id);
      }

      // Delete room
      await ctx.db.delete(room._id);
    }

    return { deletedRooms: expiredRooms.length };
  },
});

// Cleanup expired secrets
export const expireSecrets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find secrets with expiresAt set and expired
    const allSecrets = await ctx.db.query("secrets").collect();
    const expiredSecrets = allSecrets.filter(
      (s) => s.expiresAt !== undefined && s.expiresAt < now
    );

    for (const secret of expiredSecrets) {
      await ctx.db.delete(secret._id);
    }

    return { deletedSecrets: expiredSecrets.length };
  },
});
