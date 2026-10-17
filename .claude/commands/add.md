---
description: Add an advertiser, publication, draft order or placement.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this publisher. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Read the record first. Replace sample ids and dates with the operator's real instruction. Record only evidence already received or work already performed; never treat an instruction to record as permission to send or book advertising elsewhere.

Run:

```bash
node scripts/ad-sales.mjs add campaign --file=imports/order.json --actor="Operator" --json
```

The JSON fields for each record type are listed in docs/cli.md. New orders start in draft.

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, serves ads or changes a campaign in another platform.
