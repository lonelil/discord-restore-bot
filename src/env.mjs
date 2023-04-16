import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  //NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  //NEXT_PUBLIC_DISCORD_REDIRECT_URI: z.string().url(),
  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_VERIFIED_ROLE_ID: z.string(),
  DISCORD_GUILD_ID: z.string(),
  TURNSTILE_SECRET: z.string(),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  NEXT_PUBLIC_NAME: z.string(),
  NEXT_PUBLIC_LOGO: z.string(),
  NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: z.string(),
  NEXT_PUBLIC_TURNSTILE_SITEKEY: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,

  NEXT_PUBLIC_NAME: process.env.NEXT_PUBLIC_NAME,
  NEXT_PUBLIC_LOGO: process.env.NEXT_PUBLIC_LOGO,

  NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  NEXT_PUBLIC_DISCORD_REDIRECT_URI:
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_VERIFIED_ROLE_ID: process.env.DISCORD_VERIFIED_ROLE_ID,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,

  NEXT_PUBLIC_TURNSTILE_SITEKEY: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

const skip =
  !!process.env.SKIP_ENV_VALIDATION &&
  process.env.SKIP_ENV_VALIDATION !== "false" &&
  process.env.SKIP_ENV_VALIDATION !== "0";
if (!skip) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
