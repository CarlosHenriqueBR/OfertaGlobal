export type PanelRow = {
  id: string;
  createdAt: string;
  leadKey: string | null;
  emailReal: string | null;
  emailCheckout: string | null;
  orderId: string | null;
  event: string | null;
  amount: number | null;
  currency: string | null;
  buyerEmail: string | null;
  emailSentAt: string | null;
};

export type PanelData = {
  rows: PanelRow[];
  stats: {
    leads: number;
    orders: number;
    sent: number;
    failed: number;
  };
};

const CANONICAL_PANEL_DATA_URL = "https://worldwideinfo.online/api/public/panel-data";

async function fetchCanonicalPanelData(): Promise<PanelData> {
  const response = await fetch(CANONICAL_PANEL_DATA_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`panel_data_proxy_failed_${response.status}`);
  }
  return (await response.json()) as PanelData;
}

export async function fetchPanelData(): Promise<PanelData> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fetchCanonicalPanelData();
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [leadsRes, ordersRes] = await Promise.all([
    supabaseAdmin
      .from("checkout_leads")
      .select("id, lead_key, email_real, email_checkout, page, created_at")
      .order("created_at", { ascending: false })
      .limit(300),
    supabaseAdmin
      .from("digistore_orders")
      .select(
        "id, order_id, event, buyer_email, amount, currency, custom, email_real, access_email_sent_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  if (leadsRes.error) throw new Error(`leads_query_failed: ${leadsRes.error.message}`);
  if (ordersRes.error) throw new Error(`orders_query_failed: ${ordersRes.error.message}`);

  const leads = leadsRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const leadByKey = new Map(leads.map((lead) => [lead.lead_key, lead]));
  const usedLeadIds = new Set<string>();

  const orderRows: PanelRow[] = orders.map((order) => {
    const lead = order.custom ? leadByKey.get(order.custom) : undefined;
    if (lead) usedLeadIds.add(lead.id);
    return {
      id: order.id,
      createdAt: order.created_at,
      leadKey: order.custom ?? null,
      emailReal: order.email_real ?? lead?.email_real ?? null,
      emailCheckout: lead?.email_checkout ?? order.buyer_email ?? null,
      orderId: order.order_id ?? null,
      event: order.event ?? null,
      amount: order.amount === null ? null : Number(order.amount),
      currency: order.currency ?? null,
      buyerEmail: order.buyer_email ?? null,
      emailSentAt: order.access_email_sent_at ?? null,
    };
  });

  const leadRows: PanelRow[] = leads
    .filter((lead) => !usedLeadIds.has(lead.id))
    .map((lead) => ({
      id: lead.id,
      createdAt: lead.created_at,
      leadKey: lead.lead_key,
      emailReal: lead.email_real,
      emailCheckout: lead.email_checkout,
      orderId: null,
      event: null,
      amount: null,
      currency: null,
      buyerEmail: null,
      emailSentAt: null,
    }));

  const rows = [...orderRows, ...leadRows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    rows,
    stats: {
      leads: leads.length,
      orders: orders.length,
      sent: orderRows.filter((row) => row.emailSentAt).length,
      failed: orderRows.filter((row) => !row.emailSentAt).length,
    },
  };
}