# Chorify Chat Video Replication Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone interactive Demo that embeds the confirmed video-replication form inside the existing Chorify Chat shell and connects it to candidate-task and video-preview sidebars.

**Architecture:** Keep the current static ESM application and single immutable state model. Refocus the existing marketing-factory model into a Chat conversation with one optional bound replication order; render the Chat shell, inline tool card, candidate-first task panel, and selected-video preview from one view model. All generation and upload behavior remains deterministic front-end simulation.

**Tech Stack:** HTML5, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, Vercel static deployment.

## Global Constraints

- Do not modify the company website or call its private APIs.
- One AI conversation binds at most one video-replication production order.
- Order identity is `1 reference video × 1 target product × 1 target market × N candidates`.
- The task panel opens immediately after submission and displays all `1 / 3 / 5` planned slots.
- The preview panel opens only after explicit candidate selection.
- Product replacement is mandatory; person, scene, clip, and logo replacement are optional.
- Reopening or cancelling configuration must preserve candidates, selection, versions, and preview state.
- Validate at 1920×1080 and 1366×768.

---

### Task 1: Chat-bound replication state model

**Files:**
- Modify: `marketing-factory-model.mjs`
- Modify: `tests/marketing-factory-model.test.mjs`

**Interfaces:**
- Consumes: existing immutable `createDemoState()` state pattern.
- Produces: `openReplicationTool(state, source)`, `submitOrder(state)`, `sendConversationMessage(state, text)`, `sendPreviewRevision(state, candidateId, text)`, and `getMarketingFactoryViewModel(state)`.

- [ ] **Step 1: Write failing tests for Chat tool entry and one-order binding**

```js
test('all entry points open the same replication form', () => {
  let state = createDemoState();
  state = openReplicationTool(state, 'home-card');
  const firstId = state.activeOrderId;
  state = openReplicationTool(state, 'composer-tool');
  assert.equal(state.activeOrderId, firstId);
  assert.equal(state.orders[firstId].formCollapsed, false);
});

test('a bound conversation cannot create a second replication order', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'home-card')));
  const ids = state.orderIds.slice();
  state = openReplicationTool(state, 'natural-language');
  assert.deepEqual(state.orderIds, ids);
  assert.equal(state.orders[state.activeOrderId].formCollapsed, true);
});
```

- [ ] **Step 2: Run the focused model tests and verify failure**

Run: `node --test tests/marketing-factory-model.test.mjs`  
Expected: FAIL because `openReplicationTool` and the binding behavior do not exist.

- [ ] **Step 3: Implement one Chat conversation with one optional replication order**

```js
export function openReplicationTool(state, source = 'tool') {
  if (state.activeOrderId && state.orders[state.activeOrderId]) {
    return updateActiveOrder(state, (order) => {
      order.formCollapsed = order.phase !== 'draft';
      order.toolEntrySource = source;
      return order;
    });
  }
  return createOrder(state, { source });
}
```

Update submission so `order.panes.results = true` immediately and create all candidate slots before progress simulation. Keep `order.panes.detail = false` until `selectCandidate()`.

- [ ] **Step 4: Add natural-language and preview-revision state transitions**

```js
export function sendPreviewRevision(state, candidateId, text) {
  return updateActiveOrder(state, (order) => {
    order.messages.push({ role: 'user', kind: 'revision', text, candidateId });
    order.messages.push({ role: 'assistant', kind: 'message', text: `已记录对候选 ${candidateId} 的修改要求。` });
    return order;
  });
}
```

Support the deterministic phrases `投放巴西`, `生成 5 条`, `拉丁裔年轻女性`, and `其他都保持原视频` in `sendConversationMessage()`.

- [ ] **Step 5: Run model tests and commit**

Run: `node --test tests/marketing-factory-model.test.mjs`  
Expected: PASS.

```powershell
git add marketing-factory-model.mjs tests/marketing-factory-model.test.mjs
git commit -m "feat: model chat video replication orders"
```

### Task 2: Chorify Chat shell and inline replication form

**Files:**
- Modify: `marketing-factory-view.mjs`
- Modify: `index.html`
- Modify: `tests/marketing-factory-view.test.mjs`

**Interfaces:**
- Consumes: Task 1 view model fields for active conversation, draft, candidates, panes, and selected candidate.
- Produces: semantic HTML actions consumed by `app.js`, including `open-replication-tool`, `submit-order`, `reopen-configuration`, `select-candidate`, and `send-preview-revision`.

- [ ] **Step 1: Write failing view tests for the Chat shell and tool form**

```js
test('new chat exposes video replication as a Chat tool', () => {
  const html = render(createDemoState());
  assert.match(html, /Chorify AI/);
  assert.match(html, /AI 聊天/);
  assert.match(html, /data-action="open-replication-tool"/);
});

test('confirmed order renders candidate-first task panel', () => {
  const state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'home-card')));
  const html = render(state);
  assert.match(html, /本对话的复刻任务/);
  assert.match(html, /候选 01/);
  assert.match(html, /执行记录/);
});
```

- [ ] **Step 2: Run focused view tests and verify failure**

