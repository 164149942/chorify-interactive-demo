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

function renderGoalDetail(order, goal) {
  if (goal === 'person') return `<div class="goal-detail"><div><strong>人物来源</strong><small>指定人物、上传照片，或让 AI 生成</small></div><div class="segmented">${[['library', '人物库'], ['upload', '上传照片'], ['ai', 'AI 生成']].map(([value, label]) => `<button type="button" data-action="set-person-mode" data-value="${value}" class="${order.draft.personMode === value ? 'is-active' : ''}">${label}</button>`).join('')}</div><textarea data-field="personDescription" placeholder="描述人物年龄、国家、气质和创作者类型">${escapeHtml(order.draft.personDescription)}</textarea></div>`;
  if (goal === 'scene') return `<div class="goal-detail"><div><strong>场景替换说明</strong><small>指定原视频中需要换掉的画面场景</small></div><textarea data-field="sceneInstruction" placeholder="例如：将厨房替换为墨西哥公寓早餐桌">${escapeHtml(order.draft.sceneInstruction)}</textarea></div>`;
  if (goal === 'clip') return `<div class="goal-detail"><div><strong>视频片段替换</strong><small>上传素材并关联原视频的镜头或时间段</small></div><button type="button" class="asset-placeholder" data-action="placeholder">${icon('upload')} 上传素材片段并指定位置</button></div>`;
  if (goal === 'brand') return `<div class="goal-detail"><div><strong>品牌 Logo</strong><small>市场文字由本地化配置统一处理</small></div><button type="button" class="asset-placeholder" data-action="placeholder">${icon('upload')} ${escapeHtml(order.draft.brandLogo || '上传透明 Logo')}</button></div>`;
  return '';
}

function renderConfiguration(order) {
  return `
    <form id="replication-config" class="replication-card">
      <header class="config-heading"><div><span>${icon('video', 17)} 视频复刻</span><h2>${order.editingConfiguration ? '重新配置复刻任务' : '先确认这次要怎么复刻'}</h2><p>结构化选项和自然语言会同步。确认后，当前会话将绑定一份视频复刻生产订单。</p></div><button type="button" data-action="apply-preset">填入演示配置</button></header>
      ${renderSourceField(order, 'reference')}
      ${renderSourceField(order, 'product')}
      <section class="config-section ${order.validationErrors.includes('market') ? 'has-error' : ''}"><header><span>03</span><strong>投放国家与本地化</strong>${errorText(order, 'market')}</header><div class="market-row"><label><small>投放国家</small><select data-field="market"><option value="">请选择</option>${['墨西哥', '美国', '巴西', '泰国'].map((market) => `<option value="${market}" ${order.draft.market === market ? 'selected' : ''}>${market}</option>`).join('')}</select></label><div><small>自动确定</small><strong>${escapeHtml(order.draft.language || '语言待确定')}</strong><span>${escapeHtml(order.draft.subtitleMode || '字幕、画面文字与口播')}</span></div></div></section>
      <section class="config-section"><header><span>04</span><strong>选择要调整的对象</strong><small>除所选内容外，其他都继承参考视频</small></header><div class="mandatory-product">${icon('check', 15)} 商品将在原视频全部露出位置替换</div><div class="goal-grid">${Object.entries(GOAL_LABELS).map(([goal, label]) => `<button type="button" class="${order.draft.goals[goal] ? 'is-active' : ''}" data-action="toggle-goal" data-goal="${goal}" ${goal === 'product' ? 'disabled' : ''}>${order.draft.goals[goal] ? icon('check', 14) : icon('plus', 14)} ${label}</button>`).join('')}</div><div class="goal-details">${order.visibleGoalSections.map((goal) => renderGoalDetail(order, goal)).join('')}</div></section>
      <details class="advanced-config"><summary>高级设置 <span>比例、分辨率、创意强度等占位</span></summary><div>本版先确认结构与交互，具体模型参数后续补充。</div></details>
      <footer class="config-footer"><div><strong>候选数量</strong><div class="segmented">${[1, 3, 5].map((count) => `<button type="button" data-action="set-candidate-count" data-value="${count}" class="${order.draft.candidateCount === count ? 'is-active' : ''}">${count} 条</button>`).join('')}</div></div><span>${order.editingConfiguration ? '<button type="button" class="secondary" data-action="cancel-configuration-edit">取消修改</button>' : ''}<button class="primary" type="submit">${order.editingConfiguration ? '保存配置并重新生成' : '确认配置并开始复刻'} ${icon('chevron', 15)}</button></span></footer>
    </form>`;
}

