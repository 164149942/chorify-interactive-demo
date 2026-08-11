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
  product: '替换商品',
  person: '更换人物',
  scene: '更换场景',
  clip: '替换素材片段',
  brand: '替换品牌 Logo',
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
    factory: '<path d="M4 20V9l5 3V8l5 3V4h6v16z"/><path d="M8 20v-3m4 3v-3m4 3v-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    message: '<path d="M20 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h8a5 5 0 0 1 5 5z"/>',
    video: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    upload: '<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M5 15v5h14v-5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"/>',
    sparkle: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    send: '<path d="m3 11 18-8-8 18-2-8z"/><path d="m11 13 4-4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/>',
    home: '<path d="m3 11 9-8 9 8v9H6v-9"/><path d="M10 20v-6h4v6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.1.9-1.1 1.7M12 17h.01"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
}

function renderBrand() {
  return `
    <button class="brand-lockup" data-action="go-home" aria-label="返回营销工厂首页">
      <span class="brand-mark">C</span>
      <span><strong>Chorify</strong><small>营销工厂</small></span>
      <em>Beta</em>
    </button>`;
}

function renderAccount() {
  return `
    <div class="account-card">
      <span class="avatar">DW</span>
      <span><strong>Dianwen Wang</strong><small>专业版 · 8,240 AI 积分</small></span>
      <button class="icon-button" data-action="placeholder" aria-label="账户菜单">•••</button>
    </div>`;
}

function renderSessionSidebar(vm, { home = false } = {}) {
  return `
    <aside class="session-sidebar" aria-label="生产会话">
      ${renderBrand()}
      <button class="primary-side-action" data-action="create-order">${icon('plus')} 新建营销生产</button>
      <label class="sidebar-search">${icon('search', 16)}<input type="search" placeholder="搜索生产会话" aria-label="搜索生产会话"></label>
      <nav class="side-nav" aria-label="营销工厂导航">
        <button class="${home ? 'is-active' : ''}" data-action="go-home">${icon('home')} 营销工厂首页</button>
        <button data-action="placeholder">${icon('factory')} 生产记录</button>
      </nav>
      <div class="history-heading"><span>最近生产</span><button class="icon-button" data-action="placeholder">•••</button></div>
      <div class="order-list">
        ${vm.orders.map((order) => `
          <button class="order-row ${vm.activeOrderId === order.id ? 'is-active' : ''}" data-action="open-order" data-order-id="${escapeHtml(order.id)}">
            <span class="order-icon">${icon('message', 16)}</span>
            <span><strong>${escapeHtml(order.title)}</strong><small>${escapeHtml(order.subtitle)}</small></span>
            <em>${escapeHtml(order.updatedLabel)}</em>
          </button>`).join('')}
      </div>
      <div class="sidebar-foot">
        <button class="quiet-side-action" data-action="placeholder">${icon('help')} 帮助与反馈</button>
        ${renderAccount()}
      </div>
    </aside>`;
}

function renderHome(vm) {
  return `
    <div class="factory-shell factory-home">
      ${renderSessionSidebar(vm, { home: true })}
      <main class="home-main">
        <header class="home-topbar">
          <span class="crumb">Chorify / 营销工厂</span>
          <div class="credits-pill">专业版 · 8,240 AI 积分</div>
        </header>
        <section class="hero-section">
          <div class="hero-copy">
            <span class="eyebrow">REFERENCE-TO-PERFORMANCE</span>
            <h1 aria-label="把爆款营销视频变成你的可投放版本">把爆款营销视频<br>变成你的可投放版本</h1>
            <p>保留原视频镜头顺序与节奏，一次配置目标商品、投放国家和可选替换对象，由 AI 批量生产可审核的候选结果。</p>
            <button class="hero-button" data-action="create-order">${icon('plus')} 新建营销生产</button>
          </div>
          <div class="hero-visual" aria-label="营销视频复刻流程示意">
            <div class="reference-frame"><span>参考视频</span><div class="portrait-video reference-video">12.8M 播放</div></div>
            <div class="process-orbit"><span>${icon('sparkle', 24)}</span><strong>结构锁定</strong><small>商品替换 · 市场本地化</small></div>
            <div class="result-stack">
              <div class="portrait-video result-video result-a">候选 01</div>
              <div class="portrait-video result-video result-b">候选 02</div>
              <div class="portrait-video result-video result-c">候选 03</div>
            </div>
          </div>
        </section>
        <section class="workflow-intro">
          <article><span>01</span><div><strong>参考视频</strong><p>上传链接或文件，AI 识别镜头结构、节奏和全部商品露出。</p></div></article>
          <article><span>02</span><div><strong>一次配置</strong><p>选择商品、国家与需要替换的人物、场景、素材片段或 Logo。</p></div></article>
          <article><span>03</span><div><strong>候选结果</strong><p>并行生成 1 / 3 / 5 条候选，逐条预览、审核、修改和导出。</p></div></article>
        </section>
        <section class="recent-section">
          <div class="section-title"><div><span class="eyebrow">RECENT PRODUCTIONS</span><h2>最近生产</h2></div><button class="text-button" data-action="placeholder">查看全部 ${icon('chevron', 15)}</button></div>
          <div class="recent-grid">
            ${vm.orders.map((order, index) => `
              <button class="recent-card" data-action="open-order" data-order-id="${escapeHtml(order.id)}">
                <div class="recent-thumbnail tone-${index + 1}"><span>${order.draft.market || '市场'}</span><strong>${escapeHtml(order.status)}</strong></div>
                <div class="recent-card-body"><span class="status-dot"></span><strong>${escapeHtml(order.title)}</strong><p>${escapeHtml(order.subtitle)}</p><small>${escapeHtml(order.updatedLabel)}</small></div>
              </button>`).join('')}
            <button class="recent-card new-card" data-action="create-order">${icon('plus', 26)}<strong>新建营销生产</strong><span>从一个参考视频开始</span></button>
          </div>
        </section>
      </main>
    </div>`;
}