Run: `node --test tests/marketing-factory-view.test.mjs`  
Expected: FAIL because the current renderer still uses the standalone marketing-factory shell.

- [ ] **Step 3: Render the four-region Chat layout**

Implement these top-level landmarks:

```html
<aside class="chat-sidebar" aria-label="AI Chat 会话"></aside>
<main class="chat-main" aria-label="AI 对话"></main>
<aside class="task-panel" aria-label="本对话的复刻任务"></aside>
<aside class="preview-panel" aria-label="视频预览"></aside>
```

Use the current company-page language: `Chorify AI`, `AI 聊天`, `历史对话`, `本对话的复刻任务`, `视频预览`, `余额 4,828`.

- [ ] **Step 4: Render the inline form and locked summary**

The editable card must include `reference`, `product`, `market`, localization, `candidateCount`, conditional goals, and collapsed advanced settings. The confirmed summary must expose `data-action="reopen-configuration"` and preserve the same order.

- [ ] **Step 5: Render candidate-first tasks and selected preview**

Each candidate row renders the candidate identity first and a nested `<details>` element titled `执行记录`. Render preview only when `panes.detail` and `selectedCandidateId` are both present.

- [ ] **Step 6: Run view tests and commit**

Run: `node --test tests/marketing-factory-view.test.mjs`  
Expected: PASS.

```powershell
git add index.html marketing-factory-view.mjs tests/marketing-factory-view.test.mjs
git commit -m "feat: render replication tool in chat shell"
```

### Task 3: Browser interactions and visual system

**Files:**
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/marketing-factory-model.test.mjs`
- Test: `tests/marketing-factory-view.test.mjs`

**Interfaces:**
- Consumes: Task 1 actions and Task 2 `data-action` attributes.
- Produces: complete click, submit, input, panel-toggle, simulated-progress, and preview-revision interactions.

- [ ] **Step 1: Wire the three tool-entry actions**

```js
if (action === 'open-replication-tool') {
  state = openReplicationTool(state, target.dataset.source || 'tool');
  render({ scrollConversation: true });
  return;
}
```

The homepage card, composer chip, and natural-language recommendation must all call this action.

- [ ] **Step 2: Open candidates immediately on form confirmation**

After `submitOrder(state)`, render all slots immediately, scroll the summary into view, and continue deterministic progress timers without delaying the task panel.

- [ ] **Step 3: Wire preview revision back into Chat**

Handle the `preview-revision-form`, call `sendPreviewRevision()`, keep the candidate selected, and scroll the central Chat to the new user and AI messages.

- [ ] **Step 4: Restyle to match the current Chorify Chat**

Implement a white/light-gray shell, `#7657e8` primary purple, fine `#e9e7ee` borders, 10–14 px radii, a 288–320 px conversation rail, flexible Chat column, 320–380 px task panel, and 340–420 px preview panel. Each region scrolls independently; the central composer stays pinned to the bottom.

- [ ] **Step 5: Add compact viewport behavior**

At widths below 1440 px, reduce the conversation rail and panel widths while keeping the composer, candidate actions, and preview modification controls visible. Do not introduce page-level horizontal scrolling.

- [ ] **Step 6: Run the full automated suite and commit**

Run: `node --test tests/marketing-factory-model.test.mjs tests/marketing-factory-view.test.mjs`  
Expected: all tests PASS.

```powershell
git add app.js styles.css tests/marketing-factory-model.test.mjs tests/marketing-factory-view.test.mjs
git commit -m "feat: complete chat replication interactions"
```

### Task 4: Browser acceptance, documentation, GitHub, and Vercel

**Files:**
- Create: `screenshots/chat-replication-form-1920.png`
- Create: `screenshots/chat-replication-results-1920.png`
- Create: `screenshots/chat-replication-preview-1366.png`
- Modify: `BASELINE.md`

**Interfaces:**
- Consumes: completed static Demo.
- Produces: acceptance evidence, public deployment, and pushed Git history.

- [ ] **Step 1: Run a local static server and execute the main flow**

Verify: new Chat → open video replication → fill or preset → submit → all slots visible → select candidate → preview visible → send revision → reopen configuration.

- [ ] **Step 2: Capture target-size evidence**

Capture 1920×1080 form/results screenshots and a 1366×768 selected-preview screenshot. Confirm `document.documentElement.scrollWidth === window.innerWidth` and that the central composer and preview modification action are visible.

- [ ] **Step 3: Check console and automated tests**

Run: `node --test tests/marketing-factory-model.test.mjs tests/marketing-factory-view.test.mjs`  
Expected: PASS with zero failures. Browser console expected: zero errors.

- [ ] **Step 4: Update the baseline record**

Document the new branch, Chat tool entry, one-conversation/one-order rule, candidate-first task panel, preview linkage, test result, and screenshots in `BASELINE.md`.

- [ ] **Step 5: Commit and push**

```powershell
git add BASELINE.md screenshots
git commit -m "docs: record chat replication demo acceptance"
git push -u origin codex/chat-video-replication-demo-v0.1
```

- [ ] **Step 6: Deploy the static branch to Vercel**

Deploy the current directory, verify the public URL in an unauthenticated browser, and return the accessible link to the user.
