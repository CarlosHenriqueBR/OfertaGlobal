import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const botGuardMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const { checkRequestForBot, blockedResponse } = await import("./lib/bot-guard.server");
    const verdict = await checkRequestForBot(request);
    if (verdict.blocked) {
      console.warn(`[bot-guard] blocked (${verdict.reason}) ${request.url}`);
      return blockedResponse();
    }
  } catch (error) {
    console.error("[bot-guard] check failed", error);
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [botGuardMiddleware, errorMiddleware],
}));
