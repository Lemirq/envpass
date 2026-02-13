import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    workosUserId: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_workos_id", ["workosUserId"])
    .index("by_email", ["email"]),

  rooms: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    workosOrgId: v.string(),
    expiresAt: v.number(),
    createdById: v.id("users"),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_workos_org", ["workosOrgId"])
    .index("by_expires", ["expiresAt"]),

  memberships: defineTable({
    userId: v.id("users"),
    roomId: v.id("rooms"),
    role: v.union(v.literal("OWNER"), v.literal("MEMBER")),
  })
    .index("by_user", ["userId"])
    .index("by_room", ["roomId"])
    .index("by_user_room", ["userId", "roomId"]),

  secrets: defineTable({
    roomId: v.id("rooms"),
    keyName: v.string(),
    vaultObjectId: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    createdById: v.id("users"),
  })
    .index("by_room", ["roomId"])
    .index("by_room_key", ["roomId", "keyName"])
    .index("by_vault_object", ["vaultObjectId"])
    .index("by_expires", ["expiresAt"]),

  auditLogs: defineTable({
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
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_action", ["roomId", "action"]),
});
