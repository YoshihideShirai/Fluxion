---
title: Playground tour
description: How to compile Text DSL in the Fluxion Playground and inspect SVG preview plus JSON output.
---

The Playground is a compact browser editor that compiles Text DSL to `.fluxion.json` and immediately previews the result with the Web Runtime. It is the first path linked from the README and landing page.

## Open it

- In the GitHub Pages build, it is published at `/playground/`. Until the repository owner is known, the expected URL format is `https://<owner>.github.io/Fluxion/playground/`.
- Locally, follow [Getting Started](./getting-started/) to build the `web/` runtime, then open `http://localhost:8000/web/`.

## Text DSL input

Write animation text in the **Text DSL editor**. Use `scene` for canvas size and fps, then declare Scene Graph nodes with commands such as `text`, `math`, `circle`, `rect`, `line`, `path`, and `group`. Add Timeline operations with `show`, `hide`, `set`, `wait`, `play`, and `animate`.

The Text DSL compiles in the browser and does not execute arbitrary Python or JavaScript. Expressions are parsed as a small allowlisted arithmetic language.

## Compile

When **Live compile** is enabled, the generated `.fluxion.json` updates automatically after edits. Use **Compile** when you want to explicitly compile the current input. If there is a syntax error, check the status / error message near the editor, fix the referenced line, and compile again.

## Playback / scrub

After a successful compile, the **SVG preview** renders the Scene Graph. Use **Play / Stop / Reset** to play, pause, or reset the Timeline, and drag the scrubber to seek to a specific time. The Runtime reads the compiled JSON and applies timeline operations deterministically.

## Generated JSON

**Generated .fluxion.json** shows the Scene Graph, camera, value trackers, and Timeline operations passed to the Runtime. The Python DSL and Text DSL both produce this same IR, so this panel shows exactly what the browser preview consumes.

## Examples

The Playground ships with sample Text DSL and the `examples/simple_circle.fluxion.json` output generated from the Python DSL example. Start with this minimal sample to exercise compile, playback, scrub, and JSON inspection.

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

## Site build sync

`site/scripts/sync-playground.mjs` rebuilds `site/public/playground/` before the site build, then copies `web/index.html`, `web/dist/`, and `examples/simple_circle.fluxion.json` into it. The GitHub Pages workflow builds the `web/` runtime first so `web/dist/` exists, then runs the Astro build in `site/`; the synced playground is therefore included in the final Pages artifact at `/playground/`.

## Next steps

- Read [Text DSL reference](../reference/text-dsl/) for authoring syntax.
- Read [Fluxion JSON / Scene Graph](../reference/ir/) for the compiled JSON structure.
- Read [Timeline](../reference/timeline/) and [Web Runtime](../reference/runtime/) for seek and playback behavior.
