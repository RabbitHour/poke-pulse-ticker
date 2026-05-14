
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.unicorn_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_unicorn_threads_user ON public.unicorn_threads(user_id, updated_at DESC);
ALTER TABLE public.unicorn_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads select" ON public.unicorn_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own threads insert" ON public.unicorn_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own threads update" ON public.unicorn_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own threads delete" ON public.unicorn_threads FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.unicorn_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.unicorn_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_unicorn_messages_thread ON public.unicorn_messages(thread_id, created_at);
ALTER TABLE public.unicorn_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own msgs select" ON public.unicorn_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own msgs insert" ON public.unicorn_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own msgs delete" ON public.unicorn_messages FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER unicorn_threads_touch
BEFORE UPDATE ON public.unicorn_threads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
