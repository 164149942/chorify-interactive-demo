import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceReferenceAnalysis,
  advanceOrder,
  applyDemoPreset,
  createDemoState,
  createOrder,
  getMarketingFactoryViewModel,
  openReplicationTool,
  openOrder,
  resolveMissingMaterial,
  approveCandidate,
  applyReplacementGroupRule,
  confirmProductionPlan,
  confirmReplicationIntent,
  exportCandidate,
  parseReplicationIntent,
  requestCandidateRevision,
  reopenOrderConfiguration,
  cancelOrderConfigurationEdit,
  selectCandidate,
  sendConversationMessage,
  sendPreviewRevision,
  setCandidateView,
  submitOrder,
  submitReplicationIntent,
  startReferenceAnalysis,
  toggleChangeGoal,
  togglePanel,
  updatePlanFromNaturalLanguage,
  updateReplacementMapping,
  updateOrderDraft,
} from '../marketing-factory-model.mjs';

function createConfiguredOrder() {
  let state = createOrder(createDemoState());
  state = applyDemoPreset(state);
  return state;
}

function completeAnalysis(state) {
  let next = startReferenceAnalysis(state);
  while (next.orders[next.activeOrderId].phase === 'analyzing') next = advanceReferenceAnalysis(next);
  return next;
}

function createPlanOrder() {
  let state = createOrder(createDemoState());
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  return completeAnalysis(state);
}

test('all video replication entry points reuse the same conversation form', () => {
  let state = openReplicationTool(createDemoState(), 'home-card');
  const firstId = state.activeOrderId;

  state = openReplicationTool(state, 'composer-tool');

  assert.equal(state.activeOrderId, firstId);
  assert.equal(state.orderIds.filter((id) => id.startsWith('order-new-')).length, 1);
  assert.equal(state.orders[firstId].toolEntrySource, 'composer-tool');
  assert.equal(state.orders[firstId].formCollapsed, false);
});

test('a bound conversation cannot create a second replication order', () => {
  let state = openReplicationTool(createDemoState(), 'home-card');
  state = applyDemoPreset(state);
  state = submitOrder(state);
  const ids = state.orderIds.slice();

  state = openReplicationTool(state, 'natural-language');

  assert.deepEqual(state.orderIds, ids);
  assert.equal(state.orders[state.activeOrderId].formCollapsed, true);
});

test('a new production conversation starts without results or video detail', () => {
  const state = createOrder(createDemoState());
  const vm = getMarketingFactoryViewModel(state);

  assert.equal(vm.page, 'workbench');
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation']);
  assert.equal(vm.activeOrder.phase, 'intake');
  assert.equal(vm.activeOrder.formCollapsed, false);
});

test('country selection derives localization while unselected goals inherit the reference', () => {
  let state = createOrder(createDemoState());
  state = updateOrderDraft(state, { market: '墨西哥' });

  const order = state.orders[state.activeOrderId];
  assert.equal(order.draft.language, '西班牙语');
  assert.equal(order.draft.subtitleMode, '西班牙语字幕');
  assert.equal(order.draft.goals.product, false);
  assert.equal(order.draft.goals.scene, false);
});

test('product replacement becomes mandatory only when that replication mode is selected', () => {
  let state = createOrder(createDemoState());
  state = updateOrderDraft(state, { replicationMode: 'replace_product' });
  assert.equal(state.orders[state.activeOrderId].draft.goals.product, true);

  state = toggleChangeGoal(state, 'person');
  state = toggleChangeGoal(state, 'scene');
  const vm = getMarketingFactoryViewModel(state);
  assert.deepEqual(vm.activeOrder.visibleGoalSections, ['product', 'person', 'scene']);
});

test('incomplete intake stays editable and exposes only analysis prerequisites', () => {
  let state = createOrder(createDemoState());
  state = submitOrder(state);

  const order = state.orders[state.activeOrderId];
  assert.equal(order.phase, 'intake');
  assert.deepEqual(order.validationErrors, ['reference', 'replicationMode']);
  assert.equal(order.formCollapsed, false);
});

test('submitting a complete order folds the form and begins the replication worklog', () => {
  let state = submitOrder(createConfiguredOrder());
  const order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'running');
  assert.equal(order.formCollapsed, true);
  assert.equal(order.progress, 12);
  assert.equal(order.messages.at(-1).kind, 'progress');
  assert.equal(order.candidates.length, 3);
  assert.equal(order.panes.results, true);
  assert.equal(order.panes.detail, false);
  assert.deepEqual(getMarketingFactoryViewModel(state).visiblePanes, ['sessions', 'conversation', 'results']);
});

