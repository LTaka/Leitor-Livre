# Graph Report - Leitor-Livre  (2026-11-24)

## Corpus Check
- 10 files · ~3,786 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 97 nodes · 140 edges · 20 communities (12 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c112ba9`
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
- [[_COMMUNITY_popup.js|popup.js]]
- [[_COMMUNITY_ui|ui]]
- [[_COMMUNITY_background.js|background.js]]
- [[_COMMUNITY_Local Audio Export|Local Audio Export]]
- [[_COMMUNITY_Leitor Livre Extension|Leitor Livre Extension]]
- [[_COMMUNITY_Automatic Page Reading|Automatic Page Reading]]
- [[_COMMUNITY_Browser Voice Export Limitation|Browser Voice Export Limitation]]
- [[_COMMUNITY_Side Panel Controls|Side Panel Controls]]
- [[_COMMUNITY_read|read]]
- [[_COMMUNITY_baseLang|baseLang]]

## God Nodes (most connected - your core abstractions)
1. `speak()` - 12 edges
2. `load()` - 9 edges
3. `widget()` - 6 edges
4. `stop()` - 6 edges
5. `read()` - 6 edges
6. `toggle()` - 6 edges
7. `report()` - 5 edges
8. `ui()` - 5 edges
9. `detectedLanguage()` - 5 edges
10. `readCopiedInPanel()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Open Side Panel Action` --references--> `Side Panel Interface`  [EXTRACTED]
  extensao/popup.html → extensao/panel.html

## Import Cycles
- None detected.

## Communities (20 total, 8 thin omitted)

### Community 0 - "panel.js"
Cohesion: 0.18
Nodes (16): baseLang(), begin(), chosenVoice(), count(), detectedLanguage(), fillLanguages(), jump(), next() (+8 more)

### Community 1 - "manifest.json"
Cohesion: 0.14
Nodes (13): action, default_popup, default_title, background, service_worker, content_scripts, description, manifest_version (+5 more)

### Community 2 - "Side Panel Interface"
Cohesion: 0.40
Nodes (5): Paste Text Action, Audio Export Setup, Side Panel Interface, Text Playback Controls, Open Side Panel Action

### Community 3 - "speak"
Cohesion: 0.33
Nodes (11): clear(), extensionAlive(), jump(), marker(), report(), scroll(), speak(), stop() (+3 more)

### Community 4 - "content.js"
Cohesion: 0.52
Nodes (5): auto(), read(), readCopied(), readExternal(), selection()

### Community 6 - "Leitor Livre 1.0 — Extensão edge/chrome"
Cohesion: 0.40
Nodes (4): Atualizar, Leitor Livre 1.0 — Extensão edge/chrome, Limite importante das vozes do navegador, Preparar a exportação local

### Community 9 - "popup.js"
Cohesion: 0.60
Nodes (4): autoHint(), reading, refresh(), $()

### Community 11 - "ui"
Cohesion: 0.33
Nodes (6): description, suggested_key, commands, append-or-read-copied, default, mac

### Community 18 - "read"
Cohesion: 0.67
Nodes (4): load(), segment(), segments(), toast()

### Community 19 - "baseLang"
Cohesion: 1.00
Nodes (3): baseLang(), langFor(), voiceFor()

## Knowledge Gaps
- **27 isolated node(s):** `reading`, `manifest_version`, `name`, `version`, `description` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `commands` connect `ui` to `manifest.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `reading`, `manifest_version`, `name` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._