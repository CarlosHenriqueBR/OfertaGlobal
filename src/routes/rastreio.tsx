import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/rastreio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Rastreio ao vivo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RastreioPage,
});

type Counts = Record<string, number>;

function RastreioPage() {
  const [counts, setCounts] = useState<Counts>({});
  const [total, setTotal] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      if (supabase.getChannels().length > 0) {
        await supabase.removeAllChannels();
      }

      if (disposed) return;

      channel = supabase.channel("visitors-global", {
        config: { presence: { key: `viewer-${crypto.randomUUID()}` } },
      });

      const recompute = () => {
        if (!channel) return;
        const state = channel.presenceState() as Record<
          string,
          Array<{ pathname?: string }>
        >;
        const next: Counts = {};
        let count = 0;
        for (const key of Object.keys(state)) {
          const metas = state[key];
          const meta = metas[metas.length - 1];
          const path = meta?.pathname || "unknown";
          next[path] = (next[path] || 0) + 1;
          count += 1;
        }
        setCounts(next);
        setTotal(count);
      };

      channel
        .on("presence", { event: "sync" }, recompute)
        .on("presence", { event: "join" }, recompute)
        .on("presence", { event: "leave" }, recompute)
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && channel) {
            setConnected(true);
            await channel.track({
              pathname: window.location.pathname,
              online_at: new Date().toISOString(),
            });
            recompute();
          }
        });
    };

    void setup();

    return () => {
      disposed = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e6edf3", padding: "32px 20px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: connected ? "#22c55e" : "#f59e0b",
              boxShadow: connected ? "0 0 10px #22c55e" : "none",
            }}
          />
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            {connected ? "Conectado — tempo real" : "Conectando..."}
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>
          Rastreio ao vivo
        </h1>
        <p style={{ opacity: 0.7, margin: "0 0 24px" }}>
          Visitantes online agora, agrupados por página.
        </p>

        <div
          style={{
            background: "linear-gradient(135deg,#1e293b,#0f172a)",
            border: "1px solid #1f2937",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7 }}>Total online</div>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
            {total}
          </div>
        </div>

        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1f2937",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              opacity: 0.6,
              borderBottom: "1px solid #1f2937",
              display: "grid",
              gridTemplateColumns: "1fr auto",
            }}
          >
            <span>URL</span>
            <span>Pessoas</span>
          </div>
          {sorted.length === 0 ? (
            <div style={{ padding: 20, opacity: 0.6 }}>
              Nenhum visitante online no momento.
            </div>
          ) : (
            sorted.map(([path, n]) => (
              <div
                key={path}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #111827",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 14,
                    wordBreak: "break-all",
                  }}
                >
                  {path}
                </span>
                <span
                  style={{
                    background: "#1e293b",
                    color: "#22c55e",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontWeight: 700,
                    minWidth: 40,
                    textAlign: "center",
                  }}
                >
                  {n}
                </span>
              </div>
            ))
          )}
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.5 }}>
          Atualiza em tempo real conforme as pessoas entram, mudam de página ou saem.
        </p>
      </div>
    </div>
  );
}