test('candidate card and table view preference belongs to the active production conversation', () => {
  let state = submitOrder(createConfiguredOrder());
  const firstOrderId = state.activeOrderId;

  assert.equal(state.orders[firstOrderId].candidateView, 'card');

  state = setCandidateView(state, 'table');
  assert.equal(state.orders[firstOrderId].candidateView, 'table');
  assert.equal(state.orders['order-history-1'].candidateView, 'card');

  const unchanged = setCandidateView(state, 'unsupported');
  assert.deepEqual(unchanged, state);
});

test('reopening configuration preserves generated candidates selected video and versions', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);
  state = requestCandidateRevision(state, candidateId, '保留旧版本测试');

  const before = structuredClone(state.orders[state.activeOrderId]);
  state = reopenOrderConfiguration(state);
  const reopened = state.orders[state.activeOrderId];

  assert.equal(reopened.formCollapsed, false);
  assert.equal(reopened.editingConfiguration, true);
  assert.deepEqual(reopened.candidates, before.candidates);
  assert.equal(reopened.selectedCandidateId, candidateId);
  assert.deepEqual(reopened.panes, before.panes);
  assert.deepEqual(reopened.candidates[0].versionHistory, before.candidates[0].versionHistory);
});

test('cancelling reopened configuration restores the last submitted values', () => {
  let state = submitOrder(createConfiguredOrder());
  const submittedDraft = structuredClone(state.orders[state.activeOrderId].draft);
  state = reopenOrderConfiguration(state);
  state = updateOrderDraft(state, { market: '美国', candidateCount: 5 });
  state = cancelOrderConfigurationEdit(state);
  const order = state.orders[state.activeOrderId];

  assert.equal(order.formCollapsed, true);
  assert.equal(order.editingConfiguration, false);
  assert.deepEqual(order.draft, submittedDraft);
});

test('saving reopened configuration replaces candidate slots without retaining a stale detail selection', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const previousCandidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, previousCandidateId);
  state = reopenOrderConfiguration(state);
  state = updateOrderDraft(state, { candidateCount: 1 });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  while (state.orders[state.activeOrderId].phase === 'analyzing') state = advanceReferenceAnalysis(state);
  state = confirmProductionPlan(state);
  state = advanceOrder(advanceOrder(state));
  const order = state.orders[state.activeOrderId];

  assert.equal(order.candidates.length, 1);
  assert.equal(order.selectedCandidateId, null);
  assert.equal(order.panes.detail, false);
});

test('results open on submission and stay closed after a user closes them', () => {
  let state = submitOrder(createConfiguredOrder());
  let vm = getMarketingFactoryViewModel(state);
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation', 'results']);

  state = togglePanel(state, 'results', false);
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  vm = getMarketingFactoryViewModel(state);
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation']);
  assert.equal(vm.activeOrder.resultsAutoOpened, true);
});

test('selecting a candidate is the only action that opens video detail', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;

  state = selectCandidate(state, candidateId);
  const vm = getMarketingFactoryViewModel(state);
  assert.equal(vm.activeOrder.selectedCandidateId, candidateId);
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation', 'results', 'detail']);
});

test('missing material can be delegated to AI without blocking other candidates', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  state = resolveMissingMaterial(state, 'ai');

  let order = state.orders[state.activeOrderId];
  assert.equal(order.pendingAction, null);
  assert.equal(order.candidates[2].status, 'generating');
  assert.equal(order.candidates[0].status, 'previewable');

  state = advanceOrder(state);
  order = state.orders[state.activeOrderId];
  assert.equal(order.candidates[2].status, 'previewable');
  assert.equal(order.phase, 'review');
});

test('natural language updates the same structured order draft', () => {
  let state = createOrder(createDemoState());
  state = sendConversationMessage(state, '投放墨西哥，生成 5 条，并替换人物和场景');
  const order = state.orders[state.activeOrderId];

  assert.equal(order.draft.market, '墨西哥');
  assert.equal(order.draft.language, '西班牙语');
  assert.equal(order.draft.candidateCount, 5);
  assert.equal(order.draft.goals.person, true);
  assert.equal(order.draft.goals.scene, true);
});

test('natural language can localize to Brazil and reset optional changes', () => {
  let state = openReplicationTool(createDemoState(), 'natural-language');
  state = sendConversationMessage(state, '投放巴西，生成 5 条，人物换成拉丁裔年轻女性');
  let order = state.orders[state.activeOrderId];
  assert.equal(order.draft.market, '巴西');
  assert.equal(order.draft.language, '葡萄牙语');
  assert.equal(order.draft.candidateCount, 5);
  assert.equal(order.draft.goals.person, true);
  assert.match(order.draft.personDescription, /拉丁裔年轻女性/);

  state = sendConversationMessage(state, '其他都保持原视频');
  order = state.orders[state.activeOrderId];
  assert.equal(order.draft.goals.person, false);
  assert.equal(order.draft.goals.scene, false);
  assert.equal(order.draft.goals.clip, false);
  assert.equal(order.draft.goals.brand, false);
});

