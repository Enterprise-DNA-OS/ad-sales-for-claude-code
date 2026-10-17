import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseCsv} from './csv.mjs';
import {add,audit,text,date,count,choice,today} from './domain.mjs';
export const mappingFields=['advertiser_code','advertiser_name','agency','owner','campaign_code','campaign_name','currency','publication_code','publication_name','channel','placement_code','placement_name','start_on','end_on','goal','fee','creative_due'];
export function cents(v){if(!/^\d+(\.\d{1,2})?$/.test(String(v)))throw Error('Money must be a plain nonnegative decimal with at most two places');const [a,b='']=String(v).split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n))throw Error('Money exceeds safe range');return n;}
export async function importSalesforce(db,file,mapFile,actor){
 text(actor,'actor');const mapping=JSON.parse(fs.readFileSync(text(mapFile,'map'),'utf8'));
 for(const k of mappingFields)text(mapping[k],'mapping.'+k);
 if(Object.keys(mapping).some(k=>!mappingFields.includes(k)))throw Error('Unknown mapping field');
 if(new Set(Object.values(mapping)).size!==mappingFields.length)throw Error('Map each field to a distinct column');
 const rows=parseCsv(fs.readFileSync(text(file,'file'),'utf8'));if(!rows.length)throw Error('CSV has no data rows');
 const seen=new Set();let imported=0,unchanged=0;
 const parent=async(kind,code,expected,create)=>{
  const existing=(await db.query(`select * from ${kind} where code=$1`,[code]))[0];
  if(existing){for(const [k,v]of Object.entries(expected))if(existing[k]!==v)throw Error(kind+' details conflict for '+code+': '+k);return existing;}
  return create();
 };
 for(const [i,raw] of rows.entries()){
  for(const col of Object.values(mapping))if(!(col in raw))throw Error('Missing mapped column '+col);
  const d=Object.fromEntries(mappingFields.map(k=>[k,raw[mapping[k]].trim()]));
  for(const k of mappingFields.filter(k=>k!=='agency'))text(d[k],`row ${i+2} ${k}`);
  date(d.start_on,'start_on');date(d.end_on,'end_on');date(d.creative_due,'creative_due');count(d.goal,'goal');cents(d.fee);choice(d.currency,['NZD','AUD','USD'],'currency');choice(d.channel,['display','newsletter','video','audio'],'channel');
  if(d.end_on<d.start_on||d.creative_due>d.end_on)throw Error('Invalid flight dates');
  if(seen.has(d.placement_code))throw Error('Duplicate placement in file: '+d.placement_code);seen.add(d.placement_code);
  const hash=createHash('sha256').update(JSON.stringify(d)).digest('hex');
  const old=(await db.query('select source_hash from placements where code=$1',[d.placement_code]))[0];
  if(old){if(old.source_hash!==hash)throw Error('Changed source or existing placement: '+d.placement_code+'; reconcile before importing');unchanged++;continue;}
  const a=await parent('advertisers',d.advertiser_code,{name:d.advertiser_name,agency:d.agency,owner:d.owner},()=>add(db,'advertiser',{code:d.advertiser_code,name:d.advertiser_name,agency:d.agency,owner:d.owner,review_due:today()},actor));
  const c=await parent('campaigns',d.campaign_code,{name:d.campaign_name,advertiser_id:a.id,owner:d.owner,currency:d.currency},()=>add(db,'campaign',{code:d.campaign_code,name:d.campaign_name,advertiser:a.id,owner:d.owner,currency:d.currency},actor));
  const p=await parent('publications',d.publication_code,{name:d.publication_name,channel:d.channel},()=>add(db,'publication',{code:d.publication_code,name:d.publication_name,channel:d.channel,owner:d.owner},actor));
  const pl=await add(db,'placement',{code:d.placement_code,name:d.placement_name,campaign:c.id,publication:p.id,start_on:d.start_on,end_on:d.end_on,goal:Number(d.goal),fee_cents:cents(d.fee),creative_due:d.creative_due},actor);
  await db.query('update placements set source_row=$1,source_hash=$2 where id=$3',[JSON.stringify(raw),hash,pl.id]);
  await audit(db,actor,'import salesforce',pl.id,{source_hash:hash,row:i+2});imported++;
 }
 return {imported,unchanged,warning:'Imported as draft. Approvals, delivery, attachments and makegoods are not inferred.'};
}
