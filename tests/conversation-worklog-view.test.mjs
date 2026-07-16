import assert from "node:assert/strict";
import test from "node:test";

let renderConversationWorklog;
let createTaskPreparationTimerRegistry;
let captureWorklogTransientState;
let restoreWorklogTransientState;
let completeScheduledVideoGeneration;
try {
  ({
    renderConversationWorklog,
    createTaskPreparationTimerRegistry,
    captureWorklogTransientState,
    restoreWorklogTransientState,
    completeScheduledVideoGeneration,
  } = await import("../conversation-worklog-view.mjs"));
} catch {
  renderConversationWorklog = undefined;
}

test("exposes a pure conversation worklog renderer", () => {
  assert.equal(typeof renderConversationWorklog, "function");
});

function node(index, key, title, semantic, progress = null) {
  return {
    id: `node-${key}`,
    index,
    key,
    title,
    shortTitle: title,
    semantic,
    status: semantic,
    summary: `${title}摘要`,
    record: `${title}记录`,
    ...(progress ? { progress } : {}),
  };
}

function fixture(overrides = {}) {
  const nodes = [
    node(1, "understanding", "商品 / 素材理解", "completed"),
    node(2, "brief", "Marketing Brief", "completed"),
    node(3, "direction", "营销方向选择", "completed"),
    node(4, "script", "脚本", "running", { current: 3, total: 5 }),
    node(5, "storyboard", "故事画板确认", "needs_action", { current: 1, total: 5 }),
    node(6, "generation", "视频生成", "running", { current: 1, total: 5 }),
    node(7, "ai-check", "AI 初检", "running", { current: 1, total: 5 }),
    node(8, "human-review", "人工审核", "needs_action", { current: 0, total: 5 }),
    node(9, "versions", "修改与版本", "queued"),
    node(10, "delivery", "交付与导出", "queued"),
  ];
  return {
    session: { id: "session-1", title: "首批营销视频", projectId: "project-1" },
    context: {
      project: { id: "project-1", name: "便携式榨汁杯 TikTok" },
      task: { id: "task-1", name: "首批 5 条营销视频" },
      video: { id: "video-1", title: "30 秒快速早餐" },
    },
    nodes,
    timeline: [
      { id: "message-1", kind: "user-message", role: "user", semantic: "completed", text: "生成 5 条视频" },
      { id: "event-1", kind: "node-event", role: "assistant", nodeKey: "understanding", semantic: "completed", title: "商品理解已完成", text: "识别了 8 个素材。" },
      { id: "event-2", kind: "node-event", role: "assistant", nodeKey: "script", semantic: "running", title: "正在生成脚本 3/5", text: "已完成 3/5 份脚本。" },
      { id: "event-3", kind: "node-event", role: "assistant", nodeKey: "storyboard", semantic: "needs_action", title: "故事画板待确认", text: "逐条确认后生成对应视频。" },
      { id: "event-4", kind: "node-event", role: "assistant", nodeKey: "human-review", semantic: "needs_action", title: "1 条视频待人工审核", text: "人工审核后才能导出。" },
    ],
    pendingActions: [
      { type: "blocked", priority: 0, label: "异常待处理", count: 1, itemIds: ["video-blocked"] },
      { type: "human_review", priority: 1, label: "视频待人工审核", count: 1, itemIds: ["video-review"] },
      { type: "storyboard_confirmation", priority: 2, label: "故事画板待确认", count: 2, itemIds: ["storyboard-1", "storyboard-2"] },
    ],
    ...overrides,
  };
}

