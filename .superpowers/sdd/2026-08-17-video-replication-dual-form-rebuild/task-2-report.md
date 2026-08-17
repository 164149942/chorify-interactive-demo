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
