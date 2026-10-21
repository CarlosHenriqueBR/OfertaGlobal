CREATE UNIQUE INDEX IF NOT EXISTS digistore_orders_order_id_event_unique
ON public.digistore_orders (order_id, event);