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
    strategyOrigins: { person: 'default', scene: 'default', clip: 'default' },
    strategyConflicts: [],
    candidateCount: 3,
    naturalLanguage: '',
    understandingSummary: '',
    conflicts: [],
    blockingItems: [],
  };
}

function createReplacementPlan() {
  return {
    product: { target: { source: '', name: '' }, scope: 'all_exposures', inheritReference: true },
    localization: { targetCountry: '', language: '', subtitleMode: '', inheritReference: true },
    person: { strategy: 'keep', sourceCount: 0, target: '' },
    scene: { strategy: 'keep', sourceCount: 0, target: '' },
    clip: { strategy: 'keep', sourceCount: 0 },
    objects: [],
  };
}

function normalizeCandidateCount(value) {
  const count = Number(value);
  return [1, 3, 5].includes(count) ? count : 3;
}

function getInheritance(intent) {
  const mode = intent.quickMode || '';
  return {
    product: !intent.targetProduct?.name && ['same_product', ''].includes(mode),
    localization: !intent.targetCountry && ['replace_product', ''].includes(mode),
  };
}

function applyPlanInheritance(order) {
  const inheritance = getInheritance(order.intentDraft);
  order.replacementPlan.product = {
    ...order.replacementPlan.product,
    inheritReference: inheritance.product,
  };
  order.replacementPlan.localization = {
    ...order.replacementPlan.localization,
    inheritReference: inheritance.localization,
  };
}

function strategyLabel(strategy) {
  return { keep: '必须保持', replace: '必须更改', ai: '交给 AI 判断' }[strategy] || '未指定';
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
  const groupLabels = { person: '人物', scene: '场景', clip: '片段' };
  const groupsFor = (strategy) => Object.entries(groupLabels)
    .filter(([group]) => intent.strategies[group] === strategy)
    .map(([, label]) => label)
    .join('、') || '无';
  const conflictLabels = {
    same_product_with_target_product: '同商品本地化不能同时指定目标商品',
  };
  const conflicts = getIntentConflicts(intent)
    .map((conflict) => {
      if (conflictLabels[conflict]) return conflictLabels[conflict];
      const typed = (intent.strategyConflicts || []).find((item) => item.type === conflict);
      if (typed) return `${groupLabels[typed.group]}已明确选择${strategyLabel(typed.structured)}，但自然语言推断为${strategyLabel(typed.inferred)}`;
      return '存在待处理冲突';
    })
    .join('、') || '无';
  return `参考视频：${referenceLabel}；目标市场：${countryLabel}；必须更改：${groupsFor('replace')}；必须保持：${groupsFor('keep')}；交给 AI 判断：${groupsFor('ai')}；存在冲突：${conflicts}。`;
}

function getIntentConflicts(intent) {
  const conflicts = [];
  if (intent.quickMode === 'same_product' && intent.targetProduct.name) conflicts.push('same_product_with_target_product');
  conflicts.push(...(intent.strategyConflicts || []).map((item) => item.type));
  return [...new Set(conflicts)];
}

function refreshIntentGate(order) {
  order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
  order.intentDraft.blockingItems = [
    ...(order.intentDraft.reference.name ? [] : ['reference']),
    ...order.intentDraft.conflicts,
  ];
  order.intentDraft.understandingSummary = createUnderstandingSummary(order.intentDraft);
}

function objectTargetName(target) {
  if (typeof target === 'string') return target;
  return target?.name || '';
}

function createReplacementObjects(summary, intent) {
  const localization = MARKET_LOCALIZATION[intent.targetCountry] || { language: '', subtitleMode: '' };
  return [
    {
      id: 'product-main', group: 'product', scope: 'all_exposures', strategy: '',
      source: { label: '商品主体与包装露出', shotIds: ['shot-01', 'shot-03', 'shot-05', 'shot-08', 'shot-11'] },
      target: clone(intent.targetProduct),
    },
    {
      id: 'localization-01', group: 'localization', strategy: '',
      source: { label: '字幕、口播与屏幕文字', shotIds: ['shot-01', 'shot-02', 'shot-04', 'shot-06', 'shot-08', 'shot-10', 'shot-11', 'shot-12'] },
      target: { source: intent.targetCountry ? 'market' : '', name: intent.targetCountry || '', ...localization },
    },
    {
      id: 'person-01', group: 'person', strategy: '',
      source: { label: '主出镜人物', shotIds: ['shot-01', 'shot-03', 'shot-06', 'shot-09'] },
      target: { source: '', name: '' },
    },
    {
      id: 'scene-kitchen', group: 'scene', strategy: '',
      source: { label: '厨房操作台', shotIds: ['shot-01', 'shot-02', 'shot-03'] },
      target: { source: '', name: '' },
    },
    {
      id: 'scene-table', group: 'scene', strategy: '',
      source: { label: '餐桌产品演示', shotIds: ['shot-04', 'shot-05', 'shot-06'] },
      target: { source: '', name: '' },
    },
    {
      id: 'scene-commute', group: 'scene', strategy: '',
      source: { label: '通勤随拍', shotIds: ['shot-07', 'shot-08', 'shot-09'] },
      target: { source: '', name: '' },
    },
    ...[
      ['clip-01', '开场钩子', '00:00', '00:07', ['shot-01', 'shot-02', 'shot-03']],
      ['clip-02', '功能演示', '00:07', '00:14', ['shot-04', 'shot-05', 'shot-06']],
      ['clip-03', '使用场景', '00:14', '00:21', ['shot-07', 'shot-08', 'shot-09']],
      ['clip-04', '收尾召唤', '00:21', '00:28', ['shot-10', 'shot-11', 'shot-12']],
    ].map(([id, label, start, end, shotIds]) => ({
      id, group: 'clip', strategy: '',
      source: { label, shotIds, range: { start, end } },
      target: { source: '', name: '' },
    })),
  ];
}

// The production confirmation gate lives in the model so the form and the
// submit action always agree about what still needs a decision.
function recomputeReplacementPlanBlockers(order) {
  const plan = order.replacementPlan;
  if (!plan || plan.status === 'invalidated') return;
  const blockers = [];
  if (!plan.product?.inheritReference && !plan.product?.target?.name) blockers.push('product');
  if (!plan.localization?.inheritReference && !plan.localization?.targetCountry) blockers.push('market');
  blockers.push(...getIntentConflicts(order.intentDraft));
  for (const group of ['person', 'scene', 'clip']) {
    if (plan[group]?.strategy === 'replace' && !plan[group]?.target) blockers.push(`${group}_material`);
  }
  for (const object of plan.objects || []) {
    if (['person', 'scene', 'clip'].includes(object.group) && object.strategy === 'replace' && !objectTargetName(object.target)) {
      blockers.push(`${object.id}_material`);
    }
  }
  plan.blockingItems = [...new Set(blockers)];
}

function buildReplacementPlan(analysis, intent) {
  const summary = analysis.summary || {};
  const localization = MARKET_LOCALIZATION[intent.targetCountry] || { language: '', subtitleMode: '' };
  const inheritance = getInheritance(intent);
  return {
    product: {
      target: clone(intent.targetProduct),
      scope: 'all_exposures',
      exposureCount: summary.productExposureCount || 0,
      inheritReference: inheritance.product,
    },
    localization: {
      targetCountry: intent.targetCountry,
      language: localization.language,
      subtitleMode: localization.subtitleMode,
      inheritReference: inheritance.localization,
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
    clip: { strategy: intent.strategies.clip, sourceCount: summary.shotCount || 0, target: '' },
    objects: createReplacementObjects(summary, intent),
  };
}

function orderTargetDescription(intent, group) {
  return '';
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
    if (Object.hasOwn(patch, 'replicationMode') && !Object.hasOwn(patch, 'product')) {
      if (['', 'same_product'].includes(patch.replicationMode)) {
        order.intentDraft.targetProduct = { source: '', name: '' };
        order.draft.product = { source: '', name: '' };
      }
      if (['', 'replace_product'].includes(patch.replicationMode)) {
        order.intentDraft.targetCountry = '';
        order.draft.market = '';
      }
      syncLegacyDraftFromIntent(order);
    }
    if (Object.hasOwn(patch, 'personMode')) {
      order.intentDraft.strategies.person = patch.personMode === 'keep' ? 'keep' : 'replace';
      order.intentDraft.strategyOrigins.person = 'structured';
      order.intentDraft.strategyConflicts = (order.intentDraft.strategyConflicts || []).filter((item) => item.group !== 'person');
    }
    if (order.phase === 'plan' || order.editingConfiguration) applyPlanInheritance(order);
    refreshIntentGate(order);
    order.validationErrors = order.validationErrors.filter((field) => !Object.hasOwn(patch, field));
    return order;
  });
}

export function clearIntentTargetProduct(state) {
  return updateActiveOrder(state, (order) => {
    const canClear = ['intake', 'intent_review', 'plan'].includes(order.phase)
      || (order.editingConfiguration && order.replacementPlan.status !== 'invalidated');
    if (!canClear) return order;
    order.intentDraft.targetProduct = { source: '', name: '' };
    order.draft.product = { source: '', name: '' };
    if (order.phase === 'plan' || order.editingConfiguration) {
      order.replacementPlan.product = { ...order.replacementPlan.product, target: { source: '', name: '' } };
      order.replacementPlan.objects = (order.replacementPlan.objects || []).map((object) => object.group === 'product'
        ? { ...object, target: { source: '', name: '' } }
        : object);
      applyPlanInheritance(order);
      recomputeReplacementPlanBlockers(order);
    }
    refreshIntentGate(order);
    return order;
  });
}

export function updateIntentStrategy(state, group, strategy) {
  if (!['person', 'scene', 'clip'].includes(group) || !['keep', 'replace', 'ai'].includes(strategy)) return state;
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review', 'plan'].includes(order.phase) && !order.editingConfiguration) return order;
    order.intentDraft.strategies[group] = strategy;
    order.intentDraft.strategyOrigins[group] = 'structured';
    order.intentDraft.strategyConflicts = (order.intentDraft.strategyConflicts || []).filter((item) => item.group !== group);
    order.draft.goals[group] = strategy !== 'keep';
    if (order.phase === 'plan' || order.editingConfiguration) {
      order.replacementPlan[group] = { ...order.replacementPlan[group], strategy };
      recomputeReplacementPlanBlockers(order);
    }
    refreshIntentGate(order);
    recomputeReplacementPlanBlockers(order);
    return order;
  });
}

export function updateIntentFromNaturalLanguage(state, text) {
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review'].includes(order.phase) && !order.editingConfiguration) return order;
    order.intentDraft = parseReplicationIntent(text, order.intentDraft);
    syncLegacyDraftFromIntent(order);
    if (order.phase === 'plan' || order.editingConfiguration) applyPlanInheritance(order);
    refreshIntentGate(order);
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
      order.intentDraft.strategyOrigins[goal] = 'structured';
      order.intentDraft.strategyConflicts = (order.intentDraft.strategyConflicts || []).filter((item) => item.group !== goal);
    }
    refreshIntentGate(order);
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

function applyInferredStrategy(base, group, inferred, { respectStructuredStrategies = true } = {}) {
  const structured = base.strategies[group];
  const isStructured = base.strategyOrigins?.[group] === 'structured';
  base.strategyConflicts = (base.strategyConflicts || []).filter((item) => item.group !== group);
  if (respectStructuredStrategies && isStructured && structured !== inferred) {
    base.strategyConflicts.push({
      type: `${group}_strategy_conflict`,
      group,
      structured,
      inferred,
    });
    return;
  }
  base.strategies[group] = inferred;
  base.strategyOrigins[group] = isStructured ? 'structured' : 'inferred';
}

export function parseReplicationIntent(text, currentIntent = {}, options = {}) {
  const input = String(text || '').trim();
  const base = {
    ...createIntentDraft(),
    ...clone(currentIntent),
    reference: clone(currentIntent.reference || { source: '', name: '' }),
    targetProduct: clone(currentIntent.targetProduct || { source: '', name: '' }),
    strategies: { ...createIntentDraft().strategies, ...clone(currentIntent.strategies || {}) },
    strategyOrigins: { ...createIntentDraft().strategyOrigins, ...clone(currentIntent.strategyOrigins || {}) },
    strategyConflicts: clone(currentIntent.strategyConflicts || []),
  };
  const countries = Object.keys(MARKET_LOCALIZATION);
  const country = countries.find((item) => input.includes(item));
  if (country) base.targetCountry = country;
  const countMatch = input.match(/(?:生成|做)\s*([135])\s*条/);
  if (countMatch) base.candidateCount = Number(countMatch[1]);
  if (input.includes('同商品')) base.quickMode = 'same_product';
  if (input.includes('替换商品') || input.includes('换商品')) base.quickMode = 'replace_product';
  if (input.includes('自定义')) base.quickMode = 'custom';
  if (input.includes('人物换') || input.includes('替换人物')) applyInferredStrategy(base, 'person', 'replace', options);
  if (input.includes('人物沿用')) applyInferredStrategy(base, 'person', 'keep', options);
  if (input.includes('人物使用 AI') || input.includes('人物用 AI')) applyInferredStrategy(base, 'person', 'ai', options);
  if (input.includes('场景换') || input.includes('替换场景') || input.includes('替换人物和场景')) applyInferredStrategy(base, 'scene', 'replace', options);
  if (input.includes('场景沿用')) applyInferredStrategy(base, 'scene', 'keep', options);
  if (input.includes('场景使用 AI') || input.includes('场景用 AI')) applyInferredStrategy(base, 'scene', 'ai', options);
  if (input.includes('片段换') || input.includes('替换片段')) applyInferredStrategy(base, 'clip', 'replace', options);
  if (input.includes('片段沿用')) applyInferredStrategy(base, 'clip', 'keep', options);
  if (input.includes('片段使用 AI') || input.includes('片段用 AI')) applyInferredStrategy(base, 'clip', 'ai', options);
  if (input.includes('其他都保持原视频')) {
    for (const group of ['person', 'scene', 'clip']) applyInferredStrategy(base, group, 'keep', options);
  }
  base.candidateCount = normalizeCandidateCount(base.candidateCount);
  base.naturalLanguage = input;
  base.conflicts = getIntentConflicts(base);
  base.blockingItems = [
    ...(base.reference.name ? [] : ['reference']),
    ...base.conflicts,
  ];
  base.understandingSummary = createUnderstandingSummary(base);
  return base;
}

export function submitReplicationIntent(state) {
  return updateActiveOrder(state, (order) => {
    if (!['intake', 'intent_review'].includes(order.phase) && !order.editingConfiguration) return order;
    refreshIntentGate(order);
    order.phase = 'intent_review';
    order.status = order.intentDraft.blockingItems.length ? '补充复刻意图' : '复刻意图待确认';
    order.formCollapsed = false;
    return order;
  });
}

export function confirmReplicationIntent(state) {
  const reviewed = updateActiveOrder(state, (order) => {
    if (order.phase !== 'intent_review') return order;
    refreshIntentGate(order);
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
    const nextPatch = clone(patch);
    const objectId = nextPatch.objectId;
    const objectPatch = nextPatch.objectPatch;
    delete nextPatch.objectId;
    delete nextPatch.objectPatch;
    if (objectId && objectPatch) {
      order.replacementPlan.objects = (order.replacementPlan.objects || []).map((object) => {
        if (object.id !== objectId || object.group !== group) return object;
        const safePatch = {
          ...(Object.hasOwn(objectPatch, 'strategy') ? { strategy: objectPatch.strategy } : {}),
          ...(Object.hasOwn(objectPatch, 'target') ? { target: clone(objectPatch.target) } : {}),
        };
        return { ...object, ...safePatch };
      });
    } else {
      order.replacementPlan[group] = { ...order.replacementPlan[group], ...nextPatch };
    }
    if (group === 'localization' && nextPatch.targetCountry) {
      const localization = MARKET_LOCALIZATION[nextPatch.targetCountry] || { language: '', subtitleMode: '' };
      order.replacementPlan.localization = { ...order.replacementPlan.localization, targetCountry: patch.targetCountry, ...localization };
      order.replacementPlan.objects = (order.replacementPlan.objects || []).map((object) => object.group === 'localization'
        ? { ...object, target: { source: 'market', name: nextPatch.targetCountry, ...localization } }
        : object);
      order.intentDraft.targetCountry = nextPatch.targetCountry;
      syncLegacyDraftFromIntent(order);
    }
    if (group === 'product' && nextPatch.target) {
      order.intentDraft.targetProduct = clone(nextPatch.target);
      order.replacementPlan.objects = (order.replacementPlan.objects || []).map((object) => object.group === 'product'
        ? { ...object, target: clone(nextPatch.target) }
        : object);
      syncLegacyDraftFromIntent(order);
    }
    applyPlanInheritance(order);
    refreshIntentGate(order);
    recomputeReplacementPlanBlockers(order);
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
    const before = Object.fromEntries(['localization', 'person', 'scene', 'clip'].map((group) => [group, JSON.stringify(order.replacementPlan[group])]));
    order.intentDraft = parseReplicationIntent(text, order.intentDraft, { respectStructuredStrategies: false });
    syncLegacyDraftFromIntent(order);
    const localization = MARKET_LOCALIZATION[order.intentDraft.targetCountry] || { language: '', subtitleMode: '' };
    order.replacementPlan.localization = {
      ...order.replacementPlan.localization,
      targetCountry: order.intentDraft.targetCountry,
      ...localization,
    };
    order.replacementPlan.objects = (order.replacementPlan.objects || []).map((object) => object.group === 'localization'
      ? { ...object, target: { source: order.intentDraft.targetCountry ? 'market' : '', name: order.intentDraft.targetCountry || '', ...localization } }
      : object);
    for (const group of ['person', 'scene', 'clip']) {
      order.replacementPlan[group] = {
        ...order.replacementPlan[group],
        strategy: order.intentDraft.strategies[group],
      };
    }
    applyPlanInheritance(order);
    refreshIntentGate(order);
    order.replacementPlan.affectedGroups = ['localization', 'person', 'scene', 'clip']
      .filter((group) => before[group] !== JSON.stringify(order.replacementPlan[group]));
    recomputeReplacementPlanBlockers(order);
    return order;
  });
}

export function resolveReplacementPlanBlocker(state, blocker, resolution) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'plan') return order;
    const object = (order.replacementPlan.objects || []).find((item) => blocker === `${item.id}_material`);
    if (object) {
      const target = resolution === 'upload' ? { source: 'upload', name: '待上传替代素材' } : { source: '', name: '' };
      order.replacementPlan.objects = order.replacementPlan.objects.map((item) => item.id === object.id
        ? { ...item, strategy: resolution === 'keep' ? 'keep' : resolution === 'ai' ? 'ai' : 'replace', target }
        : item);
      recomputeReplacementPlanBlockers(order);
      return order;
    }
    const group = ['person', 'scene', 'clip'].find((item) => String(blocker).includes(item)) || 'clip';
    if (resolution === 'ai') order.replacementPlan[group] = { ...order.replacementPlan[group], strategy: 'ai' };
    if (resolution === 'upload') order.replacementPlan[group] = { ...order.replacementPlan[group], strategy: 'replace', target: '待上传替代素材' };
    if (resolution === 'keep') order.replacementPlan[group] = { ...order.replacementPlan[group], strategy: 'keep', keepLimitAcknowledged: true };
    recomputeReplacementPlanBlockers(order);
    return order;
  });
}

function updateReferenceAnalysisProgressMessage(order, progress) {
  const message = order.messages.find((item) => item.kind === 'progress' && item.analysisProgress);
  if (message) {
    message.progress = progress;
    return;
  }
  appendMessage(order, {
    role: 'assistant',
    kind: 'progress',
    analysisProgress: true,
    text: '正在读取镜头结构、商品露出、人物、场景、字幕和口播。分析完成后，我会只展示这条视频实际需要配置的项目。',
    progress,
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

    const retrying = order.analysis.status === 'failed';
    order.phase = 'analyzing';
    order.status = '正在分析参考视频';
    order.formCollapsed = true;
    order.analysis = { status: 'running', step: 0, progress: 18, summary: null };
    order.referenceAnalysis = clone(order.analysis);
    order.panes.results = false;
    order.panes.detail = false;
    if (!retrying) {
      appendMessage(order, {
        role: 'user',
        kind: 'summary',
        text: `分析参考视频：${order.draft.reference.name}。复刻目的：${order.draft.replicationMode === 'same_product' ? '同商品跨国家本地化' : order.draft.replicationMode === 'replace_product' ? '替换为另一款商品' : '自定义调整'}。`,
      });
    }
    updateReferenceAnalysisProgressMessage(order, 18);
    return order;
  });
}