function renderPaneToggle(panel, open, disabled = false) {
  const labels = { conversation: '对话', results: '结果', detail: '详情' };
  return `<button class="pane-toggle ${open ? 'is-open' : ''}" data-action="toggle-panel" data-panel="${panel}" aria-pressed="${open}" ${disabled ? 'disabled' : ''} title="${labels[panel]}"><span></span><i></i></button>`;
}

function renderWorkbenchHeader(order) {
  return `
    <header class="workbench-topbar">
      <div class="workbench-title"><button class="icon-button" data-action="go-home" aria-label="返回">${icon('chevron', 16)}</button><div><small>营销生产会话</small><strong>${escapeHtml(order.title)}</strong></div></div>
      <div class="workbench-status"><span class="live-dot"></span>${escapeHtml(order.status)}</div>
      <div class="pane-controls" aria-label="工作区栏位开关">
        ${renderPaneToggle('conversation', order.panes.conversation)}
        ${renderPaneToggle('results', order.panes.results, order.candidates.length === 0)}
        ${renderPaneToggle('detail', order.panes.detail, !order.selectedCandidateId)}
      </div>
    </header>`;
}

function fieldError(order, field) {
  return order.validationErrors.includes(field) ? '<span class="field-error">请补充此项</span>' : '';
}

function renderSourceField({ title, hint, type, value, error }) {
  return `
    <section class="form-section compact-source ${error ? 'has-error' : ''}">
      <div class="form-section-title"><div><span class="field-index">${type === 'reference' ? '01' : '02'}</span><strong>${title}</strong></div>${error || ''}</div>
      <div class="source-card ${value ? 'has-file' : ''}">
        <span class="source-icon">${icon(type === 'reference' ? 'video' : 'factory', 22)}</span>
        <div><strong>${value ? escapeHtml(value) : hint}</strong><small>${value ? '已加入当前生产上下文' : type === 'reference' ? '支持视频文件或公开链接' : '从产品库选择，或直接上传商品资料'}</small></div>
        <div class="source-actions">
          <button type="button" class="small-button" data-action="pick-${type}-library">${type === 'reference' ? icon('link', 14) + ' 粘贴链接' : '产品库'}</button>
          <button type="button" class="small-button" data-action="pick-${type}-upload">${icon('upload', 14)} 上传</button>
        </div>
      </div>
    </section>`;
}

