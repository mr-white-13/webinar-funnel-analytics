-- Webinar Funnel Analytics v1 schema

create extension if not exists pgcrypto;

create table if not exists webinars (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source_system text,
  title text not null,
  webinar_key text unique,
  scheduled_at timestamptz,
  timezone text,
  host_name text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  email text,
  normalized_email text generated always as (lower(email)) stored,
  first_name text,
  last_name text,
  country text,
  external_user_id text,
  identity_status text not null default 'resolved',
  identity_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists people_normalized_email_idx on people(normalized_email) where normalized_email is not null;

create table if not exists person_external_identities (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  source_system text not null,
  identity_type text not null,
  identity_value text not null,
  is_primary boolean not null default false,
  confidence numeric(5,4) not null default 1.0,
  status text not null default 'resolved',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, identity_type, identity_value)
);
create index if not exists person_external_identities_person_idx on person_external_identities(person_id);
create index if not exists person_external_identities_lookup_idx on person_external_identities(source_system, identity_type, identity_value);

create table if not exists identity_resolution_queue (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  entity_type text not null,
  entity_external_id text,
  proposed_person_id uuid references people(id),
  matched_by text,
  confidence numeric(5,4),
  status text not null default 'pending',
  reason text,
  payload jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);
create index if not exists identity_resolution_queue_status_idx on identity_resolution_queue(status, created_at desc);

create table if not exists source_accounts (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  account_name text,
  external_id text not null,
  created_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  account_id uuid references source_accounts(id),
  external_id text not null,
  name text not null,
  channel text,
  objective text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists ad_sets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  source_system text not null,
  external_id text not null,
  name text not null,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  ad_set_id uuid references ad_sets(id),
  campaign_id uuid references campaigns(id),
  source_system text not null,
  external_id text not null,
  name text not null,
  creative_name text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists spend_daily (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_account_id uuid references source_accounts(id),
  campaign_id uuid references campaigns(id),
  ad_set_id uuid references ad_sets(id),
  ad_id uuid references ads(id),
  metric_date date not null,
  currency text,
  impressions integer,
  clicks integer,
  spend numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (source_system, campaign_id, ad_set_id, ad_id, metric_date)
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  external_id text,
  registered_at timestamptz not null,
  landing_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  ga_client_id text,
  gclid text,
  fbclid text,
  msclkid text,
  click_id text,
  session_id text,
  registration_email text,
  device_type text,
  country text,
  raw_source text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);
create index if not exists registrations_person_idx on registrations(person_id);
create index if not exists registrations_webinar_idx on registrations(webinar_id);
create index if not exists registrations_ga_client_idx on registrations(ga_client_id) where ga_client_id is not null;

create table if not exists webinar_attendance (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  external_id text,
  ga_client_id text,
  attended_live boolean not null default false,
  joined_at timestamptz,
  left_at timestamptz,
  minutes_watched numeric(10,2),
  watch_percent numeric(5,2),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists replay_views (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  external_id text,
  ga_client_id text,
  viewed_at timestamptz not null,
  minutes_watched numeric(10,2),
  watch_percent numeric(5,2),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (source_system, external_id)
);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  external_id text,
  email_campaign_id text,
  email_campaign_name text,
  message_id text,
  contact_external_id text,
  event_type text not null,
  occurred_at timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (source_system, external_id)
);
create index if not exists email_events_person_idx on email_events(person_id);

create table if not exists conversions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  external_id text,
  conversion_type text not null,
  product_name text,
  currency text,
  amount numeric(12,2),
  contact_external_id text,
  order_external_id text,
  raw_payload jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_id)
);
create index if not exists conversions_person_idx on conversions(person_id);

create table if not exists touchpoints (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  webinar_id uuid references webinars(id),
  source_system text not null,
  source_type text not null,
  external_id text,
  occurred_at timestamptz not null,
  session_id text,
  ga_client_id text,
  click_id text,
  gclid text,
  fbclid text,
  msclkid text,
  channel text,
  source text,
  medium text,
  campaign_name text,
  content text,
  term text,
  landing_url text,
  referrer text,
  campaign_id uuid references campaigns(id),
  ad_set_id uuid references ad_sets(id),
  ad_id uuid references ads(id),
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists touchpoints_person_idx on touchpoints(person_id, occurred_at);
create index if not exists touchpoints_identity_idx on touchpoints(ga_client_id, session_id, click_id);

create table if not exists attribution_snapshots (
  id uuid primary key default gen_random_uuid(),
  conversion_id uuid not null references conversions(id),
  model text not null,
  attributed_touchpoint_id uuid references touchpoints(id),
  attributed_source text,
  attributed_medium text,
  attributed_campaign text,
  campaign_id uuid references campaigns(id),
  ad_set_id uuid references ad_sets(id),
  ad_id uuid references ads(id),
  credit numeric(5,4) not null default 1.0,
  notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists attribution_snapshots_unique_idx on attribution_snapshots(conversion_id, model, credit, attributed_touchpoint_id);

create table if not exists connector_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  connector_name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rows_processed integer,
  error_message text,
  cursor_before text,
  cursor_after text
);

create table if not exists connector_cursors (
  connector_name text primary key,
  source_system text not null,
  cursor_value text,
  updated_at timestamptz not null default now()
);
