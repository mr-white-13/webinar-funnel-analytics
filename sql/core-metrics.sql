-- Example core metrics queries for Webinar Funnel Analytics

-- 1. Funnel summary by webinar
select
  w.id,
  w.title,
  count(distinct r.id) as registrations,
  count(distinct case when a.attended_live then a.person_id end) as live_attendees,
  count(distinct rv.person_id) as replay_viewers,
  count(distinct c.person_id) as purchasers,
  coalesce(sum(distinct sd.spend), 0) as spend
from webinars w
left join registrations r on r.webinar_id = w.id
left join webinar_attendance a on a.webinar_id = w.id
left join replay_views rv on rv.webinar_id = w.id
left join conversions c on c.webinar_id = w.id and c.conversion_type in ('signup','purchase')
left join spend_daily sd on sd.metric_date between date(w.scheduled_at - interval '30 days') and date(w.scheduled_at)
group by 1,2;

-- 2. Spend and registrations by campaign
select
  c.name as campaign_name,
  sum(sd.spend) as spend,
  sum(sd.clicks) as clicks,
  count(distinct r.id) as registrations,
  case when count(distinct r.id) = 0 then null else sum(sd.spend) / count(distinct r.id) end as cpl
from campaigns c
left join spend_daily sd on sd.campaign_id = c.id
left join touchpoints t on t.campaign_id = c.id and t.source_type = 'registration'
left join registrations r on r.person_id = t.person_id and r.webinar_id = t.webinar_id
group by 1
order by spend desc;

-- 3. Last-touch purchases by source/campaign
select
  attributed_source,
  attributed_campaign,
  count(*) as conversions,
  sum(coalesce(conv.amount, 0)) as revenue
from attribution_snapshots a
join conversions conv on conv.id = a.conversion_id
where a.model = 'last_non_direct'
group by 1,2
order by revenue desc nulls last, conversions desc;
