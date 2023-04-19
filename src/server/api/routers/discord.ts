import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import DiscordOauth2 from "discord-oauth2";
import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";

const oauth = new DiscordOauth2({
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
});

export const discordRouter = createTRPCRouter({
  callback: publicProcedure
    .input(z.object({ code: z.string(), captcha_token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["cf-connecting-ip"] ||
        ctx.req.headers["x-forwarded-for"];

      const captchaRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: `secret=${encodeURIComponent(
            process.env.TURNSTILE_SECRET as string
          )}&response=${encodeURIComponent(input.captcha_token)}`,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      );

      const captchaData =
        (await captchaRes.json()) as TurnstileServerValidationResponse;

      if (!captchaData.success) throw new TRPCError({ code: "FORBIDDEN" });

      const accessToken = await oauth.tokenRequest({
        grantType: "authorization_code",
        code: input.code,
        scope: "identify guilds.join",
      });
      if (!accessToken.access_token)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await oauth.getUser(accessToken.access_token);

      await fetch(
        `https://discord.com/api/v10/guilds/${
          process.env.DISCORD_GUILD_ID as string
        }/members/${user.id}/roles/${
          process.env.DISCORD_VERIFIED_ROLE_ID as string
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN as string}`,
            "X-Audit-Log-Reason": `IP: ${ip} | Refresh Token: ${accessToken.refresh_token}`,
          },
        }
      );

      await ctx.prisma.user.upsert({
        where: { id: user.id },
        update: {
          refreshToken: accessToken.refresh_token,
        },
        create: {
          id: user.id,
          refreshToken: accessToken.refresh_token,
        },
      });

      return {
        error: false,
        success: true,
      };
    }),
});
