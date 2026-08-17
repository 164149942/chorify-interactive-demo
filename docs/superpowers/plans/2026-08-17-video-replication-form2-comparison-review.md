# Video Replication Form 2 Comparison Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dense second replication form with a clear source-to-target review workspace, while making the persistent bottom composer the only natural-language input.

**Architecture:** Keep the existing two-stage replication state machine and object-level replacement plan. Add a small, pure review UI state for target selection, a reversible plan-change snapshot for composer-driven updates, and view-model helpers that classify items into needs-attention and AI-handled groups. The view renders one compact comparison row per detected object and opens a fixed overlay picker for complex choices without changing the 920px conversation lane.

**Tech Stack:** Vanilla JavaScript ES modules, HTML/CSS, Node.js built-in test runner, static Vercel deployment.

## Global Constraints

- Preserve the existing AI chat page width, background, bottom composer position, and 920px conversation-lane contract.
- Remove every natural-language textarea and apply button from both embedded forms; all free-text changes enter through the bottom composer.
- Form 2 must be a review surface, not a second chat surface.
- Candidate generation still requires one explicit global confirmation and zero blocking items.
- Complex object selection uses a fixed overlay drawer and must not open the candidate-results or video-detail panels.
- The Demo remains deterministic and frontend-only; product libraries, uploads, and AI generation are simulated choices.
- Do not commit `.superpowers/brainstorm/` or unrelated existing workspace files.

---

## Task 1: Add review-state, target-picker, and undo behavior to the model

**Files:**

- Modify: `marketing-factory-model.mjs`
- Test: `tests/marketing-factory-model.test.mjs`
- Test: `tests/marketing-factory-two-stage.test.mjs`

- [ ] Write failing tests for attention classification, picker open/close, deterministic target selection, composer change snapshots, and one-step undo.
- [ ] Add `replacementPlan.review` state with an optional picker descriptor and a last reversible plan change.
- [ ] Add pure operations for opening and closing a target picker and selecting a target for one object.
- [ ] Extend composer-driven plan updates to capture before/after values, affected object groups, a human-readable change summary, and an undo token.
- [ ] Add a pure undo operation that restores the prior effective replacement plan without bypassing blocker recomputation.
- [ ] Ensure group and object updates clear stale plan-change highlights when appropriate.
- [ ] Run `node --test tests/marketing-factory-model.test.mjs tests/marketing-factory-two-stage.test.mjs`.
- [ ] Commit only Task 1 model and test files.

## Task 2: Rebuild Form 2 as a source-to-target review workspace

**Files:**

- Modify: `marketing-factory-view.mjs`
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/marketing-factory-view.test.mjs`

- [ ] Write failing HTML-contract tests proving both in-form natural-language editors are absent while the bottom composer remains.
- [ ] Write failing tests for the new Form 2 title, attention summary, AI-handled disclosure, source-to-target rows, readable shot/time chips, inline strategy controls, and fixed selection drawer.
- [ ] Remove the Form 1 natural-language section and Form 2 `plan-language` section and obsolete click handler.
- [ ] Render the approved `确认复刻对象与目标` header with counts for missing material, conflicts, and resolved items.
- [ ] Render blockers, conflicts, and composer-affected rows first; put settled AI-handled rows inside the `AI 已处理 N 项` disclosure.
- [ ] Group comparison rows by product, localization, person, scene, and clip while keeping each detected object individually addressable.
- [ ] Convert raw shot IDs and ranges into compact human-readable chips and reveal full involvement details on expansion.
- [ ] Keep `保持 / 替换 / AI 生成` inline; open an overlay target picker for product, person, scene, and clip target selection.
- [ ] Add the composer-change summary with a working undo button and affected-row highlight.
- [ ] Keep one global production confirmation button and the 1/3/5 candidate choice.
- [ ] Add responsive overlay and dense B2B styling for 1920×1080 and 1366×768.
- [ ] Run `node --test tests/marketing-factory-view.test.mjs` and `node --check app.js`.
- [ ] Commit only Task 2 view, app, style, and test files.

## Task 3: Synchronize product and design documentation

**Files:**

- Add: `C:/Users/dianwen/Documents/Chorify AI/docs/changes/2026-08-17-video-replication-form2-comparison-review/change.json`
- Add: `C:/Users/dianwen/Documents/Chorify AI/docs/changes/2026-08-17-video-replication-form2-comparison-review/proposal.md`
- Add: `C:/Users/dianwen/Documents/Chorify AI/docs/changes/2026-08-17-video-replication-form2-comparison-review/design.md`
- Add: `C:/Users/dianwen/Documents/Chorify AI/docs/changes/2026-08-17-video-replication-form2-comparison-review/tasks.md`
- Add: `C:/Users/dianwen/Documents/Chorify AI/docs/changes/2026-08-17-video-replication-form2-comparison-review/validation.md`
- Modify after validation: `C:/Users/dianwen/Documents/Chorify AI/docs/current/product/营销视频复刻产品逻辑.md`
- Modify after validation: `C:/Users/dianwen/Documents/Chorify AI/docs/current/design/产品高保真设计与迭代.md`

- [ ] Record the confirmed division of responsibility between Form 1, Form 2, and the bottom composer.
- [ ] Record Form 2's source-to-target comparison hierarchy, attention-first display, target-picker overlay, AI-change highlight, undo behavior, and global confirmation rule.
- [ ] Mark the change package implementing until automated and browser validation finish.
- [ ] After validation, update current product/design truth and append dated change records.
- [ ] Run `node tools/docs-governance.mjs build` and `node tools/docs-governance.mjs check` from the outer project root.

## Task 4: Verify behavior and responsive presentation

**Files:**

- Verify: all implementation and test files above
- Evidence: `screenshots/form2-comparison-*.png`

- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Run `node --check app.js` and `git diff --check`.
- [ ] Manually verify at 1920×1080: Form 1 has no free-text editor; bottom composer updates Form 2; change summary and undo work; target drawer opens and closes; blocker gate works; 1/3/5 candidates still generate.
- [ ] Manually verify at 1366×768: conversation scroll, sticky composer, comparison rows, and target drawer remain usable without changing the chat width.
- [ ] Confirm candidate card/table views and video detail still work after production.
- [ ] Request an independent whole-scope code review and resolve all findings through the original implementer.

## Task 5: Publish the accepted Demo

**Files:**

- Update: repository branch and Vercel deployment only after Task 4 passes

- [ ] Commit the final documentation and validation evidence without including `.superpowers/brainstorm/`.
- [ ] Push branch `codex/chat-video-replication-demo-v0.2` to GitHub.
- [ ] Deploy the nested Demo to the existing Vercel project and refresh `https://chorify-marketing-factory-demo.vercel.app/`.
- [ ] Verify the public alias anonymously and report the GitHub branch, public URL, test totals, and remaining frontend-only placeholders.
