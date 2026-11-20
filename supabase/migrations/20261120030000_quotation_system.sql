-- ============================================================
-- CleanConnect Quotation System
-- ============================================================

-- Status enum for quotation requests
DO $$ BEGIN
  CREATE TYPE public.quotation_status AS ENUM (
    'pending_review',
    'under_review',
    'quotation_sent',
    'accepted',
    'declined',
    'expired',
    'converted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------
-- quotation_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       text NOT NULL UNIQUE DEFAULT ('QR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id      text NOT NULL,
  service_name    text NOT NULL,

  -- Contact (snapshotted at submission)
  customer_name   text NOT NULL DEFAULT '',
  customer_phone  text,
  customer_email  text,

  -- Location
  address_street  text,
  address_city    text,
  address_state   text,
  full_address    text,

  -- Dynamic requirements stored as JSONB
  -- Keys depend on service formFields (property_size, rooms, floors, etc.)
  details         jsonb NOT NULL DEFAULT '{}'::jsonb,

  description     text,
  additional_notes text,

  preferred_date  date,
  preferred_time  text,

  status          public.quotation_status NOT NULL DEFAULT 'pending_review',

  -- Admin internal notes (never shown to customer)
  admin_notes     text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_requests_customer ON public.quotation_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status   ON public.quotation_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_service  ON public.quotation_requests(service_id);

-- ------------------------------------------------------------
-- quotations (issued by admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  issued_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  amount          numeric(12,2) NOT NULL CHECK (amount >= 0),
  -- Optional line-item breakdown: [{label, amount}]
  breakdown       jsonb NOT NULL DEFAULT '[]'::jsonb,
  description     text,

  valid_until     date,
  issued_at       timestamptz NOT NULL DEFAULT now(),

  -- Link to booking once customer accepts and books
  booking_id      uuid REFERENCES public.bookings(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (request_id)  -- one active quotation per request for simplicity
);

CREATE INDEX IF NOT EXISTS idx_quotations_request ON public.quotations(request_id);

-- ------------------------------------------------------------
-- quotation_attachments (photos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  file_name       text NOT NULL,
  file_size       integer,
  mime_type       text,
  uploaded_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_attachments_request ON public.quotation_attachments(request_id);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
CREATE TRIGGER trg_quotation_requests_updated
  BEFORE UPDATE ON public.quotation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_quotations_updated
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_attachments ENABLE ROW LEVEL SECURITY;

-- quotation_requests policies
CREATE POLICY "Customers read own quotation requests"
  ON public.quotation_requests FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers create own quotation requests"
  ON public.quotation_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers update own pending requests"
  ON public.quotation_requests FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id AND status IN ('pending_review', 'quotation_sent'))
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins manage all quotation requests"
  ON public.quotation_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quotations policies
CREATE POLICY "Customers read quotations for own requests"
  ON public.quotations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotation_requests r
      WHERE r.id = request_id AND (r.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins create and update quotations"
  ON public.quotations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quotation_attachments policies
CREATE POLICY "Customers read own request attachments"
  ON public.quotation_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotation_requests r
      WHERE r.id = request_id AND (r.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Customers upload attachments to own requests"
  ON public.quotation_attachments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotation_requests r
      WHERE r.id = request_id AND r.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all attachments"
  ON public.quotation_attachments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.quotation_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quotations TO authenticated;
GRANT SELECT, INSERT ON public.quotation_attachments TO authenticated;
GRANT ALL ON public.quotation_requests TO service_role;
GRANT ALL ON public.quotations TO service_role;
GRANT ALL ON public.quotation_attachments TO service_role;

-- Realtime (optional but useful for admin live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotation_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
