import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceOrder,
  applyDemoPreset,
  approveCandidate,
  createDemoState,
  createOrder,
  exportCandidate,
  getMarketingFactoryViewModel,
  selectCandidate,
  requestCandidateRevision,
  submitOrder,
} from '../marketing-factory-model.mjs';
import { renderMarketingFactory } from '../marketing-factory-view.mjs';

function render(state) {
  return renderMarketingFactory(getMarketingFactoryViewModel(state));
}

test('home explains the focused replication workflow and exposes recent orders', () => {
  const html = render(createDemoState());

  assert.match(html, /把爆款营销视频变成你的可投放版本/);
  assert.match(html, /参考视频/);
  assert.match(html, /一次配置/);
  assert.match(html, /候选结果/);
  assert.match(html, /墨西哥榨汁杯爆款复刻/);
  assert.match(html, /data-action="create-order"/);
});

test('a blank order renders only the session rail and conversation form', () => {
  const html = render(createOrder(createDemoState()));

  assert.match(html, /aria-label="生产会话"/);
  assert.match(html, /aria-label="AI 生产对话"/);
  assert.doesNotMatch(html, /aria-label="候选视频结果"/);
  assert.doesNotMatch(html, /aria-label="视频详情"/);
  assert.match(html, /复刻配置/);
  assert.match(html, /目标商品/);
  assert.match(html, /投放国家/);
  assert.match(html, /商品将在所有露出位置替换/);
});

test('conditional replacement goals appear in the same embedded form', () => {
  const html = render(applyDemoPreset(createOrder(createDemoState())));

  assert.match(html, /人物来源/);
  assert.match(html, /品牌 Logo/);
  assert.doesNotMatch(html, /场景替换说明/);
});

test('running order replaces the open form with a compact summary and progress log', () => {
  const html = render(submitOrder(applyDemoPreset(createOrder(createDemoState()))));

  assert.match(html, /配置已锁定/);
  assert.match(html, /正在读取参考视频结构/);
  assert.match(html, /12%/);
  assert.doesNotMatch(html, /id="replication-config"/);
});

test('first previewable result opens a candidate panel without opening detail', () => {
  let state = submitOrder(applyDemoPreset(createOrder(createDemoState())));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const html = render(state);

  assert.match(html, /aria-label="候选视频结果"/);
  assert.match(html, /候选 01/);
  assert.match(html, /缺少生活场景素材/);
  assert.doesNotMatch(html, /aria-label="视频详情"/);
});

test('selecting a candidate opens a dedicated detail panel with review actions', () => {
  let state = submitOrder(applyDemoPreset(createOrder(createDemoState())));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  state = selectCandidate(state, state.orders[state.activeOrderId].candidates[0].id);
  const html = render(state);

  assert.match(html, /aria-label="视频详情"/);
  assert.match(html, /复刻度 91/);
  assert.match(html, /通过审核/);
  assert.match(html, /提出修改/);
  assert.match(html, /等待审核后导出/);
});

test('panel controls expose active and inactive visual states', () => {
  let state = submitOrder(applyDemoPreset(createOrder(createDemoState())));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const html = render(state);

  assert.match(html, /data-panel="conversation"[^>]*aria-pressed="true"/);
  assert.match(html, /data-panel="results"[^>]*aria-pressed="true"/);
  assert.match(html, /data-panel="detail"[^>]*aria-pressed="false"/);
});

test('detail renders version history and only marks export after human approval', () => {
  let state = submitOrder(applyDemoPreset(createOrder(createDemoState())));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);
  state = requestCandidateRevision(state, candidateId, '提前商品露出');

  let html = render(state);
  assert.match(html, /V2/);
  assert.match(html, /V1/);
  assert.match(html, /等待审核后导出/);

  state = approveCandidate(state, candidateId);
  html = render(state);
  assert.match(html, /可以导出/);

  state = exportCandidate(state, candidateId);
  html = render(state);
  assert.match(html, /已导出/);
});
