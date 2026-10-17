---
description: Record accuracy and retention reviews already performed.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this publisher. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Read the record first. Replace sample ids and dates with the operator's real instruction. Record only evidence already received or work already performed; never treat an instruction to record as permission to send or book advertising elsewhere.

Run:

```bash
node scripts/ad-sales.mjs review-advertiser ADV-101 --on=YYYY-MM-DD --due=YYYY-MM-DD --reference="Account review record" --reason="Current order relationship" --actor="Operator" --json
```



Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, serves ads or changes a campaign in another platform.
