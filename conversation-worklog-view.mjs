const semanticLabels = {
  queued: "待处理",
  running: "进行中",
  needs_action: "待你处理",
  completed: "已完成",
  blocked: "异常",
  skipped: "已跳过",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pad(value) {
  return String(value ?? 0).padStart(2, "0");
}

function semantic(value) {
  return semanticLabels[value] ? value : "queued";
}

function resolveNode(nodes, nodeKey) {
  return nodes.find((node) => [node.key, node.shortTitle, node.title, node.id].includes(nodeKey)) ?? null;
}

export function createTaskPreparationTimerRegistry({
  setIntervalFn = globalThis.setInterval,
  clearIntervalFn = globalThis.clearInterval,
  totalSteps = 13,
  delay = 500,
} = {}) {
  const timers = new Map();
  const stop = (taskId) => {
    const timer = timers.get(taskId);
    if (!timer) return false;
    clearIntervalFn(timer.id);
    timers.delete(taskId);
    return true;
  };
  return {
    start(taskId, onTick) {
      stop(taskId);
      let completedSteps = 0;
      const id = setIntervalFn(() => {
        onTick(taskId, completedSteps);
        completedSteps += 1;
        if (completedSteps >= totalSteps) stop(taskId);
      }, delay);
      timers.set(taskId, { id });
      return id;
    },
    stop,
    stopAll() {
      for (const taskId of [...timers.keys()]) stop(taskId);
    },
    has(taskId) {
      return timers.has(taskId);
    },
    get size() {
      return timers.size;
    },
  };
}

export function completeScheduledVideoGeneration(state, storyboardId, completeFn) {
  const storyboard = state.storyboards?.[storyboardId] ?? null;
  const targetTaskId = storyboard?.taskId ?? null;
  const shouldRender = Boolean(
    targetTaskId
    && state.active?.taskId === targetTaskId
    && state.ui?.productScreen === "workspace",
  );
  const activeBefore = structuredClone(state.active ?? {});
  const composerBefore = structuredClone(state.composer ?? {});
  const nextState = completeFn(state, storyboardId);
  if (!shouldRender) {
    nextState.active = activeBefore;
    nextState.composer = composerBefore;
  }
  return {
    state: nextState,
    shouldRender,
    notice: shouldRender ? "当前视频已生成并完成 AI 初检，等待人工审核" : "",
  };
}

export function captureWorklogTransientState(root) {
  const input = root?.querySelector?.("#ai-input") ?? null;
  const timeline = root?.querySelector?.(".worklog-timeline") ?? null;
  const details = [...(root?.querySelectorAll?.(".worklog-event[data-node-key]") ?? [])];
  return {
    inputValue: input?.value ?? "",
    selectionStart: input?.selectionStart ?? 0,
    selectionEnd: input?.selectionEnd ?? 0,
    inputFocused: Boolean(input && root?.activeElement === input),
    timelineScrollTop: timeline?.scrollTop ?? 0,
    detailStates: Object.fromEntries(details.map((detail) => [detail.dataset.nodeKey, detail.open])),
  };
}

export function restoreWorklogTransientState(root, snapshot) {
  if (!snapshot) return;
  const input = root?.querySelector?.("#ai-input") ?? null;
  const timeline = root?.querySelector?.(".worklog-timeline") ?? null;
  const details = [...(root?.querySelectorAll?.(".worklog-event[data-node-key]") ?? [])];
  if (input) {
    input.value = snapshot.inputValue;
    if (snapshot.inputFocused) {
      input.focus?.();
      input.setSelectionRange?.(snapshot.selectionStart, snapshot.selectionEnd);
    }
  }
  if (timeline) timeline.scrollTop = snapshot.timelineScrollTop;
  for (const detail of details) {
    if (Object.hasOwn(snapshot.detailStates ?? {}, detail.dataset.nodeKey)) {
      detail.open = snapshot.detailStates[detail.dataset.nodeKey];
    }
  }
}

function renderProgress(progress) {
  if (!progress?.total) return "";
  const current = Math.max(0, Math.min(progress.current ?? 0, progress.total));
  const percent = Math.round((current / progress.total) * 100);
  return `<div class="worklog-progress" role="progressbar" aria-label="节点进度" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${progress.total}"><span style="width:${percent}%"></span></div><span class="worklog-progress-label">${current}/${progress.total}</span>`;
}

function renderStageRail(nodes) {
  return `
    <section class="worklog-stages" aria-label="营销任务十节点进度">
      <div class="worklog-stages-heading"><span>营销 Flow</span><strong>从理解到交付</strong></div>
      <div class="worklog-stage-track">
        ${nodes.map((node, index) => {
          const tone = semantic(node.semantic);
          const unavailable = ["queued", "skipped"].includes(tone);
          return `<button class="worklog-stage is-${tone}" data-action="open-worklog-node" data-node-id="${escapeHtml(node.id)}" title="${escapeHtml(node.title)} · ${semanticLabels[tone]}" aria-label="节点 ${pad(node.index ?? index + 1)}：${escapeHtml(node.title)}，${semanticLabels[tone]}"${unavailable ? " disabled aria-disabled=\"true\"" : ""}><span>${tone === "completed" ? "✓" : pad(node.index ?? index + 1)}</span><b>${escapeHtml(node.shortTitle ?? node.title)}</b><i>${escapeHtml(semanticLabels[tone])}</i></button>`;
        }).join("")}
      </div>
    </section>`;
}

function nodePrimaryAction(node) {
  if (!node) return "";
  const labels = {
    understanding: "查看理解结果",
    brief: "打开完整 Brief",
    direction: "查看营销方向",
    script: "查看脚本总览",
    generation: "查看视频槽位",
    "ai-check": "查看初检结果",
    "human-review": "查看待审视频",
    versions: "查看版本",
    delivery: "查看交付结果",
  };
  const label = labels[node.key];
  if (!label) return "";
  return `<button class="worklog-secondary" data-action="open-worklog-node" data-node-id="${escapeHtml(node.id)}">${label}</button>`;
}

function renderStoryboardDecisions(storyboards, productImage, currentObject = null) {
  const pending = storyboards.filter((item) => ["pending_review", "revision_requested"].includes(item.status));
  if (!pending.length) return "";
  return `<div class="storyboard-decision-list">${pending.map((storyboard) => {
    const index = Math.max(0, storyboards.findIndex((item) => item.id === storyboard.id));
    const sequence = pad(index + 1);
    const isCurrent = Boolean(
      currentObject?.centralOpen
      && currentObject.mode === "video-package"
      && currentObject.stage === "storyboard"
      && (currentObject.storyboardId === storyboard.id || currentObject.videoId === storyboard.videoId),
    );
    return `
      <article class="storyboard-decision-card${isCurrent ? " is-current" : ""}">
        <div class="storyboard-decision-thumb"><img src="${escapeHtml(productImage)}" alt="${escapeHtml(storyboard.title)}"><span>${sequence}</span></div>
        <div class="storyboard-decision-copy"><small>画板 ${sequence} · V${escapeHtml(storyboard.version ?? 1)}</small><strong>${escapeHtml(storyboard.title)}</strong><p>${escapeHtml(storyboard.angle)} · ${escapeHtml(storyboard.duration)}</p></div>
        <div class="storyboard-decision-actions">
          <button class="worklog-secondary" data-action="select-storyboard" data-storyboard-id="${escapeHtml(storyboard.id)}"${isCurrent ? " disabled aria-disabled=\"true\"" : ""}>${isCurrent ? "正在查看" : "打开查看"}</button>
          <button class="worklog-secondary" data-action="revise-storyboard" data-storyboard-id="${escapeHtml(storyboard.id)}">让 AI 修改</button>
          <button class="worklog-primary" data-action="approve-storyboard" data-storyboard-id="${escapeHtml(storyboard.id)}">确认画板 ${sequence}，并生成视频 ${sequence}</button>
        </div>
      </article>`;
  }).join("")}</div>`;
}

function isCurrentVideo(currentObject, videoId) {
  return Boolean(
    currentObject?.centralOpen
    && currentObject.mode === "video-package"
    && currentObject.stage === "video"
    && currentObject.videoId === videoId,
  );
}

function renderHumanReviewActions(videos, currentObject = null) {
  const pending = videos.filter((video) => video.humanReview === "待审核");
  if (!pending.length) return "";
  return `<div class="video-decision-list">
    ${pending.map((video) => {
      const viewing = isCurrentVideo(currentObject, video.id);
      return `<article class="video-decision-card${viewing ? " is-current" : ""}"><div><small>${escapeHtml(video.version ?? "v1")} · AI 初检通过</small><strong>${escapeHtml(video.title)}</strong></div><div><button class="worklog-secondary" data-action="select-video" data-video-id="${escapeHtml(video.id)}"${viewing ? " disabled aria-disabled=\"true\"" : ""}>${viewing ? "正在查看" : "打开查看"}</button><button class="worklog-secondary is-danger" data-action="review-video" data-video-id="${escapeHtml(video.id)}" data-decision="changes_requested">要求修改</button><button class="worklog-primary" data-action="review-video" data-video-id="${escapeHtml(video.id)}" data-decision="approve">人工通过</button></div></article>`;
    }).join("")}
  </div>`;
}

function getDeliveryStats(videos) {
  return {
    available: videos.filter((video) => video.humanReview === "人工通过" && video.status !== "已导出"),
    exported: videos.filter((video) => video.status === "已导出"),
  };
}

function renderDeliveryActions(videos, currentObject = null) {
  const { available, exported } = getDeliveryStats(videos);
  return `<div class="worklog-delivery-summary"><strong>可交付 ${available.length} 条 · 已导出 ${exported.length} 条</strong><small>只有人工审核通过的视频可以导出</small></div>${available.length ? `<div class="video-decision-list">${available.map((video) => {
    const viewing = isCurrentVideo(currentObject, video.id);
    return `<article class="video-decision-card is-approved${viewing ? " is-current" : ""}"><div><small>${escapeHtml(video.version ?? "v1")} · 人工通过</small><strong>${escapeHtml(video.title)}</strong></div><div><button class="worklog-secondary" data-action="select-video" data-video-id="${escapeHtml(video.id)}"${viewing ? " disabled aria-disabled=\"true\"" : ""}>${viewing ? "正在查看" : "打开查看"}</button><button class="worklog-primary" data-action="export-video" data-video-id="${escapeHtml(video.id)}">导出视频</button></div></article>`;
  }).join("")}</div>` : ""}`;
}

function renderStructuredSummary(node, records, currentObject = null) {
  const assets = records.assets ?? [];
  const videos = records.videos ?? [];
  const storyboards = records.storyboards ?? [];
  if (node?.key === "understanding") {
    const categories = new Set(assets.map((asset) => asset.type).filter(Boolean)).size;
    const excluded = assets.filter((asset) => asset.usage === "excluded").length;
    const missing = assets.length ? "缺失信息 0 项" : "缺失信息：商品资料与参考素材";
    return `<div class="worklog-summary-grid"><span><b>素材 ${assets.length} 项</b><small>已读取</small></span><span><b>分类 ${categories} 类</b><small>自动识别</small></span><span><b>排除 ${excluded} 项</b><small>不参与生成</small></span><span><b>${missing}</b><small>可继续补充</small></span></div>`;
  }
  if (node?.key === "brief") {
    return `<div class="worklog-summary-list"><span><small>营销目标</small><b>建立高频场景认知并促进点击与收藏</b></span><span><small>目标受众</small><b>美国大学生、通勤白领与健身人群</b></span><span><small>平台</small><b>TikTok · 9:16 短视频</b></span><span><small>核心卖点</small><b>便携、快速、易清洗、USB-C 充电</b></span></div>`;
  }
  if (node?.key === "direction") {
    const directions = [...new Set(storyboards.map((item) => item.angle).filter(Boolean))];
    return `<div class="worklog-summary-list"><span><small>推荐方向</small><b>${escapeHtml(directions[0] ?? "真实场景痛点")}</b></span><span><small>推荐理由</small><b>高频使用场景明确，前三秒容易建立需求</b></span><span><small>备选方向</small><b>${escapeHtml(directions.slice(1).join("、") || "卖点演示、使用前后对比")}</b></span></div>`;
  }
  if (node?.key === "ai-check") {
    const passed = videos.filter((video) => video.aiCheck === "通过").length;
    const risks = videos.filter((video) => ["需检查", "疑似问题", "不可用"].includes(video.aiCheck)).length;
    return `<div class="worklog-summary-grid is-two"><span><b>初检通过 ${passed} 条</b><small>仍需人工审核</small></span><span><b>风险 ${risks} 条</b><small>${risks ? "请查看风险时间点" : "暂未发现明显问题"}</small></span></div>`;
  }
  if (node?.key === "versions") {
    const historyCount = videos.reduce((sum, video) => sum + (video.versionHistory?.length ?? 0), 0);
    const requested = videos.filter((video) => video.humanReview === "需修改" || video.status === "待修改").length;
    const message = historyCount ? `存在 ${historyCount} 条可对比历史版本` : requested ? `${requested} 条视频正在生成新版本` : "当前无需修改";
    return `<div class="worklog-delivery-summary"><strong>${message}</strong><small>原版本会保留，可随时打开对比</small></div>`;
  }
  if (node?.key === "delivery") return renderDeliveryActions(videos, currentObject);
  return "";
}

function renderNodeEvent(item, node, records, productImage, currentObject = null) {
  const tone = semantic(item.semantic ?? node?.semantic);
  if (tone === "queued") return "";
  const isOpen = !["completed", "skipped"].includes(tone);
  const progress = node?.progress;
  let specialized = "";
  if (node?.key === "storyboard" && tone === "needs_action") specialized = renderStoryboardDecisions(records.storyboards, productImage, currentObject);
  if (node?.key === "human-review") specialized = renderHumanReviewActions(records.videos, currentObject);
  const structuredSummary = renderStructuredSummary(node, records, currentObject);
  const primaryAction = nodePrimaryAction(node);
  const secondaryAction = node?.key === "understanding"
    ? `<button class="worklog-secondary" data-action="quick-ai" data-prompt="我要补充商品或素材信息。">补充资料</button>`
    : node?.key === "direction"
      ? `<button class="worklog-secondary" data-action="quick-ai" data-prompt="请更换当前营销方向并说明理由。">更换方向</button>`
      : node?.key === "script"
        ? `<button class="worklog-secondary" data-action="quick-ai" data-prompt="请修改我指定的视频脚本。">修改指定脚本</button>`
        : node?.key === "ai-check"
          ? `<button class="worklog-secondary" data-action="quick-ai" data-prompt="请按 AI 初检问题优化对应视频。">让 AI 优化</button>`
          : "";
  const deliveryStats = node?.key === "delivery" ? getDeliveryStats(records.videos) : null;
  const eventTitle = node?.key === "versions" && tone === "skipped"
    ? "当前无需修改"
    : deliveryStats
      ? `交付：可交付 ${deliveryStats.available.length} 条 · 已导出 ${deliveryStats.exported.length} 条`
      : item.title ?? node?.title;
  return `
    <details class="worklog-event is-${tone}" data-node-key="${escapeHtml(node?.key ?? item.nodeKey)}"${isOpen ? " open" : ""}>
      <summary><span class="worklog-event-index">${pad(node?.index)}</span><span><small>${escapeHtml(node?.title ?? "AI 工作记录")}</small><strong>${escapeHtml(eventTitle)}</strong></span><span class="worklog-event-status">${escapeHtml(semanticLabels[tone])}</span></summary>
      <div class="worklog-event-body"><p>${escapeHtml(item.text ?? node?.summary)}</p>${renderProgress(progress)}${structuredSummary}${specialized}<div class="worklog-event-actions">${primaryAction}${secondaryAction}</div></div>
    </details>`;
}

function renderBlockedEvent(action, records) {
  const itemIds = action?.itemIds ?? [];
  const blockedVideos = itemIds.map((videoId) => records.videos.find((video) => video.id === videoId) ?? {
    id: videoId,
    title: `异常对象 ${videoId}`,
    status: "异常",
  });
  return `
    <details class="worklog-event is-blocked" data-node-key="blocked" open>
      <summary><span class="worklog-event-index">!</span><span><small>异常处理</small><strong>异常待处理 · ${blockedVideos.length} 项</strong></span><span class="worklog-event-status">异常</span></summary>
      <div class="worklog-event-body"><p>生成失败或初检不可用，需要查看问题后重试或调整。</p>
        <div class="video-decision-list">
          ${blockedVideos.map((video) => `<article class="video-decision-card"><div><small>${escapeHtml(video.status ?? "异常")}</small><strong>${escapeHtml(video.title)}</strong><p>生成失败或初检不可用</p></div><div><button class="worklog-secondary" data-action="select-video" data-video-id="${escapeHtml(video.id)}">查看问题视频</button><button class="worklog-primary" data-action="quick-ai" data-prompt="请分析并处理视频「${escapeHtml(video.title)}」的异常。">让 AI 处理</button></div></article>`).join("")}
        </div>
      </div>
    </details>`;
}

function renderTimeline(viewModel, records, productImage, snapshot, currentObject = null) {
  const items = viewModel.timeline ?? [];
  const renderedNodeKeys = new Set(items.map((item) => resolveNode(viewModel.nodes ?? [], item.nodeKey)?.key).filter(Boolean));
  const supplementalItems = [];
  const pendingReview = records.videos.filter((video) => video.humanReview === "待审核");
  if (pendingReview.length && !renderedNodeKeys.has("human-review")) {
    supplementalItems.push({ nodeKey: "human-review", semantic: "needs_action", title: `${pendingReview.length} 条视频待人工审核`, text: "人工审核通过后才能进入交付与导出。", kind: "node-event", role: "assistant" });
  }
  const deliveryStats = getDeliveryStats(records.videos);
  const versionsNode = (viewModel.nodes ?? []).find((node) => node.key === "versions");
  if ((deliveryStats.available.length || deliveryStats.exported.length) && versionsNode?.semantic === "skipped" && !renderedNodeKeys.has("versions")) {
    supplementalItems.push({ nodeKey: "versions", semantic: "skipped", title: "当前无需修改", text: "人工审核已通过，本轮不需要进入修改流程。", kind: "node-event", role: "assistant" });
  }
  if ((deliveryStats.available.length || deliveryStats.exported.length) && !renderedNodeKeys.has("delivery")) {
    supplementalItems.push({
      nodeKey: "delivery",
      semantic: deliveryStats.available.length ? "running" : "completed",
      title: "交付与导出",
      text: deliveryStats.available.length ? "人工审核通过的视频已经可以导出。" : "已导出视频已进入项目成品库。",
      kind: "node-event",
      role: "assistant",
    });
  }
  const blockedAction = (viewModel.pendingActions ?? []).find((action) => action.type === "blocked" && action.count > 0);
  const hasBlockedTimelineEvent = items.some((item) => semantic(item.semantic) === "blocked");
  return `
    <div class="worklog-timeline" role="log" aria-live="polite" aria-relevant="additions text">
      ${snapshot ? `<article class="context-source-card"><div><span>来自营销首席官</span><small>不可变快照</small></div><strong>${escapeHtml(snapshot.title)}</strong><p>${escapeHtml(snapshot.summary)}</p><button class="worklog-secondary" data-action="open-source-chief" data-chat-id="${escapeHtml(snapshot.sourceChatId)}">查看原讨论</button></article>` : ""}
      ${blockedAction && !hasBlockedTimelineEvent ? renderBlockedEvent(blockedAction, records) : ""}
      ${[...items, ...supplementalItems].map((item) => {
        if (item.role === "user" || item.kind === "user-message") return `<article class="chat-message user"><div>${escapeHtml(item.text)}</div></article>`;
        if (item.kind === "node-event" || item.nodeKey) return renderNodeEvent(item, resolveNode(viewModel.nodes ?? [], item.nodeKey), records, productImage, currentObject);
        return `<article class="chat-message assistant"><span class="mini-ai">AI</span><div><p>${escapeHtml(item.text)}</p></div></article>`;
      }).join("")}
    </div>`;
}

function renderPendingBar(actions) {
  const sorted = [...actions].sort((a, b) => a.priority - b.priority);
  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  const first = sorted[0];
  const count = (type) => sorted.find((item) => item.type === type)?.count ?? 0;
  if (!total) return `<div class="worklog-pending is-clear"><span>✓</span><div><strong>暂时没有待处理事项</strong><small>AI 会继续同步任务进展</small></div></div>`;
  return `
    <button class="worklog-pending" data-action="open-pending-action" data-pending-type="${escapeHtml(first.type)}" data-item-id="${escapeHtml(first.itemIds?.[0])}">
      <span class="worklog-pending-icon">!</span><div><strong>待你处理 <b>${total}</b></strong><small>${count("blocked")} 项异常 · ${count("human_review")} 条待审核 · ${count("storyboard_confirmation")} 张画板</small></div><i>打开第一项 →</i>
    </button>`;
}

function renderComposer(contextLabel) {
  return `
    <div class="ai-composer worklog-composer">
      <div class="ai-quick-actions"><button data-action="quick-ai" data-prompt="总结当前营销任务的进展和下一步。">总结进展</button><button data-action="quick-ai" data-prompt="检查当前交付物是否符合营销目标。">检查目标</button><button data-action="quick-ai" data-prompt="给我三个可以继续优化的方向。">优化建议</button></div>
      <div class="composer-context"><span>AI</span>${escapeHtml(contextLabel)}</div>
      <textarea id="ai-input" rows="3" placeholder="告诉 AI 你想做什么；可上传图片、视频、链接…"></textarea>
      <div class="composer-actions"><div><button aria-label="添加附件">＋</button><button aria-label="快捷指令">⌘</button><button aria-label="表情">☺</button></div><button class="send-button" data-action="send-ai" aria-label="发送">➤</button></div>
    </div>`;
}

export function renderConversationWorklog(viewModel, options = {}) {
  const records = {
    assets: options.records?.assets ?? [],
    storyboards: options.records?.storyboards ?? [],
    videos: options.records?.videos ?? [],
  };
  const context = viewModel.context ?? {};
  const projectName = context.project?.name ?? "未选择项目";
  const sessionTitle = viewModel.session?.title ?? "未选择会话";
  const objectTitle = context.video?.title ?? context.task?.name ?? "项目总览";
  const storyboardNode = (viewModel.nodes ?? []).find((node) => node.key === "storyboard");
  const visiblePendingActions = (viewModel.pendingActions ?? []).filter((action) =>
    action.type !== "storyboard_confirmation" || storyboardNode?.semantic === "needs_action",
  );
  return `
    <div class="worklog-context"><span>当前上下文</span><div><b>${escapeHtml(projectName)}</b><i>›</i><b>${escapeHtml(sessionTitle)}</b><i>›</i><strong>${escapeHtml(objectTitle)}</strong></div></div>
    ${renderStageRail(viewModel.nodes ?? [])}
    ${renderTimeline(viewModel, records, options.productImage ?? "", options.snapshot ?? null, options.currentObject ?? null)}
    ${renderPendingBar(visiblePendingActions)}
    ${renderComposer(options.composerContext ?? `当前任务：${objectTitle}`)}
  `;
}