export function advanceReferenceAnalysis(state, { fail = false } = {}) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'analyzing') return order;
    if (fail) {
      order.analysis = {
        ...order.analysis,
        status: 'failed',
        error: '参考视频分析暂时失败，请重试。',
      };
      order.referenceAnalysis = clone(order.analysis);
      order.phase = 'intake';
      order.status = '参考视频分析失败';
      order.formCollapsed = false;
      appendMessage(order, {
        role: 'assistant',
        kind: 'result',
        text: '分析失败：参考视频暂时无法完成解析。已保留你的复刻意图，请重试。',
      });
      return order;
    }
    if (order.analysis.step === 0) {
      order.analysis.step = 1;
      order.analysis.progress = 48;
      order.status = '正在识别可替换对象';
      order.referenceAnalysis = clone(order.analysis);
      updateReferenceAnalysisProgressMessage(order, 48);
      return order;
    }
    if (order.analysis.step === 1) {
      order.analysis.step = 2;
      order.analysis.progress = 78;
      order.status = '正在生成生产配置';
      order.referenceAnalysis = clone(order.analysis);
      updateReferenceAnalysisProgressMessage(order, 78);
      return order;
    }
    order.analysis = { status: 'completed', step: 3, progress: 100, summary: createReferenceAnalysisSummary() };
    order.referenceAnalysis = clone(order.analysis);
    updateReferenceAnalysisProgressMessage(order, 100);
    order.replacementPlan = buildReplacementPlan(order.referenceAnalysis, order.intentDraft);
    if (order.replacementPlan.person.strategy === 'replace' && order.draft.personDescription) {
      order.replacementPlan.person.target = order.draft.personDescription;
    }
    recomputeReplacementPlanBlockers(order);
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

function productionSummaryLabels(order) {
  const plan = order.replacementPlan || createReplacementPlan();
  const mode = order.intentDraft.quickMode || order.draft.replicationMode;
  const product = plan.product?.inheritReference
    ? (mode === 'same_product' ? '沿用原商品' : '沿用参考视频')
    : plan.product?.target?.name || order.draft.product.name || '待选择目标商品';
  const market = plan.localization?.inheritReference
    ? (mode === 'replace_product' ? '沿用原国家' : '沿用参考视频')
    : plan.localization?.targetCountry || order.draft.market || '待选择国家';
  return { product, market };
}

export function confirmProductionPlan(state) {
  return updateActiveOrder(state, (order) => {
    if (order.phase !== 'plan' && !order.editingConfiguration) return order;
    const wasEditing = order.editingConfiguration;
    order.intentDraft.conflicts = getIntentConflicts(order.intentDraft);
    recomputeReplacementPlanBlockers(order);
    const missing = [];
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
    const { product: productLabel, market: marketLabel } = productionSummaryLabels(order);
    order.subtitle = `${marketLabel} · ${productLabel}`;
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
      text: `${wasEditing ? '更新' : '确认'}生产方案：${productLabel}，投放 ${marketLabel}，生成 ${order.draft.candidateCount} 条候选视频。`,
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
    order.archivedCandidateSets ||= [];
    if (order.candidates.length) order.archivedCandidateSets.push(clone(order.candidates));
    order.replacementPlan = {
      ...clone(order.replacementPlan),
      status: 'invalidated',
      invalidatedReason: 'intent_reopened',
    };
    order.phase = 'intake';
    order.status = '旧替换清单已失效，请确认复刻意图后重新分析';
    order.editingConfiguration = false;
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

function applyConversationCompatibilityDetails(order, text) {
  if (text.includes('拉丁裔年轻女性')) {
    order.draft.personDescription = '拉丁裔年轻女性，自然妆容，真实生活方式创作者';
  }
  if (text.includes('Logo') || text.includes('品牌')) order.draft.goals.brand = true;
  if (text.includes('其他都保持原视频')) order.draft.goals.brand = false;
}

export function sendConversationMessage(state, text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return state;
  const initialOrder = state.activeOrderId ? state.orders[state.activeOrderId] : null;
  if (!initialOrder) return state;

  let next = state;
  let synchronized = false;
  if (['intake', 'intent_review'].includes(initialOrder.phase) || initialOrder.editingConfiguration) {
    next = updateIntentFromNaturalLanguage(next, cleanText);
    synchronized = true;
  } else if (initialOrder.phase === 'plan') {
    next = updatePlanFromNaturalLanguage(next, cleanText);
    synchronized = true;
  }

  return updateActiveOrder(next, (order) => {
    if (synchronized) applyConversationCompatibilityDetails(order, cleanText);
    appendMessage(order, { role: 'user', kind: 'message', text: cleanText });
    appendMessage(order, {
      role: 'assistant',
      kind: 'message',
      text: synchronized
        ? '已把这条要求同步到复刻配置。你仍可以直接修改下方表单，二者会保持一致。'
        : '我已记录这条修改要求。已生成结果会保留；涉及正在生成的候选时，我会先展示影响范围再继续。',
    });
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
