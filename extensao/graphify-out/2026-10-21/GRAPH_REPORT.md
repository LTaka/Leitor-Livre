# Graph Report - extensao  (2026-10-21)

## Corpus Check
- 6 files · ~2,691 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 67 nodes · 102 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0bcb5886`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_panel.js|panel.js]]
- [[_COMMUNITY_manifest.json|manifest.json]]
- [[_COMMUNITY_content.js|content.js]]
- [[_COMMUNITY_speak|speak]]
- [[_COMMUNITY_suggested_key|suggested_key]]
- [[_COMMUNITY_background.js|background.js]]
- [[_COMMUNITY_stop|stop]]
- [[_COMMUNITY_popup.js|popup.js]]
- [[_COMMUNITY_read|read]]

## God Nodes (most connected - your core abstractions)
1. `speak()` - 10 edges
2. `load()` - 8 edges
3. `stop()` - 6 edges
4. `read()` - 6 edges
5. `widget()` - 5 edges
6. `ui()` - 5 edges
7. `toggle()` - 5 edges
8. `readCopiedInPanel()` - 5 edges
9. `report()` - 4 edges
10. `selection()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `speak()` --calls--> `report()`  [EXTRACTED]
  content.js → content.js  _Bridges community 6 → community 3_
- `readExternal()` --calls--> `selection()`  [EXTRACTED]
  content.js → content.js  _Bridges community 8 → community 2_
- `read()` --calls--> `widget()`  [EXTRACTED]
  content.js → content.js  _Bridges community 3 → community 8_
- `load()` --calls--> `ui()`  [EXTRACTED]
  content.js → content.js  _Bridges community 6 → community 2_
- `load()` --calls--> `speak()`  [EXTRACTED]
  content.js → content.js  _Bridges community 3 → community 2_

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "panel.js"
Cohesion: 0.20
Nodes (11): begin(), chosenVoice(), count(), jump(), next(), page(), paint(), readCopiedInPanel() (+3 more)

### Community 1 - "manifest.json"
Cohesion: 0.14
Nodes (13): action, default_popup, default_title, background, service_worker, content_scripts, description, manifest_version (+5 more)

### Community 2 - "content.js"
Cohesion: 0.48
Nodes (5): load(), readCopied(), readExternal(), segments(), toast()

### Community 3 - "speak"
Cohesion: 0.47
Nodes (6): clear(), jump(), marker(), scroll(), speak(), widget()

### Community 4 - "suggested_key"
Cohesion: 0.33
Nodes (6): description, suggested_key, commands, append-or-read-copied, default, mac

### Community 6 - "stop"
Cohesion: 0.67
Nodes (4): report(), stop(), toggle(), ui()

### Community 7 - "popup.js"
Cohesion: 0.60
Nodes (4): $(), autoHint(), reading, refresh()

### Community 8 - "read"
Cohesion: 1.00
Nodes (3): auto(), read(), selection()

## Knowledge Gaps
- **15 isolated node(s):** `reading`, `manifest_version`, `name`, `version`, `description` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `commands` connect `suggested_key` to `manifest.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `reading`, `manifest_version`, `name` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._