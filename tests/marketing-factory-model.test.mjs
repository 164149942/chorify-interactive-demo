import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceOrder,
  applyDemoPreset,
  createDemoState,
  createOrder,
  getMarketingFactoryViewModel,
  openOrder,
  resolveMissingMaterial,
  approveCandidate,
  exportCandidate,
  requestCandidateRevision,
  selectCandidate,
  sendConversationMessage,
  submitOrder,
  toggleChangeGoal,
  togglePanel,
  updateOrderDraft,
} from '../marketing-factory-model.mjs';

function createConfiguredOrder() {
  let state = createOrder(createDemoState());
  state = applyDemoPreset(state);
  return state;
}

test('a new production conversation starts without results or video detail', () => {
  const state = createOrder(createDemoState());
  const vm = getMarketingFactoryViewModel(state);

  assert.equal(vm.page, 'workbench');
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation']);
  assert.equal(vm.activeOrder.phase, 'draft');
  assert.equal(vm.activeOrder.formCollapsed, false);
});

test('country selection derives localization while unselected goals inherit the reference', () => {
  let state = createOrder(createDemoState());
  state = updateOrderDraft(state, { market: '墨西哥' });

  const order = state.orders[state.activeOrderId];
  assert.equal(order.draft.language, '西班牙语');
  assert.equal(order.draft.subtitleMode, '西班牙语字幕');
  assert.equal(order.draft.goals.product, true);
  assert.equal(order.draft.goals.scene, false);
});

test('product replacement is mandatory and optional goals control conditional sections', () => {
  let state = createOrder(createDemoState());
  state = toggleChangeGoal(state, 'product');
  assert.equal(state.orders[state.activeOrderId].draft.goals.product, true);

  state = toggleChangeGoal(state, 'person');
  state = toggleChangeGoal(state, 'scene');
  const vm = getMarketingFactoryViewModel(state);
  assert.deepEqual(vm.activeOrder.visibleGoalSections, ['product', 'person', 'scene']);
});

test('incomplete configuration stays editable and exposes concrete missing fields', () => {
  let state = createOrder(createDemoState());
  state = submitOrder(state);

  const order = state.orders[state.activeOrderId];
  assert.equal(order.phase, 'draft');
  assert.deepEqual(order.validationErrors, ['reference', 'product', 'market']);
  assert.equal(order.formCollapsed, false);
});

test('submitting a complete order folds the form and begins the replication worklog', () => {
  let state = submitOrder(createConfiguredOrder());
  const order = state.orders[state.activeOrderId];

  assert.equal(order.phase, 'running');
  assert.equal(order.formCollapsed, true);
  assert.equal(order.progress, 12);
  assert.equal(order.messages.at(-1).kind, 'progress');
  assert.deepEqual(getMarketingFactoryViewModel(state).visiblePanes, ['sessions', 'conversation']);
});

test('the first previewable candidate opens results once while detail remains user controlled', () => {
  let state = submitOrder(createConfiguredOrder());
  state = advanceOrder(state);
  state = advanceOrder(state);
  state = advanceOrder(state);

  let vm = getMarketingFactoryViewModel(state);
  assert.equal(vm.activeOrder.candidates[0].status, 'previewable');
  assert.equal(vm.activeOrder.pendingAction.type, 'missing_material');
  assert.deepEqual(vm.visiblePanes, ['sessions', 'conversation', 'results']);

  state = togglePanel(state, 'results', false);
  state = advanceOrder(state);
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
