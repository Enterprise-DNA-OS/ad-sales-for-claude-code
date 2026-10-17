# CLI reference

Run node scripts/ad-sales.mjs --help. Output is an aligned table by default or JSON with --json. Options use --key=value; --json and --dry-run are valueless. Unknown options fail. Ambiguous record names list ids and exit 1. Exact codes, case-insensitive names and partial ids work.

All writes require --actor. Every CLI invocation has one database transaction. Failed writes and dry-run imports roll back. There is no implicit migration or seeding.

## Add records

node scripts/ad-sales.mjs add <kind> --file=<file.json> --actor="Operator" --json

JSON fields:

- advertiser: code, name, owner, agency (optional), review_due.
- publication: code, name, owner, channel (display, newsletter, video or audio).
- campaign: code, name, advertiser (id, code or name), owner, currency (NZD, AUD or USD).
- placement: code, name, campaign, publication, start_on, end_on, goal, fee_cents, creative_due. Only draft orders accept new placements.

Dates are valid YYYY-MM-DD dates. Goals and delivery units are positive whole impression counts. Fees are nonnegative integer cents. All other inputs are required unless marked optional. Unknown JSON fields fail.

## Writes and evidence

### add

`node scripts/ad-sales.mjs add campaign --file=imports/order.json --actor="Operator" --json`

Add an advertiser, publication, draft order or placement.

### log

`node scripts/ad-sales.mjs log IO-101 --note="Reviewed the delivery report" --actor="Operator" --json`

Record an internal order note.

### review-advertiser

`node scripts/ad-sales.mjs review-advertiser ADV-101 --on=YYYY-MM-DD --due=YYYY-MM-DD --reference="Account review record" --reason="Current order relationship" --actor="Operator" --json`

Record accuracy and retention reviews already performed.

### approve-creative

`node scripts/ad-sales.mjs approve-creative PL-102 --on=YYYY-MM-DD --reference="Approved creative version" --substantiation="Reviewed claims evidence or documented no-claims review" --actor="Operator" --json`

Record a human creative review and substantiation evidence.

### book-order

`node scripts/ad-sales.mjs book-order IO-102 --on=YYYY-MM-DD --reference="Signed insertion order" --actor="Operator" --json`

Record advertiser authorisation already received.

### record-delivery

`node scripts/ad-sales.mjs record-delivery PL-101 --on=YYYY-MM-DD --units=10000 --reference="Unique daily report id" --evidence="Serving report reference" --actor="Operator" --json`

Record evidenced daily impressions.

### propose-makegood

`node scripts/ad-sales.mjs propose-makegood PL-103 --code=MG-NEW --units=1000 --due=YYYY-MM-DD --owner="Operator" --reference="Advertiser acceptance" --actor="Operator" --json`

Record accepted replacement impressions for an ended flight.

### complete-makegood

`node scripts/ad-sales.mjs complete-makegood MG-101 --on=YYYY-MM-DD --evidence="Replacement delivery report" --actor="Operator" --json`

Record evidence that replacement impressions were delivered.

### close-order

`node scripts/ad-sales.mjs close-order IO-103 --on=YYYY-MM-DD --reference="Reconciled order review" --actor="Operator" --json`

Close a reconciled order.

### cancel-order

`node scripts/ad-sales.mjs cancel-order IO-DRAFT --reason="Advertiser withdrew draft" --actor="Operator" --json`

Cancel a draft order.

Booking must follow the recorded creative approval and be on or before each flight's start. Delivery dates must be within the original flight and not in the future. A placement takes one aggregate delivery record per day; every source reference is unique. Record corrections through a reviewed migration or a customised adjustment workflow rather than duplicating a report.

Makegoods require an ended booked flight. Total promised replacement impressions cannot exceed the original shortfall. Completion means the agreed number has been delivered, with a separate source evidence reference. Original delivery and replacement impressions stay separate. Closure must follow the original flight and any completed makegoods, and requires no unresolved shortfall or open makegood. Only draft orders can be cancelled.

## Reads, drafts and export

- /advertisers: Read advertisers, agency relationships and record review dates.
- /publications: Read the publisher properties and channels.
- /order-book: Review the insertion order book.
- /placements: Read flight dates, impression goals and agreed fees.
- /creative-chase: Chase missing creative reviews.
- /pacing: Compare recorded delivery with straight-line flight progress.
- /makegood-review: Review replacement impressions promised after underdelivery.
- /month-end: Review order value separately by currency and status.
- /attention: Find overdue creative, shortfalls, makegoods and record reviews.
- /compliance: Check creative evidence and advertiser record reviews.
- /history: Read recorded changes.
- /campaign: Read one order with placements, makegoods and notes.
- /insights: Answer ten cross-record questions.
- /import: Import a mapped Salesforce Details Only report.
- /export: Export every record and source row.
- /weekly-review: Draft the Monday review from pacing, creative and makegoods.
- /draft-order: Draft an insertion order working paper.
- /view: Render branded read-only dashboards.
- /documents: Render insertion orders, delivery statements and makegood papers.
- /customise: Change fields and rules to fit the publisher.
- /new-view: Add a read-only report from a question.

month-end groups total order value by current status and currency, across the entire register. It is an operations reconciliation, not a monthly revenue-recognition schedule. Pacing uses an even daily target including the current day, rounded up; it is not an inventory forecast. Export refuses to overwrite an existing file. Make the destination directory first. weekly-review and draft-order create unique local files under drafts/.
