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
  openReplacementTargetPicker,
  chooseReplacementTarget,
  clearIntentTargetProduct,
  sendConversationMessage,
  undoLastPlanChange,
  submitReplicationIntent,
  confirmReplicationIntent,
  confirmProductionPlan,
  updateOrderDraft,
  updateIntentStrategy,
  updateIntentFromNaturalLanguage,
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

test('embedded forms leave the persistent composer as the only free-text entry', () => {
  const intakeHtml = render(openReplicationTool(createDemoState(), 'welcome-card'));
  const planHtml = render(createPlanState());

  assert.doesNotMatch(intakeHtml, /data-field="intentNaturalLanguage"/);
  assert.doesNotMatch(intakeHtml, /data-action="recognize-intent"/);
  assert.doesNotMatch(planHtml, /class="plan-language"/);
  assert.doesNotMatch(planHtml, /data-action="apply-plan-language"/);
  assert.equal((planHtml.match(/id="conversation-input"/g) || []).length, 1);
});

test('form two is an attention-first source-to-target review with settled work disclosed', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'replace_product',
  });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  const html = render(state);

  assert.match(html, /确认复刻对象与目标/);
  assert.match(html, /data-review-count="missing"/);
  assert.match(html, /data-review-count="conflict"/);
  assert.match(html, /data-review-count="resolved"/);
  assert.match(html, /data-review-section="attention"/);
  assert.match(html, /原对象[\s\S]*复刻目标/);
  assert.match(html, /AI 已处理 \d+ 项/);
  assert.match(html, /data-review-section="ai-handled"/);
  assert.match(html, /镜头 01/);
  assert.doesNotMatch(html, />shot-01</);
  assert.match(html, /确认替换方案并开始复刻/);
  assert.match(html, /<button[^>]*disabled[^>]*>确认替换方案并开始复刻/);
});

test('a complex object target opens a fixed overlay picker without opening candidate panes', () => {
  let state = createPlanState();
  state = openReplacementTargetPicker(state, 'person', 'person-01');
  const html = render(state);
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /class="replacement-target-drawer"/);
  assert.match(html, /aria-label="选择目标人物"/);
  assert.match(html, /data-action="close-replacement-target-picker"/);
  assert.match(html, /data-action="choose-replacement-target" data-option-id="person-ai"/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
  assert.doesNotMatch(html, /aria-label="视频详情"/);
  assert.match(css, /\.replacement-target-drawer\s*\{[^}]*position:\s*fixed/s);
});

test('composer changes highlight affected comparison rows and expose a working undo action', () => {
  const state = sendConversationMessage(createPlanState(), '人物用 AI');
  const html = render(state);

  assert.match(html, /已把这条要求同步到复刻配置/);
  assert.match(html, /data-action="undo-plan-change"/);
  assert.match(html, /class="mapping-comparison-row[^"]*is-affected[^"]*" data-mapping-object-id="person-01"/);
  assert.match(html, /本次修改/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('composer product-mode changes highlight the product comparison row', () => {
  let state = createPlanState();
  state = updateOrderDraft(state, { replicationMode: 'same_product' });
  state = sendConversationMessage(state, '换商品');
  const html = render(state);

  assert.match(html, /class="mapping-comparison-row[^"]*is-affected[^"]*" data-mapping-object-id="product-main"/);
  assert.match(html, /本次修改[\s\S]*商品/);
  assert.match(html, /data-action="undo-plan-change"/);
});

test('a candidate-count-only composer change names the new count in its change card', () => {
  const html = render(sendConversationMessage(createPlanState(), '生成 5 条'));

  assert.match(html, /本次修改[\s\S]*候选数量：5条/);
  assert.match(html, /data-action="undo-plan-change"/);
});

test('confirmed production does not expose a stale composer undo action', () => {
  let state = sendConversationMessage(createPlanState(), '人物用 AI');
  state = confirmProductionPlan(state);
  const html = render(state);

  assert.doesNotMatch(html, /data-action="undo-plan-change"/);
});

test('only the newest valid plan change message exposes undo and undoing removes it', () => {
  let state = sendConversationMessage(createPlanState(), '人物用 AI');
  const firstToken = state.orders[state.activeOrderId].replacementPlan.review.lastChange.undoToken;
  state = sendConversationMessage(state, '场景用 AI');
  const secondToken = state.orders[state.activeOrderId].replacementPlan.review.lastChange.undoToken;

  let html = render(state);
  assert.equal((html.match(/data-action="undo-plan-change"/g) || []).length, 1);
  assert.doesNotMatch(html, new RegExp(`data-undo-token="${firstToken}"`));
  assert.match(html, new RegExp(`data-undo-token="${secondToken}"`));

  state = undoLastPlanChange(state, secondToken);
  html = render(state);
  assert.equal((html.match(/data-action="undo-plan-change"/g) || []).length, 0);
});

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
  assert.match(html, /data-action="set-object-strategy" data-group="person" data-object-id="person-01" data-value="ai">AI 生成/);
  assert.match(html, /原对象[\s\S]*复刻目标/);
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

test('reopened configuration returns to the intent form instead of an invalidated plan', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = reopenOrderConfiguration(state);
  const html = render(state);

  assert.match(html, /id="reference-intake-form"/);
  assert.match(html, /旧替换清单已失效/);
  assert.doesNotMatch(html, /id="production-plan-form"/);
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
  assert.doesNotMatch(html, /intentNaturalLanguage/);
  assert.doesNotMatch(html, /识别我的要求/);
  assert.match(html, /class="chat-composer conversation-composer chat-primary-composer"/);
  assert.match(html, /AI 理解/);
  assert.match(html, /分析视频并生成替换清单/);
  assert.match(html, /data-action="confirm-replication-intent"/);
});

test('first-form AI strategy is presented as a judgment choice while form-two wording stays separate', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateIntentStrategy(state, 'person', 'ai');
  const html = render(state);

  assert.match(html, /data-action="set-intent-strategy" data-group="person" data-value="ai">交给 AI 判断/);
  assert.doesNotMatch(html, /data-action="set-intent-strategy" data-group="person" data-value="ai">AI 生成/);
});

test('collapsed intent summary shortens the AI decision without changing the second form option', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  state = updateIntentStrategy(state, 'person', 'ai');
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  const html = render(state);
  const summary = html.match(/<article class="intent-summary">[\s\S]*?<\/article>/)?.[0] || '';

  assert.match(summary, /人物AI 判断/);
  assert.match(html, /data-action="set-object-strategy" data-group="person" data-object-id="person-01" data-value="ai">AI 生成/);
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
  assert.match(html, /data-action="clear-intent-target-product"/);
  assert.doesNotMatch(html, /id="production-plan-form"/);
});

test('blocker actions match the missing replacement input instead of offering an unrelated AI action', () => {
  let productState = openReplicationTool(createDemoState(), 'welcome-card');
  productState = updateOrderDraft(productState, { reference: { source: 'upload', name: '参考爆款视频.mp4' }, replicationMode: 'replace_product' });
  productState = submitReplicationIntent(productState);
  productState = confirmReplicationIntent(productState);
  productState = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(productState)));
  const productHtml = render(productState);

  assert.match(productHtml, /data-action="open-replacement-target-picker" data-group="product" data-object-id="product-main"/);
  assert.doesNotMatch(productHtml, /data-action="resolve-plan-limit" data-blocker="product"/);

  let marketState = openReplicationTool(createDemoState(), 'welcome-card');
  marketState = updateOrderDraft(marketState, { reference: { source: 'upload', name: '参考爆款视频.mp4' }, replicationMode: 'same_product' });
  marketState = submitReplicationIntent(marketState);
  marketState = confirmReplicationIntent(marketState);
  marketState = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(marketState)));
  const marketHtml = render(marketState);

  assert.match(marketHtml, /data-plan-field="targetCountry"/);
  assert.doesNotMatch(marketHtml, /data-action="resolve-plan-limit" data-blocker="product"/);
});

test('a same-product target conflict exposes a real path back to the original product', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  state = openReplacementTargetPicker(state, 'product', 'product-main');
  state = chooseReplacementTarget(state, 'product-library');

  let html = render(state);
  assert.match(html, /data-review-count="conflict"[^>]*>冲突 1/);
  assert.match(html, /data-action="clear-intent-target-product">沿用原商品/);
  assert.match(html, /<button[^>]*disabled[^>]*>确认替换方案并开始复刻/);

  state = clearIntentTargetProduct(state);
  html = render(state);
  const confirmButton = html.match(/<button[^>]*>确认替换方案并开始复刻<\/button>/)?.[0] || '';
  assert.match(html, /data-review-count="conflict"[^>]*>冲突 0/);
  assert.doesNotMatch(confirmButton, /disabled/);

  state = confirmProductionPlan(state);
  assert.equal(state.orders[state.activeOrderId].phase, 'running');
});

test('reopening configuration renders the first form and explicitly marks the old replacement plan invalid', () => {
  let state = submitOrder(applyDemoPreset(openReplicationTool(createDemoState(), 'welcome-card')));
  state = reopenOrderConfiguration(state);
  const html = render(state);

  assert.match(html, /id="reference-intake-form"/);
  assert.match(html, /旧替换清单已失效/);
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
  assert.match(html, /确认复刻对象与目标/);
  assert.match(html, /id="production-plan-form"/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('conversation orders intent, one analysis progress message, completion, and the new plan', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  const html = render(state);
  const intentIndex = html.indexOf('已确认复刻意图');
  const progressIndex = html.indexOf('正在读取镜头结构');
  const completionIndex = html.indexOf('分析完成：共');
  const planIndex = html.indexOf('确认复刻对象与目标');

  assert.ok(intentIndex < progressIndex && progressIndex < completionIndex && completionIndex < planIndex);
  assert.equal((html.match(/正在读取镜头结构/g) || []).length, 1);
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
  assert.match(html, /原对象[\s\S]*→[\s\S]*复刻目标/);
  assert.match(html, /data-action="set-object-strategy" data-group="person" data-object-id="person-01" data-value="ai"/);
  assert.match(html, /class="mapping-comparison-row[^"]*is-affected[^"]*" data-mapping-object-id="person-01"/);
  assert.match(html, /1 条[\s\S]*3 条[\s\S]*5 条/);
  assert.match(html, /确认替换方案并开始复刻/);
  assert.match(html, /<button[^>]*disabled[^>]*>确认替换方案并开始复刻/);
  assert.doesNotMatch(html, /aria-label="候选视频任务"/);
});

test('form two labels untouched market and product mappings as inherited reference values', () => {
  let replacementState = openReplicationTool(createDemoState(), 'welcome-card');
  replacementState = updateOrderDraft(replacementState, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'replace_product',
  });
  replacementState = submitReplicationIntent(replacementState);
  replacementState = confirmReplicationIntent(replacementState);
  replacementState = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(replacementState)));
  let html = render(replacementState);

  assert.match(html, /本地化[\s\S]*沿用原国家/);
  assert.doesNotMatch(html, /本地化[\s\S]*待选择国家/);

  let untouchedState = openReplicationTool(createDemoState(), 'welcome-card');
  untouchedState = updateOrderDraft(untouchedState, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  untouchedState = submitReplicationIntent(untouchedState);
  untouchedState = confirmReplicationIntent(untouchedState);
  untouchedState = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(untouchedState)));
  html = render(untouchedState);

  assert.match(html, /商品[\s\S]*沿用参考视频/);
  assert.match(html, /本地化[\s\S]*沿用参考视频/);
});