test('a preview revision is added to the same conversation without losing selection', () => {
  let state = submitOrder(createConfiguredOrder());
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);

  state = sendPreviewRevision(state, candidateId, '前三秒商品露出提前');
  const order = state.orders[state.activeOrderId];

  assert.equal(order.selectedCandidateId, candidateId);
  assert.equal(order.messages.at(-2).kind, 'revision');
  assert.match(order.messages.at(-2).text, /前三秒商品露出提前/);
  assert.match(order.messages.at(-1).text, /候选 01/);
});

test('production conversations keep drafts candidates and pane preferences isolated', () => {
  let state = createConfiguredOrder();
  const firstId = state.activeOrderId;
  state = submitOrder(state);
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  state = togglePanel(state, 'results', false);

  state = createOrder(state);
  const secondId = state.activeOrderId;
  state = updateOrderDraft(state, { market: '巴西' });
  state = openOrder(state, firstId);

  assert.equal(state.activeOrderId, firstId);
  assert.equal(state.orders[firstId].panes.results, false);
  assert.equal(state.orders[firstId].candidates[0].status, 'previewable');
  assert.equal(state.orders[secondId].draft.market, '巴西');
  assert.equal(state.orders[secondId].candidates.length, 0);
});

test('candidate review, revision and export preserve an auditable version state', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  state = resolveMissingMaterial(state, 'ai');
  state = advanceOrder(state);
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;

  state = selectCandidate(state, candidateId);
  state = requestCandidateRevision(state, candidateId, '把前三秒商品露出提前');
  let candidate = state.orders[state.activeOrderId].candidates[0];
  assert.equal(candidate.status, 'revision');
  assert.equal(candidate.version, 'V2');
  assert.match(candidate.review, /把前三秒商品露出提前/);

  state = approveCandidate(state, candidateId);
  candidate = state.orders[state.activeOrderId].candidates[0];
  assert.equal(candidate.status, 'approved');
  assert.equal(candidate.review, '人工审核通过');

  state = exportCandidate(state, candidateId);
  candidate = state.orders[state.activeOrderId].candidates[0];
  assert.equal(candidate.status, 'exported');
  assert.equal(candidate.exported, true);
});

test('natural-language intent parsing keeps the target market and product when no shortcut is chosen', () => {
  const parsed = parseReplicationIntent('人物换成拉丁裔年轻女性，场景沿用，片段使用 AI', {
    targetCountry: '墨西哥',
    targetProduct: { source: 'library', name: '便携式榨汁杯 Pro' },
  });

  assert.equal(parsed.quickMode, '');
  assert.equal(parsed.targetCountry, '墨西哥');
  assert.deepEqual(parsed.targetProduct, { source: 'library', name: '便携式榨汁杯 Pro' });
  assert.equal(parsed.strategies.person, 'replace');
  assert.equal(parsed.strategies.scene, 'keep');
  assert.equal(parsed.strategies.clip, 'ai');
});

test('natural-language intent parsing flags a same-product shortcut that conflicts with a replacement product', () => {
  const parsed = parseReplicationIntent('同商品跨国家本地化', {
    targetProduct: { source: 'library', name: '便携式榨汁杯 Pro' },
  });

  assert.deepEqual(parsed.conflicts, ['same_product_with_target_product']);
});

test('plan language and direct mapping updates operate on the five replacement groups', () => {
  let state = createPlanOrder();
  state = updatePlanFromNaturalLanguage(state, '投放巴西，生成 5 条，人物换成拉丁裔年轻女性');
  state = updateReplacementMapping(state, 'product', {
    target: { source: 'library', name: '便携式榨汁杯 Pro' },
    scope: 'all_exposures',
  });
  state = applyReplacementGroupRule(state, 'person', {
    strategy: 'replace',
    target: '拉丁裔年轻女性，自然妆容，真实生活方式创作者',
  });

  const order = state.orders[state.activeOrderId];
  assert.equal(order.intentDraft.targetCountry, '巴西');
  assert.equal(order.intentDraft.candidateCount, 5);
  assert.equal(order.replacementPlan.localization.targetCountry, '巴西');
  assert.equal(order.replacementPlan.localization.language, '葡萄牙语');
  assert.deepEqual(order.replacementPlan.product, {
    target: { source: 'library', name: '便携式榨汁杯 Pro' },
    scope: 'all_exposures',
    exposureCount: 5,
  });
  assert.equal(order.replacementPlan.person.strategy, 'replace');
  assert.match(order.replacementPlan.person.target, /拉丁裔年轻女性/);
  assert.deepEqual(Object.keys(order.replacementPlan).filter((key) => key !== 'blockingItems'), ['product', 'localization', 'person', 'scene', 'clip']);
});
