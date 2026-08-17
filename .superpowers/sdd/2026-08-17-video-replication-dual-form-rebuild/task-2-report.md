# Task 2 report — 双表单对话 UI 与事件联动

## RED / GREEN evidence

- RED: `node --test tests/marketing-factory-view.test.mjs` initially failed 4 new UI behaviors: intent-review form, visible conflict handling, conversational analysis/plan confirmation, and five mapping groups with gating.
- RED: `node --test tests/marketing-factory-model.test.mjs` initially failed because `updateIntentStrategy` and `updateIntentFromNaturalLanguage` were not exported.
- RED: after the shortcut clarification, a four-state UI test failed until the UI exposed no-change, country-only, product-only, and country-plus-product conditions.
- GREEN: `node --test tests/*.test.mjs` passes: 75 tests, 0 failures. `git diff --check` passes.

## Delivered behavior

- Form one remains inside the 920px conversation lane for both intake and intent review. It provides required reference video, three explicit shortcuts (country only, product only, both), repeat-click clear, conditional fields, person/scene/clip keep-replace-AI matrix, natural-language recognition, AI understanding, conflicts, and one-submit automatic confirmation when unblocked.
- Once confirmed, form one becomes a compact intent summary. Analysis updates are regular AI chat messages; completion appends the replacement-plan confirmation card.
- Form two renders product, localization, person, scene, and clip mapping groups with source-to-target rows, object details, person source choices, localization-only exceptions, natural-language plan updates, affected-state styling, blocker actions, 1/3/5 candidate count, time/credit estimates, and disabled confirmation while blocked.
- `app.js` now calls the real intent submit/confirm and mapping APIs. AI person is retained as `ai` through intent review and replacement-plan creation.

## Compatibility

- Existing candidate management, far-right detail, approval, version history, export, and reopen flows remain covered by the full suite.
- The legacy model values remain compatible; the UI names `custom` as “商品和国家都更换”. The input/composer/canvas width contract is unchanged.

## Commit

- Implementation: `de47dff feat: rebuild marketing factory dual forms`.

## Follow-up concerns

- Mapping media is intentionally represented with compact visual placeholders; actual object thumbnails and asset pickers need a real asset service.
- Natural-language plan updates highlight derived mapping changes but do not generate candidates until explicit confirmation.

## Review-fix follow-up

### RED / GREEN evidence

- RED: focused model/view tests failed for stale target-product shortcuts, type-specific blocker actions, invalidated-plan reopening, message order, and missing person/scene/clip replacement materials.
- GREEN: `node --test tests/marketing-factory-model.test.mjs tests/marketing-factory-view.test.mjs` passes 51 tests. Full `node --test tests/*.test.mjs` passes 84 tests with 0 failures; `git diff --check` passes.

### Review fixes delivered

- Switching to same-product or clearing a shortcut clears a no-longer-valid target product (and switching to product-only clears country). Intent conflicts now expose a direct “清除目标商品” action.
- A single model-owned `replacementPlan.blockingItems` gate drives both confirmation and form-two blockers. Product, market, conflict, and person/scene/clip replacement-material blockers each have matching, state-changing resolution paths.
- Person, scene, and clip replacements require a target source; library/upload actions write a target, while keep and AI remove the matching material blocker. Candidate creation remains blocked until the model gate is clear.
- Reopening configuration returns to form one with an explicit invalidation notice. The old plan is marked invalidated, prior candidate records are archived, and only a fresh analysis can create the next plan.
- Confirmed intent summary now precedes exactly one analysis progress message, then completion, then the new replacement plan. Natural-language plan updates record and highlight all changed mapping groups.

### Compatibility and remaining concern

- Existing candidate cards/tables, detail panel, review, versions, and export remain intact and full-suite covered. Reopened candidates remain available as archived records until fresh confirmation replaces active slots.
- Asset selection is still a deterministic demo placeholder; production integration should replace the library/upload labels with real asset IDs and upload state.

### Review-fix commit

- Code and test fixes: `3551e61 fix: close dual-form review gaps`.

### Scoped re-review: plan-stage conflict clear

- RED: a real plan-stage same-product mapping conflict stayed blocked after `clearIntentTargetProduct`, because its phase guard rejected the form-two action.
- GREEN: plan-stage clear now removes both the intent and legacy product target, recomputes the plan blockers, and permits confirmation. The guard remains limited to intake, intent review, plan, or a non-invalidated editing session.
- Verification: `node --test tests/marketing-factory-model.test.mjs` passes 31 tests; full `node --test tests/*.test.mjs` passes 85 tests with 0 failures; `git diff --check` passes.
