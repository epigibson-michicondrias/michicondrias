CREATE TABLE IF NOT EXISTS public.vet_reviews (
    id character varying(36) NOT NULL PRIMARY KEY,
    vet_id character varying(36) NOT NULL REFERENCES public.veterinarians(id) ON DELETE CASCADE,
    user_id character varying(36) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS ix_vet_reviews_vet_id ON public.vet_reviews (vet_id);
CREATE INDEX IF NOT EXISTS ix_vet_reviews_user_id ON public.vet_reviews (user_id);

ALTER TABLE public.vet_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vet_reviews' AND policyname = 'Allow public read access to vet reviews'
    ) THEN
        CREATE POLICY "Allow public read access to vet reviews" ON public.vet_reviews FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vet_reviews' AND policyname = 'Allow authenticated insert to vet reviews'
    ) THEN
        CREATE POLICY "Allow authenticated insert to vet reviews" ON public.vet_reviews FOR INSERT WITH CHECK (true);
    END IF;
END
$$;
