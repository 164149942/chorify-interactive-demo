import {
  advanceOrder,
  advanceReferenceAnalysis,
  applyDemoPreset,
  approveCandidate,
  createDemoState,
  exportCandidate,
  getMarketingFactoryViewModel,
  goHome,
  openReplicationTool,
  openOrder,
  requestCandidateRevision,
  reopenOrderConfiguration,
  cancelOrderConfigurationEdit,
  confirmProductionPlan,
  confirmReplicationIntent,
  resolveMissingMaterial,
  selectCandidate,
  sendConversationMessage,
  sendPreviewRevision,
  setCandidateView,
  startReferenceAnalysis,
  submitOrder,
  submitReplicationIntent,
  toggleChangeGoal,
  togglePanel,
  updateOrderDraft,
  updateIntentFromNaturalLanguage,
  updateIntentStrategy,
  updatePlanFromNaturalLanguage,
  updateReplacementMapping,
  applyReplacementGroupRule,
} from './marketing-factory-model.mjs';
import { renderMarketingFactory } from './marketing-factory-view.mjs';

const app = document.querySelector('#app');
let state = createDemoState();
let notice = '';
let progressTimer = null;

function activeOrder() {
  return state.activeOrderId ? state.orders[state.activeOrderId] : null;
}

function clearProgressTimer() {
  if (progressTimer) window.clearTimeout(progressTimer);
  progressTimer = null;
}

function showNotice(message) {
  notice = message;
  render();
  window.setTimeout(() => {
    if (notice !== message) return;
    notice = '';
    render();
  }, 2400);
}

function render({ scrollConversation = false } = {}) {
  app.innerHTML = `${renderMarketingFactory(getMarketingFactoryViewModel(state))}${notice ? `<div class="demo-toast" role="status">${notice}</div>` : ''}`;
  if (scrollConversation) {
    const region = document.querySelector('[data-scroll-region="conversation"]');
    if (region) region.scrollTop = region.scrollHeight;
  }
}

function scheduleNextProgress(delay = 1250) {
  clearProgressTimer();
  progressTimer = window.setTimeout(() => {
    const before = activeOrder();
    if (!before || !['analyzing', 'running'].includes(before.phase)) return;
    const priorStep = before.phase === 'analyzing' ? before.analysis.step : before.progressStep;
    state = before.phase === 'analyzing' ? advanceReferenceAnalysis(state) : advanceOrder(state);
    render({ scrollConversation: true });
    const after = activeOrder();
    if (after?.phase === 'analyzing' && after.analysis.step !== priorStep) {
      scheduleNextProgress(900);
      return;
    }
    if (after?.phase === 'running' && !after.pendingAction && after.progressStep !== priorStep) {
      scheduleNextProgress();
    } else if (after?.phase === 'running' && after.pendingAction && after.progressStep < 3) {
      scheduleNextProgress();
    }
  }, delay);
}

function updateTextField(field, value) {
  state = updateOrderDraft(state, { [field]: value });
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'open-replication-tool') {
    clearProgressTimer();
    state = openReplicationTool(state, target.dataset.source || 'tool');
    render();
    return;
  }
  if (action === 'open-order') {
    clearProgressTimer();
    state = openOrder(state, target.dataset.orderId);
    render();
    return;
  }
  if (action === 'go-home') {
    clearProgressTimer();
    state = goHome(state);
    render();
    return;
  }
  if (action === 'apply-preset') {
    state = applyDemoPreset(state);
    render();
    return;
  }
  if (action === 'reopen-configuration') {
    state = reopenOrderConfiguration(state);
    render({ scrollConversation: true });
    return;
  }
  if (action === 'cancel-configuration-edit') {
    state = cancelOrderConfigurationEdit(state);
    render({ scrollConversation: true });
    return;
  }
  if (action === 'pick-reference-library') {
    state = updateOrderDraft(state, { reference: { source: 'link', name: 'TikTok 爆款榨汁杯视频.mp4' } });
    render();
    return;
  }
  if (action === 'pick-reference-upload') {
    state = updateOrderDraft(state, { reference: { source: 'upload', name: '参考营销视频_28s.mp4' } });
    render();
    return;
  }
  if (action === 'pick-product-library') {
    state = updateOrderDraft(state, { product: { source: 'library', name: '便携式榨汁杯 Pro' } });
    render();
    return;
  }
  if (action === 'pick-product-upload') {
    state = updateOrderDraft(state, { product: { source: 'upload', name: '新商品资料包.zip' } });
    render();
    return;
  }
  if (action === 'toggle-goal') {
    state = toggleChangeGoal(state, target.dataset.goal);
    render();
    return;
  }
  if (action === 'set-person-mode') {
    updateTextField('personMode', target.dataset.value);
    render();
    return;
  }
  if (action === 'clear-quick-mode') {
    updateTextField('replicationMode', '');
    render();
    return;
  }
  if (action === 'set-intent-strategy') {
    state = updateIntentStrategy(state, target.dataset.group, target.dataset.value);
    render();
    return;
  }
  if (action === 'recognize-intent') {
    const value = document.querySelector('[data-field="intentNaturalLanguage"]')?.value || '';
    state = updateIntentFromNaturalLanguage(state, value);
    render();
    return;
  }
  if (action === 'confirm-replication-intent') {
    state = confirmReplicationIntent(state);
    render({ scrollConversation: true });
    if (activeOrder()?.phase === 'analyzing') scheduleNextProgress(700);
    return;
  }
  if (action === 'pick-replacement-target') {
    const source = target.dataset.source || 'library';
    const product = { source, name: source === 'upload' ? '新商品资料包.zip' : '便携式榨汁杯 Pro' };
    state = updateReplacementMapping(state, target.dataset.group, { target: product, scope: 'all_exposures' });
    render();
    return;
  }
  if (action === 'set-replacement-strategy') {
    state = applyReplacementGroupRule(state, target.dataset.group, { strategy: target.dataset.value });
    render();
    return;
  }
  if (action === 'set-replacement-source') {
    state = applyReplacementGroupRule(state, 'person', { strategy: target.dataset.value === 'ai' ? 'ai' : 'replace', target: target.dataset.value === 'library' ? '人物库候选' : target.dataset.value === 'upload' ? '待上传人物素材' : '' });
    render();
    return;
  }
  if (action === 'apply-plan-language') {
    const value = document.querySelector('[data-field="planNaturalLanguage"]')?.value || '';
    state = updatePlanFromNaturalLanguage(state, value);
    render();
    return;
  }
  if (action === 'set-replication-mode') {
    updateTextField('replicationMode', target.dataset.value);
    render();
    return;
  }
  if (action === 'set-candidate-count') {
    updateTextField('candidateCount', Number(target.dataset.value));
    render();
    return;
  }
  if (action === 'toggle-panel') {
    state = togglePanel(state, target.dataset.panel);
    render();
    return;
  }
  if (action === 'select-candidate') {
    state = selectCandidate(state, target.dataset.candidateId);
    render();
    return;
  }
  if (action === 'set-candidate-view') {
    state = setCandidateView(state, target.dataset.view);
    render();
    return;
  }
  if (action === 'resolve-material') {
    state = resolveMissingMaterial(state, target.dataset.strategy);
    render({ scrollConversation: true });
    if (target.dataset.strategy === 'ai') scheduleNextProgress(1000);
    else showNotice('上传入口为前端 Demo 占位；其他候选仍继续生成。');
    return;
  }
  if (action === 'request-revision') {
    const candidate = activeOrder()?.selectedCandidateId;
    if (!candidate) return;
    state = requestCandidateRevision(state, candidate, '把前三秒商品露出提前，并增强本地口播自然度');
    showNotice('已保留原版本，并创建可对比的新版本。');
    return;
  }
  if (action === 'approve-candidate') {
    const candidate = activeOrder()?.selectedCandidateId;
    if (!candidate) return;
    state = approveCandidate(state, candidate);
    showNotice('当前候选已通过人工审核，可以导出。');
    return;
  }
  if (action === 'export-candidate') {
    const candidate = activeOrder()?.selectedCandidateId;
    if (!candidate) return;
    const before = activeOrder()?.candidates.find((item) => item.id === candidate)?.status;
    state = exportCandidate(state, candidate);
    showNotice(before === 'approved' ? '演示导出完成；正式产品将在这里交付文件。' : '请先通过人工审核，再执行导出。');
    return;
  }
  if (action === 'placeholder') {
    showNotice('该入口为后续能力占位，本版先验证核心生产流程。');
  }
}

function handleSubmit(event) {
  if (event.target.id === 'reference-intake-form') {
    event.preventDefault();
    state = submitReplicationIntent(state);
    const order = activeOrder();
    render({ scrollConversation: true });
    if (order?.phase === 'intent_review' && !order.intentDraft.blockingItems.length) {
      state = confirmReplicationIntent(state);
      render({ scrollConversation: true });
      if (activeOrder()?.phase === 'analyzing') scheduleNextProgress(700);
    } else showNotice('请先补充参考视频，或处理 AI 标出的冲突。');
    return;
  }
  if (event.target.id === 'production-plan-form') {
    event.preventDefault();
    state = confirmProductionPlan(state);
    const order = activeOrder();
    render({ scrollConversation: true });
    if (order?.phase === 'running') scheduleNextProgress();
    else showNotice(order?.draft.replicationMode === 'replace_product' ? '请选择目标商品，并确认投放国家。' : '请选择投放国家。');
    return;
  }
  if (event.target.id === 'conversation-composer') {
    event.preventDefault();
    const input = event.target.querySelector('#conversation-input');
    const value = input?.value || '';
    if (!value.trim()) return;
    state = sendConversationMessage(state, value);
    render({ scrollConversation: true });
    return;
  }
  if (event.target.id === 'home-composer') {
    event.preventDefault();
    const input = event.target.querySelector('#home-input');
    const value = input?.value || '';
    if (!value.trim()) return;
    state = openReplicationTool(state, 'home-prompt');
    state = sendConversationMessage(state, value);
    render({ scrollConversation: true });
    return;
  }
  if (event.target.id === 'preview-revision-form') {
    event.preventDefault();
    const candidateId = activeOrder()?.selectedCandidateId;
    const input = event.target.querySelector('#preview-revision-input');
    const value = input?.value || '';
    if (!candidateId || !value.trim()) return;
    state = sendPreviewRevision(state, candidateId, value);
    render();
    showNotice('修改要求已回流到当前 AI 对话，原版本会保留。');
  }
}

function handleChange(event) {
  if (event.target.dataset.planField === 'targetCountry') {
    state = updateReplacementMapping(state, 'localization', { targetCountry: event.target.value });
    render();
    return;
  }
  const field = event.target.dataset.field;
  if (!field) return;
  const value = event.target.value;
  updateTextField(field, value);
  render();
}

function handleInput(event) {
  const field = event.target.dataset.field;
  if (!field || !['TEXTAREA', 'INPUT'].includes(event.target.tagName)) return;
  updateTextField(field, event.target.value);
}

app.addEventListener('click', handleClick);
app.addEventListener('submit', handleSubmit);
app.addEventListener('change', handleChange);
app.addEventListener('input', handleInput);

render();
