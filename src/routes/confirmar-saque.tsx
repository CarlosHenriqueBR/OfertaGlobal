import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confirmar-saque")({
  head: () => ({
    meta: [
      { title: "Withdrawal Confirmation | TikTok Rewards" },
      { name: "description", content: "Confirm your TikTok Rewards withdrawal securely." },
      { property: "og:title", content: "Withdrawal Confirmation | TikTok Rewards" },
      { property: "og:description", content: "Confirm your TikTok Rewards withdrawal securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CloneRoute,
});

function CloneRoute() {
  return null;
}
