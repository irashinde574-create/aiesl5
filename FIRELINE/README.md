# FIRELINE — Fire-Aware Evacuation Simulator

A frontend-only educational simulator comparing grid-adapted BUG2, A*, and A* + D* Lite across a fixed two-floor building while a deterministic fire front changes the environment. No API keys or backend are required.

## Features
- Two predefined floors, fixed exits, and explicit paired stair cells.
- Click-to-place occupant; invalid cells are rejected without moving the previous selection.
- Office, narrow-corridor, and open-plan scenarios.
- Fire-first and simultaneous fire/evacuation modes, pause/resume, stop, reset, and speed control.
- Individual algorithm runs and shared-environment comparison mode.
- Dynamic obstacles, visible paths and agent markers, event log, and exactly five metrics: path length, compute time, exit reached, replans, and floor changes.
- Unit tests using Node's built-in test runner.

## Run locally
Prerequisites: a current browser and Node.js 18+ for tests. Python 3 is a convenient static server.

```bash
cd FIRELINE
npm test
npm run serve
```
Then open **http://localhost:8000** in a browser. Alternatively, run `python3 -m http.server 8000` from the project directory. ES modules should be served over HTTP rather than opened as a `file://` URL.

## Use
1. Choose a scenario.
2. Click a safe, walkable cell on either floor to place the occupant. The start is shared by all runs.
3. Choose **Fire first** to start fire before navigation, or **Fire + evacuation** to start fire as the run begins.
4. Use an individual Run button or Compare all algorithms. In comparison mode, all agents use the same evolving fire and one simulation clock.
5. Use **Ignite fire** to start/stop fire independently, **Pause** to freeze both fire and movement, **Stop** to halt progression while preserving state, and **Reset** to restore the scenario.
6. Enable **Dynamic obstacle** and click an eligible cell to add or remove an obstacle. Stop before changing occupant placement.

## Architecture
- `index.html`, `css/styles.css`: interface and responsive dark styling.
- `js/building.js`: shared two-floor grid, fixed exits, stair connectivity, passability, and edge costs.
- `js/fire.js`: deterministic fire progression and state cloning.
- `js/astar.js`: global shortest-path search on the shared graph, including a virtual goal linked to usable fixed exits.
- `js/bug2.js`: grid-adapted goal seeking and obstacle-boundary following with hit-point/progress checks and loop guards.
- `js/dstar-lite.js`: D* Lite's `g`, `rhs`, priority keys, `km`, predecessor updates, and incremental repair after changed cells.
- `js/algorithms.js`: run initialization, route invalidation, movement validation, and coordination between initial A* and D* Lite.
- `js/renderer.js`: Canvas rendering of actual cells, paths, and agent positions.
- `js/metrics.js`: execution metrics.
- `js/app.js`: single coordinated clock, UI events, fire updates, logs, and comparison table.
- `tests/`: unit tests for grid, fire, BUG2, A*, D* Lite, and metric basics.

## Algorithm notes
### BUG2
The implementation is a grid adaptation: it greedily progresses toward an exit using a Manhattan-style distance, switches to deterministic boundary-following when blocked or revisiting, remembers boundary states, and resumes goal-directed movement when it finds a better leave point. Grid cells replace continuous line/M-line geometry, so it is illustrative rather than a formal continuous-space BUG2 proof. It does not use A* to choose each movement step.

### A*
The planner searches the actual two-floor graph and connects valid fixed exits to a virtual goal. It uses a multi-exit Manhattan heuristic that estimates travel via paired stairs for cross-floor exits; the estimate is admissible for the four-neighbor grid and unit stair transitions. Safe cells cost 1; at-risk cells cost 3; burning and burned cells, walls, and obstacles are impassable. It replans when its next planned step becomes invalid.

### A* + D* Lite
A* calculates the initial route. D* Lite then maintains `g`/`rhs` values, a keyed priority queue, `km`, and updates affected vertices and predecessors when fire or dynamic obstacles alter traversal costs. The virtual goal is linked to usable exits. D* Lite repairs the existing search state instead of recreating the planner for each change. `Replans` counts environmental repair events, not every simulation tick.

## Fire assumptions and limitations
- This is a deterministic grid-based teaching model, not a physical model of heat, smoke, visibility, toxicity, structural collapse, or human behavior.
- Burning cells become burned on the next fire update. A deterministic subset of eligible orthogonal neighbors ignites each update, while nearby unignited cells can be marked at risk. The configured cross-floor behavior spreads fire through paired stair cells. Walls and obstacles block fire spread.
- At-risk cells are assigned a higher movement cost, but a cell becomes impassable once burning or burned.
- Comparison agents share one evolving fire. Their movement timing can therefore affect when each encounters a changed environment.
- The simulation is not suitable for real emergency planning or life-safety decisions.
- Browser interaction has not been automated in a real browser in this build environment. Run the included unit tests and manually verify Canvas interaction in a browser.

## Metrics
Exactly five metrics are displayed: **Path Length** (actual grid transitions), **Compute Time** (initial planning plus measured replanning/repair work, excluding fire duration), **Exit Reached** (Reached / In Progress / Failed / No Route), **Replans** (after initial planning), and **Floor Changes** (actual stair transitions). Hazard Exposure is not implemented.

## Tests
```bash
npm test
```
Tests use Node's built-in `node:test`; no third-party packages are needed. Test results are reported separately with the project handoff. Manual browser testing is still required for visual layout and pointer interaction.
