import assert from "node:assert/strict";
import * as productModel from "../state-model.mjs";
import {
  createInitialState,
  createBlankProject,
  getActiveProject,
  getActiveSession,
  getActiveTask,
  getConversationItems,
  getCurrentTaskProcessNodes,
  getFilteredProjectTasks,
  getProjectArtifacts,
  getProjectProducts,
  getProjectTaskSummary,
  getRightPanelModel,
  openProjectAsset,
  openProjectTaskCenter,
  openResultFile,
  selectProject,
  selectSession,
  selectTaskFromCenter,
  confirmUnderstanding,
  confirmGenerationPlan,
  bindProcessNodeForEdit,
  focusTaskProcess,
  toggleConversationRecord,
  toggleRightPanel,
  toggleWorkspacePanel,
  selectDeliveryItem,
  enterVideoCanvas,
  toggleProjectsDrawer,
  toggleDeliveryMaximized,
  toggleProfileMenu,
  openChiefChat,
  createChiefChat,
  selectChiefChat,
  appendChiefMessage,
  getChiefChats,
  getActiveChiefChat,
  openChiefTransfer,
  closeChiefTransfer,
  transferChiefChatToNewProject,
  transferChiefChatToSession,
  getActiveContextSnapshot,
  startProjectSession,
  ingestDemoMaterials,
  getSessionAssets,
  getProjectInputAssets,
  promoteAssetScope,
  getWorkspaceAssets,
  getWorkspaceFolders,
  getProjectAssetReferences,
  getProjectLibraryAssets,
  getSessionContextAssets,
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
  getTaskStoryboards,
  selectStoryboard,
  requestStoryboardRevision,
  approveStoryboardAndGenerate,
  completeVideoGeneration,
  getTaskVideoProductionChains,
} from "../state-model.mjs";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("complete demo opens on the projects home without disturbing the seeded workspace", () => {
  const state = createInitialState();

  assert.equal(state.ui.productScreen, "home");
  assert.equal(state.active.projectId, "proj-blender");
  assert.equal(state.active.sessionId, "sess-blender-july");
});

test("conversation view model isolates structured timeline items by requested session", () => {
  const state = createInitialState();

  const batchView = productModel.getConversationViewModel(state, "sess-blender-july");
  const ugcView = productModel.getConversationViewModel(state, "sess-blender-ugc");

  assert.equal(batchView.session.id, "sess-blender-july");
  assert.equal(ugcView.session.id, "sess-blender-ugc");
  assert.equal(batchView.timeline.some((item) => item.text.includes("5 条 TikTok")), true);
  assert.equal(ugcView.timeline.some((item) => item.text.includes("真实用户随手拍")), true);
  assert.equal(batchView.timeline.some((item) => item.text.includes("真实用户随手拍")), false);
});

test("default demonstration task exposes the complete ordered ten-node marketing workflow", () => {
  const view = productModel.getConversationViewModel(createInitialState(), "sess-blender-july");

  assert.equal(view.nodes.length, 10);
  assert.deepEqual(view.nodes.map((node) => node.title), [
    "商品 / 素材理解",
    "Marketing Brief",
    "营销方向选择",
    "脚本",
    "故事画板确认",
    "视频生成",
    "AI 初检",
    "人工审核",
    "修改与版本",
    "交付与导出",
  ]);
});

test("every seeded project session exposes the same ten-node conversation contract", () => {
  const state = createInitialState();
  const expectedTitles = [
    "商品 / 素材理解",
    "Marketing Brief",
    "营销方向选择",
    "脚本",
    "故事画板确认",
    "视频生成",
    "AI 初检",
    "人工审核",
    "修改与版本",
    "交付与导出",
  ];

  for (const sessionId of Object.keys(state.sessions)) {
    const view = productModel.getConversationViewModel(state, sessionId);
    assert.equal(view.nodes.length, 10, sessionId);
    assert.deepEqual(view.nodes.map((node) => node.title), expectedTitles, sessionId);
    assert.equal(view.nodes.every((node) => ["queued", "running", "needs_action", "completed", "blocked", "skipped"].includes(node.semantic)), true, sessionId);
  }
});

test("conversation view model returns cloned context nodes and progress that cannot pollute state", () => {
  let state = selectDeliveryItem(createInitialState(), "video", "video-blender-1");
  state.processNodes["node-blender-script"].progress = { current: 2, total: 5 };
  const before = structuredClone(state);
  const view = productModel.getConversationViewModel(state, "sess-blender-july");

  view.context.project.name = "被外部修改的项目";
  view.context.task.name = "被外部修改的任务";
  view.context.video.title = "被外部修改的视频";
  view.nodes[0].summary = "被外部修改的节点";
  view.nodes[3].progress.current = 99;

  assert.deepEqual(state, before);
});

test("project sessions own their timeline instead of sharing a global AI message list", () => {
  let state = createBlankProject(createInitialState(), { name: "会话日志项目" });
  state = startProjectSession(state, {
    prompt: "为新品制作五条视频",
    sessionTitle: "新品首批视频",
  });

  const sessionId = state.active.sessionId;
  const timeline = state.conversationTimelines[sessionId];
  assert.equal(timeline.sessionId, sessionId);
  assert.deepEqual(timeline.items.map((item) => item.role), ["user", "assistant"]);
  assert.equal(timeline.items[0].text, "为新品制作五条视频");
  assert.equal(timeline.items[1].semantic, "running");
});

test("project conversation messages append immutably to only the requested session timeline", () => {
  const state = createInitialState();
  const before = structuredClone(state);
  const targetCount = state.conversationTimelines["sess-blender-july"].items.length;
  const otherCount = state.conversationTimelines["sess-blender-ugc"].items.length;

  const next = productModel.appendProjectConversationMessage(state, {
    sessionId: "sess-blender-july",
    role: "user",
    text: "  请把前三秒 Hook 做得更有吸引力。  ",
  });

  assert.deepEqual(state, before);
  assert.equal(next.conversationTimelines["sess-blender-july"].items.length, targetCount + 1);
  assert.equal(next.conversationTimelines["sess-blender-ugc"].items.length, otherCount);
  assert.deepEqual(next.conversationTimelines["sess-blender-july"].items.at(-1), {
    id: `timeline-sess-blender-july-${targetCount + 1}`,
    taskId: "task-blender-batch",
    kind: "message",
    role: "user",
    semantic: "completed",
    text: "请把前三秒 Hook 做得更有吸引力。",
  });
});

test("project conversation messages reject empty text without appending", () => {
  const state = createInitialState();
  const before = structuredClone(state);

  assert.throws(() => productModel.appendProjectConversationMessage(state, {
    sessionId: "sess-blender-july",
    role: "user",
    text: "   ",
  }), /text/i);
  assert.deepEqual(state, before);
});

test("legacy conversation item selector projects messages from the session timeline", () => {
  let state = createInitialState();
  state = productModel.appendProjectConversationMessage(state, {
    sessionId: "sess-blender-july",
    role: "user",
    text: "这是按会话保存的新消息",
  });

  const items = getConversationItems(state);
  assert.equal(items.some((item) => item.kind === "user-message" && item.text === "这是按会话保存的新消息"), true);
});

test("demo preparation advances through four nodes with five script and storyboard progress steps", () => {
  let state = createBlankProject(createInitialState(), { name: "自动准备项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const taskId = state.active.taskId;

  for (let index = 0; index < 3; index += 1) state = productModel.advanceDemoTaskPreparation(state, taskId);
  let view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.deepEqual(view.nodes.slice(0, 3).map((node) => node.semantic), ["completed", "completed", "completed"]);
  assert.equal(view.nodes[3].semantic, "running");
  assert.deepEqual(view.nodes[3].progress, { current: 0, total: 5 });

  for (let index = 0; index < 5; index += 1) state = productModel.advanceDemoTaskPreparation(state, taskId);
  view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.equal(view.nodes[3].semantic, "completed");
  assert.deepEqual(view.nodes[3].progress, { current: 5, total: 5 });
  assert.equal(view.nodes[4].semantic, "running");
  assert.deepEqual(view.nodes[4].progress, { current: 0, total: 5 });

  for (let index = 0; index < 5; index += 1) state = productModel.advanceDemoTaskPreparation(state, taskId);
  view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.equal(view.nodes[4].semantic, "needs_action");
  assert.deepEqual(view.nodes[4].progress, { current: 5, total: 5 });
  assert.equal(view.nodes[5].semantic, "queued");
  assert.equal(state.tasks[taskId].status, "待确认故事画板");
  assert.equal(view.timeline.some((item) => item.nodeKey === "storyboard" && item.semantic === "needs_action"), true);
});

test("storyboard confirmation video generation AI check and human review coexist in the conversation nodes", () => {
  let state = createBlankProject(createInitialState(), { name: "并行节点项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const taskId = state.active.taskId;
  for (let index = 0; index < 13; index += 1) state = productModel.advanceDemoTaskPreparation(state, taskId);
  const [target, untouched] = getTaskStoryboards(state, taskId);

  state = approveStoryboardAndGenerate(state, target.id);
  let view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.equal(view.nodes[4].semantic, "needs_action");
  assert.equal(view.nodes[5].semantic, "running");
  assert.equal(state.videos[untouched.videoId].status, "待生成");

  state = completeVideoGeneration(state, target.id);
  view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.equal(view.nodes[4].semantic, "needs_action");
  assert.equal(view.nodes[5].semantic, "running");
  assert.deepEqual(view.nodes[5].progress, { current: 1, total: 5 });
  assert.equal(view.nodes[6].semantic, "running");
  assert.equal(view.nodes[7].semantic, "running");
});

test("timeline node events synchronize completed semantics and progress after all parallel videos finish", () => {
  let state = createBlankProject(createInitialState(), { name: "Timeline synchronization project" });
  state = startProjectSession(state, { prompt: "Create five videos" });
  const taskId = state.active.taskId;
  for (let index = 0; index < 13; index += 1) state = productModel.advanceDemoTaskPreparation(state, taskId);
  const storyboards = getTaskStoryboards(state, taskId);

  for (const storyboard of storyboards) {
    state = approveStoryboardAndGenerate(state, storyboard.id);
    state = completeVideoGeneration(state, storyboard.id);
  }

  const view = productModel.getConversationViewModel(state, state.active.sessionId);
  for (const [nodeIndex, nodeKey] of [[4, "storyboard"], [5, "generation"], [6, "ai-check"]]) {
    assert.equal(view.nodes[nodeIndex].semantic, "completed");
    assert.deepEqual(view.nodes[nodeIndex].progress, { current: 5, total: 5 });
    const event = view.timeline.find((item) => item.nodeKey === nodeKey);
    assert.equal(event?.semantic, "completed");
    assert.deepEqual(event?.progress, { current: 5, total: 5 });
  }
});

test("human review node and timeline move from queued to running to completed for the five-video batch", () => {
  let state = createBlankProject(createInitialState(), { name: "Human review aggregate project" });
  state = startProjectSession(state, { prompt: "Create five videos" });
  const taskId = state.active.taskId;
  const sessionId = state.active.sessionId;

  let view = productModel.getConversationViewModel(state, sessionId);
  assert.equal(view.nodes[7].semantic, "queued");
  assert.equal(view.timeline.some((item) => item.nodeKey === "human-review"), false);

  const storyboards = getTaskStoryboards(state, taskId);
  for (const storyboard of storyboards) {
    state = approveStoryboardAndGenerate(state, storyboard.id);
    state = completeVideoGeneration(state, storyboard.id);
  }

  view = productModel.getConversationViewModel(state, sessionId);
  assert.equal(view.nodes[7].semantic, "running");
  assert.deepEqual(view.nodes[7].progress, { current: 0, total: 5 });
  let reviewEvent = view.timeline.find((item) => item.nodeKey === "human-review");
  assert.equal(reviewEvent?.semantic, "running");
  assert.deepEqual(reviewEvent?.progress, { current: 0, total: 5 });

  for (const storyboard of storyboards) {
    state = productModel.reviewVideo(state, storyboard.videoId, "approve");
  }

  view = productModel.getConversationViewModel(state, sessionId);
  assert.equal(view.nodes[7].semantic, "completed");
  assert.deepEqual(view.nodes[7].progress, { current: 5, total: 5 });
  reviewEvent = view.timeline.find((item) => item.nodeKey === "human-review");
  assert.equal(reviewEvent?.semantic, "completed");
  assert.deepEqual(reviewEvent?.progress, { current: 5, total: 5 });
});

test("pending conversation actions aggregate and sort blockers before review and storyboard confirmation", () => {
  const state = createInitialState();

  const actions = productModel.getPendingConversationActions(state, "task-blender-batch");

  assert.deepEqual(actions.map((action) => action.type), ["blocked", "human_review", "storyboard_confirmation"]);
  assert.deepEqual(actions.map((action) => action.count), [1, 2, 2]);
  assert.deepEqual(actions.map((action) => action.priority), [0, 1, 2]);
  assert.equal(actions.every((action) => ["blocked", "needs_action"].includes(action.semantic)), true);
  assert.deepEqual(productModel.getConversationViewModel(state, "sess-blender-july").pendingActions, actions);
});

test("generated videos cannot be exported before mandatory human approval", () => {
  let state = createBlankProject(createInitialState(), { name: "审核门禁项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const before = structuredClone(state);

  assert.throws(() => productModel.exportVideo(state, storyboard.videoId), /human review/i);
  assert.deepEqual(state, before);
});

test("human approval unlocks export and records both milestones in the session timeline", () => {
  let state = createBlankProject(createInitialState(), { name: "批准导出项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);

  state = productModel.reviewVideo(state, storyboard.videoId, "approve");
  assert.equal(state.videos[storyboard.videoId].humanReview, "人工通过");
  assert.equal(state.videos[storyboard.videoId].status, "可交付");
  assert.equal(productModel.getPendingConversationActions(state).some((action) => action.type === "human_review"), false);

  state = productModel.exportVideo(state, storyboard.videoId);
  const video = state.videos[storyboard.videoId];
  assert.equal(video.status, "已导出");
  assert.equal(state.artifacts[video.artifactId].status, "已导出");
  const timeline = productModel.getConversationViewModel(state, state.active.sessionId).timeline;
  assert.equal(timeline.some((item) => item.nodeKey === "human-review" && item.semantic === "running"), true);
  assert.equal(timeline.some((item) => item.nodeKey === "delivery" && item.semantic === "running"), true);
  assert.deepEqual(productModel.getConversationViewModel(state, state.active.sessionId).nodes[7].progress, { current: 1, total: 5 });
});

test("delivery node and timeline expose structured deliverable and exported counts", () => {
  let state = createBlankProject(createInitialState(), { name: "Delivery count project" });
  state = startProjectSession(state, { prompt: "Create five videos" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  state = productModel.reviewVideo(state, storyboard.videoId, "approve");

  let view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.deepEqual(view.nodes[9].counts, { deliverable: 1, exported: 0, total: 5 });
  let deliveryEvent = view.timeline.find((item) => item.nodeKey === "delivery");
  assert.deepEqual(deliveryEvent?.counts, { deliverable: 1, exported: 0, total: 5 });
  assert.equal(deliveryEvent?.semantic, "running");

  state = productModel.exportVideo(state, storyboard.videoId);
  view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.deepEqual(view.nodes[9].counts, { deliverable: 0, exported: 1, total: 5 });
  deliveryEvent = view.timeline.find((item) => item.nodeKey === "delivery");
  assert.deepEqual(deliveryEvent?.counts, { deliverable: 0, exported: 1, total: 5 });
  assert.equal(deliveryEvent?.semantic, "running");
});

test("requesting changes enters the version node while preserving the reviewed video version", () => {
  let state = createBlankProject(createInitialState(), { name: "返修版本项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const oldVideo = structuredClone(state.videos[storyboard.videoId]);
  const oldArtifact = structuredClone(state.artifacts[oldVideo.artifactId]);

  state = productModel.reviewVideo(state, storyboard.videoId, "changes_requested");
  const video = state.videos[storyboard.videoId];
  assert.equal(video.status, "待修改");
  assert.equal(video.humanReview, "需修改");
  assert.deepEqual(video.versionHistory, [{
    version: oldVideo.version,
    status: oldVideo.status,
    artifactId: oldVideo.artifactId,
    humanReview: oldVideo.humanReview,
  }]);
  assert.deepEqual(state.artifacts[oldVideo.artifactId], oldArtifact);
  assert.equal(state.storyboards[storyboard.id].status, "revision_requested");
  assert.equal(state.storyboards[storyboard.id].version, storyboard.version + 1);
  const view = productModel.getConversationViewModel(state, state.active.sessionId);
  assert.equal(view.nodes[8].semantic, "running");
  assert.equal(view.timeline.some((item) => item.nodeKey === "versions" && item.semantic === "running"), true);
  assert.throws(() => productModel.exportVideo(state, storyboard.videoId), /human review/i);
});

test("regenerating after requested changes creates a new artifact while keeping the old version addressable", () => {
  let state = createBlankProject(createInitialState(), { name: "多版本成品项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const taskId = state.active.taskId;
  const projectId = state.active.projectId;
  const oldVideo = structuredClone(state.videos[storyboard.videoId]);
  const oldArtifact = structuredClone(state.artifacts[oldVideo.artifactId]);

  state = productModel.reviewVideo(state, storyboard.videoId, "changes_requested");
  assert.equal(state.tasks[taskId].stage, "修改与版本");
  assert.equal(state.processNodes[state.active.processNodeId].shortTitle, "修改与版本");

  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const regeneratedVideo = state.videos[storyboard.videoId];
  assert.notEqual(regeneratedVideo.artifactId, oldVideo.artifactId);
  assert.deepEqual(state.artifacts[oldVideo.artifactId], oldArtifact);
  assert.equal(state.artifacts[regeneratedVideo.artifactId].videoId, storyboard.videoId);
  assert.equal(state.projects[projectId].assetIds.artifacts.includes(oldVideo.artifactId), true);
  assert.equal(state.projects[projectId].assetIds.artifacts.includes(regeneratedVideo.artifactId), true);
  assert.deepEqual(regeneratedVideo.versionHistory, [{
    version: oldVideo.version,
    status: oldVideo.status,
    artifactId: oldVideo.artifactId,
    humanReview: oldVideo.humanReview,
  }]);
});

test("selecting an old artifact resolves its immutable video snapshot while current video selection stays current", () => {
  let state = createBlankProject(createInitialState(), { name: "历史版本查看项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });
  const storyboard = getTaskStoryboards(state)[0];
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const oldArtifactId = state.videos[storyboard.videoId].artifactId;
  const oldVersion = state.videos[storyboard.videoId].version;
  state = productModel.reviewVideo(state, storyboard.videoId, "changes_requested");
  state = approveStoryboardAndGenerate(state, storyboard.id);
  state = completeVideoGeneration(state, storyboard.id);
  const newArtifactId = state.videos[storyboard.videoId].artifactId;
  const newVersion = state.videos[storyboard.videoId].version;

  state = selectDeliveryItem(state, "video", storyboard.videoId);
  assert.equal(productModel.getActiveVideo(state).version, newVersion);
  assert.equal(productModel.getActiveVideo(state).artifactId, newArtifactId);

  state = productModel.selectArtifact(state, oldArtifactId);
  const beforeOldRead = structuredClone(state);
  const oldView = productModel.getActiveVideo(state);
  assert.equal(oldView.version, oldVersion);
  assert.equal(oldView.artifactId, oldArtifactId);
  oldView.title = "外部污染";
  assert.deepEqual(state, beforeOldRead);

  state = productModel.selectArtifact(state, newArtifactId);
  const newView = productModel.getActiveVideo(state);
  assert.equal(newView.version, newVersion);
  assert.equal(newView.artifactId, newArtifactId);
});

test("project creation can open and cancel without changing the active project", () => {
  let state = createInitialState();

  state = productModel.openCreateProject(state);
  assert.equal(state.ui.productScreen, "create");
  assert.equal(state.active.projectId, "proj-blender");

  state = productModel.cancelCreateProject(state);
  assert.equal(state.ui.productScreen, "home");
  assert.equal(state.active.projectId, "proj-blender");
});

test("creating a blank project adds it to home data and opens an empty workspace", () => {
  let state = createInitialState();

  state = productModel.createBlankProject(state, {
    name: "  夏日气泡水上市  ",
    description: "为新品建立一个空白营销项目",
  });

  const project = state.projects[state.active.projectId];
  assert.equal(state.ui.productScreen, "workspace");
  assert.equal(project.name, "夏日气泡水上市");
  assert.equal(project.description, "为新品建立一个空白营销项目");
  assert.equal(project.kind, "blank");
  assert.deepEqual(project.sessionIds, []);
  assert.deepEqual(project.assetIds, { products: [], artifacts: [] });
  assert.equal(state.active.sessionId, null);
  assert.equal(state.active.taskId, null);
  assert.equal(state.active.processNodeId, null);
  assert.equal(state.active.workspaceMode, "overview");
  assert.deepEqual(getConversationItems(state), []);
});

test("home navigation preserves context and project selection enters the correct workspace", () => {
  let state = createInitialState();
  state = selectDeliveryItem(state, "video", "video-blender-3");
  state = productModel.openProjectsHome(state);

  assert.equal(state.ui.productScreen, "home");
  assert.equal(state.active.videoId, "video-blender-3");

  state = selectProject(state, "proj-earbuds");
  assert.equal(state.ui.productScreen, "workspace");
  assert.equal(state.active.projectId, "proj-earbuds");
  assert.equal(state.active.sessionId, "sess-earbuds-noise");
  assert.equal(state.active.taskId, "task-earbuds-batch");
  assert.equal(state.active.videoId, null);
});

test("switching projects clears canvas state while blank projects keep the central workspace hidden", () => {
  let state = createInitialState();
  state = productModel.createBlankProject(state, { name: "空白项目" });
  const blankProjectId = state.active.projectId;
  state = selectProject(state, "proj-blender");
  state = enterVideoCanvas(state, "video-blender-3");

  assert.equal(state.ui.projectNavCollapsed, true);

  state = selectProject(state, blankProjectId);
  assert.equal(state.ui.projectNavCollapsed, false);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.centralWorkspaceCollapsed, true);
  assert.equal(state.ui.aiPanelCollapsed, false);
  assert.equal(state.active.workspaceMode, "overview");
});

test("project assets are project-scoped and opened from the left navigation, not the right panel", () => {
  let state = createInitialState();

  state = openProjectAsset(state, "products");

  assert.equal(state.active.mainView, "products");
  assert.equal(getActiveProject(state).name, "便携式榨汁杯 TikTok");
  assert.deepEqual(
    getProjectProducts(state).map((product) => product.name),
    ["便携式榨汁杯"],
  );
  assert.equal(getRightPanelModel(state).kind, "task-process");
  assert.deepEqual(getRightPanelModel(state).tabs, []);
});

test("selecting a session switches the middle conversation and right task process together", () => {
  let state = createInitialState();

  state = selectSession(state, "sess-blender-ugc");

  assert.equal(getActiveSession(state).title, "UGC 风格补充生成");
  assert.equal(getActiveTask(state).name, "便携式榨汁杯 UGC 风格补充生成");
  assert.deepEqual(
    getCurrentTaskProcessNodes(state).map((node) => node.title),
    ["商品 / 素材理解", "UGC 修改目标", "生成计划", "视频生成", "AI 初检", "人工审核"],
  );
});

test("confirming a middle card collapses it into a short conversation record and updates the right process node", () => {
  let state = createInitialState();

  assert.equal(getConversationItems(state).some((item) => item.kind === "active-card"), true);

  state = confirmUnderstanding(state, "task-blender-batch");

  const items = getConversationItems(state);
  const nodes = getCurrentTaskProcessNodes(state);
  assert.equal(items.some((item) => item.kind === "active-card" && item.cardType === "understanding"), false);
  assert.equal(items.some((item) => item.kind === "collapsed-record" && item.text === "已确认任务理解"), true);
  assert.equal(nodes.find((node) => node.id === "node-blender-understanding").status, "done");
});

test("confirming the generation plan collapses the plan card and advances the task to video generation", () => {
  let state = createInitialState();

  state = confirmUnderstanding(state, "task-blender-batch");
  state = confirmGenerationPlan(state, "task-blender-batch");

  assert.equal(getActiveTask(state).status, "生成中");
  assert.equal(getActiveTask(state).stage, "视频生成");
  assert.equal(getConversationItems(state).some((item) => item.kind === "result-file"), true);
  assert.equal(getCurrentTaskProcessNodes(state).find((node) => node.id === "node-blender-plan").status, "done");
});

test("clicking the middle result file opens the right video-generation node", () => {
  let state = createInitialState();

  state = openResultFile(state, "task-blender-batch");

  assert.equal(state.active.mainView, "conversation");
  assert.equal(state.active.taskId, "task-blender-batch");
  assert.equal(state.active.processNodeId, "node-blender-video-generation");
  assert.equal(state.active.videoId, "video-blender-1");
  assert.equal(getRightPanelModel(state).title, "当前任务");
});

test("editing a right process node binds the composer to that node, not to a project asset tab", () => {
  let state = createInitialState();

  state = bindProcessNodeForEdit(state, "node-blender-script");

  assert.equal(state.active.processNodeId, "node-blender-script");
  assert.equal(state.composer.contextLabel, "正在修改：脚本");
  assert.match(state.composer.prefill, /脚本/);
});

test("project artifacts remain project-scoped even when the active session changes", () => {
  let state = createInitialState();

  const before = getProjectArtifacts(state).map((artifact) => artifact.title);
  state = selectSession(state, "sess-blender-ugc");
  const after = getProjectArtifacts(state).map((artifact) => artifact.title);

  assert.deepEqual(before, after);
  assert.deepEqual(after, ["早八赶时间 Hook", "健身后补能"]);
});

test("task center is a project-level view that filters tasks across sessions", () => {
  let state = createInitialState();

  state = openProjectTaskCenter(state);

  assert.equal(state.active.mainView, "tasks");
  assert.equal(getProjectTaskSummary(state).all, 2);

  state = selectTaskFromCenter(state, "task-blender-ugc");

  assert.equal(state.active.mainView, "tasks");
  assert.equal(getActiveTask(state).name, "便携式榨汁杯 UGC 风格补充生成");
  assert.equal(getFilteredProjectTasks(state).length, 2);
});

test("right task process panel can collapse and expand without losing task state", () => {
  let state = createInitialState();

  state = toggleRightPanel(state, true);

  assert.equal(getRightPanelModel(state).collapsed, true);
  assert.equal(getRightPanelModel(state).task.name, "便携式榨汁杯 TikTok 批量视频");

  state = focusTaskProcess(state, "task-blender-ugc");

  assert.equal(getRightPanelModel(state).collapsed, false);
  assert.equal(getRightPanelModel(state).task.name, "便携式榨汁杯 UGC 风格补充生成");
  assert.equal(getRightPanelModel(state).nodes.some((node) => node.title === "人工审核"), true);
});

test("collapsed conversation records can expand inline while preserving the right process link", () => {
  let state = createInitialState();

  state = confirmUnderstanding(state, "task-blender-batch");
  let record = getConversationItems(state).find((item) => item.kind === "collapsed-record" && item.recordType === "understanding");

  assert.equal(record.expanded, false);

  state = toggleConversationRecord(state, "task-blender-batch", "understanding");
  record = getConversationItems(state).find((item) => item.kind === "collapsed-record" && item.recordType === "understanding");

  assert.equal(record.expanded, true);
  assert.match(record.detail, /TikTok/);
});

test("three supporting panels collapse independently while the central workspace state is preserved", () => {
  let state = createInitialState();
  const originalView = state.active.mainView;

  state = toggleWorkspacePanel(state, "project", true);
  assert.equal(state.ui.projectNavCollapsed, true);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.aiPanelCollapsed, false);
  assert.equal(state.active.mainView, originalView);

  state = toggleWorkspacePanel(state, "workspace", true);
  state = toggleWorkspacePanel(state, "ai", true);
  assert.equal(state.ui.projectNavCollapsed, true);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.centralWorkspaceCollapsed, true);
  assert.equal(state.ui.aiPanelCollapsed, true);
  assert.equal(state.active.mainView, originalView);
});

test("selecting a delivery video opens its package and synchronizes AI context", () => {
  let state = createInitialState();

  state = selectDeliveryItem(state, "video", "video-blender-1");

  assert.equal(state.active.deliveryType, "video");
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoId, "video-blender-1");
  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  assert.match(state.composer.contextLabel, /早八赶时间 Hook/);
});

test("entering the video canvas keeps the permanent delivery browser visible", () => {
  let state = createInitialState();

  state = selectDeliveryItem(state, "video", "video-blender-3");
  state = enterVideoCanvas(state, "video-blender-3");

  assert.equal(state.active.workspaceMode, "canvas");
  assert.equal(state.active.videoId, "video-blender-3");
  assert.equal(state.ui.projectNavCollapsed, true);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  assert.equal(state.ui.aiPanelCollapsed, false);
});

test("all-projects drawer opens without disturbing workspace and closes after project selection", () => {
  let state = createInitialState();
  const originalMode = state.active.workspaceMode;

  state = toggleProjectsDrawer(state, true);

  assert.equal(state.ui.projectsDrawerOpen, true);
  assert.equal(state.active.workspaceMode, originalMode);
  assert.equal(state.active.projectId, "proj-blender");

  state = selectProject(state, "proj-earbuds");

  assert.equal(state.active.projectId, "proj-earbuds");
  assert.equal(state.ui.projectsDrawerOpen, false);
});

test("delivery maximize fills the workbench and restores the previous panel configuration", () => {
  let state = createInitialState();
  state = toggleWorkspacePanel(state, "project", true);
  state = toggleWorkspacePanel(state, "ai", true);

  state = toggleDeliveryMaximized(state, true);

  assert.equal(state.ui.deliveryMaximized, true);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.projectNavCollapsed, true);
  assert.equal(state.ui.centralWorkspaceCollapsed, true);
  assert.equal(state.ui.aiPanelCollapsed, true);
  assert.deepEqual(state.ui.deliveryMaximizeRestore, {
    projectNavCollapsed: true,
    deliveryBrowserCollapsed: false,
    centralWorkspaceCollapsed: false,
    aiPanelCollapsed: true,
  });

  state = toggleDeliveryMaximized(state, false);

  assert.equal(state.ui.deliveryMaximized, false);
  assert.equal(state.ui.projectNavCollapsed, true);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  assert.equal(state.ui.aiPanelCollapsed, true);
  assert.equal(state.ui.deliveryMaximizeRestore, null);
});

test("profile menu starts closed and toggles immutably", () => {
  const initialState = createInitialState();

  assert.equal(initialState.ui.profileMenuOpen, false);

  const openState = toggleProfileMenu(initialState);
  assert.equal(openState.ui.profileMenuOpen, true);
  assert.equal(initialState.ui.profileMenuOpen, false);
  assert.notEqual(openState, initialState);

  const closedState = toggleProfileMenu(openState);
  assert.equal(closedState.ui.profileMenuOpen, false);
  assert.equal(openState.ui.profileMenuOpen, true);
});

test("profile menu accepts an explicit false value", () => {
  const openState = toggleProfileMenu(createInitialState(), true);
  const closedState = toggleProfileMenu(openState, false);

  assert.equal(closedState.ui.profileMenuOpen, false);
  assert.equal(openState.ui.profileMenuOpen, true);
});

test("profile menu changes preserve selections conversations and panel state", () => {
  let state = selectStoryboard(createInitialState(), "storyboard-blender-1");
  state = openChiefChat(state, "chief-blender-strategy");
  state = toggleWorkspacePanel(state, "project", true);
  state = toggleWorkspacePanel(state, "delivery", true);
  state = toggleWorkspacePanel(state, "workspace", true);
  state = toggleWorkspacePanel(state, "ai", true);
  state = toggleDeliveryMaximized(state, true);
  const before = structuredClone(state);

  const next = toggleProfileMenu(state, true);

  assert.deepEqual(state, before);
  assert.notEqual(next.ui, state.ui);
  for (const key of Object.keys(state)) {
    if (key !== "ui") assert.equal(next[key], state[key], `${key} should keep its reference`);
  }
  assert.equal(next.ui.deliveryMaximizeRestore, state.ui.deliveryMaximizeRestore);
  assert.deepEqual(next.active, before.active);
  assert.deepEqual(next, {
    ...before,
    ui: {
      ...before.ui,
      profileMenuOpen: true,
    },
  });
});

test("marketing chief opens independently and keeps each consultation message list isolated", () => {
  let state = createInitialState();
  const originalProjectId = state.active.projectId;

  state = openChiefChat(state, "chief-blender-strategy");
  assert.equal(state.ui.productScreen, "chief-chat");
  assert.equal(state.active.projectId, originalProjectId);
  assert.equal(getActiveChiefChat(state).id, "chief-blender-strategy");
  const seededMessageIds = [...getActiveChiefChat(state).messageIds];

  state = createChiefChat(state, { title: "  新品内容想法  " });
  const createdId = state.active.chiefChatId;
  assert.equal(state.chiefChats[createdId].title, "新品内容想法");
  assert.deepEqual(state.chiefChats[createdId].messageIds, []);

  state = appendChiefMessage(state, { role: "user", text: "  先只讨论策略  " });
  assert.equal(getActiveChiefChat(state).messageIds.length, 1);
  assert.equal(state.chiefMessages[getActiveChiefChat(state).messageIds[0]].text, "先只讨论策略");

  state = selectChiefChat(state, "chief-blender-strategy");
  assert.deepEqual(getActiveChiefChat(state).messageIds, seededMessageIds);
  assert.equal(getChiefChats(state).some((chat) => chat.id === createdId), true);
});

test("marketing chief message validation is immutable and changes only the active consultation", () => {
  let state = createInitialState();
  state = openChiefChat(state, "chief-blender-strategy");
  const before = state;
  const inactiveMessageIds = [...state.chiefChats["chief-blender-strategy"].messageIds];
  state = createChiefChat(state, { title: "第二个会话" });
  const createdId = state.active.chiefChatId;
  state = appendChiefMessage(state, { role: "assistant", text: "可以先明确目标人群", kind: "advice" });

  assert.notEqual(state, before);
  assert.deepEqual(state.chiefChats["chief-blender-strategy"].messageIds, inactiveMessageIds);
  assert.equal(state.chiefMessages[state.chiefChats[createdId].messageIds[0]].kind, "advice");
  assert.throws(() => appendChiefMessage(state, { role: "system", text: "invalid" }), /role/i);
  assert.throws(() => appendChiefMessage(state, { role: "user", text: "   " }), /text/i);
});

test("chief transfer dialog opens and closes without creating project state", () => {
  let state = openChiefChat(createInitialState(), "chief-blender-strategy");
  const projectIds = Object.keys(state.projects);
  state = openChiefTransfer(state);
  assert.equal(state.ui.chiefTransferOpen, true);
  assert.deepEqual(Object.keys(state.projects), projectIds);
  state = closeChiefTransfer(state);
  assert.equal(state.ui.chiefTransferOpen, false);
});

test("chief transfer to a new project atomically creates a snapshot session and ten-node task", () => {
  let state = openChiefChat(createInitialState(), "chief-blender-strategy");
  const sourceChat = structuredClone(getActiveChiefChat(state));

  state = transferChiefChatToNewProject(state, {
    projectName: "便携杯夏季增长",
    sessionTitle: "首批短视频",
    summary: "用宿舍与通勤场景打透便携卖点",
    marketingGoal: "提高新品认知",
    audience: "美国大学生",
    platform: "TikTok",
    directions: ["宿舍早餐", "通勤补能"],
    decisions: ["先做五条竖版视频"],
    openQuestions: ["是否加入折扣 CTA"],
    assetIds: ["asset-chief-reference"],
  });

  const project = getActiveProject(state);
  const session = getActiveSession(state);
  const task = getActiveTask(state);
  const snapshot = getActiveContextSnapshot(state);
  assert.equal(state.ui.productScreen, "workspace");
  assert.equal(project.name, "便携杯夏季增长");
  assert.equal(project.kind, "marketing");
  assert.deepEqual(project.sessionIds, [session.id]);
  assert.deepEqual(session.taskIds, [task.id]);
  assert.deepEqual(session.contextSnapshotIds, [snapshot.id]);
  assert.equal(task.nodeIds.length, 10);
  assert.equal(snapshot.sourceChatId, sourceChat.id);
  assert.deepEqual(snapshot.decisions, ["先做五条竖版视频"]);
  assert.deepEqual(state.chiefChats[sourceChat.id], sourceChat);

  const frozenSummary = snapshot.summary;
  state = openChiefChat(state, sourceChat.id);
  state = appendChiefMessage(state, { role: "user", text: "后来又想到直播方向" });
  assert.equal(state.contextSnapshots[snapshot.id].summary, frozenSummary);
});

test("chief transfer to an existing session appends one immutable snapshot without changing tasks", () => {
  let state = openChiefChat(createInitialState(), "chief-blender-strategy");
  const taskIds = [...state.sessions["sess-blender-july"].taskIds];
  const beforeCount = state.sessions["sess-blender-july"].contextSnapshotIds?.length ?? 0;

  state = transferChiefChatToSession(state, {
    sessionId: "sess-blender-july",
    summary: "补充校园开学季方向",
    decisions: ["保留原任务"],
  });

  assert.equal(state.ui.productScreen, "workspace");
  assert.equal(state.active.sessionId, "sess-blender-july");
  assert.deepEqual(state.sessions["sess-blender-july"].taskIds, taskIds);
  assert.equal(state.sessions["sess-blender-july"].contextSnapshotIds.length, beforeCount + 1);
  assert.equal(getActiveContextSnapshot(state).summary, "补充校园开学季方向");
});

test("blank-project first action creates exactly one session task five videos and five storyboards", () => {
  let state = createBlankProject(createInitialState(), { name: "空白新品项目" });
  const blankProjectId = state.active.projectId;
  assert.equal(state.active.sessionId, null);
  assert.deepEqual(getConversationItems(state), []);

  state = startProjectSession(state, {
    prompt: "为新品制作五条 TikTok 视频",
    sessionTitle: "新品首批视频",
    taskName: "新品视频任务",
  });

  const session = getActiveSession(state);
  const task = getActiveTask(state);
  assert.equal(state.projects[blankProjectId].kind, "marketing");
  assert.equal(state.projects[blankProjectId].sessionIds.length, 1);
  assert.equal(session.taskIds.length, 1);
  assert.equal(task.nodeIds.length, 10);
  assert.equal(task.videoIds.length, 5);
  assert.equal(getTaskStoryboards(state, task.id).length, 5);
  assert.equal(new Set(getTaskStoryboards(state, task.id).map((storyboard) => storyboard.videoId)).size, 5);

  const unchangedCounts = {
    sessions: state.projects[blankProjectId].sessionIds.length,
    tasks: session.taskIds.length,
  };
  state = startProjectSession(state, { prompt: "再次调用不应重复创建" });
  assert.equal(state.projects[blankProjectId].sessionIds.length, unchangedCounts.sessions);
  assert.equal(state.sessions[session.id].taskIds.length, unchangedCounts.tasks);
});

test("blank-project first prompt opens the central task overview", () => {
  let state = createBlankProject(createInitialState(), { name: "新品项目" });
  state = startProjectSession(state, { prompt: "制作五条新品视频" });

  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  assert.equal(state.active.workspaceMode, "overview");
  assert.equal(state.active.deliveryType, "overview");
});

test("empty sessions can be selected and conversation selectors stay safe", () => {
  let state = createInitialState();
  state.sessions["sess-empty"] = {
    id: "sess-empty",
    projectId: "proj-blender",
    title: "空会话",
    taskIds: [],
    userPrompt: "",
    contextSnapshotIds: [],
    assetIds: [],
  };
  state.projects["proj-blender"].sessionIds.push("sess-empty");
  state = selectSession(state, "sess-empty");
  assert.equal(state.active.taskId, null);
  assert.equal(state.active.processNodeId, null);
  assert.deepEqual(getConversationItems(state), [{ kind: "user-message", text: "" }]);
});

test("demo material intake defaults to session scope and excludes feedback screenshots", () => {
  let state = createBlankProject(createInitialState(), { name: "素材测试项目" });
  state = startProjectSession(state, { prompt: "制作视频" });
  state = ingestDemoMaterials(state);

  const assets = getSessionAssets(state);
  assert.equal(assets.length, 4);
  assert.equal(assets.every((asset) => asset.scope === "session"), true);
  assert.equal(assets.some((asset) => asset.type === "product-link" && asset.usage === "generation"), true);
  assert.equal(assets.some((asset) => asset.type === "brand-guide" && asset.usage === "reference"), true);
  assert.equal(assets.some((asset) => asset.type === "feedback-screenshot" && asset.usage === "excluded"), true);
  assert.equal(getProjectInputAssets(state).length, 4);
});

test("asset promotion changes scope in place without duplicating its identity", () => {
  let state = createBlankProject(createInitialState(), { name: "素材晋升项目" });
  state = startProjectSession(state, { prompt: "制作视频" });
  state = ingestDemoMaterials(state);
  const asset = getSessionAssets(state)[0];
  const allIdsBefore = Object.keys(state.inputAssets);

  state = promoteAssetScope(state, asset.id, "project");
  assert.equal(state.inputAssets[asset.id].scope, "project");
  assert.deepEqual(Object.keys(state.inputAssets), allIdsBefore);
  assert.equal(state.sessions[state.active.sessionId].assetIds.includes(asset.id), true);

  state = promoteAssetScope(state, asset.id, "brand");
  assert.equal(state.inputAssets[asset.id].scope, "brand");
  assert.deepEqual(Object.keys(state.inputAssets), allIdsBefore);
  assert.throws(() => promoteAssetScope(state, asset.id, "session"), /scope/i);
});

test("workspace project and session assets share identity without implicit promotion", () => {
  let state = createInitialState();
  const referencedIds = new Set(getProjectAssetReferences(state).map((item) => item.assetId));
  const asset = getWorkspaceAssets(state).find((item) => !referencedIds.has(item.id));
  assert.ok(asset);

  state = addAssetToSessionContext(state, asset.id, state.active.sessionId);
  assert.equal(getSessionContextAssets(state).some((item) => item.id === asset.id), true);
  assert.equal(getProjectAssetReferences(state).some((item) => item.assetId === asset.id), false);

  state = addWorkspaceAssetToProject(state, asset.id, state.active.projectId);
  const reference = getProjectAssetReferences(state).find((item) => item.assetId === asset.id);
  assert.equal(reference.assetId, asset.id);
  assert.equal(reference.version, asset.version);
  assert.equal(getWorkspaceAssets(state).filter((item) => item.id === asset.id).length, 1);
});

test("asset center scopes and project asset mode keep the four-panel project context", () => {
  let state = openAssetCenter(createInitialState(), "workspace");
  assert.equal(state.ui.productScreen, "asset-center");
  assert.equal(state.active.assetCenterScope, "workspace");
  assert.ok(state.active.assetId);

  state = setAssetCenterScope(state, "project");
  assert.equal(state.active.assetCenterScope, "project");

  state = openProjectAssetMode(state);
  assert.equal(state.ui.productScreen, "workspace");
  assert.equal(state.active.workspaceMode, "project-assets");
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  assert.equal(state.ui.aiPanelCollapsed, false);
});

test("project assets are flat decorated references while workspace assets own folders", () => {
  const state = createInitialState();
  const folders = getWorkspaceFolders(state);
  const projectAssets = getProjectLibraryAssets(state);

  assert.ok(folders.length >= 2);
  assert.ok(projectAssets.length >= 2);
  assert.equal(projectAssets.every((item) => item.projectId === state.active.projectId), true);
  assert.equal(projectAssets.every((item) => item.asset && item.asset.id === item.assetId), true);
});

test("library selection session removal folder creation upload and understanding are immutable", () => {
  let state = createInitialState();
  const original = state;
  const asset = getWorkspaceAssets(state)[0];

  state = selectLibraryAsset(state, asset.id);
  assert.equal(state.active.assetId, asset.id);
  assert.notEqual(state, original);

  state = addAssetToSessionContext(state, asset.id);
  assert.equal(getSessionContextAssets(state).some((item) => item.id === asset.id), true);
  state = removeAssetFromSessionContext(state, asset.id);
  assert.equal(getSessionContextAssets(state).some((item) => item.id === asset.id), false);

  const folderCount = getWorkspaceFolders(state).length;
  state = createWorkspaceFolder(state, "新品资料");
  assert.equal(getWorkspaceFolders(state).length, folderCount + 1);

  const assetCount = getWorkspaceAssets(state).length;
  state = uploadDemoAsset(state, { name: "新品说明书.pdf", type: "pdf", scope: "workspace" });
  assert.equal(getWorkspaceAssets(state).length, assetCount + 1);
  const uploaded = getWorkspaceAssets(state).find((item) => item.name === "新品说明书.pdf");
  assert.equal(uploaded.aiStatus, "not_understood");

  state = requestAssetUnderstanding(state, [uploaded.id]);
  assert.equal(getWorkspaceAssets(state).find((item) => item.id === uploaded.id).aiStatus, "understanding");

  state = toggleSessionAssetPicker(state, true);
  assert.equal(state.ui.sessionAssetPickerOpen, true);
  assert.equal(state.ui.assetPickerScope, "project");
});

test("blank project creation can pin selected workspace assets without copying them", () => {
  const seed = createInitialState();
  const assetIds = getWorkspaceAssets(seed).slice(0, 2).map((asset) => asset.id);
  const state = createBlankProject(seed, { name: "新品项目", workspaceAssetIds: assetIds });
  const references = getProjectAssetReferences(state);

  assert.deepEqual(references.map((reference) => reference.assetId), assetIds);
  assert.equal(getWorkspaceAssets(state).filter((asset) => assetIds.includes(asset.id)).length, 2);
});

test("each video storyboard can be selected and revised independently", () => {
  let state = createBlankProject(createInitialState(), { name: "故事板测试项目" });
  state = startProjectSession(state, { prompt: "制作五条视频" });
  const taskId = state.active.taskId;
  const storyboards = getTaskStoryboards(state, taskId);
  const target = storyboards[2];
  const untouchedVersions = storyboards.filter((item) => item.id !== target.id).map((item) => [item.id, item.version]);

  state = selectStoryboard(state, target.id);
  assert.equal(state.active.storyboardId, target.id);
  assert.equal(state.active.videoId, target.videoId);
  assert.equal(state.active.deliveryType, "video");
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoStage, "storyboard");
  assert.equal(state.ui.videoPackageMemory[target.videoId].stage, "storyboard");

  state = requestStoryboardRevision(state, target.id);
  assert.equal(state.storyboards[target.id].status, "revision_requested");
  assert.equal(state.storyboards[target.id].version, target.version + 1);
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoStage, "storyboard");
  for (const [id, version] of untouchedVersions) assert.equal(state.storyboards[id].version, version);
});

test("approving one storyboard generates only its linked video and requires no credit confirmation", () => {
  let state = createBlankProject(createInitialState(), { name: "逐条生成项目" });
  state = startProjectSession(state, { prompt: "制作五条视频" });
  const storyboards = getTaskStoryboards(state);
  const target = storyboards[1];
  const untouched = storyboards.filter((item) => item.id !== target.id).map((item) => item.id);

  state = approveStoryboardAndGenerate(state, target.id);
  assert.equal(state.storyboards[target.id].status, "generating");
  assert.equal(state.videos[target.videoId].status, "视频生成中");
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoStage, "storyboard");
  assert.equal("creditConfirmation" in state.ui, false);
  for (const id of untouched) {
    assert.equal(state.storyboards[id].status, "pending_review");
    assert.equal(state.videos[state.storyboards[id].videoId].status, "待生成");
  }

  state = completeVideoGeneration(state, target.id);
  assert.equal(state.storyboards[target.id].status, "generated");
  assert.equal(state.videos[target.videoId].status, "可预览");
  assert.equal(state.videos[target.videoId].aiCheck, "通过");
  assert.equal(state.videos[target.videoId].humanReview, "待审核");
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoStage, "storyboard");
  for (const id of untouched) assert.equal(state.storyboards[id].status, "pending_review");
});

test("storyboard generation transitions reject direct completion duplicate approval and duplicate completion", () => {
  let state = createBlankProject(createInitialState(), { name: "状态门禁项目" });
  state = startProjectSession(state, { prompt: "制作五条视频" });
  const storyboard = getTaskStoryboards(state)[0];
  let before = structuredClone(state);

  assert.throws(() => completeVideoGeneration(state, storyboard.id), /generating/i);
  assert.deepEqual(state, before);

  state = approveStoryboardAndGenerate(state, storyboard.id);
  before = structuredClone(state);
  assert.throws(() => approveStoryboardAndGenerate(state, storyboard.id), /pending_review|revision_requested/i);
  assert.deepEqual(state, before);

  state = completeVideoGeneration(state, storyboard.id);
  before = structuredClone(state);
  assert.throws(() => completeVideoGeneration(state, storyboard.id), /generating/i);
  assert.deepEqual(state, before);
});

test("new v0.2 tasks cannot bypass per-video storyboard approval through the legacy plan action", () => {
  let state = createBlankProject(createInitialState(), { name: "故事板门禁项目" });
  state = startProjectSession(state, { prompt: "制作五条视频" });
  const taskId = state.active.taskId;
  const storyboardIds = getTaskStoryboards(state, taskId).map((storyboard) => storyboard.id);
  const videoStatuses = state.tasks[taskId].videoIds.map((videoId) => state.videos[videoId].status);

  state = confirmGenerationPlan(state, taskId);

  assert.deepEqual(
    storyboardIds.map((id) => state.storyboards[id].status),
    Array(5).fill("pending_review"),
  );
  assert.deepEqual(
    state.tasks[taskId].videoIds.map((videoId) => state.videos[videoId].status),
    videoStatuses,
  );
  assert.equal(state.tasks[taskId].status, "待确认故事画板");
  assert.equal(state.tasks[taskId].stage, "故事画板确认");
  assert.equal(state.active.deliveryType, "video");
  assert.equal(state.active.storyboardId, storyboardIds[0]);
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(state.active.videoStage, "storyboard");
});

test("partial storyboard generation keeps the batch at the storyboard gate with one active process node", () => {
  let state = createBlankProject(createInitialState(), { name: "聚合状态项目" });
  state = startProjectSession(state, { prompt: "制作五条视频" });
  const taskId = state.active.taskId;
  const [target, ...remaining] = getTaskStoryboards(state, taskId);
  const untouchedBefore = remaining.map((storyboard) => [storyboard.id, structuredClone(storyboard), structuredClone(state.videos[storyboard.videoId])]);

  state = approveStoryboardAndGenerate(state, target.id);
  assert.equal(state.storyboards[target.id].status, "generating");
  assert.equal(state.tasks[taskId].status, "待确认故事画板");
  assert.equal(state.tasks[taskId].stage, "故事画板确认");
  assert.equal(getCurrentTaskProcessNodes(state).filter((node) => node.status === "active").length, 1);
  assert.equal(getCurrentTaskProcessNodes(state).find((node) => node.status === "active").shortTitle, "故事画板");

  state = completeVideoGeneration(state, target.id);
  assert.equal(state.storyboards[target.id].status, "generated");
  assert.equal(state.tasks[taskId].status, "待确认故事画板");
  assert.equal(state.tasks[taskId].stage, "故事画板确认");
  assert.equal(getCurrentTaskProcessNodes(state).filter((node) => node.status === "active").length, 1);
  assert.equal(getCurrentTaskProcessNodes(state).find((node) => node.status === "active").shortTitle, "故事画板");
  for (const [id, storyboardBefore, videoBefore] of untouchedBefore) {
    assert.deepEqual(state.storyboards[id], storyboardBefore);
    assert.deepEqual(state.videos[storyboardBefore.videoId], videoBefore);
  }
});

test("blank projects keep the conditional central workspace collapsed when created and reselected", () => {
  let state = createBlankProject(createInitialState(), { name: "空白中央区项目" });
  const blankProjectId = state.active.projectId;
  assert.equal(state.ui.centralWorkspaceCollapsed, true);

  state = selectProject(state, "proj-blender");
  assert.equal(state.ui.centralWorkspaceCollapsed, false);
  state = selectProject(state, blankProjectId);
  assert.equal(state.ui.centralWorkspaceCollapsed, true);
});

test("background video completion updates its own task without replacing the selected project context", () => {
  let state = selectStoryboard(createInitialState(), "storyboard-blender-1");
  state = selectProject(state, "proj-earbuds");
  assert.equal(state.active.storyboardId, null);
  const activeBefore = structuredClone(state.active);

  state = completeVideoGeneration(state, "storyboard-blender-2");

  assert.equal(state.storyboards["storyboard-blender-2"].status, "generated");
  assert.equal(state.videos["video-blender-2"].status, "可预览");
  assert.deepEqual(state.active, activeBefore);
});

test("background task preparation advances only its target task without replacing the selected context", () => {
  let state = createBlankProject(createInitialState(), { name: "Background preparation project" });
  state = startProjectSession(state, { prompt: "Create five videos" });
  const taskId = state.active.taskId;
  state = selectProject(state, "proj-earbuds");
  const activeBefore = structuredClone(state.active);

  state = productModel.advanceDemoTaskPreparation(state, taskId);

  assert.equal(state.tasks[taskId].preparation.phase, "brief");
  assert.equal(state.processNodes[state.tasks[taskId].nodeIds[0]].conversationSemantic, "completed");
  assert.deepEqual(state.active, activeBefore);
});

test("background storyboard and review transitions never replace the selected context", () => {
  let state = selectProject(createInitialState(), "proj-earbuds");
  const activeBefore = structuredClone(state.active);
  const workspaceCollapsedBefore = state.ui.centralWorkspaceCollapsed;

  state = requestStoryboardRevision(state, "storyboard-blender-5");
  assert.equal(state.storyboards["storyboard-blender-5"].status, "revision_requested");
  assert.deepEqual(state.active, activeBefore);
  assert.equal(state.ui.centralWorkspaceCollapsed, workspaceCollapsedBefore);

  state = approveStoryboardAndGenerate(state, "storyboard-blender-4");
  assert.equal(state.storyboards["storyboard-blender-4"].status, "generating");
  assert.deepEqual(state.active, activeBefore);
  assert.equal(state.ui.centralWorkspaceCollapsed, workspaceCollapsedBefore);

  let reviewState = createBlankProject(createInitialState(), { name: "Background review project" });
  reviewState = startProjectSession(reviewState, { prompt: "Create five videos" });
  const reviewStoryboard = getTaskStoryboards(reviewState)[0];
  reviewState = approveStoryboardAndGenerate(reviewState, reviewStoryboard.id);
  reviewState = completeVideoGeneration(reviewState, reviewStoryboard.id);
  reviewState = selectProject(reviewState, "proj-earbuds");
  const reviewActiveBefore = structuredClone(reviewState.active);
  reviewState = productModel.reviewVideo(reviewState, reviewStoryboard.videoId, "changes_requested");
  assert.equal(reviewState.videos[reviewStoryboard.videoId].humanReview, "需修改");
  assert.deepEqual(reviewState.active, reviewActiveBefore);
});

test("video production chains map five scripts storyboards and videos in stable task order", () => {
  const state = createInitialState();
  const task = state.tasks["task-blender-batch"];
  const chains = getTaskVideoProductionChains(state, task.id);

  assert.equal(chains.length, 5);
  assert.deepEqual(chains.map((chain) => chain.video.id), task.videoIds);
  for (const chain of chains) {
    assert.equal(chain.storyboard.videoId, chain.video.id);
    assert.equal(chain.script.videoId, chain.video.id);
    assert.equal(chain.script.angle, chain.storyboard.angle);
    assert.equal(chain.script.hook, chain.storyboard.scenes[0].description);
  }
  assert.equal(chains.some((chain) => chain.status === "待确认"), true);
  assert.equal(chains.some((chain) => chain.status === "生成中"), true);
  assert.equal(chains.some((chain) => chain.status === "已生成"), true);
});

test("video production chains return an empty list for a missing task", () => {
  const state = createInitialState();
  assert.deepEqual(getTaskVideoProductionChains(state, "task-does-not-exist"), []);
});

test("derived production-chain scripts cannot pollute state or later selector results", () => {
  const state = createInitialState();
  const stateBefore = structuredClone(state);
  const firstResult = getTaskVideoProductionChains(state, "task-blender-batch");
  const originalScript = structuredClone(firstResult[0].script);

  firstResult[0].script.title = "被外部修改的脚本";
  firstResult[0].script.angle = "错误方向";
  firstResult[0].script.hook = "错误 Hook";

  assert.deepEqual(state, stateBefore);
  const secondResult = getTaskVideoProductionChains(state, "task-blender-batch");
  assert.deepEqual(secondResult[0].script, originalScript);
  assert.notEqual(secondResult[0].script, firstResult[0].script);
});

test("delivery browser switches between card and list without changing selection", () => {
  let state = selectDeliveryItem(createInitialState(), "video", "video-blender-3");
  const beforeVideoId = state.active.videoId;

  state = productModel.setDeliveryViewMode(state, "list");

  assert.equal(state.ui.deliveryViewMode, "list");
  assert.equal(state.active.videoId, beforeVideoId);
  assert.equal(state.ui.deliveryBrowserCollapsed, false);
});

test("video package restores its remembered stage after visiting another video", () => {
  let state = productModel.selectVideoPackageStage(createInitialState(), "video-blender-2", "storyboard");
  state = selectDeliveryItem(state, "video", "video-blender-1");
  state = selectDeliveryItem(state, "video", "video-blender-2");

  const view = productModel.getVideoPackageViewModel(state, "video-blender-2");
  assert.equal(state.active.workspaceMode, "video-package");
  assert.equal(view.activeStage, "storyboard");
});

test("permanent delivery browser ignores close requests", () => {
  const state = toggleWorkspacePanel(createInitialState(), "delivery", true);

  assert.equal(state.ui.deliveryBrowserCollapsed, false);
});
