-- Create status_views table to track who viewed which status
CREATE TABLE public.status_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id uuid REFERENCES public.statuses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(status_id, user_id)
);

ALTER TABLE public.status_views ENABLE ROW LEVEL SECURITY;

-- Anyone can view the views count
CREATE POLICY "Anyone can view status views"
  ON public.status_views FOR SELECT
  USING (true);

-- Users can insert their own view
CREATE POLICY "Users can record their own view"
  ON public.status_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for status_views
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_views;