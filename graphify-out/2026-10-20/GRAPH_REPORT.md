# Graph Report - Leitor-Livre  (2026-10-20)

## Corpus Check
- 10 files · ~2,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 70 nodes · 86 edges · 18 communities (10 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b6617de3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_panel.js|panel.js]]
- [[_COMMUNITY_manifest.json|manifest.json]]
- [[_COMMUNITY_Side Panel Interface|Side Panel Interface]]
- [[_COMMUNITY_speak|speak]]
- [[_COMMUNITY_content.js|content.js]]
- [[_COMMUNITY_native_host.py|native_host.py]]
- [[_COMMUNITY_Leitor Livre 1.0 — Extensão edgechrome|Leitor Livre 1.0 — Extensão edge/chrome]]
- [[_COMMUNITY_instalar.sh|instalar.sh]]
- [[_COMMUNITY_ui|ui]]
- [[_COMMUNITY_Local Audio Export|Local Audio Export]]
- [[_COMMUNITY_Leitor Livre Extension|Leitor Livre Extension]]
- [[_COMMUNITY_Automatic Page Reading|Automatic Page Reading]]
- [[_COMMUNITY_Browser Voice Export Limitation|Browser Voice Export Limitation]]
- [[_COMMUNITY_Side Panel Controls|Side Panel Controls]]

## God Nodes (most connected - your core abstractions)
1. `speak()` - 9 edges
2. `load()` - 7 edges
3. `read()` - 6 edges
4. `widget()` - 5 edges
5. `ui()` - 5 edges
6. `stop()` - 5 edges
7. `selection()` - 4 edges
8. `clear()` - 4 edges
9. `readExternal()` - 4 edges
10. `toggle()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Open Side Panel Action` --references--> `Side Panel Interface`  [EXTRACTED]
  extensao/popup.html → extensao/panel.html

## Import Cycles
- None detected.

## Communities (18 total, 8 thin omitted)

### Community 0 - "panel.js"
Cohesion: 0.22
Nodes (7): begin(), chosenVoice(), jump(), next(), paint(), split(), stop()

### Community 1 - "manifest.json"
Cohesion: 0.14
Nodes (13): action, default_popup, default_title, background, service_worker, content_scripts, description, manifest_version (+5 more)

### Community 2 - "Side Panel Interface"
Cohesion: 0.40
Nodes (5): Paste Text Action, Audio Export Setup, Side Panel Interface, Text Playback Controls, Open Side Panel Action

### Community 3 - "speak"
Cohesion: 0.43
Nodes (7): clear(), jump(), marker(), scroll(), speak(), stop(), widget()

### Community 4 - "content.js"
Cohesion: 0.44
Nodes (7): auto(), load(), read(), readCopied(), readExternal(), segments(), selection()

### Community 6 - "Leitor Livre 1.0 — Extensão edge/chrome"
Cohesion: 0.40
Nodes (4): Atualizar, Leitor Livre 1.0 — Extensão edge/chrome, Limite importante das vozes do navegador, Preparar a exportação local

## Knowledge Gaps
- **22 isolated node(s):** `manifest_version`, `name`, `version`, `description`, `permissions` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `manifest_version`, `name`, `version` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._