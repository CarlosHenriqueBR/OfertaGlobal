import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Orbitagram Access" },
      { name: "description", content: "Complete your secure checkout to unlock your account access." },
      { property: "og:title", content: "Secure Checkout — Orbitagram Access" },
      { property: "og:description", content: "Complete your secure checkout to unlock your account access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutRedirect,
});

function CheckoutRedirect() {
  useEffect(() => {
    const base = "https://www.digistore24.com/product/690380";
    const qs = window.location.search.replace(/^\?/, "");
    window.location.replace(qs ? `${base}?${qs}` : base);
  }, []);


  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5 text-center text-slate-950">
      <p className="text-sm font-bold">Loading...</p>
    </main>
  );
}

