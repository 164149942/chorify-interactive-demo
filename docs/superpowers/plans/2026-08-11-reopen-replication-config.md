# Reopen Replication Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the locked replication configuration reopenable without losing generated work.

**Architecture:** Add pure model transitions for reopen and cancel, reuse the existing form renderer in edit mode, and route new actions through the existing delegated event handler. Existing candidate and pane state remains independent of form visibility.

**Tech Stack:** Vanilla ES modules, HTML/CSS, Node.js built-in test runner.

## Global Constraints

- Do not change the company production site.
- Do not clear candidates or review/version history when merely opening configuration.
- Reuse the existing embedded structured form.

---

### Task 1: Reopen and cancel state transitions

**Files:**
- Modify: `marketing-factory-model.mjs`
- Test: `tests/marketing-factory-model.test.mjs`

**Interfaces:**
- Produces: `reopenOrderConfiguration(state)` and `cancelOrderConfigurationEdit(state)`.

- [ ] Write model tests that assert reopening preserves generated objects and cancelling restores the submitted draft.
- [ ] Run the focused model test and confirm it fails because the transitions do not exist.
- [ ] Add the minimal pure transitions and submitted draft snapshot.
- [ ] Run focused model tests until green.

### Task 2: Reopened form rendering and actions

**Files:**
- Modify: `marketing-factory-view.mjs`
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/marketing-factory-view.test.mjs`

**Interfaces:**
- Consumes: `reopenOrderConfiguration(state)` and `cancelOrderConfigurationEdit(state)`.

- [ ] Write a view test for the reopen button and the edit-mode form actions.
- [ ] Run the focused view test and confirm it fails.
- [ ] Render the existing form when edit mode is active and wire reopen/cancel actions.
- [ ] Run focused and full tests until green.

### Task 3: Verify and publish

**Files:**
- Modify: product design/change documentation where the interaction is recorded.

- [ ] Verify the interaction in a browser at desktop size.
- [ ] Run the complete test suite and document governance checks.
- [ ] Commit and push the isolated branch.
- [ ] Deploy and verify the public Vercel URL.
