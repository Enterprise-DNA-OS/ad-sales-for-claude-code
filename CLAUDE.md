# Ad Sales for Claude Code: operating instructions

Read current records through the CLI. This is a publisher's internal advertising sales desk: insertion orders, creative reviews, daily delivery and makegoods. Set the publisher name, operator and priorities here at setup. The sample data is fictional.

## Routing

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

## Working rules

- One CLI: scripts/ad-sales.mjs. Read docs/cli.md for inputs. Every write needs --actor and runs inside a transaction. Actor text records attribution; it is not authentication.
- Record evidence already received. Never fabricate advertiser authority, creative approval, claims substantiation or delivery.
- Never send, place an ad, charge, delete or change an external platform. Drafts go to drafts/ and a person decides what to share.
- Use an exact id when a name is ambiguous. Dates use YYYY-MM-DD. Every goal and delivery is an impression count. Never add different currencies.
- DATABASE_URL selects your controlled PostgreSQL database; otherwise DATA_DIR selects embedded PGlite. Use only the publisher's authorised database. Never commit connection settings or real exports.
- Demo and tests force isolated storage. Production setup is migrate then import, without seed. Shared use needs reviewed access, backups and restore drills.
- An import is a mapped placement report, not a full Salesforce tenant migration. It creates drafts and preserves original rows. Changed repeated rows stop for reconciliation.
- Existing migrations are immutable once applied. Customise through a new numbered migration, update commands and reports, then run npm test.
- No claim that the checks certify compliance or replace professional review. Read docs/compliance.md.

## Storage

supabase/migrations holds the schema, views.json and documents.json the read-only reports, brand.json the publisher's branding. The database is the source of truth. The database owner can edit records and audit history; this is not tamper-proof evidence.

Built and run as a managed service through Omni by Enterprise DNA. https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=salesforce-media-cloud
