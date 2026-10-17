create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table advertisers (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 owner text not null, agency text not null default '', verified_on date, verification_reference text not null default '',
 review_due date not null, retention_reason text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table publications (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 channel text not null check(channel in ('display','newsletter','video','audio')), owner text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table campaigns (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 advertiser_id uuid not null references advertisers(id), owner text not null,
 currency text not null check(currency in ('NZD','AUD','USD')), status text not null default 'draft' check(status in ('draft','booked','closed','cancelled')),
 booked_on date, authorisation_reference text not null default '', closed_on date, close_reference text not null default '',
 cancellation_reason text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status not in ('booked','closed') or (booked_on is not null and length(trim(authorisation_reference))>0)),
 check(status<>'closed' or (closed_on is not null and length(trim(close_reference))>0)),
 check(status<>'cancelled' or length(trim(cancellation_reason))>0)
);
create table placements (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 campaign_id uuid not null references campaigns(id), publication_id uuid not null references publications(id),
 start_on date not null, end_on date not null, goal integer not null check(goal>0),
 fee_cents bigint not null check(fee_cents>=0 and fee_cents<=9007199254740991), creative_due date not null,
 approved_on date, creative_reference text not null default '', substantiation_reference text not null default '',
 source_row jsonb, source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_on>=start_on), check(creative_due<=end_on),
 check(approved_on is null or (length(trim(creative_reference))>0 and length(trim(substantiation_reference))>0))
);
create table deliveries (
 id uuid primary key default gen_random_uuid(), placement_id uuid not null references placements(id),
 delivered_on date not null, impressions integer not null check(impressions>0), evidence text not null check(length(trim(evidence))>0),
 reference text not null unique, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(placement_id,delivered_on)
);
create table makegoods (
 id uuid primary key default gen_random_uuid(), code text not null unique, placement_id uuid not null references placements(id),
 units integer not null check(units>0), due_on date not null, owner text not null,
 acceptance_reference text not null check(length(trim(acceptance_reference))>0), status text not null default 'open' check(status in ('open','completed')),
 completed_on date, evidence text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'completed' or (completed_on is not null and length(trim(evidence))>0))
);
create table notes (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references campaigns(id), actor text not null, body text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), actor text not null, event text not null, record_id uuid not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index placements_campaign on placements(campaign_id);
create index deliveries_placement on deliveries(placement_id);
create index makegoods_placement on makegoods(placement_id);
do $$ declare t text; begin
 foreach t in array array['advertisers','publications','campaigns','placements','deliveries','makegoods','notes','audit_events'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
create view placement_pacing as
select p.id,p.code,p.name,c.code campaign,a.name advertiser,c.owner,c.status,c.currency,p.fee_cents,
 u.name publication,p.start_on,p.end_on,p.goal,
 coalesce(d.delivered,0)::bigint delivered,
 greatest(0,p.goal-coalesce(d.delivered,0))::bigint shortfall,
 least(p.goal,ceil(p.goal::numeric * greatest(0,least(current_date,p.end_on)-p.start_on+1) / (p.end_on-p.start_on+1)))::bigint expected,
 coalesce(m.makegood_delivered,0)::bigint makegood_delivered,
 coalesce(m.open_makegoods,0)::integer open_makegoods,
 d.last_delivery,p.approved_on
from placements p join campaigns c on c.id=p.campaign_id join advertisers a on a.id=c.advertiser_id join publications u on u.id=p.publication_id
left join (select placement_id,sum(impressions) delivered,max(delivered_on) last_delivery from deliveries group by placement_id) d on d.placement_id=p.id
left join (select placement_id,sum(units) filter(where status='completed') makegood_delivered,count(*) filter(where status='open') open_makegoods from makegoods group by placement_id) m on m.placement_id=p.id;
create view creative_queue as
select p.code,c.code campaign,c.owner,p.creative_due,p.start_on,
 greatest(0,current_date-p.creative_due) days_overdue,p.creative_reference,p.substantiation_reference
from placements p join campaigns c on c.id=p.campaign_id where p.approved_on is null and c.status in ('draft','booked');
create view order_book as
select c.id,c.code,c.name,a.name advertiser,c.owner,c.status,c.currency,count(p.id)::integer placements,
 coalesce(sum(p.fee_cents),0)::bigint fee_cents,min(p.start_on) start_on,max(p.end_on) end_on,
 count(p.id) filter(where p.approved_on is null)::integer creative_unapproved
from campaigns c join advertisers a on a.id=c.advertiser_id left join placements p on p.campaign_id=c.id group by c.id,a.name;
create view record_checks as
select code,name,verified_on,review_due,
 (verified_on is null or trim(verification_reference)='') accuracy_check_missing,
 (review_due<current_date or trim(retention_reason)='') retention_review_due
from advertisers;
