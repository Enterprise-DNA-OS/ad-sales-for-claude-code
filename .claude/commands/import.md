---
description: Import a mapped Salesforce Details Only report.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this publisher. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Read current records before stating a result. Keep currencies and original delivery separate from makegoods.

Run:

```bash
node scripts/ad-sales.mjs import salesforce --file=imports/placements.csv --map=examples/salesforce/mapping.json --actor="Operator" --dry-run --json
```

Inspect the dry run, resolve mapping and conflicts, then run the same command without --dry-run. One transaction imports the file. It does not import approval or delivery history.

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, serves ads or changes a campaign in another platform.
