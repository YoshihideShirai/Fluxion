---
title: Examples
description: Repository examples and recommended paths for trying Fluxion authoring flows.
---

Examples connect the authoring docs to concrete files in the repository.

## Python example

`examples/simple_circle.py` builds a small scene with Python DSL and exports `examples/simple_circle.fluxion.json`.

```bash
PYTHONPATH=python python examples/simple_circle.py
```

Use it to verify the Python DSL → Fluxion JSON → Web Runtime path.

## Browser example

The Playground includes a Text DSL editor. Paste snippets from [Text DSL](../reference/text-dsl/) or [Playground tour](./playground/) and compile them directly in the browser.

## Suggested learning order

1. Run [Quickstart](./getting-started/) to generate and preview the sample IR.
2. Modify `examples/simple_circle.py` with the [Python DSL](./python-dsl/) concepts.
3. Recreate a similar animation in [Text DSL](../reference/text-dsl/).
4. Compare both outputs with [Fluxion JSON / Scene Graph](../reference/ir/) and [Timeline](../reference/timeline/).