function renderGoalSection(order, goal) {
  if (goal === 'product') return '';
  if (goal === 'person') return `
    <div class="conditional-panel">
      <div class="conditional-title"><strong>人物来源</strong><span>指定人物、上传照片，或让 AI 生成</span></div>
      <div class="segmented">
        ${['library:人物库', 'upload:上传照片', 'ai:AI 生成'].map((item) => {
          const [value, label] = item.split(':');
          return `<button type="button" data-action="set-person-mode" data-value="${value}" class="${order.draft.personMode === value ? 'is-active' : ''}">${label}</button>`;
        }).join('')}
      </div>
      <textarea data-field="personDescription" placeholder="例如：25—35 岁墨西哥女性，真实生活方式创作者">${escapeHtml(order.draft.personDescription)}</textarea>
    </div>`;
  if (goal === 'scene') return `
    <div class="conditional-panel"><div class="conditional-title"><strong>场景替换说明</strong><span>指定原视频中需要换掉的画面场景</span></div><textarea data-field="sceneInstruction" placeholder="例如：将厨房场景替换为墨西哥公寓早餐桌">${escapeHtml(order.draft.sceneInstruction)}</textarea></div>`;
  if (goal === 'clip') return `
    <div class="conditional-panel"><div class="conditional-title"><strong>素材片段替换</strong><span>上传视频素材，指定替换或二次加工的原片段</span></div><div class="drop-mini">${icon('upload')} 上传视频素材并关联时间段</div></div>`;
  if (goal === 'brand') return `
    <div class="conditional-panel"><div class="conditional-title"><strong>品牌 Logo</strong><span>只替换品牌标识；市场文字由本地化配置统一处理</span></div><div class="drop-mini ${order.draft.brandLogo ? 'has-value' : ''}">${icon('upload')} ${escapeHtml(order.draft.brandLogo || '上传透明 Logo')}</div></div>`;
  return '';
}

function renderConfiguration(order) {
  return `
    <form id="replication-config" class="replication-form">
      <div class="embedded-card-heading"><div><span class="assistant-chip">AI 引导</span><h2>复刻配置</h2><p>一次确认全部生产条件。你也可以随时用自然语言修改，表单会同步更新。</p></div><button type="button" class="ghost-button" data-action="apply-preset">填入演示资料</button></div>
      ${renderSourceField({ title: '参考视频', hint: '上传你想复刻的爆款营销视频', type: 'reference', value: order.draft.reference.name, error: fieldError(order, 'reference') })}
      ${renderSourceField({ title: '目标商品', hint: '选择需要替换进视频的新商品', type: 'product', value: order.draft.product.name, error: fieldError(order, 'product') })}
      <section class="form-section ${order.validationErrors.includes('market') ? 'has-error' : ''}">
        <div class="form-section-title"><div><span class="field-index">03</span><strong>投放市场</strong></div>${fieldError(order, 'market')}</div>
        <div class="market-grid">
          <label><span>投放国家</span><select data-field="market"><option value="">请选择国家</option>${['墨西哥', '美国', '巴西', '泰国'].map((market) => `<option value="${market}" ${order.draft.market === market ? 'selected' : ''}>${market}</option>`).join('')}</select></label>
          <div class="derived-field"><span>自动本地化</span><strong>${escapeHtml(order.draft.language || '选择国家后自动确定')}</strong><small>${escapeHtml(order.draft.subtitleMode || '语言、字幕、画面文字与口播')}</small></div>
        </div>
      </section>
      <section class="form-section">
        <div class="form-section-title"><div><span class="field-index">04</span><strong>替换范围</strong></div><span class="field-note">商品必换，其他按需选择</span></div>
        <p class="mandatory-note">${icon('check', 15)} 商品将在所有露出位置替换</p>
        <div class="goal-chips">
          ${Object.entries(GOAL_LABELS).map(([goal, label]) => `<button type="button" data-action="toggle-goal" data-goal="${goal}" class="goal-chip ${order.draft.goals[goal] ? 'is-active' : ''}" ${goal === 'product' ? 'disabled' : ''}>${order.draft.goals[goal] ? icon('check', 14) : icon('plus', 14)} ${label}</button>`).join('')}
        </div>
        <div class="conditional-stack">${order.visibleGoalSections.map((goal) => renderGoalSection(order, goal)).join('')}</div>
      </section>
      <section class="form-section form-footer-section">
        <div><strong>候选视频数量</strong><span>首个结果完成后自动打开结果区</span></div>
        <div class="segmented candidate-count">${[1, 3, 5].map((count) => `<button type="button" data-action="set-candidate-count" data-value="${count}" class="${order.draft.candidateCount === count ? 'is-active' : ''}">${count} 条</button>`).join('')}</div>
        <button class="submit-button" type="submit">确认配置并开始复刻 ${icon('chevron', 16)}</button>
      </section>
    </form>`;
}

function renderMessage(message) {
  const isUser = message.role === 'user';
  return `
    <article class="conversation-message ${isUser ? 'is-user' : 'is-ai'} ${message.kind ? `kind-${message.kind}` : ''}">
      ${isUser ? '' : '<span class="ai-avatar">AI</span>'}
      <div class="message-content"><p>${escapeHtml(message.text)}</p>${message.progress != null ? `<div class="message-progress"><span style="width:${Number(message.progress)}%"></span></div><small>${Number(message.progress)}%</small>` : ''}</div>
    </article>`;
}

function renderLockedSummary(order) {
  const activeGoals = Object.entries(order.draft.goals).filter(([, enabled]) => enabled).map(([goal]) => GOAL_LABELS[goal]).join('、');
  return `
    <article class="config-summary-card">
      <div><span class="summary-kicker">配置已锁定</span><strong>${escapeHtml(order.draft.reference.name)} → ${escapeHtml(order.draft.product.name)}</strong><p>${escapeHtml(order.draft.market)} · ${escapeHtml(order.draft.language)} · ${order.draft.candidateCount} 条候选</p></div>
      <div class="summary-goals">${escapeHtml(activeGoals)}</div>
      <button class="small-button" data-action="placeholder">重新打开配置</button>
    </article>`;
}

function renderPendingAction(order) {
  if (!order.pendingAction) return '';
  return `
    <article class="pending-card">
      <div class="pending-head"><span>需要你补充</span><em>其他候选继续生产</em></div>
      <strong>${escapeHtml(order.pendingAction.title)}</strong>
      <p>${escapeHtml(order.pendingAction.description)}</p>
      <div class="pending-actions"><button class="small-button" data-action="resolve-material" data-strategy="upload">我来上传素材</button><button class="primary-small" data-action="resolve-material" data-strategy="ai">让 AI 生成替代场景</button></div>
    </article>`;
}

function renderConversationPane(order) {
  return `
    <main class="conversation-pane" aria-label="AI 生产对话">
      <div class="conversation-head"><div><span class="ai-avatar">AI</span><div><strong>Chorify 生产智能体</strong><small><i></i> 已连接当前生产会话</small></div></div><button class="icon-button" data-action="placeholder">•••</button></div>
      <div class="conversation-scroll" data-scroll-region="conversation">
        <div class="context-strip"><span>当前任务</span><strong>${escapeHtml(order.title)}</strong><em>${escapeHtml(order.status)}</em></div>
        ${order.messages.map(renderMessage).join('')}
        ${order.phase === 'draft' ? renderConfiguration(order) : renderLockedSummary(order)}
        ${renderPendingAction(order)}
      </div>
      <form class="composer" id="conversation-composer">
        <div class="composer-context">${icon('factory', 14)} 当前上下文：${escapeHtml(order.title)}</div>
        <textarea id="conversation-input" placeholder="告诉 AI 你要替换什么，也可以上传素材或粘贴链接…"></textarea>
        <div class="composer-actions"><div><button type="button" class="composer-icon" data-action="placeholder" aria-label="添加素材">${icon('plus')}</button><button type="button" class="composer-icon" data-action="placeholder" aria-label="引用资产">@</button><button type="button" class="composer-icon" data-action="placeholder" aria-label="粘贴链接">${icon('link')}</button></div><button class="send-button" type="submit" aria-label="发送">${icon('send')}</button></div>
      </form>
    </main>`;
}

function renderCandidateCard(candidate, selected) {
  const ready = ['previewable', 'approved', 'exported'].includes(candidate.status);
  return `
    <button class="candidate-card ${selected ? 'is-selected' : ''} ${ready ? 'is-ready' : ''}" data-action="select-candidate" data-candidate-id="${escapeHtml(candidate.id)}" ${candidate.status === 'queued' ? 'disabled' : ''}>
      <div class="candidate-preview candidate-${candidate.number}">
        <span class="candidate-index">${String(candidate.number).padStart(2, '0')}</span>
        ${ready ? '<span class="play-button">▶</span>' : candidate.status === 'generating' ? '<span class="generating-mark"></span>' : candidate.status === 'needs_material' ? '<span class="warning-mark">!</span>' : ''}
        <em>${escapeHtml(candidate.duration)}</em>
      </div>
      <div class="candidate-info"><strong>${escapeHtml(candidate.title)}</strong><p>${escapeHtml(candidate.direction)}</p><div><span class="status-tag status-${candidate.status}">${STATUS_LABELS[candidate.status] || candidate.status}</span>${candidate.score ? `<small>复刻度 ${candidate.score}</small>` : ''}</div></div>
    </button>`;
}

