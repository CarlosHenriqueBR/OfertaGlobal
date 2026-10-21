CREATE TABLE public.checkout_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_key text NOT NULL UNIQUE,
  email_real text NOT NULL,
  email_checkout text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  page text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkout_leads_email_checkout ON public.checkout_leads (email_checkout);
CREATE INDEX idx_checkout_leads_email_real ON public.checkout_leads (email_real);

CREATE TABLE public.digistore_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text,
  event text,
  buyer_email text,
  product_id text,
  amount numeric(12,2),
  currency text,
  custom text,
  lead_id uuid REFERENCES public.checkout_leads(id) ON DELETE SET NULL,
  email_real text,
  access_email_sent_at timestamptz,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_digistore_orders_order_event ON public.digistore_orders (order_id, event) WHERE order_id IS NOT NULL;

GRANT ALL ON public.checkout_leads TO service_role;
GRANT ALL ON public.digistore_orders TO service_role;

ALTER TABLE public.checkout_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digistore_orders ENABLE ROW LEVEL SECURITY;