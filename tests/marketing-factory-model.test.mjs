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
  resolveReplacementPlanBlocker,
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
  updateIntentStrategy,
  updateIntentFromNaturalLanguage,
  clearIntentTargetProduct,
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

test('reopening configuration archives the prior candidate version while returning to intent review', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);
  state = requestCandidateRevision(state, candidateId, '保留旧版本测试');

  const before = structuredClone(state.orders[state.activeOrderId]);
  state = reopenOrderConfiguration(state);
  const reopened = state.orders[state.activeOrderId];

  assert.equal(reopened.formCollapsed, false);
  assert.equal(reopened.editingConfiguration, false);
  assert.equal(reopened.phase, 'intake');
  assert.equal(reopened.replacementPlan.status, 'invalidated');
  assert.deepEqual(reopened.candidates, before.candidates);
  assert.deepEqual(reopened.archivedCandidateSets.at(-1), before.candidates);
  assert.equal(reopened.selectedCandidateId, candidateId);
  assert.deepEqual(reopened.panes, before.panes);
  assert.deepEqual(reopened.candidates[0].versionHistory, before.candidates[0].versionHistory);
});

test('cancelling an invalidated reconfiguration cannot revive the old replacement plan', () => {
  let state = submitOrder(createConfiguredOrder());
  state = reopenOrderConfiguration(state);
  state = updateOrderDraft(state, { market: '美国', candidateCount: 5 });
  state = cancelOrderConfigurationEdit(state);
  const order = state.orders[state.activeOrderId];

  assert.equal(order.formCollapsed, false);
  assert.equal(order.editingConfiguration, false);
  assert.equal(order.phase, 'intake');
  assert.equal(order.replacementPlan.status, 'invalidated');
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
    inheritReference: false,
  });
  assert.equal(order.replacementPlan.person.strategy, 'replace');
  assert.match(order.replacementPlan.person.target, /拉丁裔年轻女性/);
  assert.deepEqual(Object.keys(order.replacementPlan).filter((key) => !['blockingItems', 'affectedGroups'].includes(key)), ['product', 'localization', 'person', 'scene', 'clip', 'objects']);
});

test('setting an AI person strategy preserves AI through intent review and the replacement plan', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = updateIntentStrategy(state, 'person', 'ai');
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = completeAnalysis(state);
  const order = state.orders[state.activeOrderId];

  assert.equal(order.intentDraft.strategies.person, 'ai');
  assert.equal(order.replacementPlan.person.strategy, 'ai');
});

test('intent natural language updates the first form without starting analysis', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateIntentFromNaturalLanguage(state, '投放巴西，人物用 AI，片段沿用');
  const order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'intake');
  assert.equal(order.intentDraft.targetCountry, '巴西');
  assert.equal(order.intentDraft.strategies.person, 'ai');
  assert.equal(order.intentDraft.strategies.clip, 'keep');
});

test('intent understanding groups replace keep AI and conflicts into readable decisions', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = updateIntentStrategy(state, 'person', 'ai');
  state = updateIntentStrategy(state, 'scene', 'replace');
  const summary = state.orders[state.activeOrderId].intentDraft.understandingSummary;

  assert.match(summary, /必须更改：场景/);
  assert.match(summary, /必须保持：片段/);
  assert.match(summary, /交给 AI 判断：人物/);
  assert.match(summary, /存在冲突：同商品本地化不能同时指定目标商品/);
  assert.doesNotMatch(summary, /人物ai|场景replace|片段keep/);
});

test('switching or clearing a shortcut cannot leave a hidden target product in an original-product path', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    replicationMode: 'replace_product',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = updateOrderDraft(state, { replicationMode: 'same_product' });
  let order = state.orders[state.activeOrderId];

  assert.deepEqual(order.intentDraft.targetProduct, { source: '', name: '' });
  assert.equal(order.draft.product.name, '');
  assert.deepEqual(order.intentDraft.conflicts, []);

  state = updateOrderDraft(state, {
    replicationMode: 'replace_product',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = updateOrderDraft(state, { replicationMode: '' });
  order = state.orders[state.activeOrderId];
  assert.equal(order.intentDraft.quickMode, '');
  assert.equal(order.intentDraft.targetProduct.name, '');
});

test('clearing a reviewed target product removes the same-product conflict without changing the reference', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = submitReplicationIntent(state);
  state = clearIntentTargetProduct(state);
  const order = state.orders[state.activeOrderId];

  assert.equal(order.intentDraft.reference.name, '参考爆款视频.mp4');
  assert.equal(order.intentDraft.targetProduct.name, '');
  assert.deepEqual(order.intentDraft.conflicts, []);
});

test('clearing a same-product conflict from the replacement plan removes its stale target and unlocks confirmation', () => {
  let state = createPlanOrder();
  state = updateReplacementMapping(state, 'product', {
    target: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  let order = state.orders[state.activeOrderId];
  assert.equal(order.phase, 'plan');
  assert.deepEqual(order.intentDraft.conflicts, ['same_product_with_target_product']);
  assert.deepEqual(order.replacementPlan.blockingItems, ['same_product_with_target_product']);

  state = clearIntentTargetProduct(state);
  state = confirmProductionPlan(state);
  order = state.orders[state.activeOrderId];

  assert.equal(order.intentDraft.targetProduct.name, '');
  assert.equal(order.draft.product.name, '');
  assert.deepEqual(order.intentDraft.conflicts, []);
  assert.deepEqual(order.replacementPlan.blockingItems, []);
  assert.equal(order.phase, 'running');
});

test('reopening a confirmed order returns to intent configuration and invalidates only the replacement plan', () => {
  let state = submitOrder(createConfiguredOrder());
  const previousCandidates = structuredClone(state.orders[state.activeOrderId].candidates);
  state = reopenOrderConfiguration(state);
  const order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'intake');
  assert.equal(order.editingConfiguration, false);
  assert.equal(order.replacementPlan.status, 'invalidated');
  assert.deepEqual(order.candidates, previousCandidates);
});

test('natural-language plan updates record every mapping group changed by the instruction', () => {
  let state = createPlanOrder();
  state = updatePlanFromNaturalLanguage(state, '投放巴西，人物用 AI，场景用 AI，片段用 AI');
  const order = state.orders[state.activeOrderId];

  assert.deepEqual(order.replacementPlan.affectedGroups, ['localization', 'person', 'scene', 'clip']);
});

test('replace strategies block production until every replaced person scene and clip has a target source', () => {
  let state = createPlanOrder();
  state = applyReplacementGroupRule(state, 'person', { strategy: 'replace' });
  state = applyReplacementGroupRule(state, 'scene', { strategy: 'replace' });
  state = applyReplacementGroupRule(state, 'clip', { strategy: 'replace' });
  state = confirmProductionPlan(state);
  let order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'plan');
  assert.deepEqual(order.replacementPlan.blockingItems, ['person_material', 'scene_material', 'clip_material']);

  state = applyReplacementGroupRule(state, 'person', { strategy: 'replace', target: '人物库候选' });
  state = applyReplacementGroupRule(state, 'scene', { strategy: 'replace', target: '已上传场景素材' });
  state = applyReplacementGroupRule(state, 'clip', { strategy: 'replace', target: '已上传片段素材' });
  state = confirmProductionPlan(state);
  order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'running');
});

test('typed blocker resolutions change the matching model field and unlock only that blocker', () => {
  let state = createPlanOrder();
  state = updateReplacementMapping(state, 'localization', { targetCountry: '' });
  let order = state.orders[state.activeOrderId];
  assert.deepEqual(order.replacementPlan.blockingItems, ['market']);

  state = updateReplacementMapping(state, 'localization', { targetCountry: '巴西' });
  order = state.orders[state.activeOrderId];
  assert.deepEqual(order.replacementPlan.blockingItems, []);

  state = applyReplacementGroupRule(state, 'scene', { strategy: 'replace' });
  state = confirmProductionPlan(state);
  order = state.orders[state.activeOrderId];
  assert.deepEqual(order.replacementPlan.blockingItems, ['scene_material']);

  state = resolveReplacementPlanBlocker(state, 'scene_material', 'upload');
  order = state.orders[state.activeOrderId];
  assert.equal(order.replacementPlan.scene.target, '待上传替代素材');
  assert.deepEqual(order.replacementPlan.blockingItems, []);
});

test('conversation input synchronizes the real intent draft in intake and intent review without bypassing its gate', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = sendConversationMessage(state, '投放巴西，人物用 AI，场景换掉');
  let order = state.orders[state.activeOrderId];

  assert.equal(order.intentDraft.targetCountry, '巴西');
  assert.equal(order.intentDraft.strategies.person, 'ai');
  assert.equal(order.intentDraft.strategies.scene, 'replace');
  assert.match(order.messages.at(-1).text, /同步到复刻配置/);

  state = updateOrderDraft(state, {
    replicationMode: 'replace_product',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = submitReplicationIntent(state);
  state = sendConversationMessage(state, '同商品，投放墨西哥');
  order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'intent_review');
  assert.equal(order.intentDraft.quickMode, 'same_product');
  assert.equal(order.intentDraft.targetCountry, '墨西哥');
  assert.deepEqual(order.intentDraft.blockingItems, ['same_product_with_target_product']);
});

test('conversation input synchronizes the replacement plan in plan but remains an ordinary message while running', () => {
  let state = createPlanOrder();
  state = sendConversationMessage(state, '投放巴西，生成 5 条，人物用 AI，场景用 AI');
  let order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'plan');
  assert.equal(order.intentDraft.targetCountry, '巴西');
  assert.equal(order.replacementPlan.localization.targetCountry, '巴西');
  assert.equal(order.replacementPlan.person.strategy, 'ai');
  assert.equal(order.replacementPlan.scene.strategy, 'ai');
  assert.deepEqual(order.replacementPlan.affectedGroups, ['localization', 'person', 'scene']);
  assert.equal(order.candidates.length, 0);

  state = confirmProductionPlan(state);
  const before = structuredClone(state.orders[state.activeOrderId].replacementPlan);
  state = sendConversationMessage(state, '投放墨西哥，人物用 AI');
  order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'running');
  assert.deepEqual(order.replacementPlan, before);
  assert.match(order.messages.at(-1).text, /我已记录这条修改要求/);
  assert.doesNotMatch(order.messages.at(-1).text, /同步到复刻配置/);
});

