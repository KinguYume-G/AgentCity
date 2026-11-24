# Global deployment

Canonical public URL: https://kinguyume-g.github.io/AgentCity/

Pages serves the main branch root. The runtime has no third-party CDN requests: the pinned Three.js r170 minified module is vendored with its upstream MIT license. All simulation and persistence remain local. HTTPS is required for service workers (localhost is an exception).

After a complete successful initial load, the service worker caches the release assets for offline use. Cache version and asset query strings must be incremented together for each release. Storage can be evicted by browsers. A first-time visitor still needs connectivity to the hosting domain.

## Verification
- Simulation tests: node --test tests/engine.test.cjs.
- Browser compatibility workflow: Chromium software WebGL, Firefox, WebKit, a narrow touch viewport, construction scenario interactions, persistence and offline reload. WebKit engine testing is not a physical iPhone test.
- Public site & global reachability workflow: manual or successful Pages deployment event. Checks the public URL and assets, then samples Globalping HTTP probes in US, DE, JP, SG, MY, CN, AU, BR and ZA, subject to probe availability and rate limits. Results are an artifact and job summary. Unknown is not success.
- A successful HTTP probe does not prove full browser playability, and no finite test proves reachability from every ISP. In particular, mainland China and restricted corporate networks require separate real-device tests.

If Pages itself is inaccessible, eliminating external CDNs cannot fix the host restriction. For a future production rollout, consider a custom domain and approved regional hosting/CDN strategy.
