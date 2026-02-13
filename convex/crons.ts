import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired rooms",
  { hours: 1 },
  internal.cleanup.expireRooms
);

crons.interval(
  "cleanup expired secrets",
  { hours: 1 },
  internal.cleanup.expireSecrets
);

export default crons;
