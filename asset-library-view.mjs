function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const aiLabels = {
  not_understood: "尚未让 AI 理解",
  understanding: "AI 理解中",
  understood: "AI 已理解",
  failed: "AI 理解失败",
};

function assetCard(asset, selectedAssetId, { compact = false, source = "" } = {}) {
  const selected = asset.id === selectedAssetId;
  return `
    <button class="library-asset-card ${selected ? "selected" : ""} ${compact ? "compact" : ""}" data-action="select-library-asset" data-asset-id="${escapeHtml(asset.id)}">
      <span class="library-asset-preview type-${escapeHtml(asset.type)}">${escapeHtml(asset.previewLabel ?? asset.type?.toUpperCase() ?? "FILE")}</span>
      <span class="library-asset-copy">
        <strong>${escapeHtml(asset.name)}</strong>
        <small>${escapeHtml(source || `${asset.version ?? "V1"} · ${aiLabels[asset.aiStatus] ?? asset.aiStatus}`)}</small>
      </span>
      <span class="library-asset-status">${selected ? "正在查看" : escapeHtml(asset.version ?? "V1")}</span>
    </button>`;
}

export function renderProjectAssetBrowser({ assets = [], selectedAssetId = null } = {}) {
  return `
    <section class="project-asset-browser">
      <div class="asset-browser-toolbar">
        <div><span>PROJECT ASSETS</span><strong>项目资产</strong><small>${assets.length} 项 · 当前项目工作资料</small></div>
        <div class="asset-browser-actions"><button data-action="open-add-project-assets">＋ 从工作空间添加</button><button data-action="upload-project-asset">↑ 上传项目资产</button></div>
      </div>
      <div class="asset-browser-search"><span>搜索项目资产</span><b>☷</b></div>
      <div class="project-asset-list">
        ${assets.length ? assets.map((reference) => assetCard(reference.asset, selectedAssetId, { compact: true, source: reference.origin === "workspace" ? `工作空间引用 · ${reference.version}` : `项目内上传 · ${reference.version}` })).join("") : `<div class="asset-list-empty"><strong>项目还没有资产</strong><small>从工作空间添加，或上传本项目专用资料。</small></div>`}
      </div>
    </section>`;
}

export function renderAssetPreview({ asset = null, sourceLabel = "", inProject = false, inSession = false } = {}) {
  if (!asset) return `<section class="asset-preview-empty"><span>▧</span><strong>选择一项资产</strong><small>中央或左二选中后，在这里查看详细信息。</small></section>`;
  return `
    <section class="asset-preview-panel">
      <div class="asset-preview-visual type-${escapeHtml(asset.type)}"><span>${escapeHtml(asset.previewLabel ?? "FILE")}</span><small>资产预览占位</small></div>
      <div class="asset-preview-heading"><span>ASSET DETAIL</span><h1>${escapeHtml(asset.name)}</h1><p>${escapeHtml(sourceLabel)}</p></div>
      <div class="asset-preview-meta">
        <div><span>当前版本</span><strong>${escapeHtml(asset.version ?? "V1")}</strong></div>
        <div><span>AI 状态</span><strong>${escapeHtml(aiLabels[asset.aiStatus] ?? asset.aiStatus)}</strong></div>
        <div><span>更新时间</span><strong>${escapeHtml(asset.updatedAt ?? "--")}</strong></div>
      </div>
      <div class="asset-preview-summary"><span>资料摘要</span><p>${escapeHtml(asset.summary ?? "该资产尚未生成摘要。")}</p></div>
      <div class="asset-preview-actions">
        ${asset.aiStatus === "understood" ? `<button class="ghost-button" data-action="understand-selected-asset" data-asset-id="${escapeHtml(asset.id)}">重新理解</button>` : `<button class="ghost-button" data-action="understand-selected-asset" data-asset-id="${escapeHtml(asset.id)}">让 AI 理解</button>`}
        ${inSession ? `<button class="ghost-button" data-action="remove-session-asset" data-asset-id="${escapeHtml(asset.id)}">从本会话移除</button>` : `<button class="primary-button" data-action="add-session-asset" data-asset-id="${escapeHtml(asset.id)}">加入当前会话</button>`}
        ${inProject ? "" : `<button class="primary-button" data-action="add-project-asset" data-asset-id="${escapeHtml(asset.id)}">加入当前项目</button>`}
      </div>
    </section>`;
}

