import {
  advanceDemoTaskPreparation,
  appendProjectConversationMessage,
  appendChiefMessage,
  approveStoryboardAndGenerate,
  cancelCreateProject,
  closeChiefTransfer,
  completeVideoGeneration,
  createBlankProject,
  createChiefChat,
  createInitialState,
  enterVideoCanvas,
  getActiveChiefChat,
  getActiveContextSnapshot,
  getActiveProject,
  getActiveSession,
  getActiveTask,
  getActiveVideo,
  getChiefChats,
  getConversationViewModel,
  getCurrentTaskProcessNodes,
  getProjectInputAssets,
  getWorkspaceAssets,
  getWorkspaceFolders,
  getProjectAssetReferences,
  getProjectLibraryAssets,
  getSessionContextAssets,
  getProjectSessions,
  getTaskStoryboards,
  getTaskVideoProductionChains,
  getVideoPackageViewModel,
  ingestDemoMaterials,
  openChiefChat,
  openChiefTransfer,
  openCreateProject,
  openProjectsHome,
  openAssetCenter,
  setAssetCenterScope,
  openProjectAssetMode,
  selectLibraryAsset,
  addWorkspaceAssetToProject,
  addAssetToSessionContext,
  removeAssetFromSessionContext,
  createWorkspaceFolder,
  uploadDemoAsset,
  requestAssetUnderstanding,
  toggleSessionAssetPicker,
  promoteAssetScope,
  requestStoryboardRevision,
  reviewVideo,
  exportVideo,
  selectDeliveryItem,
  selectChiefChat,
  selectProject,
  selectSession,
  selectStoryboard,
  selectVideoPackageStage,
  setDeliveryViewMode,
  startProjectSession,
  toggleDeliveryMaximized,
  toggleProfileMenu,
  toggleProjectsDrawer,
  toggleWorkspacePanel,
  transferChiefChatToNewProject,
  transferChiefChatToSession,
} from "./state-model.mjs";
import {
  renderAssetCenterView,
  renderProjectAssetBrowser,
  renderAssetPreview,
  renderSessionAssetPicker,
  renderSessionContextChips,
} from "./asset-library-view.mjs";
import {
  captureWorklogTransientState,
  completeScheduledVideoGeneration,
  createTaskPreparationTimerRegistry,
  renderConversationWorklog,
  restoreWorklogTransientState,
} from "./conversation-worklog-view.mjs";

const productImage = "./assets/portable-blender-product.png";

let state = createInitialState();
let notice = "";
let transferDestination = "new-project";
let transferProjectId = "proj-blender";
let transferSessionId = "sess-blender-july";
const generationTimers = new Map();
const preparationTimers = createTaskPreparationTimerRegistry({
  setIntervalFn: window.setInterval.bind(window),
  clearIntervalFn: window.clearInterval.bind(window),
  totalSteps: 13,
  delay: 500,
});

const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name, size = 18) {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    upload: '<path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M4 15v5h16v-5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    folder: '<path d="M3 6h7l2 2h9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4m10 0h4M3 15h4m10 0h4"/>',
    bot: '<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/>',
    play: '<path d="m9 7 8 5-8 5z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    canvas: '<path d="M4 4h6v6H4zM14 14h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M10 7h4M7 10v4m10-4v4m-7 3h4"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5.5 15a8 8 0 1 0 .5-7"/>',
    send: '<path d="m3 11 18-8-8 18-2-8z"/><path d="m11 13 4-4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    maximize: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 15 15 9m-5 0h5v5"/>',
    restore: '<rect x="7" y="4" width="13" height="13" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h9"/>',
    projectIndex: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M5.5 8h.01M5.5 12h.01"/>',
    sort: '<path d="M4 7h12M4 12h9M4 17h6"/><path d="m17 15 3 3 3-3" transform="translate(-2 -1)"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.more}</svg>`;
}

function statusTone(status) {
  if (["失败", "不可用"].some((value) => status?.includes(value))) return "danger";
  if (["生成中", "当前", "待确认"].some((value) => status?.includes(value))) return "active";
  if (["通过", "已确认", "已导出", "done"].some((value) => status?.includes(value))) return "success";
  return "neutral";
}

function pill(text, tone = statusTone(text)) {
  return `<span class="pill ${tone}">${escapeHtml(text)}</span>`;
}

function findNode(shortTitle) {
  return getCurrentTaskProcessNodes(state).find((node) => node.shortTitle === shortTitle) ?? null;
}

function currentObjectLabel() {
  const video = getActiveVideo(state);
  if (video) return video.title;
  const node = state.processNodes[state.active.processNodeId];
  if (state.active.deliveryType !== "overview" && node) return node.title;
  return "会话交付总览";
}

function framePanelGlyph(position) {
  const inset = { left: 5, center: 10.5, right: 16 }[position];
  return `
    <svg class="frame-panel-glyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect class="frame-panel-outline" x="2.75" y="3.25" width="18.5" height="17.5" rx="2.6" stroke="currentColor"/>
      <line class="frame-panel-indicator" x1="${inset}" y1="6" x2="${inset}" y2="18" stroke="currentColor" stroke-linecap="round"/>
    </svg>
  `;
}

function panelButton(panel, label, position, collapsed) {
  return `
    <button class="panel-toggle ${collapsed ? "is-off" : "is-on"}" data-action="toggle-panel" data-panel="${panel}" aria-label="${label}" aria-pressed="${!collapsed}" title="${label}">
      ${framePanelGlyph(position)}
    </button>
  `;
}

function render() {
  if (state.ui.productScreen === "home" || state.ui.productScreen === "create") {
    app.innerHTML = `${renderProjectsHome(state.ui.productScreen === "create")}${renderNotice()}`;
    return;
  }

  if (state.ui.productScreen === "chief-chat") {
    app.innerHTML = `${renderChiefChatPage()}${renderNotice()}`;
    return;
  }

  if (state.ui.productScreen === "asset-center") {
    app.innerHTML = `${renderAssetCenterPage()}${renderNotice()}`;
    return;
  }

  renderWorkspace();
}

function currentAssetCenterModel() {
  const scope = state.active.assetCenterScope ?? "workspace";
  const workspaceAssets = getWorkspaceAssets(state);
  const projectReferences = getProjectLibraryAssets(state);
  const sessionAssets = getSessionContextAssets(state);
  const assets = scope === "workspace"
    ? workspaceAssets
    : scope === "project"
      ? projectReferences.map((reference) => reference.asset)
      : sessionAssets;
  const selectedAsset = state.workspaceAssets?.[state.active.assetId] ?? assets[0] ?? null;
  const selectedFolder = selectedAsset?.folderId ? state.workspaceFolders?.[selectedAsset.folderId] : null;
  return {
    scope,
    folders: scope === "workspace" ? getWorkspaceFolders(state) : [],
    assets,
    selectedAssetId: selectedAsset?.id ?? null,
    selectedAsset,
    sourceLabel: selectedAsset
      ? selectedAsset.storageScope === "workspace"
        ? `工作空间${selectedFolder ? ` / ${selectedFolder.name}` : ""}`
        : `项目内上传 / ${getActiveProject(state)?.name ?? "当前项目"}`
      : "",
    counts: { workspace: workspaceAssets.length, project: projectReferences.length, session: sessionAssets.length },
    inProject: projectReferences.some((reference) => reference.assetId === selectedAsset?.id),
    inSession: sessionAssets.some((asset) => asset.id === selectedAsset?.id),
  };
}

function renderAssetCenterPage() {
  const model = currentAssetCenterModel();
  return `
    <div class="chorify-shell asset-center-product-shell">
      <header class="topbar asset-center-topbar">
        <button class="topbar-logo home-logo-button" data-action="go-projects-home" aria-label="返回项目首页">C</button>
        <div class="home-brand"><strong>资产中心</strong><span>工作空间、项目与会话资产</span></div>
        <div class="global-search">${icon("search", 16)}<span>搜索文件夹与资产</span><kbd>Ctrl K</kbd></div>
        <div class="topbar-controls"><button class="ghost-button" data-action="go-projects-home">返回项目</button></div>
      </header>
      <div class="app-body">
        ${renderGlobalRail("assets")}
        ${renderAssetCenterView(model)}
      </div>
      ${renderSessionAssetPickerDialog()}
    </div>`;
}

function renderNotice() {
  return notice ? `<div class="toast" role="status" aria-live="polite">${icon("check", 16)}${escapeHtml(notice)}</div>` : "";
}

const profileDraftInputIds = ["chief-input", "blank-ai-input", "ai-input"];

function captureProfileMenuRenderState() {
  return {
    drafts: profileDraftInputIds
      .map((id) => {
        const input = document.getElementById(id);
        if (!input) return null;
        return {
          id,
          value: input.value,
          selectionStart: input.selectionStart,
          selectionEnd: input.selectionEnd,
          focused: document.activeElement === input,
        };
      })
      .filter(Boolean),
    profileButtonFocused: document.activeElement?.matches('[data-action="toggle-profile-menu"]') ?? false,
  };
}

function restoreProfileMenuRenderState(snapshot) {
  for (const draft of snapshot.drafts) {
    const input = document.getElementById(draft.id);
    if (!input) continue;
    input.value = draft.value;
    if (draft.focused) input.focus();
    if (Number.isInteger(draft.selectionStart) && Number.isInteger(draft.selectionEnd)) {
      input.setSelectionRange(draft.selectionStart, draft.selectionEnd);
    }
  }
}

function renderProfileMenuChange(focusTarget = null) {
  const snapshot = captureProfileMenuRenderState();
  render();
  restoreProfileMenuRenderState(snapshot);

  if (focusTarget === "first-menu-item") {
    document.querySelector('.profile-menu [role="menuitem"]')?.focus();
  } else if (focusTarget === "profile-button" || snapshot.profileButtonFocused) {
    document.querySelector('[data-action="toggle-profile-menu"]')?.focus();
  }
}

function chiefMessages(chat) {
  return (chat?.messageIds ?? []).map((id) => state.chiefMessages[id]).filter(Boolean);
}

function chiefContextPreview(chat) {
  const messages = chiefMessages(chat);
  const lastUser = [...messages].reverse().find((message) => message.role === "user")?.text;
  const lastAdvice = [...messages].reverse().find((message) => message.role === "assistant")?.text;
  return {
    summary: lastAdvice || "围绕新品营销目标、受众和内容方向形成一份可执行策略摘要。",
    goal: lastUser || "明确新品营销切入点，并形成首批视频测试方案。",
    audience: "美国大学生、通勤白领与轻健身人群",
    platform: "TikTok · 9:16 竖屏",
    directions: ["宿舍早餐", "通勤补能", "健身后场景"],
  };
}

function renderChiefChatPage() {
  const chats = getChiefChats(state);
  const chat = getActiveChiefChat(state);
  const messages = chiefMessages(chat);
  const preview = chiefContextPreview(chat);
  return `
    <div class="chorify-shell chief-shell">
      <header class="topbar chief-topbar">
        <button class="topbar-logo home-logo-button" data-action="go-projects-home" aria-label="返回项目首页">C</button>
        <div class="home-brand"><strong>营销首席官</strong><span>先讨论策略，是否进入制作由你决定</span></div>
        <div class="global-search">${icon("search", 16)}<span>搜索首席官会话</span><kbd>Ctrl K</kbd></div>
        <div class="topbar-controls"><button class="ghost-button" data-action="go-projects-home">查看项目</button><button class="primary-button" data-action="new-chief-chat">${icon("plus", 16)} 新讨论</button></div>
      </header>
      <div class="app-body">
        ${renderGlobalRail("chief")}
        <main class="chief-workspace">
          <aside class="chief-history panel-surface">
            <div class="chief-history-head"><div><span>MARKETING CHIEF</span><strong>策略会话</strong></div><button class="icon-only" data-action="new-chief-chat" aria-label="新建讨论">${icon("plus", 17)}</button></div>
            <div class="chief-history-list">
              ${chats.map((item) => `<button class="chief-history-row ${item.id === chat?.id ? "selected" : ""}" data-action="select-chief-chat" data-chat-id="${item.id}"><span>${icon("message", 16)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${item.messageIds.length ? `${item.messageIds.length} 条消息` : "新会话"}</small></span>${item.readyForProject ? `<i title="可转为项目">✦</i>` : ""}</button>`).join("")}
            </div>
            <div class="chief-history-note"><strong>可以只讨论，不制作</strong><p>首席官会话不会自动写入项目。只有你主动选择“带入视频项目”时，才会生成一份不可变的浓缩上下文。</p></div>
          </aside>
          <section class="chief-thread">
            <div class="chief-thread-head"><div><span>AI MARKETING CHIEF</span><h1>${escapeHtml(chat?.title ?? "新营销讨论")}</h1>${chat?.reference ? `<small class="chief-reference">已参考：${escapeHtml(chat.reference.label ?? "已有项目上下文")}</small>` : ""}</div><button class="ghost-button chief-transfer-trigger" data-action="open-chief-transfer" ${chat ? "" : "disabled"}>${icon("arrow", 15)} 带入视频项目</button></div>
            <div class="chief-message-list">
              ${messages.length ? messages.map((message) => renderChiefMessage(message)).join("") : `<div class="chief-empty"><span class="chief-orb">AI</span><h2>今天想先讨论什么？</h2><p>可以聊品牌策略、竞品判断、营销灵感或内容结构。讨论结束后，你可以离开，也可以选择带入新项目或已有项目。</p><div><button data-action="chief-prompt" data-prompt="帮我判断这个新品最值得测试的三个营销方向。">判断营销方向</button><button data-action="chief-prompt" data-prompt="先分析目标受众，不进入视频制作。">分析目标受众</button><button data-action="chief-prompt" data-prompt="帮我梳理竞品表达，但先只讨论思路。">梳理竞品表达</button></div></div>`}
            </div>
            <div class="chief-composer">
              <div class="chief-composer-label"><span>${icon("bot", 14)} 营销首席官</span><small>不会自动创建项目或消耗生成额度</small></div>
              <textarea id="chief-input" rows="3" placeholder="描述品牌、商品、目标或一个刚想到的营销灵感…"></textarea>
              <div><span>＋ 附件　@ 引用已有项目</span><button class="send-button" data-action="send-chief">${icon("send", 17)}</button></div>
            </div>
          </section>
          <aside class="chief-insight panel-surface">
            <div class="chief-insight-head"><span>讨论脉络</span>${pill(chat?.readyForProject ? "已有可执行方向" : "开放讨论", chat?.readyForProject ? "success" : "neutral")}</div>
            <section><small>当前目标</small><strong>${escapeHtml(preview.goal)}</strong></section>
            <section><small>建议测试方向</small><div class="direction-chips">${preview.directions.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
            <section><small>建议受众与平台</small><strong>${escapeHtml(preview.audience)}</strong><p>${escapeHtml(preview.platform)}</p></section>
            <div class="chief-insight-foot"><p>这只是讨论摘要。除非主动带入，否则不会改变任何项目。</p><button class="primary-button" data-action="open-chief-transfer">带着上下文开始制作</button></div>
          </aside>
        </main>
      </div>
      ${state.ui.chiefTransferOpen ? renderChiefTransferDialog(chat, preview) : ""}
    </div>
  `;
}

function renderChiefMessage(message) {
  if (message.role === "user") return `<article class="chief-message user"><div>${escapeHtml(message.text)}</div></article>`;
  return `<article class="chief-message assistant"><span class="mini-ai">AI</span><div><p>${escapeHtml(message.text)}</p>${message.kind === "advice" || message.kind === "direction" ? `<small>这条建议可以继续讨论，也可以稍后主动带入视频项目。</small>` : ""}</div></article>`;
}

function renderChiefTransferDialog(chat, preview) {
  const projects = Object.values(state.projects);
  const project = state.projects[transferProjectId] ?? projects[0];
  const sessions = project ? getProjectSessions(state, project.id) : [];
  if (project && !sessions.some((item) => item.id === transferSessionId)) transferSessionId = sessions[0]?.id ?? "";
  return `
    <div class="create-project-backdrop chief-transfer-backdrop" data-action="close-chief-transfer" data-backdrop="true">
      <section class="chief-transfer-dialog" role="dialog" aria-modal="true" aria-labelledby="chief-transfer-title">
        <div class="create-project-head"><div><span>CONTEXT HANDOFF</span><h2 id="chief-transfer-title">把讨论带入视频项目</h2></div><button class="icon-only" data-action="close-chief-transfer" aria-label="关闭">${icon("close", 18)}</button></div>
        <div class="transfer-body">
          <article class="context-snapshot-preview"><div><span class="snapshot-lock">不可变快照</span><small>来源：${escapeHtml(chat?.title ?? "营销首席官会话")}</small></div><h3>${escapeHtml(preview.summary)}</h3><dl><div><dt>营销目标</dt><dd>${escapeHtml(preview.goal)}</dd></div><div><dt>受众</dt><dd>${escapeHtml(preview.audience)}</dd></div><div><dt>平台</dt><dd>${escapeHtml(preview.platform)}</dd></div></dl><div class="direction-chips">${preview.directions.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div><p>带入后，项目只读取此刻的浓缩信息；之后继续修改原会话，不会悄悄改变项目上下文。</p></article>
          <div class="transfer-destination"><span>选择去向</span><button class="destination-option ${transferDestination === "new-project" ? "selected" : ""}" data-action="set-transfer-destination" data-destination="new-project"><b>01</b><span><strong>新建视频项目</strong><small>创建项目、首条会话与五条故事画板</small></span></button><button class="destination-option ${transferDestination === "new-session" ? "selected" : ""}" data-action="set-transfer-destination" data-destination="new-session"><b>02</b><span><strong>加入已有项目，建立新会话</strong><small>保留项目资产，创建新的营销任务</small></span></button><button class="destination-option ${transferDestination === "existing-session" ? "selected" : ""}" data-action="set-transfer-destination" data-destination="existing-session"><b>03</b><span><strong>导入已有项目会话</strong><small>把快照附加到当前会话，不覆盖原内容</small></span></button>
            ${transferDestination !== "new-project" ? `<label class="transfer-select"><span>项目</span><select id="transfer-project-select">${projects.map((item) => `<option value="${item.id}" ${item.id === project?.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>` : ""}
            ${transferDestination === "existing-session" ? `<label class="transfer-select"><span>会话</span><select id="transfer-session-select">${sessions.map((item) => `<option value="${item.id}" ${item.id === transferSessionId ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label>` : ""}
          </div>
        </div>
        <div class="transfer-actions"><button class="ghost-button" data-action="close-chief-transfer">继续只讨论</button><button class="primary-button" data-action="confirm-chief-transfer">${transferDestination === "new-project" ? "新建项目并带入" : transferDestination === "new-session" ? "建立新会话并带入" : "导入所选会话"}</button></div>
      </section>
    </div>
  `;
}

function renderWorkspace() {
  const project = getActiveProject(state);
  const session = getActiveSession(state);
  const task = getActiveTask(state);
  const isBlankProject = project.kind === "blank" || !session;
  const assetMode = state.active.workspaceMode === "project-assets";
  const layoutClass = [
    state.ui.projectNavCollapsed ? "project-closed" : "",
    state.ui.deliveryBrowserCollapsed ? "delivery-closed" : "",
    state.ui.centralWorkspaceCollapsed ? "workspace-closed" : "",
    state.ui.aiPanelCollapsed ? "ai-closed" : "",
    state.ui.deliveryMaximized ? "delivery-maximized" : "",
    state.active.workspaceMode === "canvas" ? "canvas-open" : "",
    assetMode ? "asset-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  app.innerHTML = `
    <div class="chorify-shell">
      <header class="topbar">
        <div class="topbar-logo">C</div>
        <div class="breadcrumbs">
          <button class="all-projects-trigger ${state.ui.projectsDrawerOpen ? "active" : ""}" data-action="toggle-projects-drawer" aria-expanded="${state.ui.projectsDrawerOpen}">${icon("projectIndex", 17)}<span>所有项目</span></button><span>/</span><button>${escapeHtml(project.name)}</button><span>/</span><strong>${escapeHtml(session?.title ?? "尚未建立营销会话")}</strong>
        </div>
        <div class="global-search">${icon("search", 16)}<span>搜索项目与资产</span><kbd>Ctrl K</kbd></div>
        <div class="topbar-controls">
          ${panelButton("project", "切换项目导航", "left", state.ui.projectNavCollapsed)}
          ${panelButton("workspace", "显示或隐藏中央工作区", "center", state.ui.centralWorkspaceCollapsed)}
          ${panelButton("ai", "切换 AI 对话", "right", state.ui.aiPanelCollapsed)}
          <i class="control-divider"></i>
          <button class="icon-only" data-action="reset-demo" aria-label="重置 Demo" title="重置 Demo">${icon("reset", 17)}</button>
        </div>
      </header>

      ${state.ui.projectsDrawerOpen ? renderProjectsDrawer(project) : ""}

      <div class="app-body">
        ${renderGlobalRail("workspace")}
        <main class="workbench ${layoutClass}">
          ${state.ui.projectNavCollapsed ? "" : isBlankProject ? renderBlankProjectNavigation(project) : renderProjectNavigation(project, session)}
          ${state.ui.deliveryBrowserCollapsed ? "" : assetMode ? renderProjectAssetsBrowserPanel() : isBlankProject ? renderBlankDeliveryBrowser() : renderDeliveryBrowser(task)}
          ${state.ui.centralWorkspaceCollapsed ? "" : assetMode ? renderProjectAssetCentral(project) : isBlankProject ? renderBlankCentralWorkspace(project) : renderCentralWorkspace(project, session, task)}
          ${state.ui.aiPanelCollapsed ? "" : isBlankProject ? renderBlankAiPanel(project) : renderAiPanel(project, session, task)}
        </main>
      </div>
    </div>
    ${renderSessionAssetPickerDialog()}
    ${renderNotice()}
  `;
}

function renderProjectAssetsBrowserPanel() {
  return `<aside class="delivery-panel panel-surface project-assets-delivery">${renderProjectAssetBrowser({ assets: getProjectLibraryAssets(state), selectedAssetId: state.active.assetId })}</aside>`;
}

function renderProjectAssetCentral(project) {
  const asset = state.workspaceAssets?.[state.active.assetId] ?? null;
  const reference = getProjectAssetReferences(state, project.id).find((item) => item.assetId === asset?.id);
  const sessionAssets = getSessionContextAssets(state);
  return `
    <section class="central-workspace project-assets">
      <div class="central-toolbar"><div><span class="eyebrow">PROJECT ASSET MODE</span><strong>${escapeHtml(asset?.name ?? "项目资产")}</strong></div><div class="central-actions"><button class="ghost-button" data-action="select-delivery" data-item-type="overview">返回生产工作台</button><button class="icon-only small-icon">${icon("more", 18)}</button></div></div>
      <div class="central-content asset-preview-content">${renderAssetPreview({ asset, sourceLabel: reference?.origin === "workspace" ? `工作空间引用 · 固定 ${reference.version}` : "项目内上传", inProject: Boolean(reference), inSession: sessionAssets.some((item) => item.id === asset?.id) })}</div>
    </section>`;
}

function renderProjectsHome(showCreateDialog = false) {
  const projects = Object.values(state.projects);
  return `
    <div class="chorify-shell product-home-shell">
      <header class="topbar home-topbar">
        <button class="topbar-logo home-logo-button" data-action="go-projects-home" aria-label="返回项目首页">C</button>
        <div class="home-brand"><strong>Chorify</strong><span>AI 营销工作空间</span></div>
        <div class="global-search">${icon("search", 16)}<span>搜索项目与资产</span><kbd>Ctrl K</kbd></div>
        <div class="topbar-controls home-actions">
          <button class="ghost-button">${icon("message", 16)} 邀请成员</button>
          <button class="primary-button" data-action="open-create-project">${icon("plus", 16)} 新建项目</button>
        </div>
      </header>
      <div class="app-body">
        ${renderGlobalRail("home")}
        <main class="projects-home">
          <section class="projects-home-heading">
            <div><span>DIANWEN'S WORKSPACE</span><h1>营销项目</h1><p>从项目进入 AI 会话、营销交付物与视频审查工作区。</p></div>
            <div class="home-summary"><strong>${projects.length}</strong><span>全部项目</span><strong>${projects.filter((project) => project.kind === "blank").length}</strong><span>待启动</span></div>
          </section>
          <section class="projects-toolbar">
            <div class="view-switch"><button class="active">${icon("grid", 15)}</button><button>☷</button></div>
            <button class="filter-button">全部项目</button>
            <button class="filter-button">最近更新</button>
            <span></span>
            <button class="filter-button">按更新时间排序 ${icon("sort", 15)}</button>
          </section>
          <section class="project-card-grid" aria-label="项目列表">
            ${projects.map((project, index) => renderHomeProjectCard(project, index)).join("")}
            <button class="project-card create-project-card" data-action="open-create-project">
              <span class="create-card-plus">${icon("plus", 28)}</span>
              <strong>新建空白项目</strong>
              <small>建立一个新的 AI 营销工作空间</small>
            </button>
          </section>
        </main>
      </div>
      ${showCreateDialog ? renderCreateProjectDialog() : ""}
    </div>
  `;
}

function renderHomeProjectCard(project, index) {
  const sessionCount = project.sessionIds.length;
  const isBlank = project.kind === "blank";
  const updatedAt = project.updatedAt ?? ["2 小时前", "昨天", "3 天前"][index % 3];
  return `
    <button class="project-card" data-action="select-project" data-project-id="${project.id}">
      <span class="project-card-cover tone-${(index % 3) + 1} ${isBlank ? "blank" : ""}">
        ${index === 0 && !isBlank ? `<img src="${productImage}" alt="${escapeHtml(project.name)}" />` : `<i>${escapeHtml(project.name.slice(0, 1))}</i>`}
        <em>${isBlank ? "空白项目" : "AI 营销项目"}</em>
      </span>
      <span class="project-card-body"><strong>${escapeHtml(project.name)}</strong><small>${isBlank ? "等待建立第一条营销会话" : `${sessionCount} 个 AI 会话 · 已有营销交付物`}</small></span>
      <span class="project-card-footer"><small>更新于 ${escapeHtml(updatedAt)}</small><i>${isBlank ? "待启动" : "进行中"}</i></span>
    </button>
  `;
}

function renderCreateProjectDialog() {
  const suggestedAssets = getWorkspaceAssets(state).slice(0, 4);
  return `
    <div class="create-project-backdrop" data-action="cancel-create-project" data-backdrop="true">
      <section class="create-project-dialog" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
        <div class="create-project-head"><div><span>NEW MARKETING PROJECT</span><h2 id="create-project-title">新建空白项目</h2></div><button class="icon-only" data-action="cancel-create-project" aria-label="关闭">${icon("close", 18)}</button></div>
        <p>先建立项目容器。营销目标、商品素材和 AI 会话将在下一阶段进入项目后创建。</p>
        <form id="create-project-form">
          <label><span>项目名称</span><input id="project-name" name="name" required maxlength="32" autocomplete="off" placeholder="例如：夏日气泡水新品上市" /></label>
          <label><span>项目描述 <small>可选</small></span><textarea id="project-description" name="description" rows="3" maxlength="100" placeholder="简单说明这次营销项目的背景"></textarea></label>
          <fieldset class="create-project-assets"><legend><span>从工作空间添加资产 <small>可选</small></span><em>创建后以引用方式进入项目，不复制文件</em></legend><div>${suggestedAssets.map((asset) => `<label><input type="checkbox" name="workspaceAssetIds" value="${escapeHtml(asset.id)}"><span class="create-asset-mark">${escapeHtml(asset.previewLabel)}</span><span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(asset.version)} · ${asset.aiStatus === "understood" ? "AI 已理解" : "尚未让 AI 理解"}</small></span></label>`).join("")}</div></fieldset>
          <div class="create-project-preview"><span class="preview-cover">C</span><div><strong>空白 AI 营销项目</strong><small>创建后进入四栏工作台，但不会自动生成会话或交付物。</small></div></div>
          <div class="create-project-actions"><button type="button" class="ghost-button" data-action="cancel-create-project">取消</button><button type="submit" class="primary-button">创建并进入项目</button></div>
        </form>
      </section>
    </div>
  `;
}

function renderBlankProjectNavigation(project) {
  const projectAssetCount = getProjectAssetReferences(state, project.id).length;
  return `
    <aside class="project-panel panel-surface">
      <div class="project-identity"><div class="project-cover blank-cover">${escapeHtml(project.name.slice(0, 1))}</div><div><strong>${escapeHtml(project.name)}</strong><small>空白项目 · 刚刚创建</small></div><button class="icon-only small-icon">${icon("more", 17)}</button></div>
      <div class="tree-section"><div class="tree-heading"><span>${icon("folder", 17)} 项目空间</span><button>${icon("plus", 15)}</button></div><button class="tree-row ${state.active.workspaceMode === "project-assets" ? "" : "selected"}" data-action="select-blank-overview"><span>${icon("grid", 16)} 项目总览</span><small>⌘1</small></button><button class="tree-row ${state.active.workspaceMode === "project-assets" ? "selected" : ""}" data-action="open-project-assets"><span>${icon("folder", 16)} 项目资产</span><small>${projectAssetCount}</small></button></div>
      <div class="tree-section blank-session-section"><div class="tree-label">AI 会话</div><div class="tree-empty-copy"><span>${icon("message", 18)}</span><strong>还没有营销会话</strong><small>描述目标或导入素材后，会原子建立会话、任务与五条故事画板。</small></div><button class="new-session" data-action="start-project-session" data-prompt="为这个项目建立首批五条营销视频，并先理解商品与目标。">${icon("plus", 15)} 新建营销会话</button></div>
      <div class="tree-section shared-assets"><div class="tree-label">项目结果</div><button class="tree-row"><span>${icon("film", 16)} 项目成品库</span><small>0</small></button></div>
    </aside>
  `;
}

function renderBlankDeliveryBrowser() {
  return `
    <aside class="delivery-panel panel-surface blank-delivery-panel">
      <div class="delivery-toolbar"><div class="view-switch"><button class="active">${icon("grid", 15)}</button><button>☷</button></div><button class="toolbar-count">✦ 0</button><button class="toolbar-count">☰ 0</button><span></span><button class="icon-only small-icon">${icon("search", 16)}</button><button class="icon-only small-icon">${icon("plus", 17)}</button></div>
      <div class="blank-delivery-state"><span class="blank-delivery-icon">${icon("folder", 30)}</span><strong>还没有交付物</strong><p>建立第一条 AI 营销会话后，商品理解、Brief、脚本、故事画板和视频会依次出现在这里。</p><small>交付物栏会始终保留，成为当前工作的选择锚点。</small></div>
    </aside>
  `;
}

function renderBlankCentralWorkspace(project) {
  return `
    <section class="central-workspace overview empty-project-workspace">
      <div class="central-toolbar"><div><span class="eyebrow">项目已创建</span><strong>${escapeHtml(project.name)}</strong></div><button class="icon-only small-icon">${icon("more", 18)}</button></div>
      <div class="empty-project-content"><span class="empty-project-mark">${icon("check", 26)}</span><span class="hero-kicker">READY FOR YOUR FIRST MARKETING TASK</span><h1>项目空间已经准备好</h1><p>${escapeHtml(project.description || "你可以描述营销目标、上传商品资料或粘贴商品链接，让 Chorify 开始理解任务。")}</p><div class="starter-card-grid"><button data-action="start-project-session" data-prompt="为便携式榨汁杯规划五条 TikTok 营销视频，面向美国大学生与通勤人群。"><span>01</span><strong>描述营销目标</strong><small>告诉 AI 想推广什么、面向谁，以及期望交付什么。</small></button><button data-action="start-project-session" data-prompt="读取我上传的商品链接、品牌规范和参考视频，先完成素材理解。"><span>02</span><strong>上传商品与链接</strong><small>演示加入商品链接、品牌指南、参考视频与反馈截图。</small></button><button data-action="start-project-session" data-prompt="用新品上市模板建立首批五条短视频任务。"><span>03</span><strong>从营销模板开始</strong><small>以新品上市结构快速建立会话与五条独立故事画板。</small></button></div><div class="phase-boundary">第一步会同时建立会话、十节点任务与五条故事画板，并自动打开中央工作区展示商品理解进度。</div></div>
    </section>
  `;
}

function renderBlankAiPanel(project) {
  return `
    <aside class="ai-panel panel-surface blank-ai-panel"><div class="ai-head"><div class="ai-avatar">AI</div><div><strong>Chorify 营销官</strong><small><i></i> 已连接当前项目</small></div><button class="icon-only small-icon">${icon("more", 18)}</button></div><div class="ai-context"><span>当前上下文</span><div class="context-path"><b>${escapeHtml(project.name)}</b><i>›</i><strong>尚未建立营销会话</strong></div></div><div class="ai-messages blank-ai-message"><article class="chat-message assistant"><span class="mini-ai">AI</span><div><p>告诉我这次想推广什么、面向谁、在哪个平台投放。你也可以直接说“读取演示素材”，我会先把上传内容放进本会话，再判断是否适合晋升为项目或品牌资产。</p></div></article><div class="ai-waiting-card"><span>${icon("message", 18)}</span><strong>从一个真实目标开始</strong><small>发送后会原子建立第一条营销会话、十节点流程和五条独立故事画板。</small></div></div><div class="ai-composer"><div class="composer-context">${icon("bot", 14)} 当前项目：${escapeHtml(project.name)}</div><textarea id="blank-ai-input" rows="3" placeholder="例如：为便携榨汁杯做 5 条 TikTok 视频，先理解商品与受众…"></textarea><div class="composer-actions"><div><button title="添加素材">${icon("plus", 17)}</button><button title="粘贴链接">⌘</button></div><button class="send-button" data-action="send-blank-ai">${icon("send", 17)}</button></div></div></aside>
  `;
}

function renderGlobalRail(active = "") {
  return `
    <nav class="global-rail" aria-label="全局导航">
      <div class="rail-top">
        <button class="rail-button ${active === "home" ? "active" : ""}" data-action="go-projects-home" title="项目主页">${icon("home")}</button>
        <button class="rail-button chief-rail-button ${active === "chief" ? "active" : ""}" data-action="open-chief-chat" title="营销首席官">${icon("bot")}<span>首席官</span></button>
        <button class="rail-button ${active === "assets" ? "active" : ""}" data-action="open-asset-center" title="资产中心">${icon("folder")}</button>
        <button class="rail-button" title="搜索">${icon("search")}</button>
        <button class="rail-button" title="通知">${icon("bell")}</button>
      </div>
      <div class="rail-bottom">
        <button class="rail-button" title="帮助">?</button>
        <button class="rail-button" title="灵感">✦</button>
        <div class="profile-menu-shell">
          <button class="profile-button" data-action="toggle-profile-menu" aria-haspopup="menu" aria-expanded="${state.ui.profileMenuOpen}" aria-label="${state.ui.profileMenuOpen ? "关闭 Dianwen Wang 用户菜单" : "打开 Dianwen Wang 用户菜单"}">DW</button>
          ${state.ui.profileMenuOpen ? `
            <div class="profile-menu">
              <div class="profile-menu-identity"><span>DW</span><strong>Dianwen Wang</strong></div>
              <div class="profile-menu-items" role="menu" aria-label="用户菜单">
                <button type="button" class="profile-menu-item profile-menu-usage" data-action="profile-menu-placeholder" role="menuitem">团队试用版 · 8,420 AI 积分</button>
                <div class="profile-menu-divider" role="separator"></div>
                <button type="button" class="profile-menu-item" data-action="profile-menu-placeholder" role="menuitem">设置</button>
                <button type="button" class="profile-menu-item" data-action="profile-menu-placeholder" role="menuitem">帮助与反馈</button>
                <div class="profile-menu-divider" role="separator"></div>
                <button type="button" class="profile-menu-item profile-menu-danger" data-action="profile-menu-logout" role="menuitem">退出登录</button>
              </div>
            </div>
          ` : ""}
        </div>
      </div>
    </nav>
  `;
}

function renderProjectsDrawer(activeProject) {
  const projects = Object.values(state.projects);
  return `
    <aside class="projects-drawer" aria-label="所有项目">
      <div class="projects-drawer-head">
        <span class="drawer-index-icon">${icon("projectIndex", 18)}</span>
        <strong>所有项目</strong>
        <span class="drawer-slash">/</span>
        <span class="drawer-current">${escapeHtml(activeProject.name)}</span>
        <button class="icon-only small-icon drawer-more" aria-label="项目菜单">${icon("more", 17)}</button>
        <button class="icon-only small-icon" data-action="close-projects-drawer" aria-label="关闭所有项目" title="关闭">${icon("close", 17)}</button>
      </div>
      <div class="projects-drawer-tools">
        <label class="project-search">${icon("search", 18)}<input type="search" placeholder="搜索项目" aria-label="搜索项目" /></label>
        <button class="icon-only" aria-label="项目排序" title="项目排序">${icon("sort", 18)}</button>
      </div>
      <div class="projects-list">
        <span class="projects-list-label">所有项目</span>
        ${projects
          .map(
            (project, index) => `
              <button class="project-list-row ${project.id === activeProject.id ? "selected" : ""}" data-action="select-project" data-project-id="${project.id}">
                <span class="project-list-cover tone-${(index % 3) + 1}">${index === 0 ? icon("play", 14) : project.name.slice(0, 1)}</span>
                <span>${escapeHtml(project.name)}</span>
                ${project.id === activeProject.id ? `<i>${icon("check", 14)}</i>` : ""}
              </button>
            `,
          )
          .join("")}
      </div>
    </aside>
  `;
}

function renderProjectNavigation(project, session) {
  const sessions = getProjectSessions(state, project.id);
  const projectCount = getProjectAssetReferences(state, project.id).length;
  const sessionCount = getSessionContextAssets(state, session.id).length;
  const assetMode = state.active.workspaceMode === "project-assets";
  return `
    <aside class="project-panel panel-surface">
      <div class="project-identity">
        <div class="project-cover">${icon("play", 20)}</div>
        <div><strong>${escapeHtml(project.name)}</strong><small>3 位成员 · AI 营销项目</small></div>
        <button class="icon-only small-icon">${icon("more", 17)}</button>
      </div>

      <div class="tree-section">
        <div class="tree-heading"><span>${icon("folder", 17)} 项目空间</span><button>${icon("plus", 15)}</button></div>
        <button class="tree-row ${assetMode ? "" : "selected"}" data-action="select-delivery" data-item-type="overview">
          <span>${icon("grid", 16)} 项目总览</span><small>⌘1</small>
        </button>
      </div>

      <div class="tree-section">
        <div class="tree-label">AI 会话</div>
        ${sessions
          .map((item) => {
            const active = item.id === session.id;
            const itemTask = state.tasks[item.taskIds[0]];
            return `
              <button class="session-row ${active ? "selected" : ""}" data-action="select-session" data-session-id="${item.id}">
                <span class="session-icon">${icon("message", 15)}</span>
                <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(itemTask.stage)}</small></span>
                <i class="status-dot ${statusTone(itemTask.status)}"></i>
              </button>
            `;
          })
          .join("")}
        <button class="new-session">${icon("plus", 15)} 新建营销会话</button>
      </div>

      <div class="tree-section shared-assets">
        <div class="tree-label">项目共同资产</div>
        <button class="tree-row ${assetMode ? "selected" : ""}" data-action="open-project-assets"><span>${icon("folder", 16)} 项目资产</span><small>${projectCount}</small></button>
        <button class="tree-row" data-action="open-session-asset-picker"><span>${icon("message", 16)} 本会话素材</span><small>${sessionCount}</small></button>
        <button class="tree-row"><span>${icon("film", 16)} 项目成品库</span><small>${project.assetIds?.artifacts?.length ?? 0}</small></button>
      </div>
    </aside>
  `;
}

function renderDeliveryBrowser(task) {
  const chains = getTaskVideoProductionChains(state, task.id);
  const viewMode = state.ui.deliveryViewMode ?? "grid";
  return `
    <aside class="delivery-panel panel-surface">
      <div class="delivery-toolbar">
        <div class="view-switch" role="group" aria-label="交付物显示方式">
          <button class="${viewMode === "grid" ? "active" : ""}" data-action="set-delivery-view" data-view="grid" aria-pressed="${viewMode === "grid"}" title="卡片视图">${icon("grid", 15)}</button>
          <button class="${viewMode === "list" ? "active" : ""}" data-action="set-delivery-view" data-view="list" aria-pressed="${viewMode === "list"}" title="列表视图">☷</button>
        </div>
        <button class="toolbar-count" disabled>✦ ${chains.length}</button>
        <button class="toolbar-count" disabled>☰ 1</button>
        <span></span>
        <button class="icon-only small-icon">${icon("search", 16)}</button>
        <button class="icon-only small-icon delivery-maximize" data-action="toggle-delivery-maximized" aria-label="${state.ui.deliveryMaximized ? "还原交付物视图" : "放大交付物视图"}" title="${state.ui.deliveryMaximized ? "还原交付物视图" : "放大交付物视图"}">${icon(state.ui.deliveryMaximized ? "restore" : "maximize", 17)}</button>
      </div>

      <div class="delivery-scroll">
        <div class="browser-group">
          <div class="browser-group-title"><span>⌄</span><strong>本会话交付</strong><small>总览</small></div>
          <div class="document-grid">
            ${renderDocumentCard("overview", null, "营销任务总览", "共同产物 · 5 条视频包 · 当前待办", "▦")}
          </div>
        </div>

        <div class="browser-group delivery-video-browser">
          <div class="browser-group-title"><span>⌄</span><strong>视频生产包</strong><small>${chains.length} 条</small></div>
          <div class="${viewMode === "list" ? "video-package-list" : "video-card-grid"}">
            ${chains.map(viewMode === "list" ? renderVideoListRow : renderVideoCard).join("")}
          </div>
        </div>
      </div>
    </aside>
  `;
}

function renderVideoListRow(chain) {
  const { video } = chain;
  const selected = state.active.videoId === video.id;
  const packageView = getVideoPackageViewModel(state, video.id);
  const stageLabels = { script: "脚本", shots: "分镜", storyboard: "画板", video: "视频" };
  return `
    <button class="video-package-row ${selected ? "selected" : ""}" data-action="select-video" data-video-id="${video.id}">
      <span class="video-list-index">${String(chain.index).padStart(2, "0")}</span>
      <span class="video-list-identity"><strong>${escapeHtml(video.title)}</strong><small>${escapeHtml(video.version ?? "草稿")} · ${escapeHtml(video.duration ?? "--")}</small></span>
      <span class="video-list-stages">
        ${Object.entries(packageView?.stages ?? {}).map(([stage, semantic]) => `<i class="stage-dot ${semantic}" title="${stageLabels[stage]}：${semantic}">${stageLabels[stage]}</i>`).join("")}
      </span>
      ${pill(chain.status, productionStatusTone(chain.status))}
    </button>
  `;
}

function storyboardStatusLabel(status) {
  return ({ pending_review: "待确认", revision_requested: "待复核", approved: "已确认", generating: "生成中", generated: "已生成" })[status] ?? status;
}

function renderDocumentCard(type, id, title, summary, mark) {
  const selected = state.active.deliveryType === type;
  return `
    <button class="document-card ${selected ? "selected" : ""}" data-action="select-delivery" data-item-type="${type}" ${id ? `data-item-id="${id}"` : ""}>
      <span class="document-mark">${mark}</span>
      <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(summary)}</small></span>
      ${pill(type === "overview" ? "当前" : "已生成", type === "overview" ? "active" : "neutral")}
    </button>
  `;
}

function productionStatusTone(status) {
  if (status === "已生成") return "success";
  if (["生成中", "待确认", "待生成"].includes(status)) return "active";
  return "neutral";
}

function renderVideoCard(chain) {
  const { video } = chain;
  const selected = state.active.videoId === video.id;
  const generated = chain.status === "已生成";
  return `
    <button class="video-card delivery-video-slot ${selected ? "selected" : ""}" data-action="select-video" data-video-id="${video.id}">
      <div class="video-card-thumb scene-${((chain.index - 1) % 5) + 1} ${generated ? "is-generated" : "is-placeholder"}">
        ${generated ? `<img src="${productImage}" alt="${escapeHtml(video.title)}" />` : `<span class="video-placeholder-icon">${icon("film", 24)}</span>`}
        <span class="video-slot-index">${String(chain.index).padStart(2, "0")}</span>
        <span class="select-check">${selected ? icon("check", 13) : ""}</span>
        <span class="duration">${escapeHtml(video.duration ?? "--")}</span>
      </div>
      <span class="video-card-info">
        <strong>${escapeHtml(video.title)}</strong>
        <small>视频 ${String(chain.index).padStart(2, "0")} · ${escapeHtml(chain.direction)}</small>
        <small class="video-card-version">${escapeHtml(video.version ?? "v1")}</small>
      </span>
      <span class="video-card-status">${pill(chain.status, productionStatusTone(chain.status))}</span>
    </button>
  `;
}

function renderCentralWorkspace(project, session, task) {
  const activeVideo = getActiveVideo(state);
  const activeChain = activeVideo ? getTaskVideoProductionChains(state, task.id).find((chain) => chain.video.id === activeVideo.id) : null;
  const viewerReady = activeChain ? activeChain.status === "已生成" : Boolean(activeVideo?.artifactId);
  return `
    <section class="central-workspace ${state.active.workspaceMode}">
      <div class="central-toolbar">
        <div>
          <span class="eyebrow">${escapeHtml(session.title)}</span>
          <strong>${escapeHtml(workspaceTitle(task))}</strong>
        </div>
        <div class="central-actions">
          ${state.active.workspaceMode === "video-package" && state.active.videoStage === "video" && viewerReady ? `<button class="ghost-button" data-action="enter-canvas" data-video-id="${state.active.videoId}">${icon("canvas", 16)} 深度画布</button>` : ""}
          ${state.active.workspaceMode === "canvas" ? `<button class="ghost-button" data-action="exit-canvas" data-video-id="${state.active.videoId}">退出画布</button>` : ""}
          <button class="icon-only small-icon">${icon("more", 18)}</button>
        </div>
      </div>
      <div class="central-content">
        ${renderCentralContent(project, session, task)}
      </div>
    </section>
  `;
}

function workspaceTitle(task) {
  const video = getActiveVideo(state);
  const storyboard = state.storyboards?.[state.active.storyboardId];
  if (state.active.workspaceMode === "video-package" && video) return `${video.title} · 视频生产包`;
  if (state.active.workspaceMode === "viewer" && video) return video.title;
  if (state.active.workspaceMode === "canvas" && video) return `${video.title} · 工作流画布`;
  if (state.active.workspaceMode === "storyboard" && storyboard) return `${storyboard.title} · 故事画板`;
  if (state.active.workspaceMode === "document" && state.active.deliveryType === "script" && state.active.videoId) {
    const activeScript = getTaskVideoProductionChains(state, task.id).find((chain) => chain.video.id === state.active.videoId)?.script;
    if (activeScript) return activeScript.title;
  }
  const node = state.processNodes[state.active.processNodeId];
  if (state.active.workspaceMode === "document" && node) return node.title;
  if (state.active.workspaceMode === "assets") return "输入素材";
  return task.name;
}

function renderCentralContent(project, session, task) {
  if (state.active.workspaceMode === "video-package") return renderVideoPackage();
  if (state.active.workspaceMode === "viewer") return renderVideoViewer();
  if (state.active.workspaceMode === "canvas") return renderCanvas();
  if (state.active.workspaceMode === "storyboard") return renderStoryboard();
  if (state.active.workspaceMode === "document") return renderDocumentViewer();
  if (state.active.workspaceMode === "assets") return renderInputsViewer();
  return renderCompactTaskOverview(project, session, task);
}

function renderCompactTaskOverview(project, session, task) {
  const nodes = getCurrentTaskProcessNodes(state);
  const complete = nodes.filter((node) => node.status === "done").length;
  const progress = Math.round((complete / Math.max(nodes.length, 1)) * 100);
  const chains = getTaskVideoProductionChains(state, task.id);
  const conversation = getConversationViewModel(state, session.id);
  const sharedOutputs = [
    { label: "商品与素材理解", node: nodes[0] },
    { label: "Marketing Brief", node: nodes[1] },
    { label: "营销方向", node: nodes[2] },
  ];
  const firstPending = conversation.pendingActions[0] ?? null;
  const stageLabels = { script: "脚本", shots: "分镜", storyboard: "画板", video: "视频" };
  return `
    <div class="overview-page compact-task-overview">
      <section class="overview-hero compact-overview-hero">
        <div>
          <span class="hero-kicker">营销任务总览</span>
          <h1>${escapeHtml(task.name)}</h1>
          <p>${escapeHtml(project.name)} · ${escapeHtml(session.title)}。这里只展示共同产物、五条视频和当前首要待办。</p>
        </div>
        <div class="progress-ring" style="--progress:${progress * 3.6}deg"><span><strong>${progress}%</strong><small>整体进度</small></span></div>
      </section>

      <section class="overview-shared-card">
        <div class="section-head"><div><span>会话级共同产物</span><strong>商品理解、Brief 与营销方向</strong></div>${pill(task.status)}</div>
        <div class="shared-output-grid">
          ${sharedOutputs.map(({ label, node }, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${label}</strong><small>${node?.status === "done" ? "已完成" : node?.status === "active" ? "生成中" : "等待处理"}</small></div>${pill(node?.status === "done" ? "已完成" : node?.status === "active" ? "进行中" : "待处理", node?.status === "done" ? "success" : node?.status === "active" ? "active" : "neutral")}</article>`).join("")}
        </div>
      </section>

      <section class="overview-video-matrix">
        <div class="section-head"><div><span>五条视频生产包</span><strong>脚本 → 分镜 → 画板 → 视频</strong></div><small>点击一行打开单条视频</small></div>
        <div class="compact-video-rows">
          ${chains.map((chain) => {
            const packageView = getVideoPackageViewModel(state, chain.video.id);
            return `<button data-action="select-video" data-video-id="${chain.video.id}"><span>${String(chain.index).padStart(2, "0")}</span><strong>${escapeHtml(chain.video.title)}</strong><div>${Object.entries(packageView?.stages ?? {}).map(([stage, semantic]) => `<i class="stage-dot ${semantic}" title="${stageLabels[stage]}：${semantic}">${stageLabels[stage]}</i>`).join("")}</div>${pill(chain.status, productionStatusTone(chain.status))}</button>`;
          }).join("")}
        </div>
      </section>

      <section class="overview-next-action ${firstPending ? firstPending.semantic : "completed"}">
        <span>${firstPending ? "待你处理" : "当前无需处理"}</span>
        <div><strong>${firstPending ? escapeHtml(firstPending.label) : "AI 正在按计划继续工作"}</strong><small>${firstPending ? `${firstPending.count} 个对象需要处理` : "新的确认或异常会在这里出现"}</small></div>
        ${firstPending ? `<button data-action="open-pending" data-pending-type="${firstPending.type}">打开第一项</button>` : ""}
      </section>
    </div>
  `;
}

function renderVideoPackage() {
  const view = getVideoPackageViewModel(state, state.active.videoId);
  if (!view) return `<div class="empty-state">请选择一条视频生产包</div>`;
  const { video, chain, stages } = view;
  const stage = state.active.videoStage ?? view.activeStage;
  const storyboard = chain?.storyboard ?? null;
  const sequence = String(chain?.index ?? 1).padStart(2, "0");
  const stageLabels = { script: "脚本", shots: "分镜表", storyboard: "故事画板", video: "视频" };
  const semanticLabels = { queued: "未开始", running: "进行中", needs_action: "待你处理", completed: "已完成", blocked: "异常" };

  const stageContent = {
    script: `
      <div class="package-placeholder-heading"><span>脚本占位</span><strong>讲什么</strong><small>本轮只确认内容区位置和阶段切换，不展开具体文案字段。</small></div>
      <div class="script-placeholder-grid"><article><span>Hook</span><i></i><i></i></article><article><span>主体内容</span><i></i><i></i><i></i></article><article><span>CTA</span><i></i></article></div>
    `,
    shots: `
      <div class="package-placeholder-heading"><span>分镜表占位</span><strong>怎么拍</strong><small>镜头结构先用占位行表达，详细字段后续由设计师补齐。</small></div>
      <div class="shots-placeholder-list">${[1, 2, 3, 4].map((item) => `<article><b>${String(item).padStart(2, "0")}</b><span><i></i><i></i></span><em>镜头占位</em></article>`).join("")}</div>
    `,
    storyboard: `
      <div class="package-placeholder-heading"><span>故事画板占位</span><strong>画面大概是什么样</strong><small>这里确认视觉预览和操作位置；每张画板仍然独立确认。</small></div>
      <div class="storyboard-placeholder-strip">${[1, 2, 3, 4].map((item) => `<article><div>${storyboard?.status === "generated" ? `<img src="${productImage}" alt="画板镜头 ${item}" />` : icon("film", 22)}</div><span>镜头 ${String(item).padStart(2, "0")}</span></article>`).join("")}</div>
    `,
    video: `
      <div class="package-placeholder-heading"><span>视频占位</span><strong>结果与版本</strong><small>播放器、版本对比和审核细节本轮不展开。</small></div>
      <div class="video-result-placeholder ${stages.video === "completed" ? "has-result" : ""}">${stages.video === "completed" ? `<img src="${productImage}" alt="${escapeHtml(video.title)}" /><button aria-label="播放视频">${icon("play", 28)}</button>` : `<span>${icon("film", 30)}</span><strong>${stages.video === "running" ? "视频生成中" : "等待故事画板确认"}</strong>`}</div>
    `,
  }[stage];

  let stageActions = `<button class="ghost-button" data-action="discuss-current-stage">与 AI 讨论</button>`;
  if (stage === "storyboard" && storyboard) {
    if (storyboard.status === "generating") stageActions += `<button class="primary-button" disabled>视频生成中…</button>`;
    else if (storyboard.status === "generated") stageActions += `<button class="primary-button" data-action="select-video-stage" data-video-id="${video.id}" data-stage="video">查看视频 ${sequence}</button>`;
    else stageActions += `<button class="ghost-button" data-action="revise-storyboard" data-storyboard-id="${storyboard.id}">让 AI 修改</button><button class="primary-button" data-action="approve-storyboard" data-storyboard-id="${storyboard.id}">确认画板 ${sequence}，并生成视频 ${sequence}</button>`;
  }
  if (stage === "video" && stages.video === "completed") stageActions += `<button class="primary-button" data-action="enter-canvas" data-video-id="${video.id}">${icon("canvas", 15)} 深度画布</button>`;

  return `
    <div class="video-package-shell">
      <header class="video-package-header">
        <div><span class="video-package-index">${sequence}</span><div><small>单条视频生产包</small><h1>${escapeHtml(video.title)}</h1><p>${escapeHtml(video.duration ?? "20s")} · ${escapeHtml(video.version ?? "草稿")} · ${escapeHtml(chain?.direction ?? "营销方向")}</p></div></div>
        ${pill(semanticLabels[stages[stage]] ?? stages[stage], stages[stage] === "completed" ? "success" : stages[stage] === "running" ? "active" : "neutral")}
      </header>
      <nav class="video-stage-tabs" aria-label="视频生产阶段">
        ${Object.entries(stageLabels).map(([key, label], index) => `<button class="${stage === key ? "active" : ""} ${stages[key]}" data-action="select-video-stage" data-video-id="${video.id}" data-stage="${key}" aria-current="${stage === key ? "step" : "false"}"><span>${stages[key] === "completed" ? icon("check", 13) : String(index + 1).padStart(2, "0")}</span><strong>${label}</strong><small>${semanticLabels[stages[key]] ?? stages[key]}</small></button>`).join("")}
      </nav>
      <section class="video-package-stage">${stageContent}</section>
      <footer class="video-package-actions"><span>当前阶段：${stageLabels[stage]}</span><div>${stageActions}</div></footer>
    </div>
  `;
}

function renderDeliveryOverview(project, session, task) {
  const nodes = getCurrentTaskProcessNodes(state);
  const complete = nodes.filter((node) => node.status === "done").length;
  const progress = Math.max(18, Math.round((complete / nodes.length) * 100));
  const storyboards = getTaskStoryboards(state, task.id);
  const chains = getTaskVideoProductionChains(state, task.id);
  const scriptNode = nodes.find((node) => node.shortTitle === "脚本" || node.title.includes("脚本"));
  const pendingStoryboard = storyboards.find((item) => item.status !== "generated") ?? storyboards[0];
  const flowNodes = buildTenNodeFlow(nodes);
  return `
    <div class="overview-page">
      <section class="overview-hero">
        <div>
          <span class="hero-kicker">AI 营销任务</span>
          <h1>${escapeHtml(task.name)}</h1>
          <p>围绕「${escapeHtml(project.name)}」完成商品理解、营销策略、内容生产与审查交付。</p>
        </div>
        <div class="progress-ring" style="--progress:${progress * 3.6}deg"><span><strong>${progress}%</strong><small>整体进度</small></span></div>
      </section>

      <section class="flow-section">
        <div class="section-head"><div><span>营销 Flow</span><strong>从输入到可交付视频</strong></div>${pill(task.status)}</div>
        <div class="flow-track">
          ${flowNodes.map((item, index) => renderFlowNode(item, index, pendingStoryboard)).join("")}
        </div>
      </section>

      <section class="production-chain-section">
        <div class="section-head"><div><span>视频生产链</span><strong>5 条视频逐一对应脚本、故事画板与成片</strong></div><small>点击任一步骤查看详情</small></div>
        <div class="production-chain-list">
          ${chains.map((chain) => renderProductionChain(chain, scriptNode)).join("")}
        </div>
      </section>

      ${renderProjectNodeDetails(flowNodes)}
    </div>
  `;
}

function renderProductionChain(chain, scriptNode) {
  const sequence = String(chain.index).padStart(2, "0");
  const sharedTitle = `视频 ${sequence} · ${chain.direction}`;
  const storyboardStatus = chain.storyboard ? storyboardStatusLabel(chain.storyboard.status) : "待生成";
  return `
    <article class="production-chain-row">
      <header><span>${sequence}</span><div><strong>${escapeHtml(chain.direction)}</strong><small>${escapeHtml(chain.video.version ?? "v1")} · ${escapeHtml(chain.video.duration ?? "--")}</small></div>${pill(chain.status, productionStatusTone(chain.status))}</header>
      <div class="production-chain-steps">
        <button class="production-step" data-action="select-delivery" data-item-type="script" data-item-id="${scriptNode?.id ?? ""}" data-video-id="${chain.video.id}" ${scriptNode ? "" : "disabled"}>
          <span class="production-step-label">脚本</span>
          <strong>${escapeHtml(sharedTitle)}</strong>
          <small>${escapeHtml(chain.script.summary)}</small>
          ${pill("已生成", "success")}
        </button>
        <button class="production-step" data-action="select-storyboard" data-storyboard-id="${chain.storyboard?.id ?? ""}" ${chain.storyboard ? "" : "disabled"}>
          <span class="production-step-label">故事画板</span>
          <strong>${escapeHtml(sharedTitle)}</strong>
          <small>${escapeHtml(chain.storyboard?.title ?? "等待脚本生成画板")}</small>
          ${pill(storyboardStatus, productionStatusTone(storyboardStatus))}
        </button>
        <button class="production-step" data-action="select-video" data-video-id="${chain.video.id}">
          <span class="production-step-label">视频</span>
          <strong>${escapeHtml(sharedTitle)}</strong>
          <small>${escapeHtml(chain.video.title ?? `视频 ${sequence}`)}</small>
          ${pill(chain.status, productionStatusTone(chain.status))}
        </button>
      </div>
    </article>
  `;
}

function renderProjectNodeDetails(flowNodes) {
  return `
    <details class="project-node-details" open>
      <summary><span><strong>项目节点详情</strong><small>展开查看完整 10 节点摘要与记录</small></span>${icon("arrow", 16)}</summary>
      <div class="project-node-detail-list">
        ${flowNodes
          .map(
            (item, index) => `
              <article class="project-node-detail">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.node?.summary ?? "等待前序节点完成")}</small><p>${escapeHtml(item.node?.record ?? "暂无记录")}</p></div>
                ${pill(item.status === "done" ? "已完成" : item.status === "active" ? "进行中" : "待处理", item.status === "done" ? "success" : item.status === "active" ? "active" : "neutral")}
              </article>
            `,
          )
          .join("")}
      </div>
    </details>
  `;
}

function buildTenNodeFlow(nodes) {
  const definitions = [
    ["商品 / 素材理解", ["任务理解", "商品 / 素材理解"]],
    ["Marketing Brief", ["Brief"]],
    ["营销方向选择", ["营销方向"]],
    ["脚本", ["脚本"]],
    ["故事画板确认", ["故事画板", "分镜"]],
    ["视频生成", ["视频生成"]],
    ["AI 初检", ["AI 初检"]],
    ["人工审核", ["人工审核"]],
    ["修改与版本", ["修改与版本", "版本"]],
    ["交付与导出", ["交付与导出", "导出"]],
  ];
  return definitions.map(([label, aliases], index) => {
    const node = nodes.find((item) => aliases.some((alias) => item.shortTitle === alias || item.title.includes(alias)));
    const priorDone = index > 0 && definitions.slice(0, index).every(([, priorAliases]) => {
      const prior = nodes.find((item) => priorAliases.some((alias) => item.shortTitle === alias || item.title.includes(alias)));
      return !prior || prior.status === "done";
    });
    return { label, node, status: node?.status ?? (priorDone ? "active" : "pending") };
  });
}

function renderFlowNode(item, index, pendingStoryboard) {
  const isStoryboard = item.label === "故事画板确认";
  const type = item.label === "Marketing Brief" ? "brief" : item.label === "脚本" ? "script" : "overview";
  const action = isStoryboard ? "select-storyboard" : "select-delivery";
  const attributes = isStoryboard ? `data-storyboard-id="${pendingStoryboard?.id ?? ""}"` : `data-item-type="${type}" ${item.node?.id ? `data-item-id="${item.node.id}"` : ""}`;
  return `<button class="flow-node ${item.status}" data-action="${action}" ${attributes} ${isStoryboard && !pendingStoryboard ? "disabled" : ""}><span>${item.status === "done" ? icon("check", 13) : String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(item.label)}</strong><small>${item.status === "done" ? "已完成" : item.status === "active" ? "进行中" : "待处理"}</small></button>${index < 9 ? '<span class="flow-line"></span>' : ""}`;
}

function renderDocumentViewer() {
  const node = state.processNodes[state.active.processNodeId];
  const type = state.active.deliveryType;
  const activeScript = type === "script" && state.active.videoId
    ? getTaskVideoProductionChains(state).find((chain) => chain.video.id === state.active.videoId)?.script
    : null;
  if (!node && !activeScript) return `<div class="empty-state">选择一项交付物查看详情</div>`;
  if (type === "storyboard") return renderStoryboard();
  const documentTitle = activeScript?.title ?? node.title;
  const documentSummary = activeScript?.summary ?? node.summary;
  return `
    <div class="document-viewer">
      <article class="paper">
        <div class="paper-meta"><span>Chorify 结构化交付物</span>${pill(node?.status === "done" ? "已确认" : "草稿")}</div>
        <h1>${escapeHtml(documentTitle)}</h1>
        <p class="paper-lead">${escapeHtml(documentSummary)}</p>
        <div class="paper-grid">
          <section><span>营销目标</span><strong>建立便携式榨汁杯的场景认知，提升 TikTok 点击与收藏。</strong></section>
          <section><span>目标人群</span><strong>美国大学生、通勤白领、健身人群</strong></section>
          <section><span>核心卖点</span><strong>便携、30 秒快速榨汁、易清洗、USB-C 充电</strong></section>
          <section><span>内容语气</span><strong>真实、轻快、像朋友推荐，避免传统硬广表达</strong></section>
        </div>
        ${
          type === "script"
            ? `<div class="script-block"><b>HOOK 00:00–00:03</b><p>${escapeHtml(activeScript?.hook ?? "待生成前三秒 Hook")}</p><b>脚本方向</b><p>${escapeHtml(activeScript?.summary ?? node?.summary)}</p><b>结构</b><p>Hook → 使用场景 → 核心卖点 → CTA</p></div>`
            : `<blockquote>${escapeHtml(node?.record)}</blockquote>`
        }
        <div class="paper-footer"><span>由 Chorify AI 生成 · 已绑定当前商品与会话</span><div><button class="ghost-button" data-action="quick-ai" data-prompt="请优化这个${escapeHtml(documentTitle)}，但保留核心营销目标。">让 AI 优化</button><button class="primary-button">确认此版本</button></div></div>
      </article>
    </div>
  `;
}

function renderStoryboard() {
  const storyboards = getTaskStoryboards(state);
  const storyboard = state.storyboards?.[state.active.storyboardId] ?? storyboards[0];
  if (!storyboard) return `<div class="empty-state">当前任务还没有故事画板</div>`;
  const sourceAssets = storyboard.sourceAssetIds.map((id) => state.inputAssets?.[id]).filter(Boolean);
  const excludedAssets = storyboard.excludedAssetIds.map((id) => state.inputAssets?.[id]).filter(Boolean);
  return `
    <div class="storyboard-viewer">
      <div class="storyboard-head"><div><span>视频故事画板 · ${escapeHtml(storyboard.aspectRatio)} · V${storyboard.version}</span><h1>${escapeHtml(storyboard.title)}</h1><p>${escapeHtml(storyboard.angle)} · ${escapeHtml(storyboard.duration)}。这条画板独立确认，只会启动对应的一条视频。</p></div>${pill(storyboardStatusLabel(storyboard.status), storyboard.status === "generated" ? "success" : storyboard.status === "generating" ? "active" : "neutral")}</div>
      <div class="storyboard-materials"><div><small>用于生成</small>${sourceAssets.length ? sourceAssets.map((asset) => `<span>${escapeHtml(asset.name)}</span>`).join("") : `<span>主商品图</span><span>商品卖点</span>`}</div><div class="excluded"><small>不参与生成</small>${excludedAssets.length ? excludedAssets.map((asset) => `<span>${escapeHtml(asset.name)}</span>`).join("") : `<span>无</span>`}</div></div>
      <div class="storyboard-grid">
        ${storyboard.scenes
          .map(
            (scene, index) => `
              <article class="scene-card">
                <div class="scene-image scene-${(index % 5) + 1}"><img src="${productImage}" alt="${escapeHtml(scene.title)}"/><span>${scene.order ?? index + 1}</span></div>
                <div><small>镜头 ${String(scene.order ?? index + 1).padStart(2, "0")}</small><strong>${escapeHtml(scene.title)}</strong><p>${escapeHtml(scene.description)}</p></div>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="storyboard-actions"><div><small>当前只确认这条视频</small><strong>其他 ${Math.max(0, storyboards.length - 1)} 条故事画板保持原状态</strong></div><div><button class="ghost-button" data-action="revise-storyboard" data-storyboard-id="${storyboard.id}" ${storyboard.status === "generating" ? "disabled" : ""}>让 AI 修改</button><button class="ghost-button" data-action="edit-storyboard" data-video-id="${storyboard.videoId}">${icon("canvas", 15)} 详细编辑</button>${storyboard.status === "generating" ? `<button class="primary-button" disabled>视频生成中…</button>` : storyboard.status === "generated" ? `<button class="primary-button" data-action="select-video" data-video-id="${storyboard.videoId}">${icon("play", 15)} 查看成片</button>` : `<button class="primary-button" data-action="approve-storyboard" data-storyboard-id="${storyboard.id}">确认并生成这条视频</button>`}</div></div>
    </div>
  `;
}

function renderInputsViewer() {
  const assets = getProjectInputAssets(state);
  return `
    <div class="inputs-viewer">
      <div class="inputs-copy"><div><span class="hero-kicker">项目与会话输入</span><h1>分级素材与用途</h1><p>新上传先进入本会话。你可以显式晋升为项目或品牌资产；底层文件保持同一 ID，不重复复制。</p></div><button class="primary-button" data-action="ingest-materials">${icon("plus", 15)} ${assets.length ? "补充演示素材" : "导入演示素材"}</button></div>
      ${assets.length ? `<div class="asset-scope-summary"><span><b>${assets.filter((asset) => asset.scope === "brand").length}</b> 品牌资产</span><span><b>${assets.filter((asset) => asset.scope === "project").length}</b> 项目资产</span><span><b>${assets.filter((asset) => asset.scope === "session").length}</b> 本会话素材</span></div><div class="input-asset-grid scoped-asset-grid">${assets.map(renderScopedAssetCard).join("")}</div>` : `<div class="asset-empty"><span>${icon("upload", 28)}</span><strong>还没有输入素材</strong><p>点击“导入演示素材”查看商品链接、品牌规范、参考视频和反馈截图如何自动分类。</p></div>`}
    </div>
  `;
}

function renderScopedAssetCard(asset, index) {
  const scopeLabel = { brand: "品牌", project: "项目", session: "本会话" }[asset.scope] ?? asset.scope;
  const usageLabel = { generation: "用于生成", reference: "仅参考", excluded: "不参与生成" }[asset.usage] ?? asset.usage;
  const nextScope = asset.scope === "session" ? "project" : asset.scope === "project" ? "brand" : null;
  const typeLabel = { "product-link": "URL", "brand-guide": "PDF", "reference-video": "MP4", "feedback-screenshot": "IMG" }[asset.type] ?? "FILE";
  return `<article class="scoped-asset-card ${asset.usage === "excluded" ? "is-excluded" : ""}"><div class="asset-placeholder ${["violet", "blue", "green"][index % 3]}">${typeLabel}</div><div class="asset-card-copy"><div><span class="scope-badge scope-${asset.scope}">${scopeLabel}</span><span class="usage-badge usage-${asset.usage}">${usageLabel}</span></div><strong>${escapeHtml(asset.name)}</strong><small>来源：${asset.source === "demo-intake" ? "本会话演示上传" : escapeHtml(asset.source)}</small></div>${nextScope ? `<button class="ghost-button asset-promote" data-action="promote-asset" data-asset-id="${asset.id}" data-scope="${nextScope}">晋升为${nextScope === "project" ? "项目" : "品牌"}资产</button>` : `<span class="asset-stable">跨项目复用</span>`}</article>`;
}

function renderVideoViewer() {
  const video = getActiveVideo(state);
  if (!video) return `<div class="empty-state">选择一条视频进入 Viewer</div>`;
  const chain = getTaskVideoProductionChains(state).find((item) => item.video.id === video.id);
  const generated = chain ? chain.status === "已生成" : Boolean(video.artifactId);
  if (!generated) {
    return `
      <div class="viewer-shell viewer-pending-shell">
        <div class="viewer-stage video-viewer-placeholder">
          <div class="video-viewer-placeholder-card">
            <span class="video-viewer-placeholder-icon">${icon("film", 30)}</span>
            <small>视频 ${String(chain?.index ?? 1).padStart(2, "0")} · ${escapeHtml(chain?.direction ?? video.title)}</small>
            <h2>${escapeHtml(video.title)}</h2>
            <p>当前状态：${escapeHtml(chain?.status ?? video.status)}。成片尚未生成，这里暂不显示视频画面或播放控件。</p>
            ${pill(chain?.status ?? video.status, productionStatusTone(chain?.status ?? video.status))}
            ${chain?.storyboard ? `<button class="primary-button" data-action="select-storyboard" data-storyboard-id="${chain.storyboard.id}">打开对应故事画板</button>` : ""}
          </div>
        </div>
        <div class="viewer-info-bar viewer-pending-info">
          <div><span class="eyebrow">视频槽位</span><strong>${escapeHtml(video.title)}</strong></div>
          <div class="review-tags">${pill(chain?.status ?? video.status, productionStatusTone(chain?.status ?? video.status))}${pill(video.version ?? "v1")}</div>
          <div>${chain?.storyboard ? `<button class="ghost-button" data-action="select-storyboard" data-storyboard-id="${chain.storyboard.id}">打开对应故事画板</button>` : ""}</div>
        </div>
      </div>
    `;
  }
  return `
    <div class="viewer-shell">
      <div class="viewer-stage">
        <div class="portrait-video">
          <img src="${productImage}" alt="${escapeHtml(video.title)}" />
          <div class="video-vignette"></div>
          <button class="play-button">${icon("play", 28)}</button>
          <div class="video-caption"><small>YOUR MORNING, BLENDED.</small><strong>30 秒新鲜出发</strong></div>
        </div>
      </div>
      <div class="viewer-controls">
        <button>${icon("play", 16)}</button><button>↻</button><span>1.0×</span><button>⌕</button>
        <div class="scrubber"><span style="width:32%"></span><i style="left:32%"></i></div>
        <strong>00:00:06:12</strong><span>/ 00:00:${video.duration.replace("s", "")}:00</span>
        <button>CC</button><button>⚙</button><button>⛶</button>
      </div>
      <div class="viewer-info-bar">
        <div><span class="eyebrow">选中视频</span><strong>${escapeHtml(video.title)}</strong></div>
        <div class="review-tags">${pill(video.status)}${pill(`AI：${video.aiCheck}`)}${pill(`人工：${video.humanReview}`)}</div>
        <div><button class="ghost-button" data-action="quick-ai" data-prompt="请把当前视频的前三秒 Hook 做得更有吸引力。">对话修改</button><button class="primary-button" data-action="enter-canvas" data-video-id="${video.id}">${icon("canvas", 15)} 深度编辑</button></div>
      </div>
    </div>
  `;
}

function renderCanvas() {
  const video = getActiveVideo(state);
  return `
    <div class="canvas-shell">
      <div class="canvas-grid"></div>
      <div class="canvas-toolbar"><button>−</button><strong>82%</strong><button>＋</button><span></span><button>自动整理</button></div>
      <article class="canvas-node product-node"><span>01 · 输入</span><strong>商品与素材理解</strong><img src="${productImage}" alt="商品素材"/><small>8 个素材 · 已锁定</small></article>
      <article class="canvas-node script-node"><span>02 · 策略</span><strong>脚本与分镜</strong><p>早八 Hook → 30 秒榨汁 → 通勤携带 → CTA</p><small>4 个镜头</small></article>
      <article class="canvas-node generation-node active"><span>03 · 生成</span><strong>${escapeHtml(video?.title ?? "视频生成")}</strong><div class="node-preview"><img src="${productImage}" alt="视频预览"/>${icon("play", 22)}</div><small>V2 · AI 初检通过</small></article>
      <article class="canvas-node review-node"><span>04 · 审核</span><strong>AI 初检 + 人工审核</strong><p>品牌露出正常，字幕安全区通过。</p>${pill("待人工审核")}</article>
      <article class="canvas-node export-node"><span>05 · 交付</span><strong>版本与导出</strong><small>MP4 · 1080 × 1920</small></article>
      <svg class="canvas-connectors" viewBox="0 0 1000 620" preserveAspectRatio="none"><path d="M205 190 C270 190 270 305 335 305"/><path d="M520 305 C585 305 560 225 625 225"/><path d="M795 225 C845 225 815 390 865 390"/><path d="M720 350 C720 450 600 470 600 545"/></svg>
    </div>
  `;
}

function renderAiPanel(project, session, task) {
  const snapshotId = session.contextSnapshotIds?.at(-1);
  const snapshot = snapshotId ? state.contextSnapshots?.[snapshotId] : null;
  const viewModel = getConversationViewModel(state, session.id);
  const records = {
    assets: getProjectInputAssets(state, project.id),
    storyboards: getTaskStoryboards(state, task.id),
    videos: task.videoIds.map((id) => state.videos[id]).filter(Boolean),
  };
  const sessionContextAssets = getSessionContextAssets(state, session.id);
  return `
    <aside class="ai-panel panel-surface">
      <div class="ai-head">
        <div class="ai-avatar">AI</div>
        <div><strong>Chorify 营销官</strong><small><i></i> 已连接当前工作区</small></div>
        <button class="icon-only small-icon">${icon("more", 18)}</button>
      </div>
      ${renderConversationWorklog(viewModel, {
        records,
        productImage,
        snapshot,
        composerContext: state.composer.contextLabel,
        currentObject: {
          centralOpen: !state.ui.centralWorkspaceCollapsed,
          mode: state.active.workspaceMode,
          videoId: state.active.videoId,
          storyboardId: state.active.storyboardId,
          stage: state.active.videoStage,
        },
        sessionAssetsHtml: renderSessionContextChips(sessionContextAssets),
      })}
    </aside>
  `;
}

function renderSessionAssetPickerDialog() {
  if (!state.ui.sessionAssetPickerOpen || !state.active.sessionId) return "";
  const scope = state.ui.assetPickerScope ?? "project";
  const assets = scope === "workspace"
    ? getWorkspaceAssets(state)
    : getProjectLibraryAssets(state).map((reference) => reference.asset);
  return renderSessionAssetPicker({
    open: true,
    scope,
    assets,
    selectedIds: getSessionContextAssets(state).map((asset) => asset.id),
  });
}

function submitAiMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  const video = getActiveVideo(state);
  state = appendProjectConversationMessage(state, { role: "user", text: clean });
  state = appendProjectConversationMessage(state, {
    role: "assistant",
    text: video
      ? `已将这条要求绑定到「${video.title}」。我会保留原版本，并生成一个可对比的新版本。`
      : `已收到。我会基于「${currentObjectLabel()}」和当前项目上下文执行，并把结果作为结构化交付物放回工作区。`,
  });
  notice = "AI 已接收任务并绑定当前上下文";
}

function submitChiefMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  if (!getActiveChiefChat(state)) state = createChiefChat(state, { title: clean.slice(0, 18) });
  state = appendChiefMessage(state, { role: "user", text: clean });
  state = appendChiefMessage(state, {
    role: "assistant",
    kind: "advice",
    text: clean.includes("受众")
      ? "建议先把受众拆成高频场景，而不是按年龄粗分：宿舍早餐、通勤补能、健身后恢复。我们可以继续讨论，不必现在进入视频制作。"
      : "我建议先测试三个表达方向：真实场景痛点、单一卖点演示、使用前后对比。先把判断依据聊清楚；只有你主动选择时，我才会把摘要带入视频项目。",
  });
  notice = "首席官已给出一轮策略建议";
}

function clearWorkflowTimers() {
  preparationTimers.stopAll();
  for (const timer of generationTimers.values()) window.clearTimeout(timer);
  generationTimers.clear();
}

function renderPreservingWorklogTransientState() {
  const transientState = captureWorklogTransientState(document);
  render();
  restoreWorklogTransientState(document, transientState);
}

function scheduleTaskPreparation(taskId) {
  preparationTimers.start(taskId, () => {
    if (!state.tasks[taskId]) {
      preparationTimers.stop(taskId);
      return;
    }
    const activeBefore = structuredClone(state.active);
    const composerBefore = structuredClone(state.composer);
    const isVisibleTask = state.active.taskId === taskId && state.ui.productScreen === "workspace";
    state = advanceDemoTaskPreparation(state, taskId);
    state.active = activeBefore;
    state.composer = composerBefore;
    if (isVisibleTask) renderPreservingWorklogTransientState();
  });
}

function scheduleVideoGenerationCompletion(storyboardId) {
  const prior = generationTimers.get(storyboardId);
  if (prior) window.clearTimeout(prior);
  const timer = window.setTimeout(() => {
    generationTimers.delete(storyboardId);
    if (state.storyboards?.[storyboardId]?.status !== "generating") return;
    const result = completeScheduledVideoGeneration(state, storyboardId, completeVideoGeneration);
    state = result.state;
    if (!result.shouldRender) return;
    notice = result.notice;
    renderPreservingWorklogTransientState();
  }, 1200);
  generationTimers.set(storyboardId, timer);
}

function startBlankProject(prompt) {
  const clean = prompt.trim() || "为这个商品建立首批五条营销视频，先完成商品与素材理解。";
  state = startProjectSession(state, {
    prompt: clean,
    sessionTitle: "首批营销视频",
    taskName: "首批 5 条营销视频",
  });
  state = ingestDemoMaterials(state);
  state = appendProjectConversationMessage(state, {
    role: "assistant",
    kind: "milestone",
    text: "我已经建立十节点任务与五条独立视频生产链。接下来会自动完成商品理解、Brief、营销方向、脚本与故事画板准备。",
  });
  scheduleTaskPreparation(state.active.taskId);
  notice = "首条营销会话、任务与演示素材已建立";
}

function transferInput() {
  const chat = getActiveChiefChat(state);
  const preview = chiefContextPreview(chat);
  return {
    projectName: `${chat?.title ?? "营销策略"} · 视频项目`,
    sessionTitle: "首批视频制作",
    taskName: "首批 5 条营销视频",
    summary: preview.summary,
    marketingGoal: preview.goal,
    audience: preview.audience,
    platform: preview.platform,
    directions: preview.directions,
    decisions: ["每条视频独立确认故事画板", "优先测试真实场景表达"],
    openQuestions: ["最终 CTA 与投放预算待确认"],
  };
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (state.ui.profileMenuOpen && !event.target.closest(".profile-menu-shell")) {
    state = toggleProfileMenu(state, false);
    document.querySelector(".profile-menu")?.remove();
    const profileButton = document.querySelector('[data-action="toggle-profile-menu"]');
    profileButton?.setAttribute("aria-expanded", "false");
    profileButton?.setAttribute("aria-label", "打开 Dianwen Wang 用户菜单");
  }
  if (!target) return;
  if (target.dataset.backdrop === "true" && event.target !== target) return;
  const action = target.dataset.action;
  let profileMenuRenderFocus = null;
  let preserveProfileDrafts = false;
  notice = "";

  if (action === "go-projects-home") state = openProjectsHome(state);
  if (action === "open-asset-center") state = openAssetCenter(state, "workspace");
  if (action === "set-asset-scope") state = setAssetCenterScope(state, target.dataset.scope);
  if (action === "open-project-assets") state = openProjectAssetMode(state);
  if (action === "select-blank-overview") {
    state = selectProject(state, state.active.projectId);
    state = toggleWorkspacePanel(state, "workspace", false);
  }
  if (action === "select-library-asset") state = selectLibraryAsset(state, target.dataset.assetId);
  if (action === "open-add-project-assets") state = openAssetCenter(state, "workspace");
  if (action === "add-project-asset") {
    state = addWorkspaceAssetToProject(state, target.dataset.assetId);
    notice = "资产已以引用方式加入当前项目，未复制底层文件";
  }
  if (action === "add-session-asset") {
    state = addAssetToSessionContext(state, target.dataset.assetId);
    notice = "资产已加入当前会话上下文";
  }
  if (action === "remove-session-asset") {
    state = removeAssetFromSessionContext(state, target.dataset.assetId);
    notice = "已从当前会话移除，原资产仍然保留";
  }
  if (action === "create-workspace-folder") {
    state = createWorkspaceFolder(state, `新建资料文件夹 ${getWorkspaceFolders(state).length + 1}`);
    notice = "已在工作空间创建演示文件夹";
  }
  if (action === "upload-library-asset" || action === "upload-project-asset") {
    const scope = action === "upload-project-asset" ? "project" : target.dataset.scope;
    state = uploadDemoAsset(state, {
      name: scope === "project" ? "项目补充资料.pdf" : "新上传营销资料.pdf",
      type: "pdf",
      scope: scope === "project" ? "project" : "workspace",
      folderId: scope === "workspace" ? state.active.assetFolderId : null,
    });
    if (scope === "project") state = openProjectAssetMode(state);
    notice = scope === "project" ? "演示资产已上传到当前项目" : "演示资产已上传到工作空间";
  }
  if (action === "understand-selected-asset") {
    state = requestAssetUnderstanding(state, [target.dataset.assetId]);
    notice = "已开始理解所选资产；上传和 AI 理解是两项独立操作";
  }
  if (action === "open-session-asset-picker") state = toggleSessionAssetPicker(state, true, "project");
  if (action === "close-session-asset-picker") state = toggleSessionAssetPicker(state, false);
  if (action === "set-asset-picker-scope") state = toggleSessionAssetPicker(state, true, target.dataset.scope);
  if (action === "confirm-session-assets") {
    const selectedIds = [...document.querySelectorAll("[data-session-asset-choice]:checked")].map((input) => input.value);
    for (const assetId of selectedIds) state = addAssetToSessionContext(state, assetId);
    state = toggleSessionAssetPicker(state, false);
    notice = `${selectedIds.length} 项资产已加入当前会话`;
  }
  if (action === "open-chief-chat") state = openChiefChat(state);
  if (action === "new-chief-chat") state = createChiefChat(state, { title: "新营销讨论" });
  if (action === "select-chief-chat") state = selectChiefChat(state, target.dataset.chatId);
  if (action === "chief-prompt") submitChiefMessage(target.dataset.prompt ?? "");
  if (action === "send-chief") submitChiefMessage(document.querySelector("#chief-input")?.value ?? "");
  if (action === "open-chief-transfer") state = openChiefTransfer(state);
  if (action === "close-chief-transfer") state = closeChiefTransfer(state);
  if (action === "set-transfer-destination") transferDestination = target.dataset.destination;
  if (action === "confirm-chief-transfer") {
    const input = transferInput();
    if (transferDestination === "new-project") state = transferChiefChatToNewProject(state, input);
    if (transferDestination === "new-session") state = transferChiefChatToSession(state, { ...input, projectId: transferProjectId });
    if (transferDestination === "existing-session") state = transferChiefChatToSession(state, { ...input, sessionId: transferSessionId });
    state = appendProjectConversationMessage(state, {
      role: "assistant",
      kind: "context-transfer",
      text: "我已读取来自营销首席官的不可变上下文快照。原讨论仍独立保存；接下来可以补充素材并逐条确认故事画板。",
    });
    notice = "首席官上下文已安全带入项目";
  }
  if (action === "open-source-chief") state = openChiefChat(state, target.dataset.chatId);
  if (action === "open-create-project") state = openCreateProject(state);
  if (action === "cancel-create-project") state = cancelCreateProject(state);
  if (action === "start-project-session") startBlankProject(target.dataset.prompt ?? "");
  if (action === "send-blank-ai") startBlankProject(document.querySelector("#blank-ai-input")?.value ?? "");
  if (action === "toggle-panel") {
    if (state.ui.deliveryMaximized) {
      state = toggleDeliveryMaximized(state, false);
      state = toggleWorkspacePanel(state, target.dataset.panel, false);
    } else {
      state = toggleWorkspacePanel(state, target.dataset.panel);
    }
  }
  if (action === "toggle-projects-drawer") state = toggleProjectsDrawer(state);
  if (action === "close-projects-drawer") state = toggleProjectsDrawer(state, false);
  if (action === "toggle-profile-menu") {
    const opening = !state.ui.profileMenuOpen;
    state = toggleProfileMenu(state);
    preserveProfileDrafts = true;
    profileMenuRenderFocus = opening ? "first-menu-item" : "profile-button";
  }
  if (action === "profile-menu-placeholder") {
    state = toggleProfileMenu(state, false);
    notice = "此功能为 Demo 占位，后续接入正式页面。";
    preserveProfileDrafts = true;
    profileMenuRenderFocus = "profile-button";
  }
  if (action === "profile-menu-logout") {
    state = toggleProfileMenu(state, false);
    notice = "演示模式暂不执行退出登录。";
    preserveProfileDrafts = true;
    profileMenuRenderFocus = "profile-button";
  }
  if (action === "toggle-delivery-maximized") state = toggleDeliveryMaximized(state);
  if (action === "set-delivery-view") state = setDeliveryViewMode(state, target.dataset.view);
  if (action === "select-video-stage") state = selectVideoPackageStage(state, target.dataset.videoId, target.dataset.stage);
  if (action === "discuss-current-stage") {
    if (state.ui.aiPanelCollapsed) state = toggleWorkspacePanel(state, "ai", false);
    state.composer.prefill = `请帮我优化当前视频的${({ script: "脚本", shots: "分镜表", storyboard: "故事画板", video: "视频结果" })[state.active.videoStage] ?? "内容"}。`;
  }
  if (action === "reset-demo") {
    clearWorkflowTimers();
    state = createInitialState();
    notice = "Demo 已重置";
  }
  if (action === "select-project") {
    state = selectProject(state, target.dataset.projectId);
  }
  if (action === "select-session") state = selectSession(state, target.dataset.sessionId);
  if (action === "open-worklog-node") {
    const node = state.processNodes[target.dataset.nodeId];
    const nodeSemantic = node?.conversationSemantic ?? (node?.status === "done" ? "completed" : node?.status === "active" ? "running" : "queued");
    let didNavigate = false;
    if (node && !["queued", "skipped"].includes(nodeSemantic)) {
      const task = state.tasks[node.taskId];
      const videos = task?.videoIds.map((id) => state.videos[id]).filter(Boolean) ?? [];
      if (["任务理解", "Brief", "营销方向"].includes(node.shortTitle)) {
        state = selectDeliveryItem(state, "brief", node.id);
        didNavigate = true;
      } else if (node.shortTitle === "脚本") {
        state = selectDeliveryItem(state, "script", node.id);
        didNavigate = true;
      } else if (node.shortTitle === "故事画板") {
        const storyboard = getTaskStoryboards(state, node.taskId).find((item) => ["pending_review", "revision_requested"].includes(item.status)) ?? getTaskStoryboards(state, node.taskId)[0];
        if (storyboard) {
          state = selectStoryboard(state, storyboard.id);
          didNavigate = true;
        }
      } else {
        const candidates = {
          "视频生成": videos.find((video) => video.status === "视频生成中") ?? videos.find((video) => video.artifactId),
          "AI 初检": videos.find((video) => ["需检查", "疑似问题", "不可用"].includes(video.aiCheck)) ?? videos.find((video) => video.aiCheck && video.aiCheck !== "待初检"),
          "人工审核": videos.find((video) => video.humanReview === "待审核") ?? videos.find((video) => video.humanReview !== "待生成"),
          "修改与版本": videos.find((video) => video.humanReview === "需修改" || video.status === "待修改") ?? videos.find((video) => video.versionHistory?.length),
          "交付与导出": videos.find((video) => video.humanReview === "人工通过" || video.status === "已导出"),
        };
        const video = candidates[node.shortTitle];
        if (video) {
          state = selectDeliveryItem(state, "video", video.id);
          didNavigate = true;
        }
      }
    }
    if (didNavigate) state = toggleWorkspacePanel(state, "workspace", false);
  }
  if (action === "select-delivery") {
    const videoId = target.dataset.videoId || null;
    state = selectDeliveryItem(state, target.dataset.itemType, target.dataset.itemId || null);
    if (videoId) state = { ...state, active: { ...state.active, videoId } };
    state = toggleWorkspacePanel(state, "workspace", false);
  }
  if (action === "select-storyboard" && target.dataset.storyboardId) state = selectStoryboard(state, target.dataset.storyboardId);
  if (action === "select-video") {
    state = selectDeliveryItem(state, "video", target.dataset.videoId);
    state = toggleWorkspacePanel(state, "workspace", false);
  }
  if (action === "enter-canvas") state = enterVideoCanvas(state, target.dataset.videoId);
  if (action === "edit-storyboard") state = enterVideoCanvas(state, target.dataset.videoId);
  if (action === "exit-canvas") state = selectDeliveryItem(state, "video", target.dataset.videoId);
  if (action === "revise-storyboard") {
    state = requestStoryboardRevision(state, target.dataset.storyboardId);
    notice = "只修改了当前故事画板，其他视频保持不变";
  }
  if (action === "approve-storyboard") {
    state = approveStoryboardAndGenerate(state, target.dataset.storyboardId);
    scheduleVideoGenerationCompletion(target.dataset.storyboardId);
    notice = "当前视频已进入生成，其他故事画板仍等待确认";
  }
  if (action === "complete-generation") {
    const timer = generationTimers.get(target.dataset.storyboardId);
    if (timer) window.clearTimeout(timer);
    generationTimers.delete(target.dataset.storyboardId);
    if (state.storyboards?.[target.dataset.storyboardId]?.status === "generating") {
      state = completeVideoGeneration(state, target.dataset.storyboardId);
      notice = "当前视频已生成并完成 AI 初检";
    }
  }
  if (action === "review-video") {
    state = reviewVideo(state, target.dataset.videoId, target.dataset.decision);
    notice = target.dataset.decision === "approve" ? "该视频已通过人工审核，可以导出" : "已保留原版本并进入修改与版本节点";
  }
  if (action === "export-video") {
    state = exportVideo(state, target.dataset.videoId);
    notice = "视频已导出并进入项目成品库";
  }
  if (action === "open-pending-action") {
    if (target.dataset.pendingType === "storyboard_confirmation") {
      state = selectStoryboard(state, target.dataset.itemId);
    } else {
      state = selectDeliveryItem(state, "video", target.dataset.itemId);
    }
    state = toggleWorkspacePanel(state, "workspace", false);
  }
  if (action === "ingest-materials") {
    state = ingestDemoMaterials(state);
    notice = "演示素材已归入本会话并完成用途分类";
  }
  if (action === "promote-asset") {
    state = promoteAssetScope(state, target.dataset.assetId, target.dataset.scope);
    notice = `素材已晋升为${target.dataset.scope === "brand" ? "品牌" : "项目"}资产，未复制底层文件`;
  }
  if (action === "quick-ai") {
    if (state.ui.aiPanelCollapsed) state = toggleWorkspacePanel(state, "ai", false);
    submitAiMessage(target.dataset.prompt || "请继续处理当前内容。");
  }
  if (action === "send-ai") {
    const input = document.querySelector("#ai-input");
    submitAiMessage(input?.value ?? "");
  }

  if (preserveProfileDrafts) renderProfileMenuChange(profileMenuRenderFocus);
  else render();
  if (notice) window.setTimeout(() => {
    notice = "";
    if (preserveProfileDrafts) renderProfileMenuChange();
    else renderPreservingWorklogTransientState();
  }, 2200);
}

function handleSubmit(event) {
  if (event.target.id !== "create-project-form") return;
  event.preventDefault();
  const nameInput = event.target.querySelector("#project-name");
  const descriptionInput = event.target.querySelector("#project-description");
  const name = nameInput?.value.trim() ?? "";
  if (!name) {
    nameInput?.focus();
    nameInput?.setCustomValidity("请输入项目名称");
    nameInput?.reportValidity();
    return;
  }

  nameInput.setCustomValidity("");
  state = createBlankProject(state, {
    name,
    description: descriptionInput?.value ?? "",
    workspaceAssetIds: [...event.target.querySelectorAll('input[name="workspaceAssetIds"]:checked')].map((input) => input.value),
  });
  notice = `项目「${name}」已创建`;
  render();
  window.setTimeout(() => {
    notice = "";
    renderPreservingWorklogTransientState();
  }, 2200);
}

function handleInput(event) {
  if (event.target.id === "project-name") {
    event.target.setCustomValidity("");
  }
  if (event.target.id === "transfer-project-select") {
    transferProjectId = event.target.value;
    transferSessionId = state.projects[transferProjectId]?.sessionIds?.[0] ?? "";
    render();
  }
  if (event.target.id === "transfer-session-select") transferSessionId = event.target.value;
}

function handleKeydown(event) {
  const menu = event.target.closest?.('[role="menu"]');
  const menuNavigationKeys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (menu && menuNavigationKeys.includes(event.key)) {
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    event.preventDefault();
    items[nextIndex]?.focus();
    return;
  }

  if (event.key === "Escape") {
    if (state.ui.profileMenuOpen) {
      event.preventDefault();
      state = toggleProfileMenu(state, false);
      renderProfileMenuChange("profile-button");
      return;
    }
    else if (state.ui.chiefTransferOpen) state = closeChiefTransfer(state);
    else if (state.ui.productScreen === "create") state = cancelCreateProject(state);
    else return;
    render();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    if (document.activeElement?.id === "chief-input") submitChiefMessage(document.activeElement.value);
    if (document.activeElement?.id === "blank-ai-input") startBlankProject(document.activeElement.value);
    if (document.activeElement?.id === "ai-input") submitAiMessage(document.activeElement.value);
    render();
  }
}

app.addEventListener("click", handleClick);
app.addEventListener("input", handleInput);
app.addEventListener("change", handleInput);
app.addEventListener("submit", handleSubmit);
document.addEventListener("keydown", handleKeydown);
render();