test('replacement plans make reference inheritance explicit when shortcuts leave country or product unchanged', () => {
  let replacementState = openReplicationTool(createDemoState(), 'welcome-card');
  replacementState = updateOrderDraft(replacementState, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'replace_product',
  });
  replacementState = submitReplicationIntent(replacementState);
  replacementState = confirmReplicationIntent(replacementState);
  while (replacementState.orders[replacementState.activeOrderId].phase === 'analyzing') replacementState = advanceReferenceAnalysis(replacementState);
  let order = replacementState.orders[replacementState.activeOrderId];

  assert.equal(order.replacementPlan.localization.inheritReference, true);
  assert.deepEqual(order.replacementPlan.blockingItems, ['product']);

  let unchangedState = openReplicationTool(createDemoState(), 'welcome-card');
  unchangedState = updateOrderDraft(unchangedState, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  unchangedState = submitReplicationIntent(unchangedState);
  unchangedState = confirmReplicationIntent(unchangedState);
  while (unchangedState.orders[unchangedState.activeOrderId].phase === 'analyzing') unchangedState = advanceReferenceAnalysis(unchangedState);
  unchangedState = confirmProductionPlan(unchangedState);
  order = unchangedState.orders[unchangedState.activeOrderId];

  assert.equal(order.replacementPlan.product.inheritReference, true);
  assert.equal(order.replacementPlan.localization.inheritReference, true);
  assert.equal(order.phase, 'running');
  assert.match(order.subtitle, /沿用参考视频/);
  assert.doesNotMatch(order.subtitle, /^\s*·|·\s*$/);
});

test('replacement plan exposes deterministic object mappings and allows one object to differ from its group rule', () => {
  let state = createPlanOrder();
  let plan = state.orders[state.activeOrderId].replacementPlan;

  assert.equal(plan.objects.filter((item) => item.group === 'person').length, 1);
  assert.deepEqual(plan.objects.find((item) => item.id === 'person-01').source.shotIds, ['shot-01', 'shot-03', 'shot-06', 'shot-09']);
  assert.equal(plan.objects.filter((item) => item.group === 'scene').length, 3);
  assert.ok(plan.objects.filter((item) => item.group === 'clip').length >= 3);
  assert.match(plan.objects.find((item) => item.id === 'clip-01').source.range.start, /^00:/);

  state = updateReplacementMapping(state, 'scene', {
    objectId: 'scene-kitchen',
    objectPatch: { strategy: 'ai' },
  });
  plan = state.orders[state.activeOrderId].replacementPlan;
  assert.equal(plan.objects.find((item) => item.id === 'scene-kitchen').strategy, 'ai');
  assert.equal(plan.scene.strategy, 'keep');
});

test('natural language does not silently overwrite an explicit first-form strategy and produces a typed gate', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = updateIntentStrategy(state, 'person', 'keep');
  state = updateIntentFromNaturalLanguage(state, '人物用 AI');
  let order = state.orders[state.activeOrderId];

  assert.equal(order.intentDraft.strategies.person, 'keep');
  assert.deepEqual(order.intentDraft.strategyConflicts, [{
    type: 'person_strategy_conflict', group: 'person', structured: 'keep', inferred: 'ai',
  }]);

  state = submitReplicationIntent(state);
  order = state.orders[state.activeOrderId];
  assert.deepEqual(order.intentDraft.blockingItems, ['person_strategy_conflict']);

  state = updateIntentStrategy(state, 'person', 'ai');
  order = state.orders[state.activeOrderId];
  assert.deepEqual(order.intentDraft.strategyConflicts, []);
  assert.deepEqual(order.intentDraft.blockingItems, []);
});

test('reference analysis replaces one progress message and can fail back to an editable retry state', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  state = startReferenceAnalysis(state);
  state = advanceReferenceAnalysis(state);
  let order = state.orders[state.activeOrderId];
  assert.equal(order.messages.filter((message) => message.kind === 'progress').length, 1);
  assert.equal(order.messages.find((message) => message.kind === 'progress').progress, 48);

  state = advanceReferenceAnalysis(state, { fail: true });
  order = state.orders[state.activeOrderId];
  assert.equal(order.phase, 'intake');
  assert.equal(order.analysis.status, 'failed');
  assert.equal(order.formCollapsed, false);
  assert.match(order.messages.at(-1).text, /分析失败/);

  state = startReferenceAnalysis(state);
  order = state.orders[state.activeOrderId];
  assert.equal(order.phase, 'analyzing');
  assert.equal(order.messages.filter((message) => message.kind === 'progress').length, 1);
});