export function renderAssetCenterView({ scope = "workspace", folders = [], assets = [], selectedAssetId = null, counts = {}, selectedAsset = null, sourceLabel = "", inProject = false, inSession = false } = {}) {
  const scopeLabels = { workspace: "工作空间资产", project: "当前项目资产", session: "当前会话素材" };
  return `
    <div class="asset-center-shell">
      <aside class="asset-scope-sidebar">
        <div class="asset-center-brand"><strong>资产中心</strong><small>统一管理营销资料</small></div>
        <span class="asset-scope-label">资产范围</span>
        ${Object.entries(scopeLabels).map(([key, label]) => `<button class="${scope === key ? "selected" : ""}" data-action="set-asset-scope" data-scope="${key}"><span>${label}</span><small>${counts[key] ?? 0}</small></button>`).join("")}
        <p>左侧只切换范围；文件夹和资产都在中央浏览。</p>
      </aside>
      <main class="asset-center-main">
        <div class="asset-center-toolbar">
          <div><span>ASSET CENTER</span><h1>${scopeLabels[scope]}</h1><p>${scope === "workspace" ? "公司长期资产，可跨项目复用。" : scope === "project" ? "当前项目允许使用的工作资料。" : "AI 在当前会话中重点使用的上下文。"}</p></div>
          <div>${scope === "workspace" ? `<button class="ghost-button" data-action="create-workspace-folder">＋ 新建文件夹</button>` : ""}${scope === "session" ? `<button class="primary-button" data-action="open-session-asset-picker">＋ 添加资产</button>` : `<button class="primary-button" data-action="upload-library-asset" data-scope="${scope}">↑ 上传资产</button>`}</div>
        </div>
        <div class="asset-center-search"><span>⌕ 搜索当前范围内的文件夹与资产</span><button>筛选</button><button>网格 / 列表</button></div>
        ${scope === "workspace" ? `<section class="asset-folder-section"><div class="asset-section-title"><strong>文件夹</strong><small>${folders.length} 个</small></div><div class="asset-folder-grid">${folders.map((folder) => `<button data-action="open-asset-folder" data-folder-id="${escapeHtml(folder.id)}"><span>▰</span><strong>${escapeHtml(folder.name)}</strong><small>${folder.assetIds?.length ?? 0} 项资产</small></button>`).join("")}<button class="create-folder-card" data-action="create-workspace-folder"><span>＋</span><strong>新建文件夹</strong><small>建立新的整理位置</small></button></div></section>` : ""}
        <section class="asset-grid-section"><div class="asset-section-title"><strong>资产</strong><small>${assets.length} 项</small></div><div class="asset-library-grid">${assets.length ? assets.map((asset) => assetCard(asset, selectedAssetId)).join("") : `<div class="asset-list-empty"><strong>当前范围还没有资产</strong><small>上传资产或从工作空间添加。</small></div>`}</div></section>
      </main>
      <aside class="asset-center-detail">${renderAssetPreview({ asset: selectedAsset, sourceLabel, inProject, inSession })}</aside>
    </div>`;
}

export function renderSessionContextChips(assets = []) {
  if (!assets.length) return "";
  return `<div class="session-asset-chips">${assets.map((asset) => `<span><b>${escapeHtml(asset.name)}</b><button data-action="remove-session-asset" data-asset-id="${escapeHtml(asset.id)}" aria-label="移除 ${escapeHtml(asset.name)}">×</button></span>`).join("")}</div>`;
}

export function renderSessionAssetPicker({ open = false, scope = "project", assets = [], selectedIds = [] } = {}) {
  if (!open) return "";
  return `
    <div class="session-asset-picker-backdrop" data-action="close-session-asset-picker" data-backdrop="true">
      <section class="session-asset-picker" role="dialog" aria-modal="true" aria-label="添加资产到当前会话">
        <div class="session-asset-picker-head"><div><span>SESSION CONTEXT</span><h2>添加资产</h2><p>只为当前 AI 会话补充重点上下文。</p></div><button data-action="close-session-asset-picker" aria-label="关闭">×</button></div>
        <div class="session-asset-picker-tabs"><button class="${scope === "project" ? "selected" : ""}" data-action="set-asset-picker-scope" data-scope="project">项目资产</button><button class="${scope === "workspace" ? "selected" : ""}" data-action="set-asset-picker-scope" data-scope="workspace">工作空间资产</button></div>
        <div class="session-asset-picker-list">${assets.map((asset) => `<label><input type="checkbox" data-session-asset-choice value="${escapeHtml(asset.id)}" ${selectedIds.includes(asset.id) ? "checked" : ""}><span class="asset-choice-mark">${escapeHtml(asset.previewLabel ?? "FILE")}</span><span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(asset.version ?? "V1")} · ${escapeHtml(aiLabels[asset.aiStatus] ?? asset.aiStatus)}</small></span></label>`).join("")}</div>
        <div class="session-asset-picker-foot"><span>默认作用范围：<b>仅用于本会话</b></span><div><button class="ghost-button" data-action="close-session-asset-picker">取消</button><button class="primary-button" data-action="confirm-session-assets">加入当前会话</button></div></div>
      </section>
    </div>`;
}
