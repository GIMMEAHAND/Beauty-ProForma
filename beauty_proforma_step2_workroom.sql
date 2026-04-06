-- ============================================================
-- Beauty ProForma — Step 2: Workroom Schema
-- Run AFTER step1 migration
-- ============================================================

-- ============================================================
-- ASSET VAULT
-- Two tiers: raw (Pro uploads) + processed (Manager uploads)
-- ============================================================

CREATE TYPE asset_tier AS ENUM ('raw', 'processed');
CREATE TYPE asset_type AS ENUM ('video', 'image', 'audio', 'document', 'pinterest_pin', 'etsy_product');

CREATE TABLE public.vault_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id   UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,

  -- Who uploaded it
  uploaded_by      UUID NOT NULL REFERENCES public.users(id),
  tier             asset_tier NOT NULL,          -- 'raw' = Pro, 'processed' = Manager
  asset_type       asset_type NOT NULL,

  -- File metadata
  title            TEXT NOT NULL,
  description      TEXT,
  file_path        TEXT NOT NULL,                -- Supabase Storage path
  file_size_bytes  BIGINT,
  mime_type        TEXT,
  thumbnail_path   TEXT,                         -- auto-generated preview

  -- Linking raw → processed
  source_asset_id  UUID REFERENCES public.vault_assets(id),  -- Manager links processed → raw

  -- Ownership is always the Pro's (from Dignity Clause)
  pro_id           UUID NOT NULL REFERENCES public.pro_profiles(id),

  -- MetriXs integration
  metrixs_asset_id TEXT,                         -- external ID from Beauty MetriXs API
  metrixs_synced_at TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vault_partnership ON public.vault_assets(partnership_id);
CREATE INDEX idx_vault_tier ON public.vault_assets(partnership_id, tier);
CREATE INDEX idx_vault_metrixs ON public.vault_assets(metrixs_asset_id) WHERE metrixs_asset_id IS NOT NULL;

-- ============================================================
-- TASK LEDGER
-- Manager posts tasks; Pro verifies them
-- ============================================================

CREATE TYPE task_status AS ENUM ('Pending', 'Submitted', 'Verified', 'Disputed');
CREATE TYPE task_category AS ENUM (
  'Pinterest Scheduling',
  'SEO Optimization',
  'Affiliate Setup',
  'Content Editing',
  'Analytics Report',
  'Email Campaign',
  'Etsy Listing',
  'Social Post',
  'Other'
);

CREATE TABLE public.task_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id  UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,

  -- Task meta
  title           TEXT NOT NULL,
  description     TEXT,
  category        task_category NOT NULL DEFAULT 'Other',
  status          task_status NOT NULL DEFAULT 'Pending',

  -- Who
  created_by      UUID NOT NULL REFERENCES public.users(id),  -- always Manager
  verified_by     UUID REFERENCES public.users(id),           -- always Pro when verified

  -- Proof of work (Manager attaches evidence)
  proof_url       TEXT,           -- link to screenshot, report, etc.
  proof_note      TEXT,

  -- Pro's verification note (can include dispute reason)
  pro_note        TEXT,
  verified_at     TIMESTAMPTZ,
  disputed_at     TIMESTAMPTZ,

  -- Optional: linked asset
  vault_asset_id  UUID REFERENCES public.vault_assets(id),

  due_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_partnership ON public.task_ledger(partnership_id);
