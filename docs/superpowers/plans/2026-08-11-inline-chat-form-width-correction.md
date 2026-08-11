# Inline Chat Form Width Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Chorify Chat's original centered conversation width while rendering the video-replication configuration as a wide AI tool message inside that conversation.

**Architecture:** Add one shared conversation lane used by messages, tool cards, summaries, and pending actions. Render the replication form inside an AI-authored tool-message row, and constrain the pinned composer to the same lane width. Keep task and preview panels closed until order submission.

**Tech Stack:** Static HTML, CSS Grid, native ESM JavaScript, Node.js test runner.

## Global Constraints

- Do not change the fixed left Chat sidebar or introduce a standalone form page.
- Do not open task or preview panels while the configuration is only being edited.
- The form may be wider than a normal message bubble but must remain inside the Chat content lane.
- The conversation, form, and composer share a 920 px maximum lane at desktop widths.
- Preserve the existing order state, candidate generation, preview, review, export, and reopen behaviors.

---

### Task 1: Lock the inline tool-message structure

**Files:**
- Modify: `tests/marketing-factory-view.test.mjs`
- Modify: `marketing-factory-view.mjs`

**Interfaces:**
- Consumes: `renderMarketingFactory(getMarketingFactoryViewModel(state))`
- Produces: `.conversation-lane`, `.chat-tool-message`, `.tool-message-body`, and `.conversation-composer` markup hooks.

- [ ] **Step 1: Write the failing render test**

Add a test that opens video replication and asserts that the form is nested under an AI tool-message inside the shared conversation lane, while no task panel is present.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test tests/marketing-factory-view.test.mjs`

Expected: FAIL because the new inline tool-message classes do not exist.

- [ ] **Step 3: Implement the minimal semantic structure**

Wrap the current conversation content in `.conversation-lane`; render the form and reopened form through a `.chat-tool-message` row with an AI avatar; add `.conversation-composer` to the existing composer.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `node --test tests/marketing-factory-view.test.mjs`

Expected: all view tests pass.

### Task 2: Restore the original Chat width behavior

**Files:**
- Modify: `tests/marketing-factory-view.test.mjs`
- Modify: `styles.css`

**Interfaces:**
- Consumes: the markup hooks from Task 1.
- Produces: one centered 920 px conversation/composer lane without page-level horizontal overflow.

- [ ] **Step 1: Write the failing CSS contract test**

Read `styles.css` and assert that `.conversation-lane` and `.conversation-composer` use a 920 px maximum width, while the form inside `.chat-tool-message` has no independent centering margin or maximum width.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test tests/marketing-factory-view.test.mjs`

Expected: FAIL because the shared width contracts are not defined.

- [ ] **Step 3: Implement the CSS width correction**

Center the lane and composer, let the tool-message body consume the remaining lane width beside the AI avatar, and keep the form's long content in the existing conversation scroll region.

- [ ] **Step 4: Run all Demo tests**

Run: `node --test tests/*.test.mjs`

Expected: zero failures.

### Task 3: Validate and publish the corrected Demo

**Files:**
- Modify: `BASELINE.md`
- Modify: `docs/superpowers/specs/2026-08-11-chat-video-replication-tool-design.md`
- Create: `screenshots/chat-inline-form-1920.png`
- Create: `screenshots/chat-inline-form-1366.png`

**Interfaces:**
- Consumes: the tested inline form implementation.
- Produces: documented, visually verified, publicly reachable Demo.

- [ ] **Step 1: Run the browser flow at 1920 × 1080**

Open a new Chat, call video replication, verify the form appears in the message stream, verify the composer stays aligned with the Chat lane, and confirm task/preview panels remain closed.

- [ ] **Step 2: Repeat at 1366 × 768**

Verify that the same layout remains usable, the conversation owns vertical scrolling, and no page-level horizontal scrolling is required.

- [ ] **Step 3: Verify submission and reopening**

Apply the Demo preset, submit, verify the task panel opens, then reopen the configuration and verify the same values return in an inline AI tool message without clearing candidate state.

- [ ] **Step 4: Update the product/design record**

Record the approved rule: the form is a wide AI tool card inside the existing Chat lane; it never changes the Chat width and only order submission opens the task panel.

- [ ] **Step 5: Commit, push, and deploy**

Commit only this Demo's files, push the current branch, deploy to the existing Vercel project, and verify the public URL in a browser.
