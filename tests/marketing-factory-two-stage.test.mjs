import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceReferenceAnalysis,
  applyReplacementGroupRule,
  confirmReplicationIntent,
  confirmProductionPlan,
  createDemoState,
  getMarketingFactoryViewModel,
  openReplicationTool,
  reopenOrderConfiguration,
  submitReplicationIntent,
  startReferenceAnalysis,
  updateOrderDraft,
} from '../marketing-factory-model.mjs';
import { renderMarketingFactory } from '../marketing-factory-view.mjs';

function activeOrder(state) {
  return state.orders[state.activeOrderId];
}

function createSameProductIntake() {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  return state;
}

function completeAnalysis(state) {
  let next = startReferenceAnalysis(state);
  while (activeOrder(next).phase === 'analyzing') next = advanceReferenceAnalysis(next);
  return next;
}

test('same-product localization starts analysis without requiring a target product', () => {
  const state = startReferenceAnalysis(createSameProductIntake());
  const order = activeOrder(state);

  assert.equal(order.phase, 'analyzing');
  assert.deepEqual(order.validationErrors, []);
  assert.equal(order.candidates.length, 0);
  assert.equal(order.panes.results, false);
});

test('reference analysis stops at a dynamic production plan before creating candidates', () => {
  const state = completeAnalysis(createSameProductIntake());
  const order = activeOrder(state);

  assert.equal(order.phase, 'plan');
  assert.equal(order.analysis.status, 'completed');
  assert.equal(order.analysis.summary.productExposureCount, 5);
  assert.equal(order.analysis.summary.personCount, 1);
  assert.equal(order.analysis.summary.sceneCount, 3);
  assert.equal(order.candidates.length, 0);
  assert.equal(order.panes.results, false);
});

test('confirming a same-product plan creates candidates without a product upload', () => {
  let state = completeAnalysis(createSameProductIntake());
  state = confirmProductionPlan(state);
  const order = activeOrder(state);

  assert.equal(order.phase, 'running');
  assert.equal(order.candidates.length, 3);
  assert.equal(order.panes.results, true);
  assert.equal(order.submittedDraft.replicationMode, 'same_product');
});

test('replace-product plan requires the target product only after analysis', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'replace_product',
    market: '美国',
  });
  state = completeAnalysis(state);
  state = confirmProductionPlan(state);

  assert.equal(activeOrder(state).phase, 'plan');
  assert.deepEqual(activeOrder(state).validationErrors, ['product']);
});

test('the chat renders a compact intake first and a data-driven second form after analysis', () => {
  const intakeHtml = renderMarketingFactory(getMarketingFactoryViewModel(createSameProductIntake()));
  assert.match(intakeHtml, /id="reference-intake-form"/);
  assert.match(intakeHtml, /先分析，再配置生产方案/);
  assert.match(intakeHtml, /同商品跨国家本地化/);
  assert.doesNotMatch(intakeHtml, /人物来源/);
  assert.doesNotMatch(intakeHtml, /候选数量/);

  const planHtml = renderMarketingFactory(getMarketingFactoryViewModel(completeAnalysis(createSameProductIntake())));
  assert.match(planHtml, /参考视频分析完成/);
  assert.match(planHtml, /id="production-plan-form"/);
  assert.match(planHtml, /商品露出/);
  assert.match(planHtml, /检测到人物/);
  assert.match(planHtml, /沿用参考视频中的商品/);
  assert.match(planHtml, /建议补充，不阻塞生产/);
});

test('intent review blocks analysis until its required reference and conflict are cleared', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = submitReplicationIntent(state);
  let order = activeOrder(state);

  assert.equal(order.phase, 'intent_review');
  assert.deepEqual(order.intentDraft.blockingItems, ['reference']);
  assert.match(order.intentDraft.understandingSummary, /参考视频/);

  state = confirmReplicationIntent(state);
  assert.equal(activeOrder(state).phase, 'intent_review');

  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = submitReplicationIntent(state);
  order = activeOrder(state);
  assert.deepEqual(order.intentDraft.blockingItems, []);

  state = confirmReplicationIntent(state);
  assert.equal(activeOrder(state).phase, 'analyzing');
});

test('analysis builds independent mapping groups and a product rule covers every product exposure', () => {
  let state = completeAnalysis(createSameProductIntake());
  state = applyReplacementGroupRule(state, 'product', {
    target: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  const order = activeOrder(state);

  assert.equal(order.referenceAnalysis.status, 'completed');
  assert.equal(order.replacementPlan.person.sourceCount, 1);
  assert.equal(order.replacementPlan.product.scope, 'all_exposures');
  assert.equal(order.replacementPlan.product.exposureCount, 5);
  assert.equal(order.replacementPlan.scene.sourceCount, 3);
  assert.deepEqual(order.replacementPlan.clip, { strategy: 'keep', sourceCount: 12 });
});

test('reopening the first form keeps the reference analysis and invalidates the current replacement plan', () => {
  let state = completeAnalysis(createSameProductIntake());
  const previousAnalysis = structuredClone(activeOrder(state).referenceAnalysis);

  state = reopenOrderConfiguration(state);
  const order = activeOrder(state);

  assert.equal(order.editingConfiguration, true);
  assert.deepEqual(order.referenceAnalysis, previousAnalysis);
  assert.equal(order.replacementPlan.status, 'invalidated');
  assert.equal(order.replacementPlan.invalidatedReason, 'intent_reopened');
});
