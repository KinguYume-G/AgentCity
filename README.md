# AGENT CITY · Atlas Bay

A browser-based 3D city simulator with autonomous residents, utility-based decision-making and a simplified local economy.

**Version 0.4 — Living World**

- [Play on GitHub Pages](https://kinguyume-g.github.io/AgentCity/)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Features

- Four seeded scenarios, 169 or 361 total plots, 42–220 initial residents, migration and employment.
- Procedural coastal city, interactive WebGL 3D camera, dynamic daylight, weather, street-level exploration, demand-driven visual traffic, and Canvas 2D fallback.
- Resident needs, action utility scores, memories, social contacts, households, rent, and local state-based dialogue.
- Local market inventory, employer capital, abstract production, taxation and public spending.
- Weighted A* grid routing, travel time, transit policy, congestion indicator, city advisor, goals, construction and time controls.
- Browser saves and JSON export/import (including older version-1 saves).

The agents are rule/utility-driven, not LLM-powered. The economics are illustrative, not a validated economic model. Residents have modeled trips along weighted grid routes. Vehicle animations respond to road demand but are not a full vehicle microsimulation. Household members are co-resident groups, not full family genealogies.

## Run locally

No build step or npm install required. From the repository root:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Three.js 0.170.0 is loaded from a public CDN for 3D; a 2D fallback is available if that fails.

## Test

Node.js 20 or later:

```sh
node --test tests/engine.test.cjs
```

## Publish

In Settings > Pages, select **Deploy from a branch**, **main**, **/ (root)**, then Save. The site URL is https://kinguyume-g.github.io/AgentCity/ (the production entry point).

Existing local saves are scoped to the browser origin and storage key. For migration between deployments, use Export / Import when available.

## Layout

```
index.html            Application shell
src/engine.js         Autonomous agents and economy
src/app.js            UI, 2D fallback, storage
src/renderer3d.js     Three.js procedural 3D renderer
src/styles.css        Responsive interface
tests/                Simulation regression tests
docs/                 Architecture and roadmap
```

MIT license. Third-party dependencies retain their own licenses.
