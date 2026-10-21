import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/up2-novo")({
  head: () => ({
    meta: [
      { title: "TikTok Bonus — Priority Processing" },
      { name: "description", content: "Priority processing for your bonus." },
    ],
  }),
  component: Up2NovoRedirect,
});

function Up2NovoRedirect() {
  useEffect(() => {
    window.location.replace(
      `/up2-novo/index.html${window.location.search}${window.location.hash}`,
    );
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5 text-center text-slate-950">
      <p className="text-sm font-bold">Loading...</p>
    </main>
  );
}
