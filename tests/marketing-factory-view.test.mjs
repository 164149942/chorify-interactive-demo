import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  advanceOrder,
  applyDemoPreset,
  approveCandidate,
  createDemoState,
  exportCandidate,
  getMarketingFactoryViewModel,
  openReplicationTool,
  reopenOrderConfiguration,
  selectCandidate,
  submitOrder,
} from '../marketing-factory-model.mjs';
import { renderMarketingFactory } from '../marketing-factory-view.mjs';

function render(state) {
  return renderMarketingFactory(getMarketingFactoryViewModel(state));
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

test('opening the tool creates one chat and renders the structured form inline', () => {
  const html = render(openReplicationTool(createDemoState(), 'welcome-card'));

  assert.match(html, /aria-label="AI 聊天会话"/);
  assert.match(html, /id="replication-config"/);
  assert.match(html, /参考视频/);
  assert.match(html, /目标商品/);
  assert.match(html, /投放国家/);
  assert.match(html, /商品将在原视频全部露出位置替换/);
  assert.match(html, /人物/);
  assert.match(html, /场景/);
  assert.match(html, /视频片段/);
  assert.match(html, /品牌 Logo/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('the replication form is an AI tool message inside the existing conversation lane', () => {
  const html = render(openReplicationTool(createDemoState(), 'welcome-card'));

  assert.match(
    html,
    /class="conversation-lane"[\s\S]*class="chat-tool-message"[\s\S]*class="message-avatar"[^>]*>AI<[\s\S]*id="replication-config"/,
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

test('conditional replacement controls stay inside the chat form', () => {
  const html = render(applyDemoPreset(openReplicationTool(createDemoState(), 'composer-tool')));

  assert.match(html, /人物来源/);
  assert.match(html, /AI 生成/);
  assert.match(html, /25—35 岁墨西哥女性/);
  assert.match(html, /Chorify Cup 品牌 Logo/);
  assert.doesNotMatch(html, /场景替换说明/);
});

test('submitting the form leaves a compact chat card and opens all candidate task slots', () => {
  const state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  const html = render(state);

  assert.match(html, /配置已确认/);
  assert.match(html, /重新打开配置/);
  assert.doesNotMatch(html, /id="replication-config"/);
  assert.match(html, /aria-label="候选视频任务"/);
  assert.equal((html.match(/data-action="select-candidate"/g) || []).length, 3);
  assert.match(html, /候选 01/);
  assert.match(html, /等待生成/);
  assert.match(html, /执行记录/);
  assert.doesNotMatch(html, /aria-label="视频预览"/);
});

test('reopened configuration preserves submitted values inside the same conversation', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = reopenOrderConfiguration(state);
  const html = render(state);

  assert.match(html, /id="replication-config"/);
  assert.match(html, /TikTok 爆款榨汁杯视频\.mp4/);
  assert.match(html, /便携式榨汁杯 Pro/);
  assert.match(html, /取消修改/);
  assert.match(html, /保存配置并重新生成/);
});

test('selecting a ready candidate opens the far-right preview and revision composer', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  const candidateId = state.orders[state.activeOrderId].candidates[0].id;
  state = selectCandidate(state, candidateId);
  const html = render(state);

  assert.match(html, /aria-label="视频预览"/);
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
