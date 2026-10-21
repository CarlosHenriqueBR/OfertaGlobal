import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TikTok Rewards" },
      { name: "description", content: "Claim your TikTok reward and get paid instantly to Cash App, PayPal, Venmo, Zelle, or your bank." },
      { property: "og:title", content: "TikTok Rewards" },
      { property: "og:description", content: "Claim your TikTok reward and get paid instantly to Cash App, PayPal, Venmo, Zelle, or your bank." },
    ],
  }),
  component: Index,
});

function Index() {
  const [src, setSrc] = useState("/front-en/index.html");

  useEffect(() => {
    const search = window.location.search || "";
    setSrc("/front-en/index.html" + search);
  }, []);

  return (
    <iframe
      src={src}
      title="TikTok Rewards"
      allow="clipboard-write"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        border: 0,
        display: "block",
        background: "#ffffff",
      }}
    />
  );
}
