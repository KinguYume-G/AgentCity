# Architecture

The static application runs entirely on each player's device. No account, server, database or LLM API is required. Three.js is loaded from a pinned CDN URL; Canvas 2D is the fallback.

## Simulation loop

Each simulated hour, the engine updates time, evaluates action utilities for each resident, selects an action, applies effects to needs and finances, and exposes a snapshot to the UI. Every day, migration, market restocking, fiscal costs, output tracking and events are processed.

Resident state includes home, work, savings, hunger, energy, happiness, health, skill, ambition, social connection, known resident IDs, decision scores and recent memories.

Markets maintain stock and business capital. Work produces abstract output and wages; food purchases transfer money to stores and the municipal budget. External production and grants inject money. This is a simplified open economy, not a closed accounting model or economic forecast.

## Components

- engine.js: seeded simulation, policy, construction, stats, persistence schema.
- app.js: DOM controls, Canvas fallback, inspector, local storage and save transfer.
- renderer3d.js: procedural geometry, instanced rendering, camera, lighting and selection.
- styles.css: responsive interface.

Render updates do not advance the simulation clock. Visual cars are decorative; individual travel and network congestion are future work. Resident decisions are utility-based, not language model inference.

## Testing and deployment

The engine is evaluated in Node without DOM or GPU dependencies. Static assets deploy to GitHub Pages; a browser/WebGL acceptance test is still required for each visual release.
