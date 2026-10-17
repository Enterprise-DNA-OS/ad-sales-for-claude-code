insert into advertisers(id,code,name,owner,agency,verified_on,verification_reference,review_due,retention_reason) values
 ('10000000-0000-0000-0000-000000000001','ADV-101','Harbour Outdoors Demo','Mia','South Agency Demo',current_date-8,'Demo account review',current_date+90,'Active demo campaign'),
 ('10000000-0000-0000-0000-000000000002','ADV-102','Southern Coffee Demo','Tom','',null,'',current_date-4,'') on conflict do nothing;
insert into publications(id,code,name,channel,owner) values
 ('20000000-0000-0000-0000-000000000001','PUB-101','Coast Daily Demo','display','Rae'),
 ('20000000-0000-0000-0000-000000000002','PUB-102','Coast Weekend Demo','newsletter','Rae') on conflict do nothing;
insert into campaigns(id,code,name,advertiser_id,owner,currency,status,booked_on,authorisation_reference) values
 ('30000000-0000-0000-0000-000000000001','IO-101','Spring trail launch','10000000-0000-0000-0000-000000000001','Mia','NZD','booked',current_date-20,'Demo signed order 101'),
 ('30000000-0000-0000-0000-000000000002','IO-102','Coffee weekend','10000000-0000-0000-0000-000000000002','Tom','AUD','draft',null,''),
 ('30000000-0000-0000-0000-000000000003','IO-103','Trail clearance','10000000-0000-0000-0000-000000000001','Mia','NZD','booked',current_date-40,'Demo signed order 103') on conflict do nothing;
insert into placements(id,code,name,campaign_id,publication_id,start_on,end_on,goal,fee_cents,creative_due,approved_on,creative_reference,substantiation_reference) values
 ('40000000-0000-0000-0000-000000000001','PL-101','Trail display','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',current_date-10,current_date+9,100000,450000,current_date-12,current_date-13,'Demo creative v1','Demo claim substantiation pack'),
 ('40000000-0000-0000-0000-000000000002','PL-102','Coffee newsletter','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',current_date+2,current_date+8,20000,150000,current_date-2,null,'',''),
 ('40000000-0000-0000-0000-000000000003','PL-103','Clearance display','30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001',current_date-30,current_date-3,50000,225000,current_date-32,current_date-33,'Demo creative v2','Demo no objective product claims review') on conflict do nothing;
insert into deliveries(id,placement_id,delivered_on,impressions,evidence,reference,actor) values
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',current_date-9,20000,'Demo daily serving report','DEL-101','Demo operator'),
 ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003',current_date-4,40000,'Demo serving report','DEL-103','Demo operator') on conflict do nothing;
insert into makegoods(id,code,placement_id,units,due_on,owner,acceptance_reference) values
 ('60000000-0000-0000-0000-000000000001','MG-101','40000000-0000-0000-0000-000000000003',10000,current_date-1,'Mia','Demo advertiser replacement acceptance') on conflict do nothing;
