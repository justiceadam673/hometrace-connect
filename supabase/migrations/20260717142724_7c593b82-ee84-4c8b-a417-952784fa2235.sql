
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_type TEXT NOT NULL,
  payment_plan TEXT NOT NULL CHECK (payment_plan IN ('full','half')),
  displayed_amount NUMERIC(14,2) NOT NULL,
  charged_amount NUMERIC(14,2) NOT NULL,
  agent_disbursement NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  paystack_response JSONB,
  buyer_email TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Agents view payments on their listings" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Admins view all payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX payments_buyer_idx ON public.payments(buyer_id);
CREATE INDEX payments_agent_idx ON public.payments(agent_id);
CREATE INDEX payments_property_idx ON public.payments(property_id);
