import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/up3-novo")({
  head: () => ({
    meta: [
      { title: "Information Validated" },
      { name: "description", content: "Your information was validated." },
    ],
  }),
  component: Up3NovoRedirect,
});

function Up3NovoRedirect() {
  useEffect(() => {
    window.location.replace(
      `/up3-novo/index.html${window.location.search}${window.location.hash}`,
    );
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5 text-center text-slate-950">
      <p className="text-sm font-bold">Loading...</p>
    </main>
  );
}
