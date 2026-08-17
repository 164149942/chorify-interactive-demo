import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  advanceOrder,
  advanceReferenceAnalysis,
  applyDemoPreset,
  approveCandidate,
  createDemoState,
  exportCandidate,
  getMarketingFactoryViewModel,
  openReplicationTool,
  submitReplicationIntent,
  confirmReplicationIntent,
  updateOrderDraft,
  updateReplacementMapping,
  updatePlanFromNaturalLanguage,
  reopenOrderConfiguration,
  selectCandidate,
  setCandidateView,
  startReferenceAnalysis,
  submitOrder,
} from '../marketing-factory-model.mjs';
import { renderMarketingFactory } from '../marketing-factory-view.mjs';

function render(state) {
  return renderMarketingFactory(getMarketingFactoryViewModel(state));
}

function createPlanState() {
  let state = applyDemoPreset(openReplicationTool(createDemoState(), 'composer-tool'));
  state = startReferenceAnalysis(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  return state;
}

test('new chat keeps the existing Chorify navigation and exposes video replication as a tool', () => {
  const html = render(createDemoState());

  assert.match(html, /Chorify AI/);
  assert.match(html, /AI 聊天/);
  assert.match(html, /无限画布/);
  assert.match(html, /视频工作流/);
  assert.match(html, /今天想推进哪件创作/);
  assert.match(html, /视频复刻/);
  assert.match(html, /data-action="open-replication-tool"/);
  assert.doesNotMatch(html, /营销工厂首页/);
});

test('opening the tool creates one chat and renders the compact intake inline', () => {
  const html = render(openReplicationTool(createDemoState(), 'welcome-card'));

  assert.match(html, /aria-label="AI 聊天会话"/);
  assert.match(html, /id="reference-intake-form"/);
  assert.match(html, /参考视频/);
  assert.match(html, /同商品，换投放国家/);
  assert.match(html, /同国家，换商品/);
  assert.doesNotMatch(html, /目标国家<\/strong>/);
  assert.doesNotMatch(html, /目标商品<\/strong>/);
  assert.doesNotMatch(html, /人物来源/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('the replication form is an AI tool message inside the existing conversation lane', () => {
  const html = render(openReplicationTool(createDemoState(), 'welcome-card'));

  assert.match(
    html,
    /class="conversation-lane"[\s\S]*class="chat-tool-message"[\s\S]*class="message-avatar"[^>]*>AI<[\s\S]*id="reference-intake-form"/,
  );
  assert.match(html, /class="chat-composer conversation-composer chat-primary-composer"/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('the form, messages, and composer share the original Chat width contract', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.conversation-lane\s*\{[^}]*width:\s*min\(920px,\s*100%\)[^}]*margin:\s*0 auto/s);
  assert.match(css, /\.conversation-scroll\s*\{[^}]*scrollbar-gutter:\s*stable both-edges/s);
  assert.match(css, /\.conversation-composer\s*\{[^}]*width:\s*min\(920px,\s*calc\(100% - 36px\)\)[^}]*margin:\s*0 auto 14px/s);
  assert.match(css, /\.chat-tool-message\s*\{[^}]*display:\s*flex[^}]*align-items:\s*flex-start/s);
  assert.match(css, /\.chat-tool-message \.replication-card\s*\{[^}]*max-width:\s*none[^}]*margin:\s*0/s);
});

test('opening video replication preserves the welcome canvas and composer visual contract', () => {
  const home = render(createDemoState());
  const conversation = render(openReplicationTool(createDemoState(), 'welcome-card'));
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(home, /class="chat-welcome chat-canvas"/);
  assert.match(conversation, /class="conversation-column chat-canvas"/);
  assert.match(home, /class="welcome-composer chat-primary-composer"/);
  assert.match(conversation, /class="chat-composer conversation-composer chat-primary-composer"/);
  assert.doesNotMatch(conversation, /class="chat-composer conversation-composer chat-primary-composer"[^>]*><small>/);
  assert.match(css, /--chat-canvas-background:\s*radial-gradient\(/);
  assert.match(css, /\.chat-canvas\s*\{[^}]*background:\s*var\(--chat-canvas-background\)/s);
  assert.match(css, /\.chat-primary-composer\s*\{[^}]*background:\s*#fff[^}]*box-shadow:\s*var\(--chat-composer-shadow\)/s);
  assert.doesNotMatch(css, /\.conversation-column[^}]*background:\s*var\(--panel\)/s);
});

test('AI-detected replacement controls stay inside the second chat form', () => {
  const html = render(createPlanState());

  assert.match(html, /data-replacement-group="person"/);
  assert.match(html, /人物库/);
  assert.match(html, /AI/);
  assert.match(html, /目标来源/);
  assert.match(html, /参考视频分析完成/);
  assert.doesNotMatch(html, /场景替换说明/);
});

test('submitting the form leaves a compact chat card and opens all candidate task slots', () => {
  const state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  const html = render(state);

  assert.match(html, /生产方案已确认/);
  assert.match(html, /重新打开配置/);
  assert.doesNotMatch(html, /id="production-plan-form"/);
  assert.match(html, /aria-label="候选视频任务"/);
  assert.equal((html.match(/data-action="select-candidate"/g) || []).length, 3);
  assert.match(html, /候选 01/);
  assert.match(html, /等待生成/);
  assert.match(html, /执行记录/);
  assert.match(html, /aria-label="卡片视图"/);
  assert.match(html, /aria-label="表格视图"/);
  assert.doesNotMatch(html, /class="task-summary"/);
  assert.doesNotMatch(html, /aria-label="视频预览"/);
});

test('video management switches between card and table views without changing its candidates', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  let html = render(state);

  assert.match(html, /class="candidate-tasks candidate-card-view"/);
  assert.equal((html.match(/data-action="select-candidate"/g) || []).length, 3);

  state = setCandidateView(state, 'table');
  html = render(state);
  assert.match(html, /class="candidate-table"/);
  assert.match(html, /<span>视频<\/span><span>状态<\/span><span>版本<\/span><span>时长<\/span>/);
  assert.equal((html.match(/data-action="select-candidate"/g) || []).length, 3);
});

test('clicking any candidate opens its far-right status detail even before preview is ready', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  const queuedCandidateId = state.orders[state.activeOrderId].candidates[1].id;
  state = selectCandidate(state, queuedCandidateId);
  const html = render(state);

  assert.match(html, /aria-label="视频详情"/);
  assert.match(html, /候选 02 · V1/);
  assert.match(html, /等待开始生成/);
  assert.doesNotMatch(html, new RegExp(`data-candidate-id="${queuedCandidateId}" disabled`));
});