function renderConfigSummary(order) {
  return `<article class="config-summary"><div><span>${icon('check', 15)} 配置已确认</span><strong>${escapeHtml(order.draft.reference.name)} → ${escapeHtml(order.draft.product.name)}</strong><p>${escapeHtml(order.draft.market)} · ${escapeHtml(order.draft.language)} · ${order.draft.candidateCount} 条候选</p></div><button data-action="reopen-configuration">重新打开配置</button></article>`;
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
          ${order.messages.map(renderMessage).join('')}
          ${order.phase === 'draft' || order.editingConfiguration ? renderConfigurationMessage(order) : renderConfigSummary(order)}
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
  return `<article class="candidate-task ${selected ? 'is-selected' : ''}"><button class="candidate-main" data-action="select-candidate" data-candidate-id="${escapeHtml(candidate.id)}" ${ready ? '' : 'disabled'}><div class="candidate-thumb tone-${candidate.number}"><span>${String(candidate.number).padStart(2, '0')}</span>${ready ? '<i>▶</i>' : '<i class="pending">◌</i>'}<em>${escapeHtml(candidate.duration)}</em></div><div><span>视频 · <b class="status-${candidate.status}">${STATUS_LABELS[candidate.status]}</b></span><strong>${escapeHtml(candidate.title)}</strong><p>${escapeHtml(candidate.direction)}</p>${candidate.score ? `<small>复刻度 ${candidate.score}</small>` : '<small>等待前序任务完成</small>'}</div></button>${renderExecutionRecord(candidate)}</article>`;
}

function renderResults(order) {
  const ready = order.candidates.filter((candidate) => ['previewable', 'approved', 'revision', 'exported'].includes(candidate.status)).length;
  return `<aside class="task-panel" aria-label="候选视频任务"><header><div><small>本对话的任务</small><strong>${order.candidates.length} 条候选视频</strong></div><button data-action="toggle-panel" data-panel="results">${icon('close')}</button></header><div class="task-summary"><span style="--progress:${order.progress}%"></span><div><strong>${ready}/${order.candidates.length} 可预览</strong><small>${escapeHtml(order.status)}</small></div></div><div class="candidate-tasks">${order.candidates.map((candidate) => renderCandidate(candidate, candidate.id === order.selectedCandidateId)).join('')}</div></aside>`;
}

function renderDetail(order) {
  const candidate = order.selectedCandidate;
  if (!candidate) return '';
  return `<aside class="preview-panel" aria-label="视频预览"><header><div><small>视频预览</small><strong>${escapeHtml(candidate.title)} · ${escapeHtml(candidate.version)}</strong></div><button data-action="toggle-panel" data-panel="detail">${icon('close')}</button></header><div class="preview-scroll"><div class="video-frame tone-${candidate.number}"><img src="./assets/portable-blender-product.png" alt="便携式榨汁杯"><button>▶</button><span>${escapeHtml(candidate.duration)}</span><em>9:16 · 1080P</em></div><section class="replication-score"><div><small>AI 复刻评估</small><strong>复刻度 ${candidate.score || '—'}</strong></div><span>${candidate.score || '—'}</span></section><section class="preview-section"><header><strong>替换核对</strong><em>${escapeHtml(candidate.version)}</em></header><ul><li>${icon('check', 14)} 商品全部露出位置已替换</li><li>${icon('check', 14)} ${escapeHtml(order.draft.market)}语言、字幕与口播已本地化</li><li>${icon('check', 14)} 原镜头顺序与整体节奏已锁定</li></ul></section><section class="preview-section"><header><strong>版本记录</strong><button data-action="placeholder">查看对比</button></header>${candidate.versionHistory.map((version) => `<div class="version-row"><b>${escapeHtml(version.version)}</b><span><strong>${escapeHtml(version.label)}</strong><small>${version.status === 'current' ? '当前版本' : '历史版本已保留'}</small></span></div>`).join('')}</section></div><form id="preview-revision-form" class="preview-revision"><textarea id="preview-revision-input" placeholder="把这一条的修改要求发回 AI 对话…"></textarea><button type="submit">发送给 AI</button></form><footer class="preview-actions"><button data-action="request-revision">提出修改</button><button class="primary" data-action="approve-candidate" ${['approved', 'exported'].includes(candidate.status) ? 'disabled' : ''}>${['approved', 'exported'].includes(candidate.status) ? '已通过审核' : '通过审核'}</button><button data-action="export-candidate" ${candidate.status !== 'approved' ? 'disabled' : ''}>${candidate.status === 'exported' ? '已导出' : candidate.status === 'approved' ? '可以导出' : '等待审核后导出'}</button></footer></aside>`;
}

function renderWorkbench(vm) {
  const order = vm.activeOrder;
  return `<div class="chat-app-shell workbench-state">${renderSidebar(vm)}<section class="chat-stage">${renderTopbar(order)}<div class="workbench-columns ${order.panes.results ? 'has-results' : ''} ${order.panes.detail ? 'has-detail' : ''}">${renderConversation(order)}${order.panes.results && order.candidates.length ? renderResults(order) : ''}${order.panes.detail && order.selectedCandidate ? renderDetail(order) : ''}</div></section></div>`;
}

export function renderMarketingFactory(vm) {
  return vm.page === 'workbench' && vm.activeOrder ? renderWorkbench(vm) : renderChatHome(vm);
}
