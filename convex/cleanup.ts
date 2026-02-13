import { internalMutation } from "./_generated/server";

// Placeholder — expiration-based cleanup removed.
// Rooms are now soft-deleted via shredRoom.
export const noop = internalMutation({
  args: {},
  handler: async () => {},
});