test('reopened configuration preserves submitted values inside the same conversation', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = reopenOrderConfiguration(state);
  const html = render(state);

  assert.match(html, /id="production-plan-form"/);
  assert.match(html, /取消修改/);
  assert.match(html, /确认替换方案并开始复刻/);
});

test('selecting a ready candidate opens the far-right preview and revision composer', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);
  const html = render(state);

  assert.match(html, /aria-label="视频详情"/);
  assert.match(html, /候选 01 · V1/);
  assert.match(html, /复刻度 91/);
  assert.match(html, /id="preview-revision-form"/);
  assert.match(html, /把这一条的修改要求发回 AI 对话/);
  assert.match(html, /通过审核/);
});

test('task and preview panel controls expose Frame-like active and inactive states', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const html = render(state);

  assert.match(html, /data-panel="results"[^>]*aria-pressed="true"/);
  assert.match(html, /data-panel="detail"[^>]*aria-pressed="false"/);
  assert.match(html, /panel-toggle[^\"]*is-open/);
});

test('preview keeps human review gating and version delivery actions', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);

  let html = render(state);
  assert.match(html, /等待审核后导出/);

  state = approveCandidate(state, candidateId);
  html = render(state);
  assert.match(html, /可以导出/);

  state = exportCandidate(state, candidateId);
  html = render(state);
  assert.match(html, /已导出/);
});

