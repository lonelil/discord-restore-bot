import { createTRPCRouter } from "~/server/api/trpc";
import { discordRouter } from "./routers/discord";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  discord: discordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
