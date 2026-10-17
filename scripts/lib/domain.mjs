import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {REPO_ROOT} from './db.mjs';
import {table} from './format.mjs';
export const tables=['advertisers','publications','campaigns','placements','deliveries','makegoods','notes','audit_events'];
export const reads={
 advertisers:'select code,name,owner,agency,verified_on,review_due from advertisers order by code',
 publications:'select code,name,channel,owner from publications order by code',
 'order-book':'select code,name,advertiser,owner,status,currency,fee_cents,start_on,end_on,creative_unapproved from order_book order by code',
 placements:'select code,campaign,publication,start_on,end_on,goal,currency,fee_cents from placement_pacing order by code',
 'creative-chase':'select * from creative_queue order by creative_due,code',
 pacing:"select code,campaign,publication,goal,delivered,expected,shortfall,last_delivery,end_on from placement_pacing where status='booked' order by end_on,code",
 'makegood-review':`select m.code,p.code placement,c.code campaign,m.owner,m.units,m.due_on,m.status,m.completed_on,m.evidence from makegoods m join placements p on p.id=m.placement_id join campaigns c on c.id=p.campaign_id order by m.due_on,m.code`,
 'month-end':`select currency,status,count(*)::integer orders,sum(fee_cents)::bigint fee_cents from order_book where status<>'cancelled' group by currency,status order by currency,status`,
 attention:`select 'Creative overdue' issue,code record,owner,creative_due due from creative_queue where days_overdue>0
 union all select 'Flight ended short',code,owner,end_on from placement_pacing where status='booked' and end_on<current_date and shortfall>makegood_delivered
 union all select 'Makegood overdue',code,owner,due_on from makegoods where status='open' and due_on<current_date
 union all select 'Account review',a.code,a.owner,r.review_due from record_checks r join advertisers a on a.code=r.code where r.accuracy_check_missing or r.retention_review_due order by due,record`,
 compliance:`select 'Accuracy evidence missing' issue,code record,'NZ IPP8' rule from record_checks where accuracy_check_missing
 union all select 'Retention review required',code,'NZ IPP9' from record_checks where retention_review_due
 union all select 'Creative review missing',code,'NZ ASA truthful presentation: evidence workflow' from creative_queue order by record,issue`,
 history:'select actor,event,record_id,detail,created_at from audit_events order by created_at,id'
};
export const questions=[
 ['Which booked placements are behind a straight-line delivery target?',"select code,campaign,goal,delivered,expected from placement_pacing where status='booked' and delivered<expected order by code"],
 ['Which ended flights still owe impressions after completed makegoods?',"select code,campaign,shortfall,makegood_delivered from placement_pacing where status='booked' and end_on<current_date and shortfall>makegood_delivered order by code"],
 ['Which creative approvals are late before the flight starts?',"select code,campaign,owner,creative_due,start_on from creative_queue where creative_due<current_date and start_on>=current_date order by code"],
 ['Which advertisers have both missing record reviews and unapproved creative?',`select a.code,a.name,p.code placement from advertisers a join record_checks r on r.code=a.code join campaigns c on c.advertiser_id=a.id join placements p on p.campaign_id=c.id where (r.accuracy_check_missing or r.retention_review_due) and p.approved_on is null and c.status in ('draft','booked') order by a.code,p.code`],
 ['Which publications carry the largest delivery shortfall?',"select publication,sum(shortfall)::bigint shortfall from placement_pacing where status='booked' group by publication order by sum(shortfall) desc,publication"],
 ['What booked value is held by each owner in each currency?',"select owner,currency,sum(fee_cents)::bigint fee_cents from order_book where status='booked' group by owner,currency order by owner,currency"],
 ['Which live flights have no delivery evidence in the last seven days?',"select code,campaign,start_on,last_delivery from placement_pacing where status='booked' and start_on<=current_date and end_on>=current_date and (last_delivery is null or last_delivery<current_date-7) order by code"],
 ['Which makegoods are overdue and who owns the follow-up?',"select code,owner,units,due_on from makegoods where status='open' and due_on<current_date order by due_on,code"],
 ['Which booked orders have finished delivery and can be reviewed for closure?',`select c.code,c.name from campaigns c where c.status='booked' and exists(select 1 from placements p where p.campaign_id=c.id) and not exists(select 1 from placement_pacing p join placements x on x.id=p.id where x.campaign_id=c.id and (p.end_on>=current_date or p.shortfall>p.makegood_delivered or p.open_makegoods>0)) order by c.code`],
 ['Which draft orders have value waiting on creative approval?',"select code,advertiser,owner,currency,fee_cents,creative_unapproved from order_book where status='draft' and creative_unapproved>0 order by code"]
];
export function text(v,label){if(typeof v!=='string'||!v.trim())throw Error(label+' is required');return v.trim();}
export function integer(v,label,{positive=false}={}){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||(positive&&Number(v)===0))throw Error(label+' must be a '+(positive?'positive':'nonnegative')+' safe integer');return Number(v);}
export function count(v,label){const n=integer(v,label,{positive:true});if(n>2147483647)throw Error(label+' exceeds supported integer range');return n;}
export function date(v,label){text(v,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(label+' must be a valid YYYY-MM-DD');return v;}
export const today=()=>new Date().toISOString().slice(0,10);
export function past(v,label){date(v,label);if(v>today())throw Error(label+' cannot be in the future');return v;}
export function keys(obj,allowed){if(!obj||Array.isArray(obj)||typeof obj!=='object')throw Error('Expected an object');for(const k of Object.keys(obj))if(!allowed.includes(k))throw Error('Unknown field '+k);}
export function choice(v,allowed,label){if(!allowed.includes(v))throw Error(label+' must be '+allowed.join(', '));return v;}
export function human(v){if(Array.isArray(v)){if(!v.length)return '(none)';return table(v,Object.keys(v[0]).map(key=>({key,label:key.replace(/_cents$/,'').replaceAll('_',' '),format:x=>x==null?'':key.endsWith('_cents')?(Number(x)/100).toFixed(2):typeof x==='object'?JSON.stringify(x):x})));}if(v&&typeof v==='object')return Object.entries(v).map(([k,x])=>k+'\n'+(typeof x==='object'?human(x):x)).join('\n\n');return String(v);}
export async function resolve(db,kind,term){
 if(!['advertisers','publications','campaigns','placements','makegoods'].includes(kind))throw Error('Unsupported record type');text(term,'record');
 const all=await db.query(`select * from ${kind} order by id`),q=term.toLowerCase();
 let found=all.filter(r=>r.id===q||r.code.toLowerCase()===q||r.name?.toLowerCase()===q);
 if(!found.length)found=all.filter(r=>r.id.startsWith(q)||r.code.toLowerCase().includes(q)||r.name?.toLowerCase().includes(q));
 if(found.length!==1)throw Error((found.length?'Ambiguous record. Choose an id:':'No matching record. Available records:')+'\n'+human((found.length?found:all).map(r=>({id:r.id,code:r.code,name:r.name||r.code}))));
 return found[0];
}
export async function insert(db,kind,obj){if(!tables.includes(kind))throw Error('Unknown entity');const cols=Object.keys(obj);return (await db.query(`insert into ${kind}(${cols.join(',')}) values(${cols.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(obj)))[0];}
export async function audit(db,actor,event,id,detail){await insert(db,'audit_events',{actor:text(actor,'actor'),event,record_id:id,detail:JSON.stringify(detail)});}
async function accountReady(db,id){const a=(await db.query('select * from advertisers where id=$1 for update',[id]))[0];if(!a.verified_on||!a.verification_reference.trim()||a.review_due<today()||!a.retention_reason.trim())throw Error('Review advertiser accuracy and retention first');}
export async function add(db,kind,d,actor){
 text(actor,'actor');let row;
 if(kind==='advertiser'){
  keys(d,['code','name','owner','agency','review_due']);row=await insert(db,'advertisers',{code:text(d.code,'code'),name:text(d.name,'name'),owner:text(d.owner,'owner'),agency:d.agency||'',review_due:date(d.review_due,'review_due')});
 }else if(kind==='publication'){
  keys(d,['code','name','channel','owner']);row=await insert(db,'publications',{code:text(d.code,'code'),name:text(d.name,'name'),channel:choice(d.channel,['display','newsletter','video','audio'],'channel'),owner:text(d.owner,'owner')});
 }else if(kind==='campaign'){
  keys(d,['code','name','advertiser','owner','currency']);const a=await resolve(db,'advertisers',d.advertiser);row=await insert(db,'campaigns',{code:text(d.code,'code'),name:text(d.name,'name'),advertiser_id:a.id,owner:text(d.owner,'owner'),currency:choice(d.currency,['NZD','AUD','USD'],'currency')});
 }else if(kind==='placement'){
  keys(d,['code','name','campaign','publication','start_on','end_on','goal','fee_cents','creative_due']);const c=await resolve(db,'campaigns',d.campaign),p=await resolve(db,'publications',d.publication);
  const locked=(await db.query('select * from campaigns where id=$1 for update',[c.id]))[0];if(locked.status!=='draft')throw Error('Add placements only to draft orders');
  const start=date(d.start_on,'start_on'),end=date(d.end_on,'end_on'),due=date(d.creative_due,'creative_due');if(end<start||due>end)throw Error('Invalid flight or creative dates');
  row=await insert(db,'placements',{code:text(d.code,'code'),name:text(d.name,'name'),campaign_id:c.id,publication_id:p.id,start_on:start,end_on:end,goal:count(d.goal,'goal'),fee_cents:integer(d.fee_cents,'fee_cents'),creative_due:due});
 }else throw Error('add requires advertiser, publication, campaign or placement');
 await audit(db,actor,'add '+kind,row.id,d);return row;
}
export const mutations=['add','log','review-advertiser','approve-creative','book-order','record-delivery','propose-makegood','complete-makegood','close-order','cancel-order'];
export async function run(db,cmd,term,f={}){
 if(reads[cmd]){if(term)throw Error('This read takes no record');return db.query(reads[cmd]);}
 if(cmd==='insights'){if(term)throw Error('insights takes no record');const out={};for(const [q,sql] of questions)out[q]=await db.query(sql);return out;}
 if(cmd==='campaign'){
  const c=await resolve(db,'campaigns',term);return {order:[c],placements:await db.query('select * from placement_pacing where campaign=$1 order by code',[c.code]),makegoods:await db.query('select m.* from makegoods m join placements p on p.id=m.placement_id where p.campaign_id=$1 order by m.code',[c.id]),notes:await db.query('select actor,body,created_at from notes where campaign_id=$1 order by created_at',[c.id])};
 }
 if(cmd==='add')return add(db,term,JSON.parse(fs.readFileSync(text(f.file,'file'),'utf8')),f.actor);
 if(mutations.includes(cmd)){
  const actor=text(f.actor,'actor');let result;
  const kind=cmd==='review-advertiser'?'advertisers':['approve-creative','record-delivery','propose-makegood'].includes(cmd)?'placements':cmd==='complete-makegood'?'makegoods':'campaigns';
  let r=await resolve(db,kind,term),campaign;
  if(kind==='placements'||kind==='makegoods'){
   const p=kind==='placements'?r:(await db.query('select * from placements where id=$1',[r.placement_id]))[0];
   campaign=(await db.query('select * from campaigns where id=$1 for update',[p.campaign_id]))[0];
   if(['closed','cancelled'].includes(campaign.status))throw Error('Order is closed or cancelled');
  }
  r=(await db.query(`select * from ${kind} where id=$1 for update`,[r.id]))[0];
  if(kind==='campaigns')campaign=r;
  if(cmd==='review-advertiser'){
   const checked=past(f.on,'on'),due=date(f.due,'due');if(due<=today())throw Error('Next review must be in the future');
   result=(await db.query('update advertisers set verified_on=$1,verification_reference=$2,review_due=$3,retention_reason=$4 where id=$5 returning *',[checked,text(f.reference,'reference'),due,text(f.reason,'reason'),r.id]))[0];
  }
  if(cmd==='log')result=await insert(db,'notes',{campaign_id:r.id,actor,body:text(f.note,'note')});
  if(cmd==='approve-creative'){
   if(campaign.status!=='draft')throw Error('Creative changes require a draft order');if(r.approved_on)throw Error('Creative already approved');
   const on=past(f.on,'on');if(on>r.end_on)throw Error('Approval is after flight end');
   result=(await db.query('update placements set approved_on=$1,creative_reference=$2,substantiation_reference=$3 where id=$4 returning *',[on,text(f.reference,'reference'),text(f.substantiation,'substantiation'),r.id]))[0];
  }
  if(cmd==='book-order'){
   if(r.status!=='draft')throw Error('Only draft orders can be booked');await accountReady(db,r.advertiser_id);
   const ps=await db.query('select * from placements where campaign_id=$1',[r.id]);if(!ps.length||ps.some(p=>!p.approved_on))throw Error('All placements need creative approval');
   const on=past(f.on,'on');if(ps.some(p=>p.start_on<on||p.approved_on>on))throw Error('Booking must follow approval and precede flight start');
   result=(await db.query("update campaigns set status='booked',booked_on=$1,authorisation_reference=$2 where id=$3 returning *",[on,text(f.reference,'reference'),r.id]))[0];
  }
  if(cmd==='record-delivery'){
   if(campaign.status!=='booked')throw Error('Book the order before recording delivery');const on=past(f.on,'on');if(on<r.start_on||on>r.end_on)throw Error('Delivery date must be within the flight');
   result=await insert(db,'deliveries',{placement_id:r.id,delivered_on:on,impressions:count(f.units,'units'),evidence:text(f.evidence,'evidence'),reference:text(f.reference,'reference'),actor});
  }
  if(cmd==='propose-makegood'){
   if(campaign.status!=='booked'||r.end_on>=today())throw Error('Makegoods require an ended booked flight');
   const p=(await db.query('select * from placement_pacing where id=$1',[r.id]))[0];
   const promised=(await db.query('select coalesce(sum(units),0)::bigint units from makegoods where placement_id=$1',[r.id]))[0];
   const units=count(f.units,'units');if(Number(promised.units)+units>Number(p.shortfall))throw Error('Makegood units exceed remaining shortfall');
   const due=date(f.due,'due');if(due<=r.end_on)throw Error('Makegood must follow the original flight');
   result=await insert(db,'makegoods',{code:text(f.code,'code'),placement_id:r.id,units,due_on:due,owner:text(f.owner,'owner'),acceptance_reference:text(f.reference,'reference')});
  }
  if(cmd==='complete-makegood'){
   if(r.status!=='open')throw Error('Makegood already completed');const on=past(f.on,'on'),p=(await db.query('select * from placements where id=$1',[r.placement_id]))[0];if(on<=p.end_on)throw Error('Makegood delivery must follow original flight');
   result=(await db.query("update makegoods set status='completed',completed_on=$1,evidence=$2 where id=$3 returning *",[on,text(f.evidence,'evidence'),r.id]))[0];
  }
  if(cmd==='close-order'){
   if(r.status!=='booked')throw Error('Only booked orders can be closed');await accountReady(db,r.advertiser_id);
   const on=past(f.on,'on');const ps=await db.query('select * from placement_pacing where campaign=$1',[r.code]);
   if(!ps.length||ps.some(p=>p.end_on>=on||Number(p.shortfall)>Number(p.makegood_delivered)||p.open_makegoods>0))throw Error('Finish flights, delivery and makegoods before closure');
   const later=await db.query('select m.id from makegoods m join placements p on p.id=m.placement_id where p.campaign_id=$1 and m.completed_on>$2',[r.id,on]);if(later.length)throw Error('Closure predates makegood evidence');
   result=(await db.query("update campaigns set status='closed',closed_on=$1,close_reference=$2 where id=$3 returning *",[on,text(f.reference,'reference'),r.id]))[0];
  }
  if(cmd==='cancel-order'){
   if(r.status!=='draft')throw Error('Only draft orders can be cancelled');
   result=(await db.query("update campaigns set status='cancelled',cancellation_reason=$1 where id=$2 returning *",[text(f.reason,'reason'),r.id]))[0];
  }
  await audit(db,actor,cmd,r.id,f);return result;
 }
 if(cmd==='export'){
  const out={format:'ad-sales-v1',exported_at:new Date().toISOString()};for(const t of tables)out[t]=await db.query(`select * from ${t} order by id`);
  if(f.out){fs.writeFileSync(f.out,JSON.stringify(out,null,2)+'\n',{flag:'wx'});return {file:path.resolve(f.out),records:tables.reduce((n,t)=>n+out[t].length,0)};}return out;
 }
 if(cmd==='weekly-review'||cmd==='draft-order'){
  const sections={};if(cmd==='weekly-review')for(const c of ['pacing','creative-chase','makegood-review'])sections[c]=await run(db,c);else sections.campaign=await run(db,'campaign',term);
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`${cmd}-${randomUUID()}.md`);
  fs.writeFileSync(file,'# Internal draft: '+cmd+'\n\nGenerated '+today()+'. Review before sharing. No message sent.\n\n'+human(sections)+'\n',{flag:'wx'});return {file};
 }
 throw Error('Unknown command: '+cmd);
}
