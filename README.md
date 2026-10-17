# Ad Sales for Claude Code

Insertion orders, creative reviews, delivery checks and makegoods in a database the publisher owns. MIT code from Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free code. Install, run the demo and map your export. Database hosting and coding-agent costs are yours. | Your placement fields, approval rules, delivery sources and Salesforce mapping. [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=salesforce-media-cloud&utm_medium=readme). | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=salesforce-media-cloud&utm_medium=readme). |

## From a signed order to evidenced delivery

A publisher promises impressions across a display property and a newsletter. The commercial desk needs the advertiser's authority, reviewed creative, delivery reports and a plan for any shortfall. This build keeps those records together and points to the work that needs attention.

Salesforce Media Cloud Advanced lists US$450 per user per month, billed annually. Ten seats would be US$54,000 a year at that list price. This is an illustrative scenario, not a verified customer invoice or a saving claim. [Vendor pricing](https://www.salesforce.com/media/cloud/pricing/), checked 17 October 2026.

The free desk covers internal order and delivery records. It does not serve advertisements, sell inventory in a marketplace, forecast audience availability, run auctions, bill advertisers or process payments. Keep serving and finance systems in place. This is not a full Media Cloud replacement out of the box.

## Quick start

Node 20 or newer. No server is needed for the embedded demo.

```bash
git clone https://github.com/Enterprise-DNA-OS/ad-sales-for-claude-code.git
cd ad-sales-for-claude-code
npm install
npm test
npm run demo
```

The demo ignores DATABASE_URL and uses .data/demo. Read it on Linux or macOS:

```bash
DATA_DIR=.data/demo node scripts/ad-sales.mjs pacing
DATA_DIR=.data/demo node scripts/ad-sales.mjs campaign IO-101 --json
DATA_DIR=.data/demo npm run view
DATA_DIR=.data/demo npm run docs
```

In PowerShell set $env:DATA_DIR='.data/demo' and run without the DATA_DIR prefix. For real records choose a fresh DATA_DIR, run npm run migrate, then import without seeding. DATABASE_URL selects your controlled PostgreSQL database. Never commit connection settings.

## Recurring work

| Job | Command |
|---|---|
| Read advertisers, agency relationships and record review dates | /advertisers |
| Read the publisher properties and channels | /publications |
| Review the insertion order book | /order-book |
| Read flight dates, impression goals and agreed fees | /placements |
| Chase missing creative reviews | /creative-chase |
| Compare recorded delivery with straight-line flight progress | /pacing |
| Review replacement impressions promised after underdelivery | /makegood-review |
| Review order value separately by currency and status | /month-end |
| Find overdue creative, shortfalls, makegoods and record reviews | /attention |
| Check creative evidence and advertiser record reviews | /compliance |
| Read recorded changes | /history |
| Read one order with placements, makegoods and notes | /campaign |
| Answer ten cross-record questions | /insights |
| Add an advertiser, publication, draft order or placement | /add |
| Record an internal order note | /log |
| Record accuracy and retention reviews already performed | /review-advertiser |
| Record a human creative review and substantiation evidence | /approve-creative |
| Record advertiser authorisation already received | /book-order |
| Record evidenced daily impressions | /record-delivery |
| Record accepted replacement impressions for an ended flight | /propose-makegood |
| Record evidence that replacement impressions were delivered | /complete-makegood |
| Close a reconciled order | /close-order |
| Cancel a draft order | /cancel-order |
| Import a mapped Salesforce Details Only report | /import |
| Export every record and source row | /export |
| Draft the Monday review from pacing, creative and makegoods | /weekly-review |
| Draft an insertion order working paper | /draft-order |
| Render branded read-only dashboards | /view |
| Render insertion orders, delivery statements and makegood papers | /documents |
| Change fields and rules to fit the publisher | /customise |
| Add a read-only report from a question | /new-view |

## Ten questions across the order book

The insights command executes these ten queries today. These cross-record questions are examples for the free desk, not a claim that a configured Salesforce report cannot answer them.

1. Which booked placements are behind a straight-line delivery target?
2. Which ended flights still owe impressions after completed makegoods?
3. Which creative approvals are late before the flight starts?
4. Which advertisers have both missing record reviews and unapproved creative?
5. Which publications carry the largest delivery shortfall?
6. What booked value is held by each owner in each currency?
7. Which live flights have no delivery evidence in the last seven days?
8. Which makegoods are overdue and who owns the follow-up?
9. Which booked orders have finished delivery and can be reviewed for closure?
10. Which draft orders have value waiting on creative approval?

## Your first hour: ten things to ask for

1. Show the placements falling behind delivery.
2. Show the creative reviews already overdue.
3. Read the complete IO-101 file.
4. Show ended flights with an unresolved shortfall.
5. List overdue makegoods by owner.
6. Show order value separately for each currency and status.
7. Draft Monday's review from delivery, creative and makegoods.
8. Put our business name and logo on the order working papers.
9. Test our placement export without saving any rows.
10. Add a trafficking owner and a report grouped by that owner.

## Import and export

```bash
node scripts/ad-sales.mjs import salesforce --file=examples/salesforce/placements.csv --map=examples/salesforce/mapping.json --actor="Operator" --dry-run --json
node scripts/ad-sales.mjs import salesforce --file=examples/salesforce/placements.csv --map=examples/salesforce/mapping.json --actor="Operator" --json
node scripts/ad-sales.mjs export --out=ad-sales-backup.json --json
```

Map your Salesforce Details Only placement report once, then import with one command. The example is a configured report shape, not a universal Salesforce export. Dates must be ISO, fees plain decimal totals and goals impression counts. Original rows are preserved. Unchanged repeat rows are skipped; changed rows stop for reconciliation. Advertisers, publications, orders and placements come across. Approvals, serving history, attachments and makegoods do not. Read the [switch guide](docs/replace-salesforce-media-cloud.md).

## Views, documents and controls

Set the business name, logo and colours in brand.json. npm run view renders the weekly order desk, delivery and record review. npm run docs creates insertion order working papers, delivery statements and makegood plans for each order. These are internal working papers until a person checks them against the signed terms. Drafts stay local.

Booking requires an advertiser record review, creative and claims evidence references, and advertiser authority. Record daily impressions with a unique source reference; a placement accepts one aggregate record per day. Makegoods are separately evidenced replacement impressions after the original flight. Closed orders require completed flights and no unresolved shortfall or open makegood. Fee totals are agreed order value, not recognised revenue, invoices, tax or collected cash. Pacing assumes even delivery through the flight including today; it does not predict future performance. Currency totals remain separate.

The [record checks](docs/compliance.md) are evidence prompts, not legal certification. An owner can change records and audit history. Shared use needs reviewed access and backups. There is no publisher login, ad-server connection, media upload, mobile approval workflow or live booking interface. [Why no front end](docs/why-no-front-end.md) explains the scope.

## Verification

npm test uses a temporary database and exercises every read and mutation, blocked transitions, duplicate daily delivery, closure after makegoods, money and date validation, import conflicts, rollback, dry runs, exports, drafts and escaped HTML. CI is configured for Windows and Linux on Node 20 and 22, plus PostgreSQL 17. TEST_DATABASE_URL must point to a disposable test database; the suite creates and drops its own schema.

## Licence

MIT. Copyright (c) 2026 Enterprise DNA. Salesforce is a trademark of Salesforce, Inc. This independent project is not affiliated with or endorsed by Salesforce.
