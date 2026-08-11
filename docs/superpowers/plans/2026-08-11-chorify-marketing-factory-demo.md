# Chorify Marketing Factory Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, browser-runnable Chorify Marketing Factory demo that preserves the existing Chorify shell while demonstrating the approved conversation-first video replication workflow.

**Architecture:** A framework-free static app keeps all interaction state in a pure immutable model, derives a compact view model for rendering, and uses one browser adapter for timers and DOM events. The landing page and progressive four-pane workbench share the same session/order data, while candidate and detail panes appear only when their state allows it.

**Tech Stack:** HTML, CSS, ES modules, Node.js built-in test runner, Vercel static deployment.

## Global Constraints

- Do not modify the company website or its source code.
- Do not introduce a mandatory project layer; one production conversation equals one replication order.
- Keep the structured configuration form inside the AI conversation.
- The first previewable candidate opens the results pane once; the video detail pane opens only after explicit selection.
- Support 1920x1080 and 1366x768 desktop layouts.
- This is a pure frontend demo with simulated AI and generation progress.

---

### Task 1: Pure production-order state model

**Files:**
- Create: `marketing-factory-model.mjs`
- Create: `tests/marketing-factory-model.test.mjs`

**Interfaces:**
- Produces: `createDemoState()`, `createOrder()`, `updateOrderDraft()`, `toggleChangeGoal()`, `submitOrder()`, `advanceOrder()`, `resolveMissingMaterial()`, `selectCandidate()`, `togglePanel()`, `getMarketingFactoryViewModel()`.

- [ ] **Step 1: Write failing tests for the blank order and conditional configuration.**

```js
test('a blank order starts with only sessions and conversation visible', () => {
  const vm = getMarketingFactoryViewModel(createDemoState());
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation']);
});

test('country selection derives localization while unselected goals inherit the reference', () => {
  let state = createDemoState();
  state = updateOrderDraft(state, { market: 'Mexico' });
  assert.equal(state.orders[state.activeOrderId].draft.language, 'Spanish');
  assert.equal(state.orders[state.activeOrderId].draft.goals.scene, false);
});
```

- [ ] **Step 2: Run `node --test tests/marketing-factory-model.test.mjs` and verify the missing-module failure.**
- [ ] **Step 3: Implement immutable state creation and draft updates.**
- [ ] **Step 4: Run the tests and verify they pass.**
- [ ] **Step 5: Add failing tests for submission, proactive missing-material handling, candidate progression, auto-open-once, explicit detail selection, and per-session isolation.**
- [ ] **Step 6: Implement the minimal transitions and rerun the full test file.**

### Task 2: Accessible page and pane renderers

**Files:**
- Create: `marketing-factory-view.mjs`
- Create: `tests/marketing-factory-view.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: `getMarketingFactoryViewModel(state)`.
- Produces: `renderApp(vm)` and accessible `data-action` controls consumed by `app.js`.

- [ ] **Step 1: Write failing tests that assert the landing page exposes new production and history, the blank workbench exposes the embedded form, and hidden panes are absent.**
- [ ] **Step 2: Run the view tests and verify failure because the renderer does not exist.**
- [ ] **Step 3: Implement the shell, landing page, session pane, conversation form, timeline cards, candidate pane, and detail pane renderers.**
- [ ] **Step 4: Run view and model tests together and verify all pass.**

### Task 3: Browser interactions and simulated progress

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: model actions and `renderApp(vm)`.
- Produces: click/change/input event delegation, deterministic progress timer, and responsive pane behavior.

- [ ] **Step 1: Add failing model tests for form submission, timed progress, missing-material resolution, panel memory, and switching production conversations.**
- [ ] **Step 2: Verify expected failures.**
- [ ] **Step 3: Implement DOM event delegation and timer-driven calls to `advanceOrder()`.**
- [ ] **Step 4: Implement Chorify shell styling, Frame-inspired panel toggles, scroll ownership, candidate cards, and detail layout.**
- [ ] **Step 5: Run all automated tests and syntax checks.**

### Task 4: Documentation, visual verification, and deployment

**Files:**
- Modify: `BASELINE.md`
- Modify: `docs/changes/marketing-factory-conversation-video-workbench/design.md` in the parent Chorify workspace.
- Modify: `docs/changes/marketing-factory-conversation-video-workbench/tasks.md` in the parent Chorify workspace.
- Modify: `docs/changes/marketing-factory-conversation-video-workbench/validation.md` in the parent Chorify workspace.

**Interfaces:**
- Produces: a reproducible baseline, browser screenshots, GitHub history, and a public Vercel URL.

- [ ] **Step 1: Run model/view tests and `node --check` on every JavaScript module.**
- [ ] **Step 2: Serve the demo locally and verify the end-to-end scenario from blank order to selected candidate.**
- [ ] **Step 3: Verify 1920x1080 and 1366x768 layouts, including conversation scrolling and progressive pane opening.**
- [ ] **Step 4: Update governed product documents and run `node tools/docs-governance.mjs build` plus `node tools/docs-governance.mjs check`.**
- [ ] **Step 5: Commit only the isolated demo changes, push `codex/marketing-factory-demo-v0.1`, and deploy a separate Vercel preview.**