test('the first inline form captures a replication intent with tri-state choices and AI review', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = submitReplicationIntent(state);
  const html = render(state);

  assert.match(html, /定义这次要怎么复刻/);
  assert.match(html, /data-action="set-replication-mode"/);
  assert.match(html, /data-action="set-intent-strategy" data-group="person" data-value="keep"/);
  assert.match(html, /data-action="set-intent-strategy" data-group="person" data-value="replace"/);
  assert.match(html, /data-action="set-intent-strategy" data-group="person" data-value="ai"/);
  assert.match(html, /识别我的要求/);
  assert.match(html, /AI 理解/);
  assert.match(html, /分析视频并生成替换清单/);
  assert.match(html, /data-action="confirm-replication-intent"/);
});

test('first-form shortcuts expose no-change, country-only, product-only, and country-plus-product fields', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  let html = render(state);
  assert.doesNotMatch(html, /目标国家<\/strong>/);
  assert.doesNotMatch(html, /目标商品<\/strong>/);

  state = updateOrderDraft(state, { replicationMode: 'same_product' });
  html = render(state);
  assert.match(html, /同商品，换投放国家/);
  assert.match(html, /目标国家<\/strong>/);
  assert.doesNotMatch(html, /目标商品<\/strong>/);
  assert.match(html, /data-action="clear-quick-mode"/);

  state = updateOrderDraft(state, { replicationMode: 'replace_product' });
  html = render(state);
  assert.match(html, /同国家，换商品/);
  assert.doesNotMatch(html, /目标国家<\/strong>/);
  assert.match(html, /目标商品<\/strong>/);

  state = updateOrderDraft(state, { replicationMode: 'custom' });
  html = render(state);
  assert.match(html, /商品和国家都更换/);
  assert.match(html, /目标国家<\/strong>/);
  assert.match(html, /目标商品<\/strong>/);
});

test('first form keeps conflicts visible and prevents advancing analysis until they are resolved', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    product: { source: 'library', name: '便携式榨汁杯 Pro' },
  });
  state = submitReplicationIntent(state);
  const html = render(state);

  assert.match(html, /当前有冲突需要处理/);
  assert.match(html, /same_product_with_target_product/);
  assert.doesNotMatch(html, /id="production-plan-form"/);
});

test('analysis is conversational and appends a replacement-plan confirmation card instead of candidates', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  const html = render(state);

  assert.match(html, /class="chat-message is-ai"/);
  assert.match(html, /class="intent-summary"/);
  assert.match(html, /确认替换清单/);
  assert.match(html, /id="production-plan-form"/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('the second inline form renders five mapping groups, applies natural-language changes without generating, and gates blockers', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' }, replicationMode: 'replace_product' });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  state = updatePlanFromNaturalLanguage(state, '人物用 AI');
  const html = render(state);

  assert.match(html, /data-replacement-group="product"/);
  assert.match(html, /data-replacement-group="localization"/);
  assert.match(html, /data-replacement-group="person"/);
  assert.match(html, /data-replacement-group="scene"/);
  assert.match(html, /data-replacement-group="clip"/);
  assert.match(html, /原对象[\s\S]*→[\s\S]*目标对象/);
  assert.match(html, /人物库[\s\S]*上传[\s\S]*AI/);
  assert.match(html, /受影响/);
  assert.match(html, /1 条[\s\S]*3 条[\s\S]*5 条/);
  assert.match(html, /确认替换方案并开始复刻/);
  assert.match(html, /<button[^>]*disabled[^>]*>确认替换方案并开始复刻/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});