test('form two renders compact rows for every deterministic object and exposes row-level controls', () => {
  const html = render(createPlanState());

  assert.equal((html.match(/data-mapping-object-id="scene-/g) || []).length, 3);
  assert.ok((html.match(/data-mapping-object-id="clip-/g) || []).length >= 3);
  assert.match(html, /data-mapping-object-id="person-01"[\s\S]*镜头 01[\s\S]*镜头 03/);
  assert.match(html, /data-mapping-object-id="clip-01"[\s\S]*00:00/);
  assert.match(html, /data-action="set-object-strategy" data-group="scene" data-object-id="scene-kitchen" data-value="ai"/);
});

test('a structured strategy conflict is visible in form one instead of being silently replaced by natural language', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  state = updateIntentStrategy(state, 'person', 'keep');
  state = updateIntentFromNaturalLanguage(state, '人物用 AI');
  state = submitReplicationIntent(state);
  const html = render(state);

  assert.match(html, /人物.*保留.*AI 判断/);
  assert.match(html, /person_strategy_conflict/);
  assert.match(html, /当前有冲突需要处理/);
});

test('analysis failure returns an editable form with a retry action', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'same_product',
    market: '墨西哥',
  });
  state = startReferenceAnalysis(state);
  state = advanceReferenceAnalysis(state, { fail: true });
  const html = render(state);

  assert.match(html, /id="reference-intake-form"/);
  assert.match(html, /分析失败/);
  assert.match(html, /data-action="retry-reference-analysis"/);
});

test('confirmed summaries and preview details use inheritance-aware market language and product labels', () => {
  let state = openReplicationTool(createDemoState(), 'welcome-card');
  state = updateOrderDraft(state, {
    reference: { source: 'upload', name: '参考爆款视频.mp4' },
    replicationMode: 'replace_product',
    product: { source: 'library', name: '新商品 Pro' },
  });
  state = submitReplicationIntent(state);
  state = confirmReplicationIntent(state);
  state = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(state)));
  state = confirmProductionPlan(state);
  state = advanceOrder(advanceOrder(advanceOrder(state)));
  state = selectCandidate(state, state.orders[state.activeOrderId].candidates[0].id);
  const html = render(state);

  assert.match(html, /生产方案已确认[\s\S]*新商品 Pro[\s\S]*沿用原国家[\s\S]*沿用参考视频语言/);
  assert.match(html, /替换核对[\s\S]*沿用原国家[\s\S]*沿用参考视频语言/);
  assert.doesNotMatch(html, /<p>\s*·\s*·\s*3 条候选/);
  assert.doesNotMatch(html, />语言、字幕与口播已本地化/);

  let inheritedState = openReplicationTool(createDemoState(), 'welcome-card');
  inheritedState = updateOrderDraft(inheritedState, { reference: { source: 'upload', name: '参考爆款视频.mp4' } });
  inheritedState = submitReplicationIntent(inheritedState);
  inheritedState = confirmReplicationIntent(inheritedState);
  inheritedState = advanceReferenceAnalysis(advanceReferenceAnalysis(advanceReferenceAnalysis(inheritedState)));
  inheritedState = confirmProductionPlan(inheritedState);
  inheritedState = advanceOrder(advanceOrder(advanceOrder(inheritedState)));
  inheritedState = selectCandidate(inheritedState, inheritedState.orders[inheritedState.activeOrderId].candidates[0].id);
  const inheritedHtml = render(inheritedState);

  assert.match(inheritedHtml, /生产方案已确认[\s\S]*沿用参考视频[\s\S]*沿用参考视频语言/);
  assert.match(inheritedHtml, /替换核对[\s\S]*商品处理：沿用参考视频[\s\S]*市场：沿用参考视频/);
});

test('object rows without an override inherit their group rule instead of requesting missing material', () => {
  const html = render(createPlanState());
  const rowStart = html.indexOf('data-mapping-object-id="scene-kitchen"');
  const rowEnd = html.indexOf('data-mapping-object-id="scene-bedroom"', rowStart);
  const sceneRow = html.slice(rowStart, rowEnd);

  assert.match(sceneRow, /沿用当前分组规则/);
  assert.doesNotMatch(sceneRow, /待补充目标素材/);
});

test('row-level replace clicks show a replacement target instead of the stale keep summary', () => {
  let state = createPlanState();
  for (const [group, objectId, replacementLabel, staleKeepLabel] of [
    ['person', 'person-01', '待选择或上传人物', '保留原人物'],
    ['scene', 'scene-kitchen', '待选择或上传场景', '保留原场景'],
    ['clip', 'clip-01', '待上传替代视频片段', '保留原片段'],
  ]) {
    state = updateReplacementMapping(state, group, { objectId, objectPatch: { strategy: 'replace' } });
    const html = render(state);
    const rowStart = html.indexOf(`data-mapping-object-id="${objectId}"`);
    const nextRow = html.indexOf('data-mapping-object-id=', rowStart + 1);
    const row = html.slice(rowStart, nextRow === -1 ? undefined : nextRow);

    assert.match(row, new RegExp(`class="is-active"[^>]+data-value="replace"`));
    assert.match(row, new RegExp(replacementLabel));
    assert.doesNotMatch(row, new RegExp(staleKeepLabel));
  }
});