const records = {
  storyboards: [
    {
      id: "storyboard-1",
      videoId: "video-1",
      title: "早八赶时间 Hook",
      angle: "30 秒快速早餐",
      duration: "18s",
      version: 2,
      status: "pending_review",
    },
    {
      id: "storyboard-2",
      videoId: "video-2",
      title: "宿舍桌面轻早餐",
      angle: "宿舍果昔场景",
      duration: "20s",
      version: 1,
      status: "revision_requested",
    },
  ],
  videos: [
    { id: "video-1", storyboardId: "storyboard-1", title: "30 秒快速早餐", status: "待生成", version: "v2", humanReview: "待生成" },
    { id: "video-review", storyboardId: "storyboard-review", title: "健身后即时补给", status: "可预览", version: "v1", humanReview: "待审核" },
    { id: "video-approved", storyboardId: "storyboard-approved", title: "通勤补能", status: "可交付", version: "v1", humanReview: "人工通过" },
  ],
};

test("renders all ten nodes and keeps simultaneous active semantics visible", () => {
  const html = renderConversationWorklog(fixture(), { records });
  assert.equal((html.match(/class="worklog-stage /g) ?? []).length, 10);
  assert.match(html, /01[\s\S]*商品 \/ 素材理解/);
  assert.match(html, /10[\s\S]*交付与导出/);
  assert.equal((html.match(/worklog-stage is-running/g) ?? []).length, 3);
  assert.equal((html.match(/worklog-stage is-needs_action/g) ?? []).length, 2);
});

test("folds completed node events while expanding running progress", () => {
  const html = renderConversationWorklog(fixture(), { records });
  assert.match(html, /<details class="worklog-event is-completed"[^>]*>[\s\S]*商品理解已完成/);
  assert.doesNotMatch(html, /<details class="worklog-event is-completed"[^>]* open/);
  assert.match(html, /<details class="worklog-event is-running"[^>]* open[\s\S]*正在生成脚本 3\/5/);
  assert.match(html, /class="worklog-progress-label"[^>]*>3\/5</);
});

test("renders an exact per-storyboard confirmation card", () => {
  const html = renderConversationWorklog(fixture(), { records, productImage: "./product.png" });
  assert.match(html, /class="storyboard-decision-thumb"[\s\S]*src="\.\/product\.png"/);
  assert.match(html, /30 秒快速早餐/);
  assert.match(html, /18s/);
  assert.match(html, /V2/);
  assert.match(html, /data-action="select-storyboard" data-storyboard-id="storyboard-1"[\s\S]*打开查看/);
  assert.match(html, /data-action="revise-storyboard" data-storyboard-id="storyboard-1"[\s\S]*让 AI 修改/);
  assert.match(html, /data-action="approve-storyboard" data-storyboard-id="storyboard-1"[\s\S]*确认画板 01，并生成视频 01/);
});

test("deduplicates a storyboard card that is already open in the central workspace", () => {
  const html = renderConversationWorklog(fixture(), {
    records,
    productImage: "./product.png",
    currentObject: {
      centralOpen: true,
      mode: "video-package",
      videoId: "video-1",
      storyboardId: "storyboard-1",
      stage: "storyboard",
    },
  });
  assert.match(html, /storyboard-decision-card is-current/);
  assert.match(html, /data-storyboard-id="storyboard-1"[^>]*disabled[^>]*>正在查看</);
  assert.match(html, /data-storyboard-id="storyboard-2"[^>]*>打开查看</);
});

test("renders human review actions and an export action after approval", () => {
  const html = renderConversationWorklog(fixture(), { records });
  assert.match(html, /data-action="review-video" data-video-id="video-review" data-decision="approve"[\s\S]*人工通过/);
  assert.match(html, /data-action="review-video" data-video-id="video-review" data-decision="changes_requested"[\s\S]*要求修改/);
  assert.match(html, /data-action="export-video" data-video-id="video-approved"[\s\S]*导出视频/);
});

test("deduplicates a video card that is already open in the central workspace", () => {
  const html = renderConversationWorklog(fixture(), {
    records,
    currentObject: {
      centralOpen: true,
      mode: "video-package",
      videoId: "video-review",
      stage: "video",
    },
  });
  assert.match(html, /video-decision-card is-current/);
  assert.match(html, /data-video-id="video-review"[^>]*disabled[^>]*>正在查看</);
});

test("summarizes pending work in priority order and opens the first item", () => {
  const html = renderConversationWorklog(fixture(), { records });
  assert.match(html, /待你处理 <b>4<\/b>/);
  assert.match(html, /1 项异常[\s\S]*1 条待审核[\s\S]*2 张画板/);
  assert.match(html, /data-action="open-pending-action" data-pending-type="blocked" data-item-id="video-blocked"/);
});

test("keeps queued nodes in the stage rail but out of the timeline", () => {
  const view = fixture({
    timeline: fixture().timeline.filter((item) => item.nodeKey !== "storyboard"),
  });
  const html = renderConversationWorklog(view, { records });
  assert.match(html, /worklog-stage is-queued[\s\S]*修改与版本/);
  assert.doesNotMatch(html, /class="worklog-event is-queued"/);
});

test("keeps preparation timers isolated by task id", () => {
  assert.equal(typeof createTaskPreparationTimerRegistry, "function");
  let nextTimerId = 1;
  const callbacks = new Map();
  const cleared = [];
  const registry = createTaskPreparationTimerRegistry({
    setIntervalFn(callback) {
      const id = nextTimerId++;
      callbacks.set(id, callback);
      return id;
    },
    clearIntervalFn(id) {
      cleared.push(id);
      callbacks.delete(id);
    },
    totalSteps: 2,
    delay: 500,
  });
  const ticks = [];
  registry.start("task-a", (taskId) => ticks.push(taskId));
  registry.start("task-b", (taskId) => ticks.push(taskId));
  assert.equal(registry.size, 2);
  callbacks.get(1)();
  callbacks.get(1)();
  assert.equal(registry.has("task-a"), false);
  assert.equal(registry.has("task-b"), true);
  callbacks.get(2)();
  assert.deepEqual(ticks, ["task-a", "task-a", "task-b"]);
  registry.stopAll();
  assert.equal(registry.size, 0);
  assert.deepEqual(cleared, [1, 2]);
});

test("captures and restores AI draft focus timeline scroll and manual detail state", () => {
  assert.equal(typeof captureWorklogTransientState, "function");
  assert.equal(typeof restoreWorklogTransientState, "function");
  const beforeInput = {
    value: "不要丢掉这段输入",
    selectionStart: 3,
    selectionEnd: 8,
  };
  const beforeTimeline = { scrollTop: 216 };
  const beforeDetails = [
    { dataset: { nodeKey: "understanding" }, open: true },
    { dataset: { nodeKey: "script" }, open: false },
  ];
  const beforeRoot = {
    activeElement: beforeInput,
    querySelector(selector) {
      if (selector === "#ai-input") return beforeInput;
      if (selector === ".worklog-timeline") return beforeTimeline;
      return null;
    },
    querySelectorAll() {
      return beforeDetails;
    },
  };
  const snapshot = captureWorklogTransientState(beforeRoot);

  const afterInput = {
    value: "",
    focusCalled: false,
    focus() { this.focusCalled = true; },
    setSelectionRange(start, end) { this.range = [start, end]; },
  };
  const afterTimeline = { scrollTop: 0 };
  const afterDetails = [
    { dataset: { nodeKey: "understanding" }, open: false },
    { dataset: { nodeKey: "script" }, open: true },
    { dataset: { nodeKey: "storyboard" }, open: true },
  ];
  const afterRoot = {
    querySelector(selector) {
      if (selector === "#ai-input") return afterInput;
      if (selector === ".worklog-timeline") return afterTimeline;
      return null;
    },
    querySelectorAll() {
      return afterDetails;
    },
  };
  restoreWorklogTransientState(afterRoot, snapshot);
  assert.equal(afterInput.value, "不要丢掉这段输入");
  assert.deepEqual(afterInput.range, [3, 8]);
  assert.equal(afterInput.focusCalled, true);
  assert.equal(afterTimeline.scrollTop, 216);
  assert.deepEqual(afterDetails.map((item) => item.open), [true, false, true]);
});

test("renders approved structured summaries for nodes 01 02 03 07 09 and 10", () => {
  const view = fixture();
  view.nodes.find((item) => item.key === "ai-check").semantic = "running";
  view.nodes.find((item) => item.key === "versions").semantic = "running";
  view.nodes.find((item) => item.key === "delivery").semantic = "running";
  view.timeline = [
    { id: "u", role: "assistant", kind: "node-event", nodeKey: "understanding", semantic: "running", title: "正在理解商品", text: "读取素材。" },
    { id: "b", role: "assistant", kind: "node-event", nodeKey: "brief", semantic: "running", title: "Marketing Brief", text: "整理目标。" },
    { id: "d", role: "assistant", kind: "node-event", nodeKey: "direction", semantic: "running", title: "营销方向", text: "推荐方向。" },
    { id: "a", role: "assistant", kind: "node-event", nodeKey: "ai-check", semantic: "running", title: "AI 初检", text: "检查视频。" },
    { id: "v", role: "assistant", kind: "node-event", nodeKey: "versions", semantic: "running", title: "修改与版本", text: "检查版本。" },
    { id: "e", role: "assistant", kind: "node-event", nodeKey: "delivery", semantic: "running", title: "交付与导出", text: "准备交付。" },
  ];
  const summaryRecords = {
    assets: [
      { id: "asset-1", type: "product-link", usage: "generation" },
      { id: "asset-2", type: "reference-video", usage: "reference" },
      { id: "asset-3", type: "feedback-screenshot", usage: "excluded" },
    ],
    storyboards: records.storyboards,
    videos: [
      { ...records.videos[1], aiCheck: "通过", versionHistory: [] },
      { id: "video-risk", title: "风险视频", status: "可预览", version: "v2", humanReview: "待审核", aiCheck: "疑似问题", versionHistory: [{ version: "v1" }] },
      { ...records.videos[2], aiCheck: "通过", versionHistory: [] },
      { id: "video-exported", title: "已导出视频", status: "已导出", version: "v1", humanReview: "人工通过", aiCheck: "通过", versionHistory: [] },
    ],
  };
  const html = renderConversationWorklog(view, { records: summaryRecords });
  assert.match(html, /素材 3 项/);
  assert.match(html, /分类 3 类/);
  assert.match(html, /排除 1 项/);
  assert.match(html, /缺失信息/);
  assert.match(html, /营销目标[\s\S]*目标受众[\s\S]*TikTok[\s\S]*核心卖点/);
  assert.match(html, /推荐方向[\s\S]*推荐理由[\s\S]*备选方向/);
  assert.match(html, /初检通过 3 条[\s\S]*风险 1 条/);
  assert.match(html, /存在 1 条可对比历史版本/);
  assert.match(html, /可交付 1 条 · 已导出 1 条/);
});

test("keeps delivery actions outside a collapsed completed review event and shows exported totals", () => {
  const view = fixture();
  view.nodes.find((item) => item.key === "human-review").semantic = "completed";
  view.nodes.find((item) => item.key === "versions").semantic = "skipped";
  view.nodes.find((item) => item.key === "delivery").semantic = "running";
  view.timeline = [
    { id: "review", kind: "node-event", role: "assistant", nodeKey: "human-review", semantic: "completed", title: "人工审核已完成", text: "视频已通过。" },
  ];
  const html = renderConversationWorklog(view, { records });
  assert.match(html, /data-node-key="human-review"[\s\S]*<\/details>[\s\S]*data-node-key="delivery"/);
  assert.match(html, /data-node-key="versions"[\s\S]*当前无需修改/);
  assert.match(html, /data-node-key="delivery"[\s\S]*data-action="export-video" data-video-id="video-approved"/);

  const exportedView = structuredClone(view);
  exportedView.nodes.find((item) => item.key === "delivery").semantic = "completed";
  exportedView.timeline.push({ id: "delivery", kind: "node-event", role: "assistant", nodeKey: "delivery", semantic: "completed", title: "已导出", text: "进入成品库。" });
  const exportedHtml = renderConversationWorklog(exportedView, {
    records: {
      ...records,
      videos: records.videos.map((video) => video.id === "video-approved" ? { ...video, status: "已导出" } : video),
    },
  });
  assert.match(exportedHtml, /可交付 0 条 · 已导出 1 条/);
});

test("routes active worklog nodes without opening queued stages and exposes accessible progress", () => {
  const html = renderConversationWorklog(fixture(), { records });
  assert.match(html, /class="worklog-stage is-queued"[^>]*disabled/);
  assert.match(html, /data-action="open-worklog-node" data-node-id="node-generation"/);
  assert.match(html, /role="progressbar"[^>]*aria-valuenow="3"[^>]*aria-valuemax="5"/);
  assert.match(html, /class="worklog-timeline" role="log" aria-live="polite"/);
});

test("renders blockers as expanded timeline events with object context and actions", () => {
  const blockedRecords = {
    ...records,
    videos: [
      ...records.videos,
      {
        id: "video-blocked",
        title: "办公室下午茶",
        status: "失败",
        aiCheck: "不可用",
        humanReview: "待生成",
        version: "v1",
      },
    ],
  };
  const html = renderConversationWorklog(fixture(), { records: blockedRecords });
  assert.match(html, /<details class="worklog-event is-blocked"[^>]* open/);
  assert.match(html, /异常待处理[\s\S]*办公室下午茶[\s\S]*生成失败或初检不可用/);
  assert.match(html, /data-action="select-video" data-video-id="video-blocked"[\s\S]*查看问题视频/);
  assert.match(html, /data-action="quick-ai"[^>]*data-prompt="请分析并处理视频「办公室下午茶」的异常。"/);
});

test("background generation completion preserves the active task without notice or render", () => {
  assert.equal(typeof completeScheduledVideoGeneration, "function");
  const backgroundState = {
    active: { taskId: "task-current", videoId: "video-current" },
    composer: { contextLabel: "当前任务" },
    ui: { productScreen: "workspace" },
    storyboards: { "storyboard-bg": { id: "storyboard-bg", taskId: "task-background", status: "generating" } },
  };
  const result = completeScheduledVideoGeneration(backgroundState, "storyboard-bg", (input) => ({
    ...structuredClone(input),
    active: { taskId: "task-background", videoId: "video-background" },
    composer: { contextLabel: "后台任务" },
    completed: true,
  }));
  assert.equal(result.state.completed, true);
  assert.deepEqual(result.state.active, backgroundState.active);
  assert.deepEqual(result.state.composer, backgroundState.composer);
  assert.equal(result.shouldRender, false);
  assert.equal(result.notice, "");
});

test("foreground generation completion requests render and a scoped notice", () => {
  const foregroundState = {
    active: { taskId: "task-current", videoId: "video-current" },
    composer: { contextLabel: "当前任务" },
    ui: { productScreen: "workspace" },
    storyboards: { "storyboard-current": { id: "storyboard-current", taskId: "task-current", status: "generating" } },
  };
  const result = completeScheduledVideoGeneration(foregroundState, "storyboard-current", (input) => ({ ...structuredClone(input), completed: true }));
  assert.equal(result.shouldRender, true);
  assert.match(result.notice, /当前视频已生成并完成 AI 初检/);
});

test("uses 当前无需修改 as the folded title for a skipped version node", () => {
  const view = fixture();
  view.nodes.find((item) => item.key === "versions").semantic = "skipped";
  view.nodes.find((item) => item.key === "delivery").semantic = "running";
  view.timeline = [];
  const html = renderConversationWorklog(view, { records });
  assert.match(html, /data-node-key="versions"[^>]*>\s*<summary>(?:(?!<\/summary>)[\s\S])*<strong>当前无需修改<\/strong>(?:(?!<\/summary>)[\s\S])*<\/summary>/);
});
