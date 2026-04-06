// ============================================================
// Beauty ProForma — Suite Event Dispatcher
// supabase/functions/suite-dispatcher/index.ts
//
// This is the nervous system. Every cross-app action posts here.
// The function routes events, triggers side effects, and
// publishes to Supabase Realtime for live UI updates.
// ============================================================

// ─────────────────────────────────────────────────────────────
// EVENT CONTRACT
// All three apps post to this endpoint with:
// POST /functions/v1/suite-dispatcher
// Headers: Authorization: Bearer <service_role_key>
// Body: SuiteEvent (see type below)
// ─────────────────────────────────────────────────────────────

export type SuiteApp = 'metrixs' | 'salonflow' | 'proforma';

export type SuiteEventType =
  // MetriXs
  | 'metrixs.signal_computed'
  | 'metrixs.opportunity_flagged'
  | 'metrixs.ghost_money_detected'
  // SalonFlow
  | 'salonflow.post_scheduled'
  | 'salonflow.post_published'
  | 'salonflow.post_failed'
  | 'salonflow.campaign_created'
  // ProForma
  | 'proforma.task_created'
  | 'proforma.task_verified'
  | 'proforma.partnership_activated'
  | 'proforma.retainer_paid';

export interface SuiteEvent {
  source_app:     SuiteApp;
  target_app?:    SuiteApp;
  event_type:     SuiteEventType;
  partnership_id?: string;
  actor_user_id?:  string;
  payload:         Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// EDGE FUNCTION
// ─────────────────────────────────────────────────────────────
export const suiteDispatcher = `
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const event = await req.json();
  const { source_app, target_app, event_type, partnership_id, actor_user_id, payload } = event;

  // 1. Write to suite_events table (DB trigger handles routing)
  const { data: suiteEvent, error } = await sb
    .from('suite_events')
    .insert({
      source_app,
      target_app,
      event_type,
      partnership_id,
      actor_user_id,
      payload,
    })
    .select()
    .single();

  if (error) {
    console.error('[suite-dispatcher] Insert failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // 2. Route-specific side effects (beyond what DB triggers handle)
  const sideEffects = await routeEvent(event_type, payload, partnership_id);

  return new Response(JSON.stringify({
    event_id: suiteEvent.id,
    event_type,
    side_effects: sideEffects,
    timestamp: new Date().toISOString(),
  }), { headers: { 'Content-Type': 'application/json' } });
});

// ─────────────────────────────────────────────────────────────
// ROUTER — side effects beyond DB triggers
// ─────────────────────────────────────────────────────────────
async function routeEvent(
  type: string,
  payload: Record<string, unknown>,
  partnershipId?: string
): Promise<string[]> {
  const effects: string[] = [];

  switch (type) {

    // ── MetriXs identified an opportunity gap ──────────────────
    case 'metrixs.opportunity_flagged': {
      // Refresh pro_metrixs_signals with latest data
      if (payload.pro_id) {
        await sb.from('pro_metrixs_signals').upsert({
          pro_id: payload.pro_id,
          avg_engagement_rate:   payload.avg_engagement_rate,
          top_platform:          payload.top_platform,
          total_monthly_reach:   payload.total_monthly_reach,
          avg_views_per_post:    payload.avg_views_per_post,
          monthly_revenue_cents: payload.monthly_revenue_cents,
          affiliate_setup:       payload.affiliate_setup,
          digital_products_count: payload.digital_products_count,
          brand_deals_active:    payload.brand_deals_active,
          computed_at:           new Date().toISOString(),
        });
        effects.push('pro_metrixs_signals.upserted');
      }
      break;
    }

    // ── MetriXs detected ghost money ──────────────────────────
    case 'metrixs.ghost_money_detected': {
      if (partnershipId && payload.source) {
        const { data: p } = await sb
          .from('partnerships')
          .select('pro_id')
          .eq('id', partnershipId)
          .single();

        if (p) {
          await sb.from('ghost_money').upsert({
            partnership_id:  partnershipId,
            pro_id:          p.pro_id,
            source:          payload.source,
            description:     payload.description,
            estimated_cents: payload.estimated_cents,
            status:          'unclaimed',
          }, { onConflict: 'partnership_id,source' });
          effects.push('ghost_money.detected');
        }
      }
      break;
    }

    // ── SalonFlow post published — update MetriXs cache ────────
    case 'salonflow.post_published': {
      if (payload.vault_asset_id && payload.metrixs_asset_id) {
        await sb.from('vault_assets').update({
          metrixs_asset_id: payload.metrixs_asset_id,
          metrixs_synced_at: new Date().toISOString(),
        }).eq('id', payload.vault_asset_id);
        effects.push('vault_asset.metrixs_linked');
      }
      break;
    }

    // ── SalonFlow campaign created — log to workroom ───────────
    case 'salonflow.campaign_created': {
      if (partnershipId) {
        await sb.from('workroom_activity').insert({
          partnership_id: partnershipId,
          actor_id:       payload.actor_user_id,
          activity_type:  'task_created',
          payload: {
            source:   'salonflow_campaign',
            message:  \`Campaign created in SalonFlow: \${payload.campaign_name}\`,
            platform: payload.platform,
          }
        });
        effects.push('workroom_activity.logged');
      }
      break;
    }

    // ── ProForma partnership activated → seed split rules ──────
    case 'proforma.partnership_activated': {
      if (partnershipId) {
        // Call the DB function to seed default 80/20 split rules
        await sb.rpc('seed_default_split_rules', { p_partnership_id: partnershipId });
        effects.push('revenue_split_rules.seeded');

        // Run initial match scoring
        const { data: partnership } = await sb
          .from('partnerships')
          .select('pro_id, manager_id')
          .eq('id', partnershipId)
          .single();

        if (partnership) {
          await sb.from('match_opportunities').upsert({
            pro_id:      partnership.pro_id,
            manager_id:  partnership.manager_id,
            status:      'surfaced',
            opportunity_score: 0,
            gap_coverage_pct:  0,
            skills_matched: [],
          }, { onConflict: 'pro_id,manager_id' });
          effects.push('match_opportunity.created');
        }
      }
      break;
    }

  }

  return effects;
}
`;

// ─────────────────────────────────────────────────────────────
// SALONFLOW SDK SNIPPET
// Drop this into SalonFlow's post-scheduling code
// Fires the event that auto-creates ProForma tasks
// ─────────────────────────────────────────────────────────────
export const salonflowIntegrationSnippet = `
// SalonFlow — Beauty ProForma Integration
// Add this to your post-scheduling success handler

import { createClient } from '@supabase/supabase-js';

const PROFORMA_URL = process.env.PROFORMA_SUPABASE_URL;
const PROFORMA_KEY = process.env.PROFORMA_SERVICE_KEY;

const proforma = createClient(PROFORMA_URL, PROFORMA_KEY);

export async function onPostScheduled(post: {
  id: string;
  title: string;
  platform: 'pinterest' | 'tiktok' | 'instagram';
  scheduled_at: string;
  partnership_id: string;
  actor_user_id: string;
  vault_asset_id?: string;
}) {
  // Fire-and-forget: SalonFlow doesn't wait for ProForma to respond
  fetch(\`\${PROFORMA_URL}/functions/v1/suite-dispatcher\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${PROFORMA_KEY}\`
    },
    body: JSON.stringify({
      source_app:     'salonflow',
      target_app:     'proforma',
      event_type:     'salonflow.post_scheduled',
      partnership_id: post.partnership_id,
      actor_user_id:  post.actor_user_id,
      payload: {
        salonflow_post_id: post.id,
        title:             post.title,
        platform:          post.platform,
        scheduled_at:      post.scheduled_at,
        vault_asset_id:    post.vault_asset_id,
      }
    })
  }).catch(err => console.warn('[proforma-integration] Event dispatch failed:', err));
  
  // SalonFlow continues normally regardless of ProForma response
}

// Usage in your scheduler:
// await schedulePost(postData);
// onPostScheduled({ ...postData, partnership_id, actor_user_id });
`;

// ─────────────────────────────────────────────────────────────
// METRIXS SDK SNIPPET
// Beauty MetriXs calls this to push signal data into ProForma
// ─────────────────────────────────────────────────────────────
export const metrixsIntegrationSnippet = `
// Beauty MetriXs — ProForma Integration
// Call this after computing a Pro's engagement signals

export async function pushOpportunitySignal(data: {
  pro_id: string;
  avg_engagement_rate: number;   // e.g. 8.4 (percent)
  top_platform: string;
  total_monthly_reach: number;
  avg_views_per_post: number;
  monthly_revenue_cents: number;
  affiliate_setup: boolean;
  digital_products_count: number;
  brand_deals_active: number;
}) {
  await fetch(\`\${PROFORMA_URL}/functions/v1/suite-dispatcher\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${PROFORMA_KEY}\`
    },
    body: JSON.stringify({
      source_app:  'metrixs',
      target_app:  'proforma',
      event_type:  'metrixs.opportunity_flagged',
      payload:     data,
    })
  });
}

// Ghost money detection
export async function reportGhostMoney(data: {
  partnership_id: string;
  source: string;          // 'amazon_storefront' | 'ltk' | 'brand_deal' | etc.
  description: string;
  estimated_cents: number;
}) {
  await fetch(\`\${PROFORMA_URL}/functions/v1/suite-dispatcher\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${PROFORMA_KEY}\`
    },
    body: JSON.stringify({
      source_app:     'metrixs',
      target_app:     'proforma',
      event_type:     'metrixs.ghost_money_detected',
      partnership_id: data.partnership_id,
      payload:        data,
    })
  });
}
`;

/*
================================================================
SUITE DATA FLOW SUMMARY
================================================================

BEAUTY METRIXS identifies the Value:
  → Computes engagement_rate, reach, monetization_gap
  → Pushes metrixs.opportunity_flagged to ProForma
  → ProForma stores in pro_metrixs_signals
  → opportunity_score computed automatically (GENERATED ALWAYS)
  → Manager Discovery Feed ranks Pros by opportunity_score

SALONFLOW executes the Distribution:
  → Manager schedules a post in SalonFlow
  → SalonFlow fires salonflow.post_scheduled to ProForma
  → DB trigger creates task_ledger row (status: Submitted)
  → Workroom activity feed updates in real-time
  → Pro sees task awaiting verification (not a screenshot — live)
  → Post publishes → salonflow.post_published → vault_asset linked to MetriXs

PROFORMA manages the Business:
  → Partnership records, Dignity Clause, split rules
  → proforma.partnership_activated → seeds 80/20 split rules
  → proforma.retainer_paid → logs to earnings_ledger
  → All three apps share partnership_id as the primary join key

KEY INVARIANT:
  partnership_id is the universal foreign key.
  Any event without a partnership_id is global (discovery, onboarding).
  Any event with a partnership_id is scoped to that shared workspace.

================================================================
*/
