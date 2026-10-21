CREATE UNIQUE INDEX IF NOT EXISTS digistore_orders_order_event_unique
ON public.digistore_orders (order_id, event)
WHERE order_id IS NOT NULL AND event IS NOT NULL;