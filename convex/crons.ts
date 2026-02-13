import { cronJobs } from "convex/server";

const crons = cronJobs();

// No scheduled jobs — rooms are manually shredded by owners.

export default crons;
