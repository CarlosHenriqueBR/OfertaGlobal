import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPanelData } from "@/lib/panel.functions";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel de E-mails e Pedidos" },
      { name: "description", content: "Acompanhe leads, pedidos Digistore e envios de e-mail de acesso." },
      { property: "og:title", content: "Painel de E-mails e Pedidos" },
      { property: "og:description", content: "Leads, pedidos e status de envio de e-mail em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const fetchPanel = useServerFn(getPanelData);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["panel-data"],
    queryFn: () => fetchPanel(),
    refetchInterval: 30000,
  });

  return (
    <main className="min-h-dvh bg-[#0B0D12] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Painel de E-mails</h1>
            <p className="text-sm text-white/50">E-mail real, e-mail do checkout e status do envio.</p>
          </div>
          <button
            className="rounded-lg bg-[#FE2C55] px-4 py-2 text-sm font-bold disabled:opacity-50"
            disabled={isFetching}
            onClick={() => refetch()}
            type="button"
          >
            {isFetching ? "Atualizando..." : "Atualizar"}
          </button>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Leads" value={data?.stats.leads ?? 0} />
          <Stat label="Pedidos" value={data?.stats.orders ?? 0} />
          <Stat label="E-mails enviados" value={data?.stats.sent ?? 0} />
          <Stat label="Sem envio" value={data?.stats.failed ?? 0} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">E-mail real</th>
                <th className="px-3 py-3">E-mail no checkout</th>
                <th className="px-3 py-3">E-mail na Digistore</th>
                <th className="px-3 py-3">Pedido</th>
                <th className="px-3 py-3">Evento</th>
                <th className="px-3 py-3">Envio</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-3 py-6 text-white/50" colSpan={7}>
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && (data?.rows.length ?? 0) === 0 && (
                <tr>
                  <td className="px-3 py-6 text-white/50" colSpan={7}>
                    Nenhum registro ainda.
                  </td>
                </tr>
              )}
              {data?.rows.map((row) => (
                <tr className="border-t border-white/5 align-top" key={row.id}>
                  <td className="whitespace-nowrap px-3 py-3 text-white/60">
                    {new Date(row.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-3 py-3 font-semibold">{row.emailReal ?? "—"}</td>
                  <td className="px-3 py-3 text-white/70">{row.emailCheckout ?? "—"}</td>
                  <td className="px-3 py-3 text-white/70">{row.buyerEmail ?? "—"}</td>
                  <td className="px-3 py-3 text-white/70">
                    {row.orderId ?? "—"}
                    {row.amount !== null && (
                      <span className="block text-xs text-white/40">
                        {row.amount} {row.currency ?? ""}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-white/70">{row.event ?? "lead"}</td>
                  <td className="px-3 py-3">
                    {row.emailSentAt ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">
                        Enviado {new Date(row.emailSentAt).toLocaleString("pt-BR")}
                      </span>
                    ) : row.orderId ? (
                      <span className="rounded-full bg-rose-500/15 px-2 py-1 text-xs font-bold text-rose-300">
                        Não enviado
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/50">
                        Sem compra
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
