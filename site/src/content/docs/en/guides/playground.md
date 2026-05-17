---
title: Playground tour
description: How to compile Text DSL in the Fluxion Playground and inspect SVG preview plus JSON output.
---

The Playground is a compact browser editor that compiles Text DSL to `.fluxion.json` and immediately previews the result with the Web Runtime.

## Open it

- In the GitHub Pages build, it is published at `/playground/`.
- Locally, follow [Quickstart](./getting-started/) to build the `web/` runtime, then open `http://localhost:8000/web/`.

## Screen flow

1. Write animation text in the **Text DSL editor**.
2. When **Live compile** is enabled, the generated `.fluxion.json` updates automatically after edits.
3. Use **Compile** to compile the current input explicitly.
4. Inspect the rendered Scene Graph in the **SVG preview**.
5. Use **Play / Stop / Reset** and the scrubber to inspect the Timeline.
6. Read **Generated .fluxion.json** to see the IR passed to the Runtime.

## Try this sample

```text
scene width=1280 height=720 fps=60
text title "Fluxion Playground" at 640,120 size=40 fill="#e2e8f0"
circle dot r=44 at 260,380 fill="#38bdf8" stroke="#0f172a" strokeWidth=4

at 0s:
  show title
  show dot

play FadeIn(title) duration=0.6s
animate dot.x from 260 to 760 duration=1.4s easing=easeInOut
play FadeOut(title) duration=0.5s
```

## Next steps

- Read [Text DSL](../reference/text-dsl/) for authoring syntax.
- Read [Fluxion JSON / Scene Graph](../reference/ir/) for the compiled JSON structure.
- Read [Timeline](../reference/timeline/) and [Web Runtime](../reference/runtime/) for seek and playback behavior.
