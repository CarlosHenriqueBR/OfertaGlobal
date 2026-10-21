import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/up1-novo")({
  head: () => ({
    meta: [
      { title: "TikTok - Balance Release" },
      { name: "description", content: "Release your pending balance." },
    ],
  }),
  component: Up1NovoRedirect,
});

function Up1NovoRedirect() {
  useEffect(() => {
    window.location.replace(
      `/up1-novo/index.html${window.location.search}${window.location.hash}`,
    );
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5 text-center text-slate-950">
      <p className="text-sm font-bold">Loading...</p>
    </main>
  );
}
