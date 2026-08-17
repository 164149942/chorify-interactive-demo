const MARKET_LOCALIZATION = {
  墨西哥: { language: '西班牙语', subtitleMode: '西班牙语字幕' },
  美国: { language: '英语', subtitleMode: '英语字幕' },
  巴西: { language: '葡萄牙语', subtitleMode: '葡萄牙语字幕' },
  泰国: { language: '泰语', subtitleMode: '泰语字幕' },
};

const GOAL_ORDER = ['product', 'person', 'scene', 'clip', 'brand'];

function clone(value) {
  return structuredClone(value);
}

function createDraft() {
  return {
    reference: { source: '', name: '' },
    product: { source: '', name: '' },
    replicationMode: '',
    brief: '',
    market: '',
    language: '',
    subtitleMode: '',
    candidateCount: 3,
    goals: {
      product: false,
      person: false,
      scene: false,
      clip: false,
      brand: false,
    },
    personMode: 'ai',
    personDescription: '',
    sceneInstruction: '',
    clipInstruction: '',
    brandLogo: '',
  };
}

function createIntentDraft() {
  return {
    reference: { source: '', name: '' },
    quickMode: '',
    targetCountry: '',
    targetProduct: { source: '', name: '' },
    strategies: { person: 'keep', scene: 'keep', clip: 'keep' },
    candidateCount: 3,
    naturalLanguage: '',
    understandingSummary: '',
    conflicts: [],
    blockingItems: [],
  };
}

function createReplacementPlan() {
  return {
    product: { target: { source: '', name: '' }, scope: 'all_exposures' },
    localization: { targetCountry: '', language: '', subtitleMode: '' },
    person: { strategy: 'keep', sourceCount: 0, target: '' },
    scene: { strategy: 'keep', sourceCount: 0, target: '' },
    clip: { strategy: 'keep', sourceCount: 0 },
  };
}

function normalizeCandidateCount(value) {
  const count = Number(value);
  return [1, 3, 5].includes(count) ? count : 3;
}

function syncLegacyDraftFromIntent(order) {
  const intent = order.intentDraft;
  const localization = MARKET_LOCALIZATION[intent.targetCountry] || { language: '', subtitleMode: '' };
  order.draft.reference = clone(intent.reference);
  order.draft.product = clone(intent.targetProduct);
  order.draft.replicationMode = intent.quickMode;
  order.draft.market = intent.targetCountry;
  order.draft.language = localization.language;
  order.draft.subtitleMode = localization.subtitleMode;
  order.draft.candidateCount = normalizeCandidateCount(intent.candidateCount);
  order.draft.goals.person = intent.strategies.person !== 'keep';
  order.draft.goals.scene = intent.strategies.scene !== 'keep';
  order.draft.goals.clip = intent.strategies.clip !== 'keep';
}

function updateIntentFromLegacyPatch(order, patch) {
  if (Object.hasOwn(patch, 'reference')) order.intentDraft.reference = clone(patch.reference);
  if (Object.hasOwn(patch, 'replicationMode')) order.intentDraft.quickMode = patch.replicationMode;
  if (Object.hasOwn(patch, 'market')) order.intentDraft.targetCountry = patch.market;
  if (Object.hasOwn(patch, 'product')) order.intentDraft.targetProduct = clone(patch.product);
  if (Object.hasOwn(patch, 'candidateCount')) order.intentDraft.candidateCount = normalizeCandidateCount(patch.candidateCount);
  syncLegacyDraftFromIntent(order);
}

function createUnderstandingSummary(intent) {
  const referenceLabel = intent.reference.name || '尚未提供参考视频';
  const countryLabel = intent.targetCountry || '尚未指定目标国家';
  return `参考视频：${referenceLabel}；目标市场：${countryLabel}；人物${intent.strategies.person}、场景${intent.strategies.scene}、片段${intent.strategies.clip}。`;
}

function getIntentConflicts(intent) {
  return intent.quickMode === 'same_product' && intent.targetProduct.name
    ? ['same_product_with_target_product']
    : [];
}

function buildReplacementPlan(analysis, intent) {
  const summary = analysis.summary || {};
  const localization = MARKET_LOCALIZATION[intent.targetCountry] || { language: '', subtitleMode: '' };
  return {
    product: {
      target: clone(intent.targetProduct),
      scope: 'all_exposures',
      exposureCount: summary.productExposureCount || 0,
    },
    localization: {
      targetCountry: intent.targetCountry,
      language: localization.language,
      subtitleMode: localization.subtitleMode,
    },
    person: {
      strategy: intent.strategies.person,
      sourceCount: summary.personCount || 0,
      target: orderTargetDescription(intent, 'person'),
      sources: summary.personCount ? [{
        id: 'person-1',
        label: '主出镜人物',
        shotIds: ['shot-01', 'shot-03', 'shot-06', 'shot-09'],
      }] : [],
    },
    scene: { strategy: intent.strategies.scene, sourceCount: summary.sceneCount || 0, target: '' },
    clip: { strategy: intent.strategies.clip, sourceCount: summary.shotCount || 0 },
  };
}

function orderTargetDescription(intent, group) {
  return group === 'person' && intent.strategies.person === 'replace'
    ? '待确认人物替换描述'
    : '';
}

function createBlankOrder(id, number) {
  const draft = createDraft();
  const intentDraft = createIntentDraft();
  return {
    id,
    title: `新营销生产 ${number}`,
    subtitle: '等待配置复刻任务',
    status: '等待参考视频',
    phase: 'intake',
    progress: 0,
    progressStep: 0,
    formCollapsed: false,
    editingConfiguration: false,
    submittedDraft: null,
    submittedIntentDraft: null,
    submittedReplacementPlan: null,
    validationErrors: [],
    draft,
    intentDraft,
    referenceAnalysis: {
      status: 'idle',
      step: 0,
      progress: 0,
      summary: null,
    },
    replacementPlan: createReplacementPlan(),
    analysis: {
      status: 'idle',
      step: 0,
      progress: 0,
      summary: null,
    },
    panes: {
      sessions: true,
      conversation: true,
      results: false,
      detail: false,
    },
    resultsAutoOpened: false,
    resultsManuallyClosed: false,
    candidateView: 'card',
    selectedCandidateId: null,
    pendingAction: null,
    toolEntrySource: 'new-chat',
    candidates: [],
    messages: [
      {
        id: `${id}-welcome`,
        role: 'assistant',
        kind: 'message',
        text: '先给我参考视频，并告诉我这次是同商品本地化、替换新商品，还是自定义调整。我会先分析视频，再生成需要你确认的生产方案。',
      },
    ],
    updatedLabel: '刚刚',
  };
}

function createSeedOrder({ id, title, market, product, status, phase, readyCount }) {
  const order = createBlankOrder(id, id.slice(-1));
  order.title = title;
  order.subtitle = `${market} · ${product}`;
  order.status = status;
  order.phase = phase;
  order.progress = phase === 'review' ? 100 : 64;
  order.progressStep = phase === 'review' ? 4 : 3;
  order.formCollapsed = true;
  order.analysis = {
    status: 'completed',
    step: 3,
    progress: 100,
    summary: createReferenceAnalysisSummary(),
  };
  order.draft = {
    ...createDraft(),
    reference: { source: 'history', name: '参考爆款营销视频.mp4' },
    product: { source: 'library', name: product },
    replicationMode: 'replace_product',
    market,
    ...MARKET_LOCALIZATION[market],
  };
  updateIntentFromLegacyPatch(order, order.draft);
  order.submittedDraft = clone(order.draft);
  order.submittedIntentDraft = clone(order.intentDraft);
  order.referenceAnalysis = clone(order.analysis);
  order.replacementPlan = buildReplacementPlan(order.referenceAnalysis, order.intentDraft);
  order.submittedReplacementPlan = clone(order.replacementPlan);
  order.candidates = createCandidateSlots(id, 3).map((candidate, index) => ({
    ...candidate,
    status: index < readyCount ? 'previewable' : index === readyCount ? 'generating' : 'queued',
  }));
  order.panes.results = true;
  order.resultsAutoOpened = true;
  order.messages.push({
    id: `${id}-history-summary`,
    role: 'assistant',
    kind: 'result',
    text: `${readyCount} 条候选视频已可预览，点击右侧结果继续审核。`,
  });
  order.updatedLabel = id.endsWith('1') ? '22 小时前' : '8 月 1 日';
  return order;
}

function createCandidateSlots(orderId, count) {
  const directions = ['原结构高还原', '本地人物版本', '素材融合版本', '场景增强版本', '品牌强化版本'];
  return Array.from({ length: count }, (_, index) => ({
    id: `${orderId}-candidate-${index + 1}`,
    number: index + 1,
    title: `候选 ${String(index + 1).padStart(2, '0')}`,
    direction: directions[index] || `复刻变体 ${index + 1}`,
    status: 'queued',
    duration: '00:28',
    version: 'V1',
    score: null,
    review: '待审核',
    exported: false,
    versionHistory: [{ version: 'V1', label: 'AI 初版', status: 'current' }],
  }));
}

function updateActiveOrder(state, updater) {
  if (!state.activeOrderId || !state.orders[state.activeOrderId]) return state;
  const next = clone(state);
  const current = next.orders[next.activeOrderId];
  next.orders[next.activeOrderId] = updater(current) || current;
  return next;
}

function appendMessage(order, message) {
  order.messages.push({
    id: `${order.id}-message-${order.messages.length + 1}`,
    ...message,
  });
}

export function createDemoState() {
  const first = createSeedOrder({
    id: 'order-history-1',
    title: '墨西哥榨汁杯爆款复刻',
    market: '墨西哥',
    product: '便携式榨汁杯',
    status: '2 条可预览',
    phase: 'running',
    readyCount: 2,
  });
  const second = createSeedOrder({
    id: 'order-history-2',
    title: '美国耳机达人视频复刻',
    market: '美国',
    product: '骨传导耳机',
    status: '3 条待审核',
    phase: 'review',
    readyCount: 3,
  });

  return {
    page: 'home',
    activeOrderId: null,
    nextOrderNumber: 1,
    orderIds: [first.id, second.id],
    orders: {
      [first.id]: first,
      [second.id]: second,
    },
  };
}

export function createOrder(state, { source = 'new-chat' } = {}) {
  const next = clone(state);
  const id = `order-new-${next.nextOrderNumber}`;
  const order = createBlankOrder(id, next.nextOrderNumber);
  order.toolEntrySource = source;
  next.nextOrderNumber += 1;
  next.orderIds.unshift(id);
  next.orders[id] = order;
  next.activeOrderId = id;
  next.page = 'workbench';
  return next;
}

export function openReplicationTool(state, source = 'tool') {
  if (!state.activeOrderId || !state.orders[state.activeOrderId]) {
    return createOrder(state, { source });
  }
  return updateActiveOrder(state, (order) => {
    order.toolEntrySource = source;
    if (order.phase === 'intake' || order.phase === 'plan') order.formCollapsed = false;
    return order;
  });
}

export function openOrder(state, orderId) {
  if (!state.orders[orderId]) return state;
  const next = clone(state);
  next.activeOrderId = orderId;
  next.page = 'workbench';
  return next;
}

export function goHome(state) {
  const next = clone(state);
  next.page = 'home';
  next.activeOrderId = null;
  return next;
}

export function updateOrderDraft(state, patch) {
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review', 'plan'].includes(order.phase) && !order.editingConfiguration) return order;
    order.draft = { ...order.draft, ...clone(patch) };
    if (Object.hasOwn(patch, 'replicationMode')) {
      order.draft.goals.product = patch.replicationMode === 'replace_product';
      if (patch.replicationMode !== 'replace_product') order.validationErrors = order.validationErrors.filter((field) => field !== 'product');
    }
    if (Object.hasOwn(patch, 'market')) {
      const localization = MARKET_LOCALIZATION[patch.market] || { language: '', subtitleMode: '' };
      order.draft.language = localization.language;
      order.draft.subtitleMode = localization.subtitleMode;
    }
    updateIntentFromLegacyPatch(order, patch);
    if (Object.hasOwn(patch, 'personMode')) {
      order.intentDraft.strategies.person = patch.personMode === 'keep' ? 'keep' : 'replace';
    }
    order.validationErrors = order.validationErrors.filter((field) => !Object.hasOwn(patch, field));
    return order;
  });
}

export function updateIntentStrategy(state, group, strategy) {
  if (!['person', 'scene', 'clip'].includes(group) || !['keep', 'replace', 'ai'].includes(strategy)) return state;
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review', 'plan'].includes(order.phase) && !order.editingConfiguration) return order;
    order.intentDraft.strategies[group] = strategy;
    order.draft.goals[group] = strategy !== 'keep';
    if (order.phase === 'plan' || order.editingConfiguration) {
      order.replacementPlan[group] = { ...order.replacementPlan[group], strategy };
    }
    order.intentDraft.understandingSummary = createUnderstandingSummary(order.intentDraft);
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    return order;
  });
}

export function updateIntentFromNaturalLanguage(state, text) {
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review'].includes(order.phase) && !order.editingConfiguration) return order;
    order.intentDraft = parseReplicationIntent(text, order.intentDraft);
    syncLegacyDraftFromIntent(order);
    return order;
  });
}

export function toggleChangeGoal(state, goal) {
  if (!GOAL_ORDER.includes(goal) || goal === 'product') return state;
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review', 'plan'].includes(order.phase) && !order.editingConfiguration) return order;
    order.draft.goals[goal] = !order.draft.goals[goal];
    if (['person', 'scene', 'clip'].includes(goal)) {
      order.intentDraft.strategies[goal] = order.draft.goals[goal] ? 'replace' : 'keep';
    }
    return order;
  });
}

export function applyDemoPreset(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'intake') return order;
    order.title = '墨西哥榨汁杯爆款复刻';
    order.subtitle = '墨西哥 · 便携式榨汁杯';
    order.draft = {
      ...createDraft(),
      reference: { source: 'upload', name: 'TikTok 爆款榨汁杯视频.mp4' },
      product: { source: 'library', name: '便携式榨汁杯 Pro' },
      replicationMode: 'replace_product',
      brief: '保持原视频节奏，替换为新商品并完成墨西哥市场本地化。',
      market: '墨西哥',
      ...MARKET_LOCALIZATION.墨西哥,
      candidateCount: 3,
      goals: {
        product: true,
        person: true,
        scene: false,
        clip: false,
        brand: true,
      },
      personMode: 'ai',
      personDescription: '25—35 岁墨西哥女性，真实生活方式创作者',
      brandLogo: 'Chorify Cup 品牌 Logo',
    };
    updateIntentFromLegacyPatch(order, order.draft);
    order.intentDraft.strategies = { person: 'replace', scene: 'keep', clip: 'keep' };
    order.validationErrors = [];
    return order;
  });
}

function createReferenceAnalysisSummary() {
  return {
    duration: '00:28',
    shotCount: 12,
    productExposureCount: 5,
    personCount: 1,
    sceneCount: 3,
    textCount: 8,
    voiceLanguage: '英语',
    productClarity: '主体清晰，包装文字局部偏小',
    materialGaps: [
      {
        level: 'recommended',
        title: '商品包装正面高清图',
        description: '用于本地化包装文字与近景镜头；缺失时可沿用参考视频画面，不阻塞生产。',
      },
    ],
  };
}

export function parseReplicationIntent(text, currentIntent = {}) {
  const input = String(text || '').trim();
  const base = {
    ...createIntentDraft(),
    ...clone(currentIntent),
    reference: clone(currentIntent.reference || { source: '', name: '' }),
    targetProduct: clone(currentIntent.targetProduct || { source: '', name: '' }),
    strategies: { ...createIntentDraft().strategies, ...clone(currentIntent.strategies || {}) },
  };
  const countries = Object.keys(MARKET_LOCALIZATION);
  const country = countries.find((item) => input.includes(item));
  if (country) base.targetCountry = country;
  const countMatch = input.match(/(?:生成|做)\s*([135])\s*条/);
  if (countMatch) base.candidateCount = Number(countMatch[1]);
  if (input.includes('同商品')) base.quickMode = 'same_product';
  if (input.includes('替换商品') || input.includes('换商品')) base.quickMode = 'replace_product';
  if (input.includes('自定义')) base.quickMode = 'custom';
  if (input.includes('人物换') || input.includes('替换人物')) base.strategies.person = 'replace';
  if (input.includes('人物沿用')) base.strategies.person = 'keep';
  if (input.includes('人物使用 AI') || input.includes('人物用 AI')) base.strategies.person = 'ai';
  if (input.includes('场景换') || input.includes('替换场景')) base.strategies.scene = 'replace';
  if (input.includes('场景沿用')) base.strategies.scene = 'keep';
  if (input.includes('场景使用 AI') || input.includes('场景用 AI')) base.strategies.scene = 'ai';
  if (input.includes('片段换') || input.includes('替换片段')) base.strategies.clip = 'replace';
  if (input.includes('片段沿用')) base.strategies.clip = 'keep';
  if (input.includes('片段使用 AI') || input.includes('片段用 AI')) base.strategies.clip = 'ai';
  base.candidateCount = normalizeCandidateCount(base.candidateCount);
  base.naturalLanguage = input;
  base.conflicts = getIntentConflicts(base);
  base.understandingSummary = createUnderstandingSummary(base);
  return base;
}

export function submitReplicationIntent(state) {
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review'].includes(order.phase) && !order.editingConfiguration) return order;
    order.intentDraft.understandingSummary = createUnderstandingSummary(order.intentDraft);
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    order.intentDraft.blockingItems = [
      ...(order.intentDraft.reference.name ? [] : ['reference']),
      ...order.intentDraft.conflicts,
    ];
    order.phase = 'intent_review';
    order.status = order.intentDraft.blockingItems.length ? '补充复刻意图' : '复刻意图待确认';
    order.formCollapsed = false;
    return order;
  });
}

export function confirmReplicationIntent(state) {
  const reviewed = updateActiveOrder(state, (order) => {
    if (order.phase !== 'intent_review') return order;
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    order.intentDraft.understandingSummary = createUnderstandingSummary(order.intentDraft);
    order.intentDraft.blockingItems = [
      ...(order.intentDraft.reference.name ? [] : ['reference']),
      ...order.intentDraft.conflicts,
    ];
    if (order.intentDraft.blockingItems.length) return order;
    order.draft = { ...order.draft, replicationMode: order.intentDraft.quickMode };
    syncLegacyDraftFromIntent(order);
    order.phase = 'intake';
    return order;
  });
  return startReferenceAnalysis(reviewed, { allowEmptyQuickMode: true });
}

export function updateReplacementMapping(state, group, patch) {
  if (!['product', 'localization', 'person', 'scene', 'clip'].includes(group)) return state;
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'plan' && !(order.editingConfiguration && order.replacementPlan.status !== 'invalidated')) return order;
    order.replacementPlan[group] = { ...order.replacementPlan[group], ...clone(patch) };
    if (group === 'localization' && patch.targetCountry) {
      const localization = MARKET_LOCALIZATION[patch.targetCountry] || { language: '', subtitleMode: '' };
      order.replacementPlan.localization = { ...order.replacementPlan.localization, targetCountry: patch.targetCountry, ...localization };
      order.intentDraft.targetCountry = patch.targetCountry;
      syncLegacyDraftFromIntent(order);
    }
    if (group === 'product' && patch.target) {
      order.intentDraft.targetProduct = clone(patch.target);
      syncLegacyDraftFromIntent(order);
    }
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    return order;
  });
}

export function applyReplacementGroupRule(state, group, rule) {
  if (!['product', 'person', 'scene', 'clip'].includes(group)) return state;
  const patch = group === 'product'
    ? { target: clone(rule.target || { source: '', name: '' }), scope: 'all_exposures' }
    : clone(rule);
  return updateReplacementMapping(state, group, patch);
}

export function updatePlanFromNaturalLanguage(state, text) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'plan' && !(order.editingConfiguration && order.replacementPlan.status !== 'invalidated')) return order;
    order.intentDraft = parseReplicationIntent(text, order.intentDraft);
    syncLegacyDraftFromIntent(order);
    const localization = MARKET_LOCALIZATION[order.intentDraft.targetCountry] || { language: '', subtitleMode: '' };
    order.replacementPlan.localization = {
      ...order.replacementPlan.localization,
      targetCountry: order.intentDraft.targetCountry,
      ...localization,
    };
    for (const group of ['person', 'scene', 'clip']) {
      order.replacementPlan[group] = {
        ...order.replacementPlan[group],
        strategy: order.intentDraft.strategies[group],
      };
    }
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    return order;
  });
}

export function startReferenceAnalysis(state, { allowEmptyQuickMode = false } = {}) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'intake') return order;
    const missing = [];
    if (!order.draft.reference.name) missing.push('reference');
    if (!order.draft.replicationMode && !allowEmptyQuickMode) missing.push('replicationMode');
    order.validationErrors = missing;
    if (missing.length) return order;

    order.phase = 'analyzing';
    order.status = '正在分析参考视频';
    order.formCollapsed = true;
    order.analysis = { status: 'running', step: 0, progress: 18, summary: null };
    order.referenceAnalysis = clone(order.analysis);
    order.panes.results = false;
    order.panes.detail = false;
    appendMessage(order, {
      role: 'user',
      kind: 'summary',
      text: `分析参考视频：${order.draft.reference.name}。复刻目的：${order.draft.replicationMode === 'same_product' ? '同商品跨国家本地化' : order.draft.replicationMode === 'replace_product' ? '替换为另一款商品' : '自定义调整'}。`,
    });
    appendMessage(order, {
      role: 'assistant',
      kind: 'progress',
      text: '正在读取镜头结构、商品露出、人物、场景、字幕和口播。分析完成后，我会只展示这条视频实际需要配置的项目。',
      progress: 18,
    });
    return order;
  });
}

export function advanceReferenceAnalysis(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'analyzing') return order;
    if (order.analysis.step === 0) {
      order.analysis.step = 1;
      order.analysis.progress = 48;
      order.status = '正在识别可替换对象';
      order.referenceAnalysis = clone(order.analysis);
      return order;
    }
    if (order.analysis.step === 1) {
      order.analysis.step = 2;
      order.analysis.progress = 78;
      order.status = '正在生成生产配置';
      order.referenceAnalysis = clone(order.analysis);
      return order;
    }
    order.analysis = { status: 'completed', step: 3, progress: 100, summary: createReferenceAnalysisSummary() };
    order.referenceAnalysis = clone(order.analysis);
    order.replacementPlan = buildReplacementPlan(order.referenceAnalysis, order.intentDraft);
    order.replacementPlan.blockingItems = [];
    order.phase = 'plan';
    order.status = '生产方案待确认';
    order.formCollapsed = false;
    order.draft.goals.person = order.analysis.summary.personCount > 0;
    order.draft.goals.brand = order.analysis.summary.textCount > 0;
    appendMessage(order, {
      role: 'assistant',
      kind: 'result',
      text: `分析完成：共 ${order.analysis.summary.shotCount} 个镜头、${order.analysis.summary.productExposureCount} 处商品露出、${order.analysis.summary.personCount} 位人物和 ${order.analysis.summary.sceneCount} 个主要场景。请确认动态生产方案。`,
    });
    return order;
  });
}

export function confirmProductionPlan(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'plan' && !order.editingConfiguration) return order;
    const wasEditing = order.editingConfiguration;
    const missing = [];
    if (['same_product', 'custom'].includes(order.draft.replicationMode) && !order.draft.market) missing.push('market');
    if (['replace_product', 'custom'].includes(order.draft.replicationMode) && !order.draft.product.name) missing.push('product');
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    if (order.intentDraft.conflicts.length) missing.push(...order.intentDraft.conflicts);
    if (order.replacementPlan.status === 'invalidated') missing.push('replacementPlan');
    if (order.replacementPlan.blockingItems?.length) missing.push(...order.replacementPlan.blockingItems);
    order.validationErrors = missing;
    if (missing.length) return order;

    order.phase = 'running';
    order.status = '正在创建候选视频';
    order.progress = 12;
    order.progressStep = 0;
    order.formCollapsed = true;
    order.editingConfiguration = false;
    order.submittedDraft = clone(order.draft);
    order.submittedIntentDraft = clone(order.intentDraft);
    order.submittedReplacementPlan = clone(order.replacementPlan);
    const productLabel = order.draft.replicationMode === 'same_product' ? '沿用原商品' : order.draft.product.name || '按自定义方案';
    order.subtitle = `${order.draft.market} · ${productLabel}`;
    order.candidates = createCandidateSlots(order.id, order.draft.candidateCount);
    order.selectedCandidateId = null;
    order.pendingAction = null;
    order.panes.results = true;
    order.panes.detail = false;
    order.resultsAutoOpened = true;
    order.resultsManuallyClosed = false;
    appendMessage(order, {
      role: 'user',
      kind: 'summary',
      text: `${wasEditing ? '更新' : '确认'}生产方案：${productLabel}，投放 ${order.draft.market}，生成 ${order.draft.candidateCount} 条候选视频。`,
    });
    appendMessage(order, {
      role: 'assistant',
      kind: 'progress',
      text: '生产方案已锁定，正在按参考视频的镜头顺序建立候选视频。',
      progress: 12,
    });
    return order;
  });
}

// 保留给既有演示测试和历史入口的一键兼容路径；真实 UI 使用两个明确动作。
export function submitOrder(state) {
  let next = state;
  const order = next.activeOrderId ? next.orders[next.activeOrderId] : null;
  if (order?.phase === 'intake') {
    next = startReferenceAnalysis(next);
    while (next.orders[next.activeOrderId]?.phase === 'analyzing') next = advanceReferenceAnalysis(next);
  }
  return confirmProductionPlan(next);
}

export function reopenOrderConfiguration(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase === 'intake' || order.editingConfiguration) return order;
    order.submittedDraft ||= clone(order.draft);
    order.submittedIntentDraft ||= clone(order.intentDraft);
    order.submittedReplacementPlan ||= clone(order.replacementPlan);
    order.draft = clone(order.submittedDraft);
    order.intentDraft = clone(order.submittedIntentDraft);
    order.replacementPlan = {
      ...clone(order.replacementPlan),
      status: 'invalidated',
      invalidatedReason: 'intent_reopened',
    };
    order.editingConfiguration = true;
    order.formCollapsed = false;
    order.validationErrors = [];
    return order;
  });
}

export function cancelOrderConfigurationEdit(state) {
  return updateActiveOrder(state, (order) => {
    if (!order.editingConfiguration) return order;
    if (order.submittedDraft) order.draft = clone(order.submittedDraft);
    if (order.submittedIntentDraft) order.intentDraft = clone(order.submittedIntentDraft);
    if (order.submittedReplacementPlan) order.replacementPlan = clone(order.submittedReplacementPlan);
    order.editingConfiguration = false;
    order.formCollapsed = true;
    order.validationErrors = [];
    return order;
  });
}

export function advanceOrder(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'running') return order;

    if (order.progressStep === 0) {
      order.progressStep = 1;
      order.progress = 30;
      order.status = '正在拆解参考视频';
      appendMessage(order, {
        role: 'assistant',
        kind: 'progress',
        text: '已锁定原视频镜头顺序和整体节奏，正在识别全部商品露出位置。',
        progress: 30,
      });
      return order;
    }

    if (order.progressStep === 1) {
      order.progressStep = 2;
      order.progress = 52;
      order.status = '正在映射替换对象';
      if (!order.candidates.length) order.candidates = createCandidateSlots(order.id, order.draft.candidateCount);
      order.selectedCandidateId = null;
      order.panes.detail = false;
      appendMessage(order, {
        role: 'assistant',
        kind: 'progress',
        text: `已建立 ${order.draft.candidateCount} 条生产变体，商品将在全部露出位置替换，本地化文案将使用${order.draft.language}。`,
        progress: 52,
      });
      return order;
    }

    if (order.progressStep === 2) {
      order.progressStep = 3;
      order.progress = 72;
      order.status = '首条候选已可预览';
      if (order.candidates[0]) {
        order.candidates[0].status = 'previewable';
        order.candidates[0].score = 91;
      }
      if (order.candidates[1]) order.candidates[1].status = 'generating';
      if (order.candidates[2]) {
        order.candidates[2].status = 'needs_material';
        order.pendingAction = {
          type: 'missing_material',
          candidateId: order.candidates[2].id,
          title: '候选 03 缺少生活场景素材',
          description: '原参考视频 00:12—00:16 使用了卧室晨间场景。其他候选仍在继续生产。',
        };
      }
      if (!order.resultsAutoOpened && !order.resultsManuallyClosed) {
        order.panes.results = true;
        order.resultsAutoOpened = true;
      }
      appendMessage(order, {
        role: 'assistant',
        kind: 'result',
        text: '候选 01 已可预览，我已为你打开结果区。候选 03 需要补充一个场景选择，但不会阻塞其他视频。',
      });
      return order;
    }

    if (order.pendingAction) {
      order.progress = 82;
      order.status = '2 条可预览 · 1 项待补充';
      if (order.candidates[1]) {
        order.candidates[1].status = 'previewable';
        order.candidates[1].score = 87;
      }
      return order;
    }

    order.progressStep = 4;
    order.progress = 100;
    order.phase = 'review';
    order.status = `${order.candidates.length} 条候选待审核`;
    order.candidates.forEach((candidate, index) => {
      candidate.status = 'previewable';
      candidate.score ||= Math.max(78, 90 - index * 3);
    });
    appendMessage(order, {
      role: 'assistant',
      kind: 'result',
      text: `${order.candidates.length} 条候选视频已经生成完成。我已按复刻完整度和商品一致性排序，请从结果区开始审核。`,
    });
    return order;
  });
}

export function resolveMissingMaterial(state, strategy) {
  return updateActiveOrder(state, (order) => {
    if (order.pendingAction?.type !== 'missing_material') return order;
    const candidate = order.candidates.find((item) => item.id === order.pendingAction.candidateId);
    if (candidate) candidate.status = 'generating';
    appendMessage(order, {
      role: 'user',
      kind: 'decision',
      text: strategy === 'upload' ? '我会补充生活场景素材。' : '允许 AI 按墨西哥家庭晨间氛围生成替代场景。',
    });
    appendMessage(order, {
      role: 'assistant',
      kind: 'progress',
      text: strategy === 'upload' ? '已保留素材上传位置，候选 03 暂停等待。' : '已采用 AI 场景补全，候选 03 恢复生成。',
      progress: order.progress,
    });
    if (strategy !== 'upload') order.pendingAction = null;
    return order;
  });
}

export function selectCandidate(state, candidateId) {
  return updateActiveOrder(state, (order) => {
    if (!order.candidates.some((candidate) => candidate.id === candidateId)) return order;
    order.selectedCandidateId = candidateId;
    order.panes.results = true;
    order.panes.detail = true;
    return order;
  });
}

export function setCandidateView(state, view) {
  if (!['card', 'table'].includes(view)) return state;
  return updateActiveOrder(state, (order) => {
    order.candidateView = view;
    return order;
  });
}

export function requestCandidateRevision(state, candidateId, instruction = '按当前意见生成新版本') {
  return updateActiveOrder(state, (order) => {
    const candidate = order.candidates.find((item) => item.id === candidateId);
    if (!candidate || !['previewable', 'approved'].includes(candidate.status)) return order;
    const nextVersionNumber = candidate.versionHistory.length + 1;
    candidate.versionHistory = candidate.versionHistory.map((version) => ({ ...version, status: 'history' }));
    candidate.version = `V${nextVersionNumber}`;
    candidate.versionHistory.push({ version: candidate.version, label: '按反馈生成', status: 'current' });
    candidate.status = 'revision';
    candidate.review = `修改要求：${instruction}`;
    appendMessage(order, {
      role: 'user',
      kind: 'decision',
      text: `要求修改${candidate.title}：${instruction}`,
    });
    appendMessage(order, {
      role: 'assistant',
      kind: 'progress',
      text: `已保留 ${candidate.versionHistory.at(-2).version}，正在生成可对比的 ${candidate.version}。`,
      progress: order.progress,
    });
    return order;
  });
}

