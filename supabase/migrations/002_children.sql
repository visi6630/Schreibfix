-- Multi-child support: child profiles per parent account
CREATE TABLE IF NOT EXISTS children (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  grade    SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  avatar   TEXT NOT NULL DEFAULT '🦊',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own children"
  ON children FOR ALL
  USING  (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());
