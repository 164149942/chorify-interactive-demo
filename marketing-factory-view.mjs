import { getProductionSummaryLabels } from './marketing-factory-model.mjs';

const STATUS_LABELS = {
  queued: '等待生成',
  generating: '生成中',
  needs_material: '待补充',
  previewable: '可预览',
  approved: '已通过',
  revision: '修改中',
  exported: '已导出',
};

const GOAL_LABELS = {
  product: '商品',
  person: '人物',
  scene: '场景',
  clip: '视频片段',
  brand: '品牌 Logo',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function icon(name, size = 18) {
  const paths = {
    chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h9a5 5 0 0 1 5 5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    canvas: '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="m8 8 3 7m5-7-3 7"/>',
    workflow: '<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="14" width="7" height="6" rx="1"/><path d="M10 7h4a3 3 0 0 1 3 3v4"/>',
    toolbox: '<path d="m14.7 6.3 3-3a4 4 0 0 1-5 5l-7.5 7.5a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 1 5-5l-3 3z"/>',
    video: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m21 15-5-5L5 20"/>',
    spark: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/>',
    upload: '<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M5 15v5h14v-5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    send: '<path d="m3 11 18-8-8 18-2-8z"/><path d="m11 13 4-4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.1.9-1.1 1.7M12 17h.01"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}

function renderSidebar(vm) {
  const active = vm.activeOrderId;
  return `
    <aside class="chat-sidebar" aria-label="Chorify 导航">
      <button class="chat-brand" data-action="go-home"><span class="brand-mark">C</span><strong>Chorify AI</strong><span class="collapse-mark">≡</span></button>
      <button class="module-selector is-active" data-action="go-home">${icon('chat')}<span>AI 聊天</span><em>⌄</em></button>
      <nav class="tool-nav">
        <button data-action="placeholder">${icon('canvas')}<span>无限画布</span></button>
        <button data-action="placeholder">${icon('workflow')}<span>视频工作流</span><small>旧版</small></button>
      </nav>
      <div class="side-section-title"><span>工具</span><em>⌄</em></div>
      <nav class="tool-nav compact">
        <button data-action="open-replication-tool" data-source="sidebar-tool">${icon('video')}<span>视频复刻</span></button>
        <button data-action="placeholder">${icon('toolbox')}<span>工具箱</span></button>
      </nav>
      <div class="history-title"><span>历史对话</span><button data-action="open-replication-tool" data-source="new-chat" aria-label="新建会话">＋</button></div>
      <div class="history-list">
        ${vm.orders.map((order) => `
          <button class="history-row ${active === order.id ? 'is-active' : ''}" data-action="open-order" data-order-id="${escapeHtml(order.id)}">
            ${icon('chat', 15)}<span><strong>${escapeHtml(order.title)}</strong><small>${escapeHtml(order.updatedLabel)}</small></span>
          </button>`).join('')}
      </div>
      <div class="sidebar-footer">
        <button data-action="placeholder">${icon('help')}<span>帮助与反馈</span></button>
        <button class="account-row" data-action="placeholder"><span class="avatar">DW</span><span><strong>Dianwen Wang</strong><small>余额 4,828</small></span><em>•••</em></button>
      </div>
    </aside>`;
}

function renderPanelToggle(panel, open, disabled = false) {
  const label = panel === 'results' ? '任务面板' : '预览面板';
  return `<button class="panel-toggle ${open ? 'is-open' : ''}" data-action="toggle-panel" data-panel="${panel}" aria-pressed="${open}" ${disabled ? 'disabled' : ''} title="${label}"><span></span><i></i></button>`;
}

function renderTopbar(order = null) {
  return `
    <header class="chat-topbar">
      <strong>${escapeHtml(order?.title || '新会话')}</strong>
      <div class="topbar-actions"><span class="credits">余额 4,828</span>${renderPanelToggle('results', Boolean(order?.panes.results), !order?.candidates.length)}${renderPanelToggle('detail', Boolean(order?.panes.detail), !order?.selectedCandidateId)}</div>
    </header>`;
}

function renderChatHome(vm) {
  return `
    <div class="chat-app-shell home-state">
      ${renderSidebar(vm)}
      <section class="chat-stage">
        ${renderTopbar()}
        <main class="chat-welcome chat-canvas">
          <div class="welcome-copy"><span class="welcome-logo">C</span><small>CHORIFY CREATION AGENT</small><h1>今天想推进哪件创作？</h1><p>直接说目标、上传素材，或选择一个结构化工具开始。Agent 会在同一会话中理解、执行并交付结果。</p></div>
          <div class="capability-cards">
            <button data-action="placeholder"><span>${icon('spark', 21)}</span><small>研究与策划</small><strong>研究一款产品的受众，并规划内容方向</strong><em>→</em></button>
            <button data-action="placeholder"><span>${icon('image', 21)}</span><small>视觉创作</small><strong>分析产品图，再给出多套视觉方案</strong><em>→</em></button>
            <button class="featured" data-action="open-replication-tool" data-source="welcome-card"><span>${icon('video', 21)}</span><small>视频交付</small><strong>视频复刻</strong><p>替换商品并完成市场本地化</p><em>→</em></button>
          </div>
          ${renderHomeComposer()}
        </main>
      </section>
    </div>`;
}

function renderHomeComposer() {
  return `
    <form class="welcome-composer chat-primary-composer" id="home-composer">
      <textarea id="home-input" placeholder="描述你想要的图片或视频，@ 可引用项目资产…"></textarea>
      <div><span><button type="button" data-action="placeholder">＋</button><button type="button" data-action="open-replication-tool" data-source="composer-tool">${icon('video', 15)} 视频复刻</button></span><button class="send-button" type="submit">${icon('send')}</button></div>
    </form>`;
}

function renderMessage(message) {
  const user = message.role === 'user';
  return `<article class="chat-message ${user ? 'is-user' : 'is-ai'}"><div class="message-avatar">${user ? 'DW' : 'AI'}</div><div class="message-bubble"><p>${escapeHtml(message.text)}</p>${message.progress != null ? `<div class="inline-progress"><span style="width:${Number(message.progress)}%"></span></div><small>${Number(message.progress)}%</small>` : ''}</div></article>`;
}

function errorText(order, field) {
  return order.validationErrors.includes(field) ? '<em class="validation">请补充此项</em>' : '';
}

function renderSourceField(order, kind) {
  const reference = kind === 'reference';
  const data = order.draft[kind];
  const title = reference ? '参考视频' : '目标商品';
  return `
    <section class="config-section ${order.validationErrors.includes(kind) ? 'has-error' : ''}">
      <header><span>${reference ? '01' : '02'}</span><strong>${title}</strong>${errorText(order, kind)}</header>
      <div class="upload-row"><div class="upload-icon">${icon(reference ? 'video' : 'image', 22)}</div><div><strong>${escapeHtml(data.name || (reference ? '上传想要复刻的爆款视频' : '选择要替换进视频的新商品'))}</strong><small>${data.name ? '已加入当前会话上下文' : reference ? '支持视频文件或公开链接' : '从产品库选择，或直接上传商品资料'}</small></div><span><button type="button" data-action="pick-${kind}-library">${reference ? '粘贴链接' : '产品库'}</button><button type="button" data-action="pick-${kind}-upload">${icon('upload', 14)} 上传</button></span></div>
    </section>`;
}

function renderReplicationMode(order) {
  const options = [
    ['same_product', '同商品跨国家本地化', '保留商品主体，调整语言、人物、场景与市场表达'],
    ['replace_product', '替换为另一款商品', '分析完成后，再补充新商品与缺失素材'],
    ['custom', '自定义调整', '先分析参考视频，再逐项选择要修改的对象'],
  ];
  return `<div class="mode-grid">${options.map(([value, title, description]) => `<button type="button" class="mode-option ${order.draft.replicationMode === value ? 'is-active' : ''}" data-action="set-replication-mode" data-value="${value}"><span>${order.draft.replicationMode === value ? icon('check', 15) : ''}</span><strong>${title}</strong><small>${description}</small></button>`).join('')}</div>`;
}

function renderIntentStrategies(order) {
  const labels = { person: '人物', scene: '场景', clip: '片段' };
  return `<section class="intent-section"><header><strong>可调整对象</strong><small>未处理的对象会沿用参考视频</small></header><div class="intent-strategy-matrix">${Object.entries(labels).map(([group, label]) => `<div><strong>${label}</strong><span>${['keep', 'replace', 'ai'].map((value) => `<button type="button" class="${order.intentDraft.strategies[group] === value ? 'is-active' : ''}" data-action="set-intent-strategy" data-group="${group}" data-value="${value}">${value === 'keep' ? '保留' : value === 'replace' ? '替换' : '交给 AI 判断'}</button>`).join('')}</span></div>`).join('')}</div></section>`;
}

function renderIntentReview(order) {
  const intent = order.intentDraft;
  const hasConflict = intent.blockingItems.length > 0;
  const needsCountry = ['same_product', 'custom'].includes(intent.quickMode);
  const needsProduct = ['replace_product', 'custom'].includes(intent.quickMode);
  const strategyLabels = { keep: '保留', replace: '替换', ai: 'AI 判断' };
  const conflictRows = (intent.strategyConflicts || []).map((conflict) => `<div class="intent-conflict-row" data-conflict-id="${escapeHtml(conflict.type)}"><span><strong>${escapeHtml({ person: '人物', scene: '场景', clip: '片段' }[conflict.group] || conflict.group)}</strong>：表单选择“${escapeHtml(strategyLabels[conflict.structured])}”，自然语言识别为“${escapeHtml(strategyLabels[conflict.inferred])}”</span><span><button type="button" data-action="resolve-intent-strategy-conflict" data-group="${escapeHtml(conflict.group)}" data-value="${escapeHtml(conflict.structured)}">沿用表单选择</button><button type="button" data-action="resolve-intent-strategy-conflict" data-group="${escapeHtml(conflict.group)}" data-value="${escapeHtml(conflict.inferred)}">采用 AI 理解</button></span></div>`).join('');
  const conflictText = intent.conflicts.includes('same_product_with_target_product')
    ? 'same_product_with_target_product：同商品本地化不能同时指定目标商品。'
    : intent.blockingItems.includes('reference') ? '请先补充参考视频。' : '';
  const analysisFailed = order.referenceAnalysis?.status === 'failed' || order.analysis?.status === 'failed';
  return `
    <form id="reference-intake-form" class="replication-card intent-card">
      <header class="config-heading enterprise-heading"><div><span>${icon('video', 17)} 视频复刻 · 意图定义</span><h2>定义这次要怎么复刻</h2><p>先确认参考视频与替换规则。AI 会先生成替换清单，尚不会创建候选视频。</p></div><button type="button" data-action="apply-preset">填入演示内容</button></header>
      <section class="intent-section ${intent.blockingItems.includes('reference') ? 'has-error' : ''}"><header><strong>参考视频 <em>必填</em></strong><small>上传或粘贴公开链接</small></header><div class="upload-row"><div class="upload-icon">${icon('video', 22)}</div><div><strong>${escapeHtml(intent.reference.name || '上传想要复刻的爆款视频')}</strong><small>${intent.reference.name ? '已加入当前对话上下文' : '支持视频文件或公开链接'}</small></div><span><button type="button" data-action="pick-reference-library">粘贴链接</button><button type="button" data-action="pick-reference-upload">${icon('upload', 14)} 上传</button></span></div></section>
      <section class="intent-section"><header><strong>快捷方式 <small>选填，再次点击可清空</small></strong></header><div class="mode-grid">${[['same_product', '同商品，换投放国家'], ['replace_product', '同国家，换商品'], ['custom', '商品和国家都更换']].map(([value, label]) => `<button type="button" class="mode-option ${intent.quickMode === value ? 'is-active' : ''}" data-action="${intent.quickMode === value ? 'clear-quick-mode' : 'set-replication-mode'}" data-value="${value}"><span>${intent.quickMode === value ? icon('check', 15) : ''}</span><strong>${label}</strong><small>${value === 'same_product' ? '仅设置目标国家' : value === 'replace_product' ? '仅设置目标商品' : '同时设置目标商品和投放国家'}</small></button>`).join('')}</div></section>
      ${needsCountry ? `<section class="intent-section"><label><strong>目标国家</strong><select data-field="market"><option value="">请选择</option>${['墨西哥', '美国', '巴西', '泰国'].map((market) => `<option value="${market}" ${intent.targetCountry === market ? 'selected' : ''}>${market}</option>`).join('')}</select></label></section>` : ''}
      ${needsProduct ? `<section class="intent-section"><header><strong>目标商品</strong><small>将替换原视频中的商品露出</small></header><div class="upload-row"><div class="upload-icon">${icon('image', 22)}</div><div><strong>${escapeHtml(intent.targetProduct.name || '选择目标商品')}</strong><small>可从产品库选择或上传资料</small></div><span><button type="button" data-action="pick-product-library">产品库</button><button type="button" data-action="pick-product-upload">${icon('upload', 14)} 上传</button></span></div></section>` : ''}
      ${renderIntentStrategies(order)}
      <section class="intent-section"><header><strong>自然语言补充</strong><button type="button" data-action="recognize-intent">识别我的要求</button></header><textarea data-field="intentNaturalLanguage" placeholder="例如：面向巴西市场，人物使用 AI，保留场景和片段">${escapeHtml(intent.naturalLanguage)}</textarea></section>
      ${order.replacementPlan.status === 'invalidated' ? '<section class="intent-reanalysis-notice"><strong>旧替换清单已失效</strong><p>已保留旧版本记录；确认本次意图后将重新分析并生成新版替换清单。</p></section>' : ''}
      ${analysisFailed ? `<section class="analysis-failure"><strong>分析失败</strong><p>${escapeHtml(order.referenceAnalysis?.error || order.analysis?.error || '参考视频暂时无法完成解析。')}</p><button type="button" data-action="retry-reference-analysis">重试分析</button></section>` : ''}
      <section class="ai-understanding ${hasConflict ? 'has-conflict' : ''}"><strong>AI 理解</strong><p>${escapeHtml(intent.understandingSummary || '请补充你的复刻要求，我会在这里解释理解结果。')}</p>${hasConflict ? `<div class="conflict"><strong>当前有冲突需要处理</strong>${conflictText ? `<p>${escapeHtml(conflictText)}${intent.conflicts.includes('same_product_with_target_product') ? ' <button type="button" data-action="clear-intent-target-product">清除目标商品</button>' : ''}</p>` : ''}${conflictRows}</div>` : '<small>没有冲突，可直接分析视频并生成替换清单。</small>'}</section>
      <footer class="config-footer intent-footer"><small>分析后会生成五组可编辑的替换清单</small><span><button class="primary" type="submit">分析视频并生成替换清单 ${icon('chevron', 15)}</button>${order.phase === 'intent_review' && !hasConflict ? '<button type="button" class="secondary" data-action="confirm-replication-intent">确认并开始分析</button>' : ''}</span></footer>
    </form>`;
}

function renderReferenceIntake(order) {
  return renderIntentReview(order);
}

function renderAnalysisProgress(order) {
  return renderMessage({ role: 'assistant', text: `${order.status}：${order.draft.reference.name}。正在读取镜头与节奏、识别对象并生成替换清单。`, progress: order.analysis.progress });
}

function renderIntentSummary(order) {
  const intent = order.intentDraft;
  const mode = intent.quickMode === 'same_product' ? '同商品，换投放国家' : intent.quickMode === 'replace_product' ? '同国家，换商品' : intent.quickMode === 'custom' ? '商品和国家都更换' : '沿用商品与国家';
  const label = (value) => ({ keep: '保留', replace: '替换', ai: 'AI 判断' }[value] || '保留');
  return `<article class="intent-summary"><span>${icon('check', 14)} 已确认复刻意图</span><strong>${escapeHtml(intent.reference.name)}</strong><small>${mode} · 人物${label(intent.strategies.person)} · 场景${label(intent.strategies.scene)} · 片段${label(intent.strategies.clip)}</small></article>`;
}

function renderAnalysisSummary(order) {
  const summary = order.analysis.summary;
  return `<section class="analysis-summary"><header><div><span>${icon('check', 16)} 参考视频分析完成</span><h3>AI 已把参考视频转成可配置的生产蓝图</h3></div><em>${summary.duration} · ${summary.shotCount} 个镜头</em></header><div class="analysis-metrics"><div><strong>${summary.productExposureCount}</strong><span>商品露出</span></div><div><strong>${summary.personCount}</strong><span>检测到人物</span></div><div><strong>${summary.sceneCount}</strong><span>主要场景</span></div><div><strong>${summary.textCount}</strong><span>文字/字幕段</span></div><div><strong>${summary.voiceLanguage}</strong><span>原口播语言</span></div></div></section>`;
}

function renderGoalDetail(order, goal) {
  if (goal === 'person') return `<div class="goal-detail"><div><strong>人物来源</strong><small>指定人物、上传照片，或让 AI 生成</small></div><div class="segmented">${[['library', '人物库'], ['upload', '上传照片'], ['ai', 'AI 生成']].map(([value, label]) => `<button type="button" data-action="set-person-mode" data-value="${value}" class="${order.draft.personMode === value ? 'is-active' : ''}">${label}</button>`).join('')}</div><textarea data-field="personDescription" placeholder="描述人物年龄、国家、气质和创作者类型">${escapeHtml(order.draft.personDescription)}</textarea></div>`;
  if (goal === 'scene') return `<div class="goal-detail"><div><strong>场景替换说明</strong><small>指定原视频中需要换掉的画面场景</small></div><textarea data-field="sceneInstruction" placeholder="例如：将厨房替换为墨西哥公寓早餐桌">${escapeHtml(order.draft.sceneInstruction)}</textarea></div>`;
  if (goal === 'clip') return `<div class="goal-detail"><div><strong>视频片段替换</strong><small>上传素材并关联原视频的镜头或时间段</small></div><button type="button" class="asset-placeholder" data-action="placeholder">${icon('upload')} 上传素材片段并指定位置</button></div>`;
  if (goal === 'brand') return `<div class="goal-detail"><div><strong>品牌 Logo</strong><small>市场文字由本地化配置统一处理</small></div><button type="button" class="asset-placeholder" data-action="placeholder">${icon('upload')} ${escapeHtml(order.draft.brandLogo || '上传透明 Logo')}</button></div>`;
  return '';
}

function renderConfiguration(order) {
  const summary = order.analysis.summary;
  const plan = order.replacementPlan;
  const blockers = plan.blockingItems || [];
  const groupMeta = [
    ['product', '商品', `${summary.productExposureCount} 处商品露出`, plan.product.inheritReference ? (order.draft.replicationMode ? '沿用原商品' : '沿用参考视频') : plan.product.target?.name || '待选择目标商品'],
    ['localization', '本地化', `${summary.textCount} 段文字与口播`, plan.localization.inheritReference ? (order.draft.replicationMode === 'replace_product' ? '沿用原国家' : '沿用参考视频') : plan.localization.targetCountry ? `${plan.localization.targetCountry} · ${plan.localization.language}` : '待选择国家'],
    ['person', '人物', `${summary.personCount} 位主出镜人物`, plan.person.strategy === 'ai' ? 'AI 生成' : plan.person.strategy === 'replace' ? (plan.person.target || '待指定人物') : '保留原人物'],
    ['scene', '场景', `${summary.sceneCount} 个主要场景`, plan.scene.strategy === 'ai' ? 'AI 生成' : plan.scene.strategy === 'replace' ? (plan.scene.target || '待指定场景') : '保留原场景'],
    ['clip', '片段', `${summary.shotCount} 个镜头`, plan.clip.strategy === 'ai' ? 'AI 生成' : plan.clip.strategy === 'replace' ? '待关联新片段' : '保留原片段'],
  ];
  const renderGroupDetails = (group) => {
    if (group === 'product') return `<div class="mapping-details"><p>出现镜头：00:01、00:06、00:11、00:17、00:23</p><p>推荐理由：商品主体清晰，适合统一替换所有露出。</p><div class="segmented"><button type="button" data-action="pick-replacement-target" data-group="product" data-source="library">产品库</button><button type="button" data-action="pick-replacement-target" data-group="product" data-source="upload">上传</button></div><small>镜头例外：暂无；默认覆盖全部露出。</small></div>`;
    if (group === 'localization') return `<div class="mapping-details"><label>投放国家<select data-plan-field="targetCountry"><option value="">请选择</option>${['墨西哥', '美国', '巴西', '泰国'].map((market) => `<option value="${market}" ${plan.localization.targetCountry === market ? 'selected' : ''}>${market}</option>`).join('')}</select></label><details><summary>镜头例外</summary><p>仅在屏幕文字与口播未对齐时创建例外；当前无需处理。</p></details></div>`;
    const value = plan[group].strategy;
    const sourceLabel = group === 'person' ? '人物库' : `${group === 'scene' ? '场景' : '片段'}素材库`;
    const target = plan[group].target;
    return `<div class="mapping-details"><div class="segmented">${['keep', 'replace', 'ai'].map((strategy) => `<button type="button" class="${value === strategy ? 'is-active' : ''}" data-action="set-replacement-strategy" data-group="${group}" data-value="${strategy}">${strategy === 'keep' ? '保留' : strategy === 'replace' ? '替换' : 'AI 生成'}</button>`).join('')}</div>${value === 'replace' ? `<div class="segmented person-source"><button type="button" data-action="set-replacement-source" data-group="${group}" data-value="library">${sourceLabel}</button><button type="button" data-action="set-replacement-source" data-group="${group}" data-value="upload">上传替代素材</button></div>` : ''}<p>出现镜头：${group === 'person' ? '00:02、00:08、00:16、00:24' : group === 'scene' ? '厨房、餐桌、通勤场景' : '按原镜头顺序处理'}</p><p>推荐理由：${value === 'keep' ? '保留可稳定复现原视频节奏。' : value === 'ai' ? '由 AI 补齐匹配市场的内容。' : '替换后保持镜头节奏不变。'}</p><small>目标来源：${value === 'ai' ? 'AI 生成' : value === 'replace' ? (target || '待从资产库或上传选择') : '参考视频'}；镜头例外：占位</small></div>`;
  };
  const objectTargetLabel = (object, fallbackTarget) => {
    const named = typeof object.target === 'string' ? object.target : object.target?.name;
    if (named) return named;
    if (object.target?.placeholder) return object.target.placeholder;
    if (!object.strategy && ['person', 'scene', 'clip'].includes(object.group)) return `沿用分组规则：${fallbackTarget}`;
    if (object.group === 'product' && plan.product.inheritReference) return fallbackTarget;
    if (object.group === 'localization' && plan.localization.inheritReference) return fallbackTarget;
    if (object.strategy === 'keep') return '沿用参考视频';
    if (object.strategy === 'ai') return 'AI 生成';
    return fallbackTarget;
  };
  const renderObjectRow = (object, fallbackTarget) => {
    const source = object.source || {};
    const shots = (source.shotIds || []).join('、');
    const range = source.range ? `${source.range.start}–${source.range.end}` : '';
    const effectiveStrategy = object.strategy || plan[object.group]?.strategy || '';
    const controls = ['person', 'scene', 'clip'].includes(object.group)
      ? `<span class="object-strategy-controls">${['keep', 'replace', 'ai'].map((strategy) => `<button type="button" class="${effectiveStrategy === strategy ? 'is-active' : ''}" data-action="set-object-strategy" data-group="${escapeHtml(object.group)}" data-object-id="${escapeHtml(object.id)}" data-value="${strategy}">${strategy === 'keep' ? '保留' : strategy === 'replace' ? '替换' : 'AI 生成'}</button>`).join('')}</span>`
      : '';
    const targetHint = !object.strategy
      ? '沿用分组规则'
      : object.strategy === 'keep'
        ? '保持原对象'
        : object.strategy === 'ai'
          ? '由 AI 生成匹配内容'
          : object.target?.source || object.target?.placeholder || '待补充目标素材';
    return `<div class="mapping-object-row" data-mapping-object-id="${escapeHtml(object.id)}"><div class="mapping-row"><span class="mapping-source"><i class="mapping-thumb">${icon(object.group === 'product' ? 'image' : 'video', 13)}</i><span><small>原对象</small><strong>${escapeHtml(source.label || '未命名对象')}</strong><small>${escapeHtml([range, shots].filter(Boolean).join(' · '))}</small></span></span><b>→</b><span class="mapping-target"><small>目标对象</small><strong>${escapeHtml(objectTargetLabel(object, fallbackTarget))}</strong><small>${escapeHtml(targetHint)}</small></span></div>${controls}</div>`;
  };
  return `
    <form id="production-plan-form" class="replication-card plan-card">
      <header class="config-heading enterprise-heading"><div><span>${icon('spark', 17)} 视频复刻 · 替换清单</span><h2>${order.editingConfiguration ? '调整已确认的替换方案' : '确认替换清单'}</h2><p>AI 已按原视频对象拆成五组映射；确认前不会创建候选视频。</p></div><span class="analysis-complete-badge">分析完成</span></header>
      ${renderAnalysisSummary(order)}
      <section class="plan-language"><header><strong>用自然语言更新替换清单</strong><button type="button" data-action="apply-plan-language">更新清单</button></header><textarea data-field="planNaturalLanguage" placeholder="例如：投放巴西，生成 5 条，人物使用 AI"></textarea><small>更新后只高亮受影响映射，不会直接生成。</small></section>
      <div class="replacement-groups">${groupMeta.map(([group, title, source, fallbackTarget]) => { const groupObjects = (plan.objects || []).filter((object) => object.group === group); return `<details class="replacement-group ${group === 'localization' ? 'localization-group' : ''} ${(plan.affectedGroups || []).includes(group) ? 'is-affected' : ''}" data-replacement-group="${group}" ${(plan.affectedGroups || []).includes(group) || group === 'product' || (group !== 'localization' && plan[group]?.strategy !== 'keep') ? 'open' : ''}><summary><span>${title}</span><small>${source}</small><em>${['person', 'scene', 'clip'].includes(group) ? plan[group].strategy : ''}</em></summary><div class="mapping-object-list">${groupObjects.length ? groupObjects.map((object) => renderObjectRow(object, fallbackTarget)).join('') : `<div class="mapping-row"><span class="mapping-source">原对象：${source}</span><b>→</b><span class="mapping-target">目标对象：${escapeHtml(fallbackTarget)}</span></div>`}</div>${renderGroupDetails(group)}</details>`; }).join('')}</div>
      ${blockers.length ? `<section class="plan-blockers"><strong>存在阻塞项，暂不能开始复刻</strong><p>${escapeHtml(blockers.join('、'))}</p>${blockers.map((blocker) => blocker === 'product' ? '<div><button type="button" data-action="pick-replacement-target" data-group="product" data-source="library">从产品库选择</button><button type="button" data-action="pick-replacement-target" data-group="product" data-source="upload">上传商品素材</button></div>' : blocker === 'market' ? '<div><button type="button" data-action="select-market-blocker" data-value="墨西哥">选择投放国家</button></div>' : blocker === 'same_product_with_target_product' ? '<div><button type="button" data-action="clear-intent-target-product">清除目标商品</button></div>' : `<div><button type="button" data-action="resolve-plan-limit" data-blocker="${escapeHtml(blocker)}" data-value="keep">继续保持</button><button type="button" data-action="resolve-plan-limit" data-blocker="${escapeHtml(blocker)}" data-value="ai">允许 AI 近似重建</button><button type="button" data-action="resolve-plan-limit" data-blocker="${escapeHtml(blocker)}" data-value="upload">上传替代素材</button></div>`).join('')}</section>` : ''}
      <footer class="config-footer"><div><strong>候选数量</strong><div class="segmented">${[1, 3, 5].map((count) => `<button type="button" data-action="set-candidate-count" data-value="${count}" class="${order.draft.candidateCount === count ? 'is-active' : ''}">${count} 条</button>`).join('')}</div><small>预计 ${order.draft.candidateCount * 2} 分钟 · ${order.draft.candidateCount * 80} 积分</small></div><span>${order.editingConfiguration ? '<button type="button" class="secondary" data-action="cancel-configuration-edit">取消修改</button>' : ''}<button class="primary" type="submit" ${blockers.length ? 'disabled' : ''}>确认替换方案并开始复刻 ${icon('chevron', 15)}</button></span></footer>
    </form>`;
}

function renderConfigSummary(order) {
  const { product, market, language } = getProductionSummaryLabels(order);
  return `<article class="config-summary"><div><span>${icon('check', 15)} 生产方案已确认</span><strong>${escapeHtml(order.draft.reference.name)} · ${escapeHtml(product)}</strong><p>${escapeHtml(market)} · ${escapeHtml(language)} · ${order.draft.candidateCount} 条候选</p></div><button data-action="reopen-configuration">重新打开配置</button></article>`;
}

function renderConfigurationMessage(order) {
  return `<article class="chat-tool-message"><div class="message-avatar">AI</div><div class="tool-message-body">${renderConfiguration(order)}</div></article>`;
}

function renderPending(order) {
  if (!order.pendingAction) return '';
  return `<article class="pending-action"><span>需要你补充</span><strong>${escapeHtml(order.pendingAction.title)}</strong><p>${escapeHtml(order.pendingAction.description)}</p><div><button data-action="resolve-material" data-strategy="upload">我来上传素材</button><button class="primary" data-action="resolve-material" data-strategy="ai">让 AI 生成替代场景</button></div></article>`;
}

function renderConversation(order) {
  return `
    <main class="conversation-column chat-canvas" aria-label="AI 聊天会话">
      <div class="conversation-agent"><span class="ai-avatar">AI</span><div><strong>Chorify 创作智能体</strong><small><i></i> 已连接当前会话</small></div><button data-action="placeholder">•••</button></div>
      <div class="conversation-scroll" data-scroll-region="conversation">
        <div class="conversation-lane">
          <div class="context-bar"><span>当前任务</span><strong>${escapeHtml(order.title)}</strong><em>${escapeHtml(order.status)}</em></div>
          ${order.messages.slice(0, 1).map(renderMessage).join('')}
          ${['intake', 'intent_review'].includes(order.phase) ? `<article class="chat-tool-message"><div class="message-avatar">AI</div><div class="tool-message-body">${renderReferenceIntake(order)}</div></article>` : ''}
          ${['analyzing', 'plan'].includes(order.phase) && !order.editingConfiguration ? renderIntentSummary(order) : ''}
          ${order.messages.slice(1).map(renderMessage).join('')}
          ${order.phase === 'plan' || order.editingConfiguration ? renderConfigurationMessage(order) : ''}
          ${['running', 'review'].includes(order.phase) && !order.editingConfiguration ? renderConfigSummary(order) : ''}
          ${renderPending(order)}
        </div>
      </div>
      <form class="chat-composer conversation-composer chat-primary-composer" id="conversation-composer"><textarea id="conversation-input" placeholder="继续补充要求，或用自然语言修改上方配置…"></textarea><div><span><button type="button" data-action="placeholder">＋</button><button type="button" data-action="placeholder">@ 资产</button><button type="button" data-action="open-replication-tool" data-source="composer-tool">${icon('video', 15)} 视频复刻</button></span><button class="send-button" type="submit">${icon('send')}</button></div></form>
    </main>`;
}

function renderExecutionRecord(candidate) {
  return `<details class="execution-record"><summary>执行记录 <span>${STATUS_LABELS[candidate.status]}</span></summary><ol><li class="done">参考结构解析</li><li class="${candidate.status === 'queued' ? '' : 'done'}">商品与本地化映射</li><li class="${['previewable', 'approved', 'revision', 'exported'].includes(candidate.status) ? 'done' : ''}">候选视频生成</li><li>人工审核与导出</li></ol></details>`;
}

function renderCandidate(candidate, selected) {
  const ready = ['previewable', 'approved', 'revision', 'exported'].includes(candidate.status);
  return `<article class="candidate-task ${selected ? 'is-selected' : ''}"><button class="candidate-main" data-action="select-candidate" data-candidate-id="${escapeHtml(candidate.id)}"><div class="candidate-thumb tone-${candidate.number}"><span>${String(candidate.number).padStart(2, '0')}</span>${ready ? '<i>▶</i>' : '<i class="pending">◌</i>'}<em>${escapeHtml(candidate.duration)}</em></div><div><span>视频 · <b class="status-${candidate.status}">${STATUS_LABELS[candidate.status]}</b></span><strong>${escapeHtml(candidate.title)}</strong><p>${escapeHtml(candidate.direction)}</p>${candidate.score ? `<small>复刻度 ${candidate.score}</small>` : '<small>查看当前生产状态</small>'}</div></button>${renderExecutionRecord(candidate)}</article>`;
}

function renderCandidateTable(order) {
  return `<div class="candidate-table"><header><span>视频</span><span>状态</span><span>版本</span><span>时长</span></header>${order.candidates.map((candidate) => `<button class="candidate-table-row ${candidate.id === order.selectedCandidateId ? 'is-selected' : ''}" data-action="select-candidate" data-candidate-id="${escapeHtml(candidate.id)}"><span><i class="candidate-mini-thumb tone-${candidate.number}"></i><b>${escapeHtml(candidate.title)}</b></span><span class="status-${candidate.status}">${STATUS_LABELS[candidate.status]}</span><span>${escapeHtml(candidate.version)}</span><span>${escapeHtml(candidate.duration)}</span></button>`).join('')}</div>`;
}

function renderResults(order) {
  const view = order.candidateView || 'card';
  return `<aside class="task-panel" aria-label="候选视频任务"><header><div><small>视频管理</small><strong>${order.candidates.length} 条候选视频</strong></div><span class="candidate-view-controls"><button class="${view === 'card' ? 'is-active' : ''}" data-action="set-candidate-view" data-view="card" aria-label="卡片视图" aria-pressed="${view === 'card'}">${icon('grid', 16)}</button><button class="${view === 'table' ? 'is-active' : ''}" data-action="set-candidate-view" data-view="table" aria-label="表格视图" aria-pressed="${view === 'table'}">${icon('list', 16)}</button><button data-action="toggle-panel" data-panel="results" aria-label="关闭视频管理">${icon('close')}</button></span></header>${view === 'table' ? renderCandidateTable(order) : `<div class="candidate-tasks candidate-card-view">${order.candidates.map((candidate) => renderCandidate(candidate, candidate.id === order.selectedCandidateId)).join('')}</div>`}</aside>`;
}

function renderDetail(order) {
  const candidate = order.selectedCandidate;
  if (!candidate) return '';
  const ready = ['previewable', 'approved', 'revision', 'exported'].includes(candidate.status);
  const { product: productLabel, market: marketLabel, language: languageLabel } = getProductionSummaryLabels(order);
  const waitingTitle = candidate.status === 'needs_material' ? '等待补充素材' : candidate.status === 'generating' ? '视频生成中' : '等待开始生成';
  const media = ready ? `<div class="video-frame tone-${candidate.number}"><img src="./assets/portable-blender-product.png" alt="便携式榨汁杯"><button>▶</button><span>${escapeHtml(candidate.duration)}</span><em>9:16 · 1080P</em></div><section class="replication-score"><div><small>AI 复刻评估</small><strong>复刻度 ${candidate.score || '—'}</strong></div><span>${candidate.score || '—'}</span></section><section class="preview-section"><header><strong>替换核对</strong><em>${escapeHtml(candidate.version)}</em></header><ul><li>${icon('check', 14)} 商品处理：${escapeHtml(productLabel)}</li><li>${icon('check', 14)} 市场：${escapeHtml(marketLabel)}；语言、字幕与口播：${escapeHtml(languageLabel)}</li><li>${icon('check', 14)} 原镜头顺序与整体节奏已锁定</li></ul></section><section class="preview-section"><header><strong>版本记录</strong><button data-action="placeholder">查看对比</button></header>${candidate.versionHistory.map((version) => `<div class="version-row"><b>${escapeHtml(version.version)}</b><span><strong>${escapeHtml(version.label)}</strong><small>${version.status === 'current' ? '当前版本' : '历史版本已保留'}</small></span></div>`).join('')}</section>` : `<div class="video-status-placeholder tone-${candidate.number}"><span class="status-orbit">◌</span><strong>${waitingTitle}</strong><p>${escapeHtml(candidate.direction)} · ${STATUS_LABELS[candidate.status]}</p><small>生成完成后将在这里自动显示视频预览、版本与审核操作。</small></div>`;
  const actions = ready ? `<form id="preview-revision-form" class="preview-revision"><textarea id="preview-revision-input" placeholder="把这一条的修改要求发回 AI 对话…"></textarea><button type="submit">发送给 AI</button></form><footer class="preview-actions"><button data-action="request-revision">提出修改</button><button class="primary" data-action="approve-candidate" ${['approved', 'exported'].includes(candidate.status) ? 'disabled' : ''}>${['approved', 'exported'].includes(candidate.status) ? '已通过审核' : '通过审核'}</button><button data-action="export-candidate" ${candidate.status !== 'approved' ? 'disabled' : ''}>${candidate.status === 'exported' ? '已导出' : candidate.status === 'approved' ? '可以导出' : '等待审核后导出'}</button></footer>` : '';
  return `<aside class="preview-panel" aria-label="视频详情"><header><div><small>视频详情</small><strong>${escapeHtml(candidate.title)} · ${escapeHtml(candidate.version)}</strong></div><button data-action="toggle-panel" data-panel="detail">${icon('close')}</button></header><div class="preview-scroll">${media}</div>${actions}</aside>`;
}

function renderWorkbench(vm) {
  const order = vm.activeOrder;
  return `<div class="chat-app-shell workbench-state">${renderSidebar(vm)}<section class="chat-stage">${renderTopbar(order)}<div class="workbench-columns ${order.panes.results ? 'has-results' : ''} ${order.panes.detail ? 'has-detail' : ''}">${renderConversation(order)}${order.panes.results && order.candidates.length ? renderResults(order) : ''}${order.panes.detail && order.selectedCandidate ? renderDetail(order) : ''}</div></section></div>`;
}

export function renderMarketingFactory(vm) {
  return vm.page === 'workbench' && vm.activeOrder ? renderWorkbench(vm) : renderChatHome(vm);
}