export function approveCandidate(state, candidateId) {
  return updateActiveOrder(state, (order) => {
    const candidate = order.candidates.find((item) => item.id === candidateId);
    if (!candidate || !['previewable', 'revision'].includes(candidate.status)) return order;
    candidate.status = 'approved';
    candidate.review = '人工审核通过';
    appendMessage(order, {
      role: 'user',
      kind: 'decision',
      text: `通过${candidate.title} ${candidate.version} 的人工审核。`,
    });
    return order;
  });
}

export function exportCandidate(state, candidateId) {
  return updateActiveOrder(state, (order) => {
    const candidate = order.candidates.find((item) => item.id === candidateId);
    if (!candidate || candidate.status !== 'approved') return order;
    candidate.status = 'exported';
    candidate.exported = true;
    candidate.review = '已导出';
    appendMessage(order, {
      role: 'assistant',
      kind: 'result',
      text: `${candidate.title} ${candidate.version} 已完成演示导出，正式产品将在这里提供文件和投放交接。`,
    });
    return order;
  });
}

export function togglePanel(state, panel, explicitValue) {
  if (!['sessions', 'conversation', 'results', 'detail'].includes(panel)) return state;
  return updateActiveOrder(state, (order) => {
    if (panel === 'detail' && !order.selectedCandidateId && explicitValue !== false) return order;
    const nextValue = explicitValue ?? !order.panes[panel];
    order.panes[panel] = nextValue;
    if (panel === 'results' && !nextValue) order.resultsManuallyClosed = true;
    return order;
  });
}

export function sendConversationMessage(state, text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return state;
  return updateActiveOrder(state, (order) => {
    appendMessage(order, { role: 'user', kind: 'message', text: cleanText });
    if (['intake', 'plan'].includes(order.phase) || order.editingConfiguration) {
      const markets = Object.keys(MARKET_LOCALIZATION);
      const market = markets.find((item) => cleanText.includes(item));
      if (market) {
        order.draft.market = market;
        order.draft.language = MARKET_LOCALIZATION[market].language;
        order.draft.subtitleMode = MARKET_LOCALIZATION[market].subtitleMode;
      }
      const countMatch = cleanText.match(/(?:生成|做)\s*([135])\s*条/);
      if (countMatch) order.draft.candidateCount = Number(countMatch[1]);
      if (cleanText.includes('人物')) order.draft.goals.person = true;
      if (cleanText.includes('拉丁裔年轻女性')) order.draft.personDescription = '拉丁裔年轻女性，自然妆容，真实生活方式创作者';
      if (cleanText.includes('场景')) order.draft.goals.scene = true;
      if (cleanText.includes('素材片段') || cleanText.includes('视频片段')) order.draft.goals.clip = true;
      if (cleanText.includes('Logo') || cleanText.includes('品牌')) order.draft.goals.brand = true;
      if (cleanText.includes('其他都保持原视频')) {
        order.draft.goals.person = false;
        order.draft.goals.scene = false;
        order.draft.goals.clip = false;
        order.draft.goals.brand = false;
      }
      appendMessage(order, {
        role: 'assistant',
        kind: 'message',
        text: '已把这条要求同步到复刻配置。你仍可以直接修改下方表单，二者会保持一致。',
      });
    } else {
      appendMessage(order, {
        role: 'assistant',
        kind: 'message',
        text: '我已记录这条修改要求。已生成结果会保留；涉及正在生成的候选时，我会先展示影响范围再继续。',
      });
    }
    return order;
  });
}

export function sendPreviewRevision(state, candidateId, text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return state;
  return updateActiveOrder(state, (order) => {
    const candidate = order.candidates.find((item) => item.id === candidateId);
    if (!candidate) return order;
    appendMessage(order, { role: 'user', kind: 'revision', text: cleanText, candidateId });
    appendMessage(order, {
      role: 'assistant',
      kind: 'message',
      text: `已记录对候选 ${String(candidate.number).padStart(2, '0')} 的修改要求。原版本会保留，我会生成一个可对比的新版本。`,
    });
    return order;
  });
}

export function getMarketingFactoryViewModel(state) {
  const activeOrder = state.activeOrderId ? clone(state.orders[state.activeOrderId]) : null;
  if (activeOrder) {
    activeOrder.visibleGoalSections = GOAL_ORDER.filter((goal) => activeOrder.draft.goals[goal]);
    activeOrder.selectedCandidate = activeOrder.candidates.find(
      (candidate) => candidate.id === activeOrder.selectedCandidateId,
    ) || null;
  }

  const visiblePanes = [];
  if (activeOrder) {
    for (const pane of ['sessions', 'conversation', 'results', 'detail']) {
      if (activeOrder.panes[pane]) visiblePanes.push(pane);
    }
  }

  return {
    page: state.page,
    activeOrderId: state.activeOrderId,
    activeOrder,
    visiblePanes,
    orders: state.orderIds.map((id) => clone(state.orders[id])),
  };
}
