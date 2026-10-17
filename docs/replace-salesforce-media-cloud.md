# Bring the placement order book across

## Export from Salesforce

Ask the Salesforce administrator for a report that has one row per advertising placement with stable advertiser, order, publication and placement identifiers. The advertising objects and report fields differ between Media Cloud implementations. Use the report's Export action, Details Only, CSV with Unicode UTF-8. [Salesforce's export walkthrough](https://trailhead.salesforce.com/content/learn/projects/create-reports-and-dashboards-for-sales-and-marketing-managers/manage-reported-data) documents that export path. The [Advertising Sales Management data model](https://help.salesforce.com/s/articleView?id=ind.media_ad_sales_management_learn_data_model.htm&language=en_US&type=5) describes advertiser, agency, placement and plan relationships; it does not promise the example column labels.

Export a small sample first. Remove subtotal and total rows. Use dates in YYYY-MM-DD, impression counts as whole numbers, and total placement fees as plain decimals without currency symbols or thousands separators. Keep the currency in its own column. Never mix currency within an order or import a CPM unit price as the total fee. This importer only supports impression-based placements.

## Map once, import with one command

Copy examples/salesforce/mapping.json to imports/mapping.json and set each value to an exact report header. Keep actual files under imports/ (ignored by git). All mapped headers are required; agency values may be empty. The publication channel is display, newsletter, video or audio. Currency is NZD, AUD or USD. A report formula or preparatory export transform can supply fields missing in your current report; do not invent missing facts.

```bash
node scripts/ad-sales.mjs import salesforce --file=imports/placements.csv --map=imports/mapping.json --actor="Operator" --dry-run --json
node scripts/ad-sales.mjs import salesforce --file=imports/placements.csv --map=imports/mapping.json --actor="Operator" --json
```

One transaction imports the entire file. A failed row rolls the file back. A repeated unchanged placement is skipped. A changed row or conflicting parent record stops for reconciliation instead of silently overwriting local work. Stable codes are required. New rows cannot be added to an order that is already booked or closed.

## What maps

Advertiser identity, name, agency and owner; order identity, name, currency and owner; publication identity, name and channel; placement identity, name, flight dates, impression goal, total fee and creative due date. Original source rows and their mapped fingerprints are preserved. Advertisers start with an outstanding review and orders start in draft.

## What remains to reconcile

Signed approvals, creative files, targeting, rate cards, audience forecasts, delivery reports, amendments, invoices, taxes, payment details, historical statuses, makegoods, comments and attachments are not reconstructed from this report. Keep the original export and source system while reconciling. Review each imported order against signed terms, add the evidence and only then record booking. Historical flights need a reviewed migration plan for their evidence; do not fabricate past approvals to pass a gate.

Compare order counts, placement counts and fees per currency before switching the desk. Run pacing and creative-chase, then render a working paper. The export command writes every current record as JSON including original source rows. It is a logical export, not an automatic restore tool. Maintain database backups and test restoration separately.

No full Media Cloud migration in a day is promised. After the mapping is checked, bringing the supported report across is one command. Enterprise DNA can handle the mapping, additional history and ad-server connections as scoped work.
