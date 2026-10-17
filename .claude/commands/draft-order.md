---
description: Draft an insertion order working paper.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this publisher. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Read current records before stating a result. Keep currencies and original delivery separate from makegoods.

Run:

```bash
node scripts/ad-sales.mjs draft-order IO-101 --json
```



Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, serves ads or changes a campaign in another platform.
