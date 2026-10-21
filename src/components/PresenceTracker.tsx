import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Random visitor id per tab/session
function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("__visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("__visitor_id", id);
  }
  return id;
}

export function PresenceTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/rastreio") return;

    const visitorId = getVisitorId();
    const channel = supabase.channel("visitors-global", {
      config: { presence: { key: visitorId } },
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          pathname,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  return null;
}