function renderResultsPane(order) {
  const readyCount = order.candidates.filter((candidate) => ['previewable', 'approved', 'exported'].includes(candidate.status)).length;
  return `
    <aside class="results-pane" aria-label="候选视频结果">
      <header class="pane-header"><div><small>候选结果</small><strong>${readyCount}/${order.candidates.length} 可预览</strong></div><button class="icon-button" data-action="toggle-panel" data-panel="results" aria-label="关闭结果区">${icon('close')}</button></header>
      <div class="results-summary"><span style="--progress:${order.progress}%"></span><div><strong>${escapeHtml(order.status)}</strong><small>首个结果自动展开 · 详情由你选择后打开</small></div></div>
      <div class="candidate-list">${order.candidates.map((candidate) => renderCandidateCard(candidate, candidate.id === order.selectedCandidateId)).join('')}</div>
      <footer class="results-footer"><span>${icon('sparkle', 15)} AI 已按复刻完整度排序</span><button class="text-button" data-action="placeholder">批量操作</button></footer>
    </aside>`;
}

function renderDetailPane(order) {
  const candidate = order.selectedCandidate;
  if (!candidate) return '';
  return `
    <aside class="detail-pane" aria-label="视频详情">
      <header class="pane-header"><div><small>视频详情</small><strong>${escapeHtml(candidate.title)} · ${escapeHtml(candidate.version)}</strong></div><button class="icon-button" data-action="toggle-panel" data-panel="detail" aria-label="关闭详情">${icon('close')}</button></header>
      <div class="detail-scroll">
        <div class="detail-video candidate-${candidate.number}"><span class="play-button large">▶</span><div><span>${escapeHtml(candidate.duration)}</span><span>9:16 · 1080P</span></div></div>
        <section class="detail-metrics"><div><span>AI 复刻评估</span><strong>复刻度 ${candidate.score || '—'}</strong></div><div class="score-ring">${candidate.score || '—'}</div></section>
        <section class="detail-section"><div class="detail-section-title"><strong>替换核对</strong><span>${escapeHtml(candidate.version)}</span></div><ul><li>${icon('check', 15)} 商品全露出位置已替换</li><li>${icon('check', 15)} ${escapeHtml(order.draft.market)}字幕与口播已本地化</li><li>${icon('check', 15)} 原镜头顺序与整体节奏已锁定</li></ul></section>
        <section class="detail-section"><div class="detail-section-title"><strong>版本与修改</strong><button class="text-button" data-action="placeholder">查看对比</button></div>${candidate.versionHistory.map((version) => `<div class="version-row ${version.status === 'current' ? 'is-current' : ''}"><span>${escapeHtml(version.version)}</span><div><strong>${escapeHtml(version.label)}</strong><small>${version.status === 'current' ? '刚刚 · 当前版本' : '历史版本 · 已保留'}</small></div><em>${version.status === 'current' ? '当前' : '历史'}</em></div>`).join('')}</section>
      </div>
      <footer class="detail-actions"><button class="secondary-button" data-action="request-revision" ${candidate.status === 'exported' ? 'disabled' : ''}>${candidate.status === 'revision' ? '继续修改' : '提出修改'}</button><button class="approve-button" data-action="approve-candidate" ${['approved', 'exported'].includes(candidate.status) ? 'disabled' : ''}>${['approved', 'exported'].includes(candidate.status) ? '已通过审核' : '通过审核'}</button><button class="export-button" data-action="export-candidate" ${!['approved', 'exported'].includes(candidate.status) ? 'disabled' : ''}>${candidate.status === 'exported' ? '已导出' : candidate.status === 'approved' ? '可以导出' : '等待审核后导出'}</button></footer>
    </aside>`;
}

function renderWorkbench(vm) {
  const order = vm.activeOrder;
  if (!order) return renderHome(vm);
  const paneCount = vm.visiblePanes.length;
  return `
    <div class="factory-shell workbench-shell pane-count-${paneCount}" data-visible-panes="${vm.visiblePanes.join(',')}">
      ${renderSessionSidebar(vm)}
      <section class="workbench-area">
        ${renderWorkbenchHeader(order)}
        <div class="workbench-columns">
          ${order.panes.conversation ? renderConversationPane(order) : ''}
          ${order.panes.results && order.candidates.length ? renderResultsPane(order) : ''}
          ${order.panes.detail && order.selectedCandidate ? renderDetailPane(order) : ''}
        </div>
      </section>
    </div>`;
}

export function renderMarketingFactory(vm) {
  return vm.page === 'workbench' ? renderWorkbench(vm) : renderHome(vm);
}