CREATE INDEX idx_task_status ON public.task_ledger(partnership_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vault_updated
BEFORE UPDATE ON public.vault_assets
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_task_updated
BEFORE UPDATE ON public.task_ledger
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Set verified_at automatically
CREATE OR REPLACE FUNCTION set_task_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Verified' AND OLD.status != 'Verified' THEN
    NEW.verified_at = NOW();
  END IF;
  IF NEW.status = 'Disputed' AND OLD.status != 'Disputed' THEN
    NEW.disputed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_verified
BEFORE UPDATE ON public.task_ledger
FOR EACH ROW EXECUTE FUNCTION set_task_verified();

-- ============================================================
-- METRIXS PERFORMANCE CACHE
-- Stores pulled metrics so the Workroom loads fast
-- without hammering the API every render
-- ============================================================

CREATE TABLE public.metrixs_cache (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id   UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  vault_asset_id   UUID REFERENCES public.vault_assets(id) ON DELETE CASCADE,

  -- Source platform
  platform         TEXT NOT NULL,  -- 'pinterest', 'tiktok', 'instagram', 'etsy'

  -- Core metrics (stored as JSONB for flexibility across platforms)
  metrics          JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- Pinterest shape: { impressions, saves, clicks, outbound_clicks, ctr }
  -- TikTok shape:    { views, likes, shares, comments, watch_time_avg }
  -- Instagram shape: { reach, impressions, profile_visits, saves, shares }
  -- Etsy shape:      { views, favorites, sales, revenue_cents }

  -- Snapshot metadata
  period_start     DATE,
  period_end       DATE,
  pulled_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate pulls for same asset + platform + period
  CONSTRAINT unique_metric_snapshot UNIQUE (vault_asset_id, platform, period_start, period_end)
);

CREATE INDEX idx_metrixs_partnership ON public.metrixs_cache(partnership_id);
CREATE INDEX idx_metrixs_asset ON public.metrixs_cache(vault_asset_id);
CREATE INDEX idx_metrixs_pulled ON public.metrixs_cache(pulled_at DESC);

-- ============================================================
-- WORKROOM ACTIVITY FEED (real-time events)
-- Supabase Realtime listens to this table
-- ============================================================

CREATE TYPE activity_type AS ENUM (
  'asset_uploaded',
  'asset_processed',
  'task_created',
  'task_submitted',
  'task_verified',
  'task_disputed',
  'metrics_refreshed',
  'partner_joined'
);

CREATE TABLE public.workroom_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id  UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  actor_id        UUID NOT NULL REFERENCES public.users(id),
  activity_type   activity_type NOT NULL,
  payload         JSONB DEFAULT '{}'::JSONB,  -- { title, asset_id, task_id, etc. }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_partnership ON public.workroom_activity(partnership_id, created_at DESC);

-- Enable Realtime on activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.workroom_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_ledger;

-- ============================================================
-- RLS POLICIES — Workroom tables
-- Both partners see everything in their shared workroom
-- ============================================================

ALTER TABLE public.vault_assets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_ledger       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrixs_cache     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workroom_activity ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a participant in this partnership?
CREATE OR REPLACE FUNCTION is_partnership_member(p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partnerships p
    JOIN public.pro_profiles pro ON pro.id = p.pro_id
    JOIN public.manager_profiles mgr ON mgr.id = p.manager_id
    WHERE p.id = p_id
    AND (pro.user_id = auth.uid() OR mgr.user_id = auth.uid())
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE POLICY "workroom_members_vault"
  ON public.vault_assets FOR ALL
  USING (is_partnership_member(partnership_id));

CREATE POLICY "workroom_members_tasks"
  ON public.task_ledger FOR ALL
  USING (is_partnership_member(partnership_id));

CREATE POLICY "workroom_members_metrics"
  ON public.metrixs_cache FOR ALL
  USING (is_partnership_member(partnership_id));

CREATE POLICY "workroom_members_activity"
  ON public.workroom_activity FOR ALL
  USING (is_partnership_member(partnership_id));

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or JS client)
-- ============================================================

-- These are the bucket names to create in Supabase Storage:
--
-- 1. 'vault-raw'       — Pro uploads raw assets
--    Policy: authenticated Pro in partnership can INSERT
--            Both partners can SELECT
--
-- 2. 'vault-processed' — Manager uploads processed assets
--    Policy: authenticated Manager in partnership can INSERT
--            Both partners can SELECT
--
-- Run in Supabase Dashboard > Storage > New Bucket
-- or via supabase-js:
--   supabase.storage.createBucket('vault-raw', { public: false })
--   supabase.storage.createBucket('vault-processed', { public: false })

-- ============================================================
-- WORKROOM SUMMARY VIEW (used by dashboard header)
-- ============================================================

CREATE VIEW public.workroom_summary AS
SELECT
  p.id AS partnership_id,
  p.status,
  pro.display_name   AS pro_name,
  pro.specialty      AS pro_specialty,
  mgr.display_name   AS manager_name,
  mgr.skill_tags,

  -- Asset counts
  COUNT(DISTINCT va.id) FILTER (WHERE va.tier = 'raw')       AS raw_assets,
  COUNT(DISTINCT va.id) FILTER (WHERE va.tier = 'processed') AS processed_assets,

  -- Task counts
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'Pending')   AS tasks_pending,
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'Submitted') AS tasks_submitted,
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'Verified')  AS tasks_verified,
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'Disputed')  AS tasks_disputed

FROM public.partnerships p
JOIN public.pro_profiles pro      ON pro.id = p.pro_id
JOIN public.manager_profiles mgr  ON mgr.id = p.manager_id
LEFT JOIN public.vault_assets va  ON va.partnership_id = p.id
LEFT JOIN public.task_ledger tl   ON tl.partnership_id = p.id
GROUP BY p.id, p.status, pro.display_name, pro.specialty, mgr.display_name, mgr.skill_tags;
