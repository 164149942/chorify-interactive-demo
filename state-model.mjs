const seedState = {
  active: {
    projectId: "proj-blender",
    sessionId: "sess-blender-july",
    taskId: "task-blender-batch",
    mainView: "conversation",
    assetView: null,
    taskFilter: "all",
    processNodeId: "node-blender-understanding",
    videoId: null,
    artifactId: null,
    deliveryType: "overview",
    workspaceMode: "overview",
    expandedRecordIds: {},
    chiefChatId: null,
    contextSnapshotId: null,
    storyboardId: null,
    videoStage: null,
  },
  ui: {
    productScreen: "home",
    projectNavCollapsed: false,
    deliveryBrowserCollapsed: false,
    centralWorkspaceCollapsed: false,
    aiPanelCollapsed: false,
    projectsDrawerOpen: false,
    deliveryMaximized: false,
    deliveryMaximizeRestore: null,
    chiefTransferOpen: false,
    profileMenuOpen: false,
    deliveryViewMode: "grid",
    videoPackageMemory: {},
  },
  meta: {
    nextProjectNumber: 1,
    nextChiefChatNumber: 1,
    nextChiefMessageNumber: 1,
    nextContextSnapshotNumber: 1,
    nextProductionNumber: 1,
    nextInputAssetNumber: 1,
  },
  composer: {
    prefill: "",
    contextLabel: "当前任务：便携式榨汁杯 TikTok 批量视频",
  },
  chiefChats: {
    "chief-blender-strategy": {
      id: "chief-blender-strategy",
      title: "便携杯新品营销方向",
      messageIds: ["chief-message-seed-1", "chief-message-seed-2"],
      reference: null,
      readyForProject: true,
      createdAt: "2026-07-15T09:00:00.000Z",
    },
  },
  chiefMessages: {
    "chief-message-seed-1": {
      id: "chief-message-seed-1",
      chatId: "chief-blender-strategy",
      role: "user",
      text: "便携式榨汁杯新品适合从什么营销方向切入？",
      kind: "message",
    },
    "chief-message-seed-2": {
      id: "chief-message-seed-2",
      chatId: "chief-blender-strategy",
      role: "assistant",
      text: "可以先测试宿舍早餐、通勤补能与健身后三个场景，再决定是否进入视频制作。",
      kind: "advice",
    },
  },
  contextSnapshots: {},
  inputAssets: {},
  storyboards: {
    "storyboard-blender-1": {
      id: "storyboard-blender-1",
      taskId: "task-blender-batch",
      videoId: "video-blender-1",
      title: "早八赶时间 Hook",
      angle: "30 秒快速早餐",
      duration: "18s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: [
        { id: "scene-blender-1-1", order: 1, title: "迟到危机", description: "手机时间与匆忙收拾形成前三秒 Hook。" },
        { id: "scene-blender-1-2", order: 2, title: "快速装杯", description: "水果与液体快速加入便携杯。" },
        { id: "scene-blender-1-3", order: 3, title: "边走边喝", description: "通勤路上完成饮用与卖点收束。" },
      ],
      version: 1,
      status: "generated",
    },
    "storyboard-blender-2": {
      id: "storyboard-blender-2",
      taskId: "task-blender-batch",
      videoId: "video-blender-2",
      title: "宿舍果昔场景",
      angle: "宿舍桌面轻早餐",
      duration: "20s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: [
        { id: "scene-blender-2-1", order: 1, title: "桌面空镜", description: "宿舍桌面与早餐材料建立场景。" },
        { id: "scene-blender-2-2", order: 2, title: "一键榨汁", description: "展示杯体启动和果昔变化。" },
        { id: "scene-blender-2-3", order: 3, title: "清洗收纳", description: "快速冲洗并收入背包。" },
      ],
      version: 1,
      status: "generating",
    },
    "storyboard-blender-3": {
      id: "storyboard-blender-3",
      taskId: "task-blender-batch",
      videoId: "video-blender-3",
      title: "健身后补能",
      angle: "健身结束即时补给",
      duration: "20s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: [
        { id: "scene-blender-3-1", order: 1, title: "训练结束", description: "运动后的疲惫状态与补能需求。" },
        { id: "scene-blender-3-2", order: 2, title: "蛋白果昔", description: "加入配料并直接搅拌。" },
        { id: "scene-blender-3-3", order: 3, title: "轻松离场", description: "拿杯离开健身房，收束便携卖点。" },
      ],
      version: 2,
      status: "generated",
    },
    "storyboard-blender-4": {
      id: "storyboard-blender-4",
      taskId: "task-blender-batch",
      videoId: "video-blender-4",
      title: "办公室下午茶",
      angle: "工位轻饮",
      duration: "18s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: [
        { id: "scene-blender-4-1", order: 1, title: "下午犯困", description: "工位低能量状态作为问题。" },
        { id: "scene-blender-4-2", order: 2, title: "快速制作", description: "桌面完成一杯水果饮。" },
        { id: "scene-blender-4-3", order: 3, title: "恢复专注", description: "回到工作并展示杯体。" },
      ],
      version: 2,
      status: "revision_requested",
    },
    "storyboard-blender-5": {
      id: "storyboard-blender-5",
      taskId: "task-blender-batch",
      videoId: "video-blender-5",
      title: "卖点直给",
      angle: "三卖点快速演示",
      duration: "15s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: [
        { id: "scene-blender-5-1", order: 1, title: "便携", description: "单手拿起与放入包内。" },
        { id: "scene-blender-5-2", order: 2, title: "快速", description: "计时展示快速搅拌。" },
        { id: "scene-blender-5-3", order: 3, title: "易清洗", description: "冲洗动作与 CTA。" },
      ],
      version: 1,
      status: "pending_review",
    },
  },
  projects: {
    "proj-blender": {
      id: "proj-blender",
      name: "便携式榨汁杯 TikTok",
      summary: "项目级资产：产品库、成品库、任务中心、会话记录",
      assetIds: {
        products: ["product-blender"],
        artifacts: ["artifact-blender-1", "artifact-blender-2"],
      },
      sessionIds: ["sess-blender-july", "sess-blender-ugc"],
    },
    "proj-earbuds": {
      id: "proj-earbuds",
      name: "3C 耳机广告",
      summary: "项目级资产：耳机商品资料和历史成片",
      assetIds: {
        products: ["product-earbuds"],
        artifacts: [],
      },
      sessionIds: ["sess-earbuds-noise"],
    },
    "proj-skincare": {
      id: "proj-skincare",
      name: "护肤精华种草",
      summary: "项目级资产：精华商品资料和导出视频",
      assetIds: {
        products: ["product-serum"],
        artifacts: ["artifact-serum-1"],
      },
      sessionIds: ["sess-skincare-seeding"],
    },
  },
  sessions: {
    "sess-blender-july": {
      id: "sess-blender-july",
      projectId: "proj-blender",
      title: "7 月新品首批视频",
      taskIds: ["task-blender-batch"],
      userPrompt: "帮我为这款便携式榨汁杯生成 5 条 TikTok 普通营销视频，面向美国大学生和通勤白领。",
    },
    "sess-blender-ugc": {
      id: "sess-blender-ugc",
      projectId: "proj-blender",
      title: "UGC 风格补充生成",
      taskIds: ["task-blender-ugc"],
      userPrompt: "把已生成的视频改得更像真实用户随手拍，不要太广告。",
    },
    "sess-earbuds-noise": {
      id: "sess-earbuds-noise",
      projectId: "proj-earbuds",
      title: "降噪卖点首批视频",
      taskIds: ["task-earbuds-batch"],
      userPrompt: "为这款降噪耳机做一批对比型 TikTok 视频，突出通勤和学习场景。",
    },
    "sess-skincare-seeding": {
      id: "sess-skincare-seeding",
      projectId: "proj-skincare",
      title: "精华液种草脚本",
      taskIds: ["task-skincare-export"],
      userPrompt: "给这款烟酰胺精华做 3 条种草视频。",
    },
  },
  tasks: {
    "task-blender-batch": {
      id: "task-blender-batch",
      projectId: "proj-blender",
      sessionId: "sess-blender-july",
      name: "便携式榨汁杯 TikTok 批量视频",
      status: "待确认理解",
      stage: "任务理解",
      productId: "product-blender",
      nodeIds: [
        "node-blender-understanding",
        "node-blender-brief",
        "node-blender-plan",
        "node-blender-script",
        "node-blender-storyboard",
        "node-blender-video-generation",
        "node-blender-ai-check",
        "node-blender-human-review",
        "node-blender-versions",
        "node-blender-export",
      ],
      cards: {
        understanding: "active",
        plan: "pending",
        resultFile: false,
      },
      videoIds: ["video-blender-1", "video-blender-2", "video-blender-3", "video-blender-4", "video-blender-5"],
    },
    "task-blender-ugc": {
      id: "task-blender-ugc",
      projectId: "proj-blender",
      sessionId: "sess-blender-ugc",
      name: "便携式榨汁杯 UGC 风格补充生成",
      status: "待人工审核",
      stage: "人工审核",
      productId: "product-blender",
      nodeIds: ["node-ugc-understanding", "node-ugc-target", "node-ugc-plan", "node-ugc-video-generation", "node-ugc-ai-check", "node-ugc-human-review"],
      cards: {
        understanding: "collapsed",
        plan: "collapsed",
        resultFile: true,
      },
      videoIds: ["video-blender-ugc-1", "video-blender-ugc-2", "video-blender-ugc-3"],
    },
    "task-earbuds-batch": {
      id: "task-earbuds-batch",
      projectId: "proj-earbuds",
      sessionId: "sess-earbuds-noise",
      name: "降噪耳机场景种草视频",
      status: "方案中",
      stage: "脚本 / 分镜",
      productId: "product-earbuds",
      nodeIds: ["node-earbuds-understanding", "node-earbuds-script", "node-earbuds-plan"],
      cards: {
        understanding: "collapsed",
        plan: "active",
        resultFile: false,
      },
      videoIds: ["video-earbuds-1", "video-earbuds-2"],
    },
    "task-skincare-export": {
      id: "task-skincare-export",
      projectId: "proj-skincare",
      sessionId: "sess-skincare-seeding",
      name: "烟酰胺精华种草视频",
      status: "已导出",
      stage: "导出完成",
      productId: "product-serum",
      nodeIds: ["node-serum-understanding", "node-serum-video-generation", "node-serum-export"],
      cards: {
        understanding: "collapsed",
        plan: "collapsed",
        resultFile: true,
      },
      videoIds: ["video-serum-1"],
    },
  },
  processNodes: {
    "node-blender-understanding": {
      id: "node-blender-understanding",
      taskId: "task-blender-batch",
      title: "商品 / 素材理解",
      shortTitle: "任务理解",
      status: "active",
      summary: "识别商品、平台、目标人群、视频数量和素材用途。",
      record: "商品：便携式榨汁杯；平台：TikTok；数量：5 条；目标人群：美国大学生 / 通勤白领。",
    },
    "node-blender-brief": {
      id: "node-blender-brief",
      taskId: "task-blender-batch",
      title: "Marketing Brief",
      shortTitle: "Brief",
      status: "pending",
      summary: "营销目标、目标用户、核心卖点沉淀。",
      record: "突出便携、快速、易清洗，强调宿舍、通勤、健身后场景。",
    },
    "node-blender-script": {
      id: "node-blender-script",
      taskId: "task-blender-batch",
      title: "脚本",
      shortTitle: "脚本",
      status: "pending",
      summary: "生成 5 条视频脚本草案。",
      record: "脚本包含 Hook、卖点展示、场景转折和 CTA。",
    },
    "node-blender-storyboard": {
      id: "node-blender-storyboard",
      taskId: "task-blender-batch",
      title: "故事画板确认",
      shortTitle: "故事画板",
      status: "pending",
      summary: "为每条脚本生成镜头节奏和画面描述。",
      record: "每条视频 4–6 个镜头，比例 9:16。",
    },
    "node-blender-plan": {
      id: "node-blender-plan",
      taskId: "task-blender-batch",
      title: "营销方向选择",
      shortTitle: "营销方向",
      status: "pending",
      summary: "比较候选方向并选择本批次内容策略。",
      record: "早八、宿舍、健身、办公室、卖点直给五个方向。",
    },
    "node-blender-video-generation": {
      id: "node-blender-video-generation",
      taskId: "task-blender-batch",
      title: "视频生成",
      shortTitle: "视频生成",
      status: "pending",
      summary: "视频子项生成、失败重试和预览入口。",
      record: "生成完成后，中间只显示文件卡，详情在此节点查看。",
    },
    "node-blender-export": {
      id: "node-blender-export",
      taskId: "task-blender-batch",
      title: "交付与导出",
      shortTitle: "交付与导出",
      status: "pending",
      summary: "导出最终可用视频。",
      record: "支持导出 MP4。",
    },
    "node-blender-versions": {
      id: "node-blender-versions",
      taskId: "task-blender-batch",
      title: "修改与版本",
      shortTitle: "修改与版本",
      status: "pending",
      summary: "保留原版本并生成可比较的新版本。",
      record: "仅在人工审核要求修改时进入。",
    },
    "node-blender-ai-check": {
      id: "node-blender-ai-check",
      taskId: "task-blender-batch",
      title: "AI 初检",
      shortTitle: "AI 初检",
      status: "pending",
      summary: "生成后给出通过、需检查、疑似问题、不可用等简单标签。",
      record: "AI 初检不替代人工审核，只提供首轮风险提示。",
    },
    "node-blender-human-review": {
      id: "node-blender-human-review",
      taskId: "task-blender-batch",
      title: "人工审核",
      shortTitle: "人工审核",
      status: "pending",
      summary: "人工通过、需修改或标记不可用。",
      record: "人工审核是最终业务判断；审核前导出必须保留未审核提示。",
    },
    "node-ugc-understanding": {
      id: "node-ugc-understanding",
      taskId: "task-blender-ugc",
      title: "商品 / 素材理解",
      shortTitle: "任务理解",
      status: "done",
      summary: "复用便携式榨汁杯商品资料和已生成成片。",
      record: "目标是降低广告感，保留商品卖点。",
    },
    "node-ugc-target": {
      id: "node-ugc-target",
      taskId: "task-blender-ugc",
      title: "UGC 修改目标",
      shortTitle: "UGC 目标",
      status: "done",
      summary: "真实用户随手拍、厨房/宿舍场景、弱化品牌口播。",
      record: "生成 3 条 UGC 风格变体。",
    },
    "node-ugc-plan": {
      id: "node-ugc-plan",
      taskId: "task-blender-ugc",
      title: "生成计划",
      shortTitle: "生成计划",
      status: "done",
      summary: "确认 UGC 变体数量和修改范围。",
      record: "默认保留原成片版本，生成新版本。",
    },
    "node-ugc-video-generation": {
      id: "node-ugc-video-generation",
      taskId: "task-blender-ugc",
      title: "视频生成",
      shortTitle: "视频生成",
      status: "done",
      summary: "3 条 UGC 变体已生成，等待审核处理。",
      record: "生成结果进入 AI 初检和人工审核，不覆盖旧版本。",
    },
    "node-ugc-ai-check": {
      id: "node-ugc-ai-check",
      taskId: "task-blender-ugc",
      title: "AI 初检",
      shortTitle: "AI 初检",
      status: "done",
      summary: "2 条通过，1 条需人工检查。",
      record: "疑似问题：第 3 条产品露出偏弱。",
    },
    "node-ugc-human-review": {
      id: "node-ugc-human-review",
      taskId: "task-blender-ugc",
      title: "人工审核",
      shortTitle: "人工审核",
      status: "active",
      summary: "3 条视频待人工审核。",
      record: "可以逐条通过、标记需修改或不可用。",
    },
    "node-earbuds-understanding": {
      id: "node-earbuds-understanding",
      taskId: "task-earbuds-batch",
      title: "商品 / 素材理解",
      shortTitle: "任务理解",
      status: "done",
      summary: "降噪耳机、通勤和学习场景。",
      record: "目标平台 TikTok。",
    },
    "node-earbuds-script": {
      id: "node-earbuds-script",
      taskId: "task-earbuds-batch",
      title: "脚本",
      shortTitle: "脚本",
      status: "active",
      summary: "地铁通勤、图书馆学习、咖啡店办公。",
      record: "对比型脚本生成中。",
    },
    "node-earbuds-plan": {
      id: "node-earbuds-plan",
      taskId: "task-earbuds-batch",
      title: "生成计划",
      shortTitle: "生成计划",
      status: "pending",
      summary: "待确认。",
      record: "预计 3 条视频。",
    },
    "node-serum-understanding": {
      id: "node-serum-understanding",
      taskId: "task-skincare-export",
      title: "商品 / 素材理解",
      shortTitle: "任务理解",
      status: "done",
      summary: "烟酰胺精华、熬夜肌提亮。",
      record: "已确认。",
    },
    "node-serum-video-generation": {
      id: "node-serum-video-generation",
      taskId: "task-skincare-export",
      title: "视频生成",
      shortTitle: "视频生成",
      status: "done",
      summary: "3 条视频已完成。",
      record: "全部通过人工确认。",
    },
    "node-serum-export": {
      id: "node-serum-export",
      taskId: "task-skincare-export",
      title: "导出",
      shortTitle: "导出",
      status: "done",
      summary: "已导出。",
      record: "MP4 已导出。",
    },
  },
  products: {
    "product-blender": {
      id: "product-blender",
      projectId: "proj-blender",
      name: "便携式榨汁杯",
      summary: "30 秒快速榨汁 · 充电便携 · 易清洗",
      audience: "美国大学生 / 通勤白领 / 健身人群",
      assetCount: 8,
      image: "./assets/portable-blender-product.png",
    },
    "product-earbuds": {
      id: "product-earbuds",
      projectId: "proj-earbuds",
      name: "主动降噪蓝牙耳机",
      summary: "通勤降噪 · 长续航 · 低延迟",
      audience: "学生 / 通勤人群 / 办公人群",
      assetCount: 5,
      image: "",
    },
    "product-serum": {
      id: "product-serum",
      projectId: "proj-skincare",
      name: "烟酰胺提亮精华",
      summary: "提亮肤色 · 清爽吸收 · 适合熬夜肌",
      audience: "25–35 岁护肤用户",
      assetCount: 6,
      image: "",
    },
  },
  videos: {
    "video-blender-1": {
      id: "video-blender-1",
      taskId: "task-blender-batch",
      title: "早八赶时间 Hook",
      status: "可预览",
      duration: "18s",
      version: "v1",
      aiCheck: "通过",
      humanReview: "待审核",
      artifactId: "artifact-blender-1",
    },
    "video-blender-2": {
      id: "video-blender-2",
      taskId: "task-blender-batch",
      title: "宿舍果昔场景",
      status: "视频生成中",
      duration: "20s",
      version: "v1",
      aiCheck: "待初检",
      humanReview: "待生成",
      artifactId: null,
    },
    "video-blender-3": {
      id: "video-blender-3",
      taskId: "task-blender-batch",
      title: "健身后补能",
      status: "可预览",
      duration: "20s",
      version: "v2",
      aiCheck: "需人工检查",
      humanReview: "待审核",
      artifactId: "artifact-blender-2",
    },
    "video-blender-4": {
      id: "video-blender-4",
      taskId: "task-blender-batch",
      title: "办公室下午茶",
      status: "失败",
      duration: "—",
      version: "—",
      aiCheck: "不可用",
      humanReview: "未进入",
      artifactId: null,
    },
    "video-blender-5": {
      id: "video-blender-5",
      taskId: "task-blender-batch",
      title: "卖点直给",
      status: "待生成",
      duration: "15s",
      version: "—",
      aiCheck: "待初检",
      humanReview: "待生成",
      artifactId: null,
    },
    "video-blender-ugc-1": {
      id: "video-blender-ugc-1",
      taskId: "task-blender-ugc",
      title: "真实用户厨房随拍",
      status: "待人工审核",
      duration: "18s",
      version: "v2",
      aiCheck: "通过",
      humanReview: "待审核",
      artifactId: null,
    },
    "video-blender-ugc-2": {
      id: "video-blender-ugc-2",
      taskId: "task-blender-ugc",
      title: "宿舍桌面随手拍",
      status: "待人工审核",
      duration: "20s",
      version: "v2",
      aiCheck: "通过",
      humanReview: "待审核",
      artifactId: null,
    },
    "video-blender-ugc-3": {
      id: "video-blender-ugc-3",
      taskId: "task-blender-ugc",
      title: "健身后补能自拍",
      status: "需人工检查",
      duration: "19s",
      version: "v2",
      aiCheck: "产品露出不足",
      humanReview: "待审核",
      artifactId: null,
    },
    "video-earbuds-1": {
      id: "video-earbuds-1",
      taskId: "task-earbuds-batch",
      title: "地铁通勤降噪前后对比",
      status: "脚本生成中",
      duration: "20s",
      version: "草稿",
      aiCheck: "待初检",
      humanReview: "待生成",
      artifactId: null,
    },
    "video-earbuds-2": {
      id: "video-earbuds-2",
      taskId: "task-earbuds-batch",
      title: "图书馆学习场景",
      status: "待生成",
      duration: "18s",
      version: "草稿",
      aiCheck: "待初检",
      humanReview: "待生成",
      artifactId: null,
    },
    "video-serum-1": {
      id: "video-serum-1",
      taskId: "task-skincare-export",
      title: "熬夜后提亮肤色",
      status: "已导出",
      duration: "22s",
      version: "v2",
      aiCheck: "通过",
      humanReview: "人工通过",
      artifactId: "artifact-serum-1",
    },
  },
  artifacts: {
    "artifact-blender-1": {
      id: "artifact-blender-1",
      projectId: "proj-blender",
      taskId: "task-blender-batch",
      videoId: "video-blender-1",
      title: "早八赶时间 Hook",
      status: "未导出",
      quality: "AI 初检通过",
    },
    "artifact-blender-2": {
      id: "artifact-blender-2",
      projectId: "proj-blender",
      taskId: "task-blender-batch",
      videoId: "video-blender-3",
      title: "健身后补能",
      status: "已导出",
      quality: "人工通过",
    },
    "artifact-serum-1": {
      id: "artifact-serum-1",
      projectId: "proj-skincare",
      taskId: "task-skincare-export",
      videoId: "video-serum-1",
      title: "熬夜后提亮肤色",
      status: "已导出",
      quality: "人工通过",
    },
  },
};

function clone(value) {
  return structuredClone(value);
}

function createVideoSnapshot(video, artifactId = video.artifactId) {
  return {
    id: video.id,
    taskId: video.taskId,
    storyboardId: video.storyboardId ?? null,
    title: video.title,
    status: video.status,
    duration: video.duration,
    version: video.version,
    aiCheck: video.aiCheck,
    humanReview: video.humanReview,
    artifactId,
  };
}

function firstTaskIdForSession(state, sessionId) {
  return state.sessions[sessionId]?.taskIds?.[0] ?? null;
}

function firstNodeIdForTask(state, taskId) {
  return state.tasks[taskId]?.nodeIds?.[0] ?? null;
}

function findTaskIdByNodeId(state, nodeId) {
  return state.processNodes[nodeId]?.taskId ?? null;
}

function findActiveNodeIdForTask(state, taskId) {
  const task = state.tasks[taskId];
  if (!task) return null;
  return task.nodeIds.find((id) => state.processNodes[id].status === "active") ?? task.nodeIds[0];
}

function recordKey(taskId, recordType) {
  return `${taskId}:${recordType}`;
}

function ensureV02Collections(state) {
  state.active.chiefChatId ??= null;
  state.active.contextSnapshotId ??= null;
  state.active.storyboardId ??= null;
  state.active.videoStage ??= null;
  state.ui.chiefTransferOpen ??= false;
  state.ui.deliveryViewMode ??= "grid";
  state.ui.videoPackageMemory ??= {};
  state.meta.nextChiefChatNumber ??= 1;
  state.meta.nextChiefMessageNumber ??= 1;
  state.meta.nextContextSnapshotNumber ??= 1;
  state.meta.nextProductionNumber ??= 1;
  state.meta.nextInputAssetNumber ??= 1;
  state.chiefChats ??= {};
  state.chiefMessages ??= {};
  state.contextSnapshots ??= {};
  state.inputAssets ??= {};
  state.storyboards ??= {};
  state.videos ??= {};
  state.artifacts ??= {};
  state.conversationTimelines ??= {};
  for (const artifact of Object.values(state.artifacts)) {
    const video = state.videos[artifact.videoId];
    if (!video) continue;
    artifact.version ??= video.version;
    artifact.videoSnapshot ??= createVideoSnapshot(video, artifact.id);
  }
}

function requireRecord(collection, id, label) {
  const record = collection?.[id];
  if (!record) throw new Error(`${label} not found: ${id ?? ""}`);
  return record;
}

function asTrimmedText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
}

function ensureSessionTimeline(state, sessionId) {
  const session = state.sessions?.[sessionId];
  if (!session) return null;
  if (!state.conversationTimelines[sessionId]) {
    state.conversationTimelines[sessionId] = {
      sessionId,
      items: [
        {
          id: `timeline-${sessionId}-1`,
          taskId: session.taskIds?.[0] ?? null,
          kind: "user-message",
          role: "user",
          semantic: "completed",
          text: session.userPrompt ?? "",
        },
      ],
    };
  }
  return state.conversationTimelines[sessionId];
}

function upsertNodeTimelineItem(state, task, nodeKey, input) {
  const timeline = ensureSessionTimeline(state, task.sessionId);
  if (!timeline) return null;
  const existing = timeline.items.find((item) => item.taskId === task.id && item.nodeKey === nodeKey);
  if (existing) {
    Object.assign(existing, input, { nodeKey, taskId: task.id });
    return existing;
  }
  const item = {
    id: `timeline-${task.sessionId}-${timeline.items.length + 1}`,
    taskId: task.id,
    nodeKey,
    kind: "node-event",
    role: "assistant",
    ...input,
  };
  timeline.items.push(item);
  return item;
}

const detailedFlowNodes = [
  ["understanding", "商品 / 素材理解", "任务理解", "识别商品、素材、平台、目标人群与任务边界。"],
  ["brief", "Marketing Brief", "Brief", "沉淀营销目标、受众、卖点与表达约束。"],
  ["direction", "营销方向选择", "营销方向", "比较候选方向并选择本批次内容策略。"],
  ["script", "脚本", "脚本", "生成每条视频的 Hook、主体、转折与 CTA。"],
  ["storyboard", "故事画板确认", "故事画板", "逐条确认故事画板后再生成对应视频。"],
  ["generation", "视频生成", "视频生成", "仅生成已确认故事画板所对应的视频。"],
  ["ai-check", "AI 初检", "AI 初检", "检查品牌露出、字幕安全与画面完整性。"],
  ["human-review", "人工审核", "人工审核", "由用户完成最终业务判断。"],
  ["versions", "修改与版本", "修改与版本", "保留原版本并生成可比较的新版本。"],
  ["delivery", "交付与导出", "交付与导出", "整理最终可用视频并导出。"],
];

function buildStoryboardScenes(storyboardId, index) {
  const sceneTemplates = [
    ["前三秒 Hook", "用清晰问题或场景冲突抓住注意力。"],
    ["使用场景", "展示产品进入真实生活场景。"],
    ["核心卖点", "用动作与特写解释一个关键卖点。"],
    ["结果与 CTA", "展示使用结果并给出轻量行动提示。"],
  ];
  return sceneTemplates.map(([title, description], sceneIndex) => ({
    id: `${storyboardId}-scene-${sceneIndex + 1}`,
    order: sceneIndex + 1,
    title: index === 0 && sceneIndex === 0 ? "真实痛点 Hook" : title,
    description,
  }));
}

function createProductionTask(state, { projectId, sessionId, taskName, prompt = "", videoCount = 5 } = {}) {
  const number = state.meta.nextProductionNumber;
  state.meta.nextProductionNumber += 1;
  const taskId = `task-created-${number}`;
  const nodeIds = [];

  for (const [index, [slug, title, shortTitle, summary]] of detailedFlowNodes.entries()) {
    const nodeId = `node-created-${number}-${slug}`;
    state.processNodes[nodeId] = {
      id: nodeId,
      taskId,
      title,
      shortTitle,
      status: index === 0 ? "active" : "pending",
      conversationSemantic: index === 0 ? "running" : "queued",
      ...(slug === "script" || slug === "storyboard" ? { progress: { current: 0, total: videoCount } } : {}),
      summary,
      record: index === 0 ? asTrimmedText(prompt, "等待用户提供商品与营销目标。") : "等待上游节点完成。",
    };
    nodeIds.push(nodeId);
  }

  const videoIds = [];
  const storyboardIds = [];
  const directions = ["场景痛点", "真实体验", "卖点演示", "前后对比", "口碑推荐"];
  for (let index = 0; index < videoCount; index += 1) {
    const videoId = `video-created-${number}-${index + 1}`;
    const storyboardId = `storyboard-created-${number}-${index + 1}`;
    const title = `视频 ${index + 1} · ${directions[index % directions.length]}`;
    state.videos[videoId] = {
      id: videoId,
      taskId,
      storyboardId,
      title,
      status: "待生成",
      duration: "20s",
      version: "草稿",
      aiCheck: "待初检",
      humanReview: "待生成",
      artifactId: null,
    };
    state.storyboards[storyboardId] = {
      id: storyboardId,
      taskId,
      videoId,
      title,
      angle: directions[index % directions.length],
      duration: "20s",
      aspectRatio: "9:16",
      sourceAssetIds: [],
      excludedAssetIds: [],
      scenes: buildStoryboardScenes(storyboardId, index),
      version: 1,
      status: "pending_review",
    };
    videoIds.push(videoId);
    storyboardIds.push(storyboardId);
  }

  state.tasks[taskId] = {
    id: taskId,
    projectId,
    sessionId,
    name: asTrimmedText(taskName, "首批营销视频"),
    status: "方案中",
    stage: "商品 / 素材理解",
    productId: null,
    nodeIds,
    storyboardIds,
    cards: {
      understanding: "active",
      plan: "pending",
      resultFile: false,
    },
    preparation: {
      phase: "understanding",
      scriptsGenerated: 0,
      storyboardsGenerated: 0,
      total: videoCount,
    },
    videoIds,
  };
  state.sessions[sessionId].taskIds.push(taskId);
  upsertNodeTimelineItem(state, state.tasks[taskId], "understanding", {
    semantic: "running",
    title: "正在理解商品与素材",
    text: "正在读取商品、素材、平台、目标人群与任务边界。",
  });
  return taskId;
}

function createProjectSession(state, { projectId, sessionTitle, prompt, taskName, contextSnapshotIds = [] } = {}) {
  const number = state.meta.nextProductionNumber;
  const sessionId = `sess-created-${number}`;
  state.sessions[sessionId] = {
    id: sessionId,
    projectId,
    title: asTrimmedText(sessionTitle, "首批营销视频"),
    taskIds: [],
    userPrompt: asTrimmedText(prompt, "请先理解商品与营销目标，并规划五条营销视频。"),
    contextSnapshotIds: [...contextSnapshotIds],
    assetIds: [],
  };
  state.projects[projectId].sessionIds.push(sessionId);
  const taskId = createProductionTask(state, { projectId, sessionId, taskName, prompt });
  return { sessionId, taskId };
}

function createContextSnapshot(state, chat, input = {}) {
  const number = state.meta.nextContextSnapshotNumber;
  state.meta.nextContextSnapshotNumber += 1;
  const id = `context-snapshot-${number}`;
  state.contextSnapshots[id] = {
    id,
    sourceChatId: chat.id,
    title: asTrimmedText(input.title, chat.title),
    summary: asTrimmedText(input.summary, "来自营销首席官会话的策略摘要。"),
    marketingGoal: asTrimmedText(input.marketingGoal),
    product: asTrimmedText(input.product ?? input.brand),
    audience: asTrimmedText(input.audience),
    platform: asTrimmedText(input.platform),
    directions: asStringArray(input.directions),
    decisions: asStringArray(input.decisions),
    openQuestions: asStringArray(input.openQuestions),
    assetIds: asStringArray(input.assetIds),
  };
  return id;
}

function isActiveTaskContext(state, task) {
  return state.active.projectId === task.projectId
    && state.active.sessionId === task.sessionId
    && state.active.taskId === task.id;
}

function setExclusiveActiveProcessNode(state, task, shortTitle) {
  let activeNodeId = null;
  for (const nodeId of task.nodeIds) {
    const node = state.processNodes[nodeId];
    if (!node) continue;
    if (node.shortTitle === shortTitle) {
      node.status = "active";
      activeNodeId = node.id;
    } else if (node.status === "active") {
      node.status = "pending";
    }
  }
  if (isActiveTaskContext(state, task)) state.active.processNodeId = activeNodeId ?? task.nodeIds[0] ?? null;
  return activeNodeId;
}

function refreshStoryboardAggregate(state, taskId) {
  const task = requireRecord(state.tasks, taskId, "task");
  const storyboards = getTaskStoryboards(state, taskId);
  const hasStoryboardsToConfirm = storyboards.some((storyboard) =>
    ["pending_review", "revision_requested"].includes(storyboard.status),
  );
  const hasGeneratingStoryboards = storyboards.some((storyboard) =>
    ["approved", "generating"].includes(storyboard.status),
  );

  if (hasStoryboardsToConfirm || storyboards.length === 0) {
    task.status = "待确认故事画板";
    task.stage = "故事画板确认";
    setExclusiveActiveProcessNode(state, task, "故事画板");
  } else if (hasGeneratingStoryboards) {
    task.status = "生成中";
    task.stage = "视频生成";
    setExclusiveActiveProcessNode(state, task, "视频生成");
  } else {
    task.status = "待人工审核";
    task.stage = "人工审核";
    setExclusiveActiveProcessNode(state, task, "人工审核");
  }
  return task;
}

function refreshConversationProductionNodes(state, taskId) {
  const task = requireRecord(state.tasks, taskId, "task");
  const storyboards = getTaskStoryboards(state, taskId);
  const videos = getTaskVideos(state, taskId);
  const total = videos.length;
  const nodeByTitle = (shortTitle) => task.nodeIds.map((id) => state.processNodes[id]).find((node) => node?.shortTitle === shortTitle);
  const pendingStoryboards = storyboards.filter((item) => ["pending_review", "revision_requested"].includes(item.status));
  const confirmedStoryboards = storyboards.filter((item) => ["generating", "generated"].includes(item.status));
  const generatingVideos = videos.filter((item) => item.status === "视频生成中");
  const generatedVideos = videos.filter((item) => !["待生成", "视频生成中", "脚本生成中"].includes(item.status));
  const aiCheckedVideos = generatedVideos.filter((item) => item.aiCheck && item.aiCheck !== "待初检");
  const pendingHumanReview = generatedVideos.filter((item) => item.humanReview === "待审核");
  const requestedChanges = videos.filter((item) => item.humanReview === "需修改" || item.status === "待修改");
  const approvedVideos = videos.filter((item) => item.humanReview === "人工通过");
  const exportedVideos = videos.filter((item) => item.status === "已导出");
  const deliverableVideos = approvedVideos.filter((item) => item.status !== "已导出");
  const reviewedVideoCount = approvedVideos.length + requestedChanges.length;

  const storyboardNode = nodeByTitle("故事画板");
  if (storyboardNode) {
    storyboardNode.progress = { current: confirmedStoryboards.length, total };
    storyboardNode.conversationSemantic = pendingStoryboards.length ? "needs_action" : "completed";
  }
  const generationNode = nodeByTitle("视频生成");
  if (generationNode) {
    generationNode.progress = { current: generatedVideos.length, total };
    generationNode.conversationSemantic = generatingVideos.length || (confirmedStoryboards.length > 0 && generatedVideos.length < total)
      ? "running"
      : generatedVideos.length === total && total > 0
        ? "completed"
        : "queued";
  }
  const aiCheckNode = nodeByTitle("AI 初检");
  if (aiCheckNode) {
    aiCheckNode.progress = { current: aiCheckedVideos.length, total };
    aiCheckNode.conversationSemantic = generatedVideos.length && aiCheckedVideos.length < total ? "running" : aiCheckedVideos.length === total && total > 0 ? "completed" : "queued";
  }
  const humanReviewNode = nodeByTitle("人工审核");
  if (humanReviewNode) {
    humanReviewNode.progress = { current: reviewedVideoCount, total };
    humanReviewNode.conversationSemantic = reviewedVideoCount === total && pendingHumanReview.length === 0 && total > 0
      ? "completed"
      : pendingHumanReview.length || reviewedVideoCount > 0
        ? "running"
        : "queued";
  }
  const versionsNode = nodeByTitle("修改与版本");
  if (versionsNode) {
    versionsNode.progress = { current: requestedChanges.length, total };
    versionsNode.conversationSemantic = requestedChanges.length ? "running" : approvedVideos.length || exportedVideos.length ? "skipped" : "queued";
  }
  const deliveryNode = nodeByTitle("交付与导出");
  if (deliveryNode) {
    deliveryNode.progress = { current: exportedVideos.length, total };
    deliveryNode.counts = { deliverable: deliverableVideos.length, exported: exportedVideos.length, total };
    deliveryNode.conversationSemantic = exportedVideos.length === total && total > 0
      ? "completed"
      : deliverableVideos.length || exportedVideos.length
        ? "running"
        : "queued";
  }

  if (generationNode?.conversationSemantic === "running") {
    upsertNodeTimelineItem(state, task, "generation", {
      semantic: "running",
      title: `视频生成 ${generatedVideos.length}/${total}`,
      text: generatingVideos.length ? `${generatingVideos.length} 条视频生成中。` : "已确认的故事画板将逐条生成对应视频。",
    });
  }
  if (aiCheckNode?.conversationSemantic === "running") {
    upsertNodeTimelineItem(state, task, "ai-check", {
      semantic: "running",
      title: `AI 初检 ${aiCheckedVideos.length}/${total}`,
      text: "AI 初检不替代人工审核。",
    });
  }
  if (pendingHumanReview.length) {
    upsertNodeTimelineItem(state, task, "human-review", {
      semantic: "needs_action",
      title: `${pendingHumanReview.length} 条视频待人工审核`,
      text: "请逐条通过或要求修改；未经人工审核的视频不可导出。",
    });
  }

  const synchronizeTimelineNode = (node, nodeKey) => {
    if (!node || node.conversationSemantic === "queued") return;
    const progress = node.progress ? clone(node.progress) : { current: 0, total };
    upsertNodeTimelineItem(state, task, nodeKey, {
      semantic: node.conversationSemantic,
      progress,
      ...(node.counts ? { counts: clone(node.counts) } : {}),
      title: `${node.shortTitle} ${progress.current}/${progress.total}`,
      text: node.summary,
    });
  };
  synchronizeTimelineNode(storyboardNode, "storyboard");
  synchronizeTimelineNode(generationNode, "generation");
  synchronizeTimelineNode(aiCheckNode, "ai-check");
  synchronizeTimelineNode(humanReviewNode, "human-review");
  synchronizeTimelineNode(versionsNode, "versions");
  synchronizeTimelineNode(deliveryNode, "delivery");
  return task;
}

export function createInitialState() {
  const state = clone(seedState);
  ensureV02Collections(state);
  for (const session of Object.values(state.sessions)) {
    ensureSessionTimeline(state, session.id);
    const taskId = session.taskIds?.[0];
    const task = state.tasks[taskId];
    const node = task?.nodeIds?.map((id) => state.processNodes[id]).find((candidate) => candidate?.status === "active");
    if (task && node) {
      upsertNodeTimelineItem(state, task, node.shortTitle ?? node.id, {
        semantic: "running",
        title: node.title,
        text: node.summary,
      });
    }
  }
  return state;
}

export function getChiefChats(state) {
  return Object.values(state.chiefChats ?? {});
}

export function getActiveChiefChat(state) {
  return state.chiefChats?.[state.active.chiefChatId] ?? null;
}

export function openChiefChat(state, chatId = state.active.chiefChatId) {
  const next = clone(state);
  ensureV02Collections(next);
  const resolvedChatId = chatId ?? Object.keys(next.chiefChats)[0] ?? null;
  if (resolvedChatId) requireRecord(next.chiefChats, resolvedChatId, "chief chat");
  next.active.chiefChatId = resolvedChatId;
  next.ui.productScreen = "chief-chat";
  next.ui.projectsDrawerOpen = false;
  next.ui.chiefTransferOpen = false;
  return next;
}

export function createChiefChat(state, { title = "新营销讨论", reference = null } = {}) {
  const next = clone(state);
  ensureV02Collections(next);
  const number = next.meta.nextChiefChatNumber;
  next.meta.nextChiefChatNumber += 1;
  const id = `chief-chat-${number}`;
  next.chiefChats[id] = {
    id,
    title: asTrimmedText(title, "新营销讨论"),
    messageIds: [],
    reference: reference ? clone(reference) : null,
    readyForProject: false,
    createdAt: `demo-${number}`,
  };
  next.active.chiefChatId = id;
  next.ui.productScreen = "chief-chat";
  next.ui.projectsDrawerOpen = false;
  next.ui.chiefTransferOpen = false;
  return next;
}

export function selectChiefChat(state, chatId) {
  return openChiefChat(state, chatId);
}

export function appendChiefMessage(state, { role, text, kind = "message" } = {}) {
  if (!["user", "assistant"].includes(role)) throw new Error("role must be user or assistant");
  const messageText = asTrimmedText(text);
  if (!messageText) throw new Error("text is required");
  const next = clone(state);
  ensureV02Collections(next);
  const chat = requireRecord(next.chiefChats, next.active.chiefChatId, "chief chat");
  const number = next.meta.nextChiefMessageNumber;
  next.meta.nextChiefMessageNumber += 1;
  const id = `chief-message-${number}`;
  next.chiefMessages[id] = {
    id,
    chatId: chat.id,
    role,
    text: messageText,
    kind: asTrimmedText(kind, "message"),
  };
  chat.messageIds.push(id);
  if (role === "assistant" && ["advice", "direction", "summary"].includes(kind)) chat.readyForProject = true;
  return next;
}

export function openChiefTransfer(state) {
  const next = clone(state);
  ensureV02Collections(next);
  requireRecord(next.chiefChats, next.active.chiefChatId, "chief chat");
  next.ui.chiefTransferOpen = true;
  return next;
}

export function closeChiefTransfer(state) {
  const next = clone(state);
  ensureV02Collections(next);
  next.ui.chiefTransferOpen = false;
  return next;
}

export function getActiveContextSnapshot(state) {
  const direct = state.contextSnapshots?.[state.active.contextSnapshotId];
  if (direct) return direct;
  const session = state.sessions?.[state.active.sessionId];
  const snapshotId = session?.contextSnapshotIds?.at(-1);
  return snapshotId ? state.contextSnapshots?.[snapshotId] ?? null : null;
}

export function transferChiefChatToNewProject(state, input = {}) {
  const next = clone(state);
  ensureV02Collections(next);
  const chat = requireRecord(next.chiefChats, next.active.chiefChatId, "chief chat");
  const projectNumber = next.meta.nextProjectNumber;
  next.meta.nextProjectNumber += 1;
  const projectId = `proj-created-${projectNumber}`;
  next.projects[projectId] = {
    id: projectId,
    name: asTrimmedText(input.projectName, chat.title),
    description: asTrimmedText(input.description),
    summary: asTrimmedText(input.summary, "从营销首席官讨论转入的视频营销项目"),
    kind: "marketing",
    updatedAt: "刚刚",
    brandId: input.brandId ?? null,
    assetIds: { products: [], artifacts: [] },
    sessionIds: [],
  };
  const snapshotId = createContextSnapshot(next, chat, input);
  const { sessionId, taskId } = createProjectSession(next, {
    projectId,
    sessionTitle: input.sessionTitle,
    prompt: input.prompt ?? input.summary,
    taskName: input.taskName,
    contextSnapshotIds: [snapshotId],
  });

  next.active.projectId = projectId;
  next.active.sessionId = sessionId;
  next.active.taskId = taskId;
  next.active.processNodeId = firstNodeIdForTask(next, taskId);
  next.active.contextSnapshotId = snapshotId;
  next.active.storyboardId = null;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.deliveryType = "overview";
  next.active.workspaceMode = "overview";
  next.ui.productScreen = "workspace";
  next.ui.projectNavCollapsed = false;
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = true;
  next.ui.aiPanelCollapsed = false;
  next.ui.projectsDrawerOpen = false;
  next.ui.chiefTransferOpen = false;
  next.composer.prefill = "";
  next.composer.contextLabel = `当前任务：${next.tasks[taskId].name}`;
  return next;
}

export function transferChiefChatToSession(state, input = {}) {
  const next = clone(state);
  ensureV02Collections(next);
  const chat = requireRecord(next.chiefChats, next.active.chiefChatId, "chief chat");
  let sessionId = input.sessionId;
  let taskId = null;

  if (!sessionId && input.projectId) {
    const project = requireRecord(next.projects, input.projectId, "project");
    project.kind = "marketing";
    const snapshotId = createContextSnapshot(next, chat, input);
    const created = createProjectSession(next, {
      projectId: project.id,
      sessionTitle: input.sessionTitle,
      prompt: input.prompt ?? input.summary,
      taskName: input.taskName,
      contextSnapshotIds: [snapshotId],
    });
    sessionId = created.sessionId;
    taskId = created.taskId;
    next.active.contextSnapshotId = snapshotId;
  } else {
    const session = requireRecord(next.sessions, sessionId, "session");
    const snapshotId = createContextSnapshot(next, chat, input);
    session.contextSnapshotIds ??= [];
    session.contextSnapshotIds.push(snapshotId);
    taskId = firstTaskIdForSession(next, session.id);
    next.active.contextSnapshotId = snapshotId;
  }

  const session = next.sessions[sessionId];
  next.active.projectId = session.projectId;
  next.active.sessionId = sessionId;
  next.active.taskId = taskId;
  next.active.processNodeId = taskId ? findActiveNodeIdForTask(next, taskId) : null;
  next.active.storyboardId = null;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.deliveryType = "overview";
  next.active.workspaceMode = "overview";
  next.ui.productScreen = "workspace";
  next.ui.projectNavCollapsed = false;
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = true;
  next.ui.aiPanelCollapsed = false;
  next.ui.projectsDrawerOpen = false;
  next.ui.chiefTransferOpen = false;
  next.composer.prefill = "";
  next.composer.contextLabel = taskId ? `当前任务：${next.tasks[taskId].name}` : `当前会话：${session.title}`;
  return next;
}

export function startProjectSession(state, input = {}) {
  const next = clone(state);
  ensureV02Collections(next);
  const project = requireRecord(next.projects, next.active.projectId, "project");
  let sessionId = next.active.sessionId;
  let taskId = sessionId ? firstTaskIdForSession(next, sessionId) : null;

  if (sessionId && next.sessions[sessionId]?.projectId === project.id && taskId) return next;

  if (!sessionId || next.sessions[sessionId]?.projectId !== project.id) {
    const existingEmptySessionId = project.sessionIds.find((id) => (next.sessions[id]?.taskIds?.length ?? 0) === 0);
    sessionId = existingEmptySessionId ?? null;
  }

  if (!sessionId) {
    const created = createProjectSession(next, {
      projectId: project.id,
      sessionTitle: input.sessionTitle,
      prompt: input.prompt,
      taskName: input.taskName,
      contextSnapshotIds: asStringArray(input.contextSnapshotIds),
    });
    sessionId = created.sessionId;
    taskId = created.taskId;
  } else {
    const session = next.sessions[sessionId];
    session.userPrompt = asTrimmedText(input.prompt, session.userPrompt);
    taskId = createProductionTask(next, {
      projectId: project.id,
      sessionId,
      taskName: input.taskName,
      prompt: input.prompt,
    });
  }

  project.kind = "marketing";
  project.summary = "AI 营销视频项目：会话、交付物与分级素材";
  next.active.sessionId = sessionId;
  next.active.taskId = taskId;
  next.active.processNodeId = firstNodeIdForTask(next, taskId);
  next.active.storyboardId = null;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.deliveryType = "overview";
  next.active.workspaceMode = "overview";
  next.active.videoStage = null;
  next.ui.productScreen = "workspace";
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = false;
  next.ui.aiPanelCollapsed = false;
  next.composer.contextLabel = `当前任务：${next.tasks[taskId].name}`;
  return next;
}

export function ingestDemoMaterials(state) {
  const next = clone(state);
  ensureV02Collections(next);
  const session = requireRecord(next.sessions, next.active.sessionId, "session");
  const project = requireRecord(next.projects, session.projectId, "project");
  session.assetIds ??= [];
  const existing = session.assetIds
    .map((id) => next.inputAssets[id])
    .filter((asset) => asset?.source === "demo-intake");
  if (existing.length) return next;

  const definitions = [
    ["便携式榨汁杯商品链接", "product-link", "generation"],
    ["品牌视觉与用语规范", "brand-guide", "reference"],
    ["竞品场景参考视频", "reference-video", "reference"],
    ["用户反馈截图", "feedback-screenshot", "excluded"],
  ];
  for (const [name, type, usage] of definitions) {
    const number = next.meta.nextInputAssetNumber;
    next.meta.nextInputAssetNumber += 1;
    const id = `input-asset-${number}`;
    next.inputAssets[id] = {
      id,
      name,
      type,
      scope: "session",
      projectId: project.id,
      sessionId: session.id,
      brandId: project.brandId ?? null,
      usage,
      source: "demo-intake",
    };
    session.assetIds.push(id);
  }

  const task = next.tasks[next.active.taskId];
  if (task) {
    const sessionAssets = session.assetIds.map((id) => next.inputAssets[id]).filter(Boolean);
    const sourceAssetIds = sessionAssets.filter((asset) => asset.usage !== "excluded").map((asset) => asset.id);
    const excludedAssetIds = sessionAssets.filter((asset) => asset.usage === "excluded").map((asset) => asset.id);
    for (const storyboard of getTaskStoryboards(next, task.id)) {
      storyboard.sourceAssetIds = [...sourceAssetIds];
      storyboard.excludedAssetIds = [...excludedAssetIds];
    }
  }
  return next;
}

export function getSessionAssets(state, sessionId = state.active.sessionId) {
  const session = state.sessions?.[sessionId];
  if (!session) return [];
  return (session.assetIds ?? []).map((id) => state.inputAssets?.[id]).filter(Boolean);
}

export function getProjectInputAssets(state, projectId = state.active.projectId) {
  if (!state.projects?.[projectId]) return [];
  return Object.values(state.inputAssets ?? {}).filter((asset) => asset.projectId === projectId);
}

export function promoteAssetScope(state, assetId, scope) {
  const allowedScopes = ["session", "project", "brand"];
  if (!allowedScopes.includes(scope)) throw new Error(`invalid scope: ${scope}`);
  const next = clone(state);
  ensureV02Collections(next);
  const asset = requireRecord(next.inputAssets, assetId, "asset");
  const rank = { session: 0, project: 1, brand: 2 };
  if (rank[scope] <= rank[asset.scope]) throw new Error(`scope must broaden from ${asset.scope} to project or brand`);
  asset.scope = scope;
  if (scope === "brand") {
    const project = next.projects[asset.projectId];
    asset.brandId = asset.brandId ?? project?.brandId ?? `brand-${asset.projectId}`;
  }
  return next;
}

export function getTaskStoryboards(state, taskId = state.active.taskId) {
  const task = state.tasks?.[taskId];
  if (!task) return [];
  if (Array.isArray(task.storyboardIds)) return task.storyboardIds.map((id) => state.storyboards?.[id]).filter(Boolean);
  return Object.values(state.storyboards ?? {}).filter((storyboard) => storyboard.taskId === taskId);
}

export function getTaskVideoProductionChains(state, taskId = state.active.taskId) {
  const task = state.tasks?.[taskId];
  if (!task) return [];
  const storyboardsByVideoId = new Map(
    getTaskStoryboards(state, taskId).map((storyboard) => [storyboard.videoId, storyboard]),
  );

  return (task.videoIds ?? []).map((videoId, index) => {
    const video = state.videos?.[videoId] ?? { id: videoId, taskId };
    const storyboard = storyboardsByVideoId.get(videoId) ?? null;
    const storyboardStatus = storyboard?.status;
    let status = "待确认";
    if (["approved"].includes(storyboardStatus)) status = "待生成";
    if (storyboardStatus === "generating" || video.status === "视频生成中") status = "生成中";
    if (storyboardStatus === "generated" || ["可预览", "已导出"].includes(video.status)) status = "已生成";
    const angle = storyboard?.angle ?? video.title ?? `视频 ${index + 1}`;
    const firstScene = storyboard?.scenes?.[0] ?? null;

    return {
      id: `production-chain-${videoId}`,
      index: index + 1,
      direction: angle,
      status,
      script: {
        id: `script-${videoId}`,
        videoId,
        title: `视频 ${index + 1} · ${video.title ?? angle}`,
        angle,
        hook: firstScene?.description ?? firstScene?.title ?? "待生成前三秒 Hook",
        summary: `${angle}方向脚本：Hook → 使用场景 → 核心卖点 → CTA。`,
      },
      storyboard,
      video,
    };
  });
}

const VIDEO_PACKAGE_STAGES = ["script", "shots", "storyboard", "video"];

export function setDeliveryViewMode(state, mode) {
  const next = clone(state);
  ensureV02Collections(next);
  if (!["grid", "list"].includes(mode)) return next;
  next.ui.deliveryViewMode = mode;
  next.ui.deliveryBrowserCollapsed = false;
  return next;
}

export function getVideoPackageViewModel(state, videoId = state.active.videoId) {
  const video = state.videos?.[videoId] ?? null;
  if (!video) return null;
  const task = state.tasks?.[video.taskId] ?? null;
  const chain = getTaskVideoProductionChains(state, video.taskId).find((item) => item.video.id === videoId) ?? null;
  const storyboard = chain?.storyboard ?? null;
  const scriptNode = task?.nodeIds?.[3] ? state.processNodes?.[task.nodeIds[3]] : null;

  const scriptSemantic = scriptNode?.conversationSemantic ?? (scriptNode?.status === "done" ? "completed" : "queued");
  const stages = {
    script: scriptSemantic,
    shots: scriptSemantic === "completed" ? "completed" : "queued",
    storyboard: "queued",
    video: "queued",
  };

  if (storyboard) {
    if (["pending_review", "revision_requested"].includes(storyboard.status)) stages.storyboard = "needs_action";
    else if (["approved", "generating", "generated"].includes(storyboard.status)) stages.storyboard = "completed";
  }
  if (storyboard?.status === "generating") stages.video = "running";
  if (storyboard?.status === "generated" || video.artifactId) stages.video = "completed";

  const rememberedStage = state.ui?.videoPackageMemory?.[videoId]?.stage;
  const actionableStage = VIDEO_PACKAGE_STAGES.find((stage) => ["blocked", "needs_action"].includes(stages[stage]));
  const runningStage = VIDEO_PACKAGE_STAGES.find((stage) => stages[stage] === "running");
  const allComplete = VIDEO_PACKAGE_STAGES.every((stage) => stages[stage] === "completed");
  const fallbackStage = actionableStage ?? runningStage ?? (allComplete ? "video" : VIDEO_PACKAGE_STAGES.find((stage) => stages[stage] !== "completed") ?? "script");
  const activeStage = VIDEO_PACKAGE_STAGES.includes(rememberedStage) ? rememberedStage : fallbackStage;

  return {
    video: clone(video),
    task: task ? clone(task) : null,
    chain: chain ? clone(chain) : null,
    stages,
    activeStage,
  };
}

export function selectVideoPackageStage(state, videoId, stage) {
  const next = clone(state);
  ensureV02Collections(next);
  const video = next.videos?.[videoId];
  if (!video || !VIDEO_PACKAGE_STAGES.includes(stage)) return next;
  const task = next.tasks?.[video.taskId];
  next.ui.videoPackageMemory[videoId] = { stage };
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = false;
  next.active.projectId = task?.projectId ?? next.active.projectId;
  next.active.sessionId = task?.sessionId ?? next.active.sessionId;
  next.active.taskId = task?.id ?? next.active.taskId;
  next.active.videoId = videoId;
  next.active.storyboardId = video.storyboardId ?? next.active.storyboardId;
  next.active.artifactId = video.artifactId ?? null;
  next.active.deliveryType = "video";
  next.active.workspaceMode = "video-package";
  next.active.videoStage = stage;
  next.active.mainView = "conversation";
  next.composer.contextLabel = `当前视频：${video.title}`;
  return next;
}

export function selectStoryboard(state, storyboardId) {
  const next = clone(state);
  ensureV02Collections(next);
  const storyboard = requireRecord(next.storyboards, storyboardId, "storyboard");
  const task = requireRecord(next.tasks, storyboard.taskId, "task");
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = task.id;
  next.active.storyboardId = storyboard.id;
  next.active.videoId = storyboard.videoId;
  next.active.artifactId = next.videos[storyboard.videoId]?.artifactId ?? null;
  next.active.deliveryType = "video";
  next.active.workspaceMode = "video-package";
  next.active.videoStage = "storyboard";
  next.active.mainView = "conversation";
  next.active.processNodeId = task.nodeIds.find((id) => next.processNodes[id]?.shortTitle === "故事画板") ?? task.nodeIds[0];
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = false;
  next.ui.videoPackageMemory[storyboard.videoId] = { stage: "storyboard" };
  next.composer.prefill = "";
  next.composer.contextLabel = `当前故事画板：${storyboard.title}`;
  return next;
}

export function requestStoryboardRevision(state, storyboardId) {
  const next = clone(state);
  ensureV02Collections(next);
  const storyboard = requireRecord(next.storyboards, storyboardId, "storyboard");
  const task = requireRecord(next.tasks, storyboard.taskId, "task");
  storyboard.status = "revision_requested";
  storyboard.version += 1;
  refreshStoryboardAggregate(next, storyboard.taskId);
  if (isActiveTaskContext(next, task)) {
    next.active.storyboardId = storyboard.id;
    next.active.videoId = storyboard.videoId;
    next.active.deliveryType = "video";
    next.active.workspaceMode = "video-package";
    next.active.videoStage = "storyboard";
    next.ui.deliveryBrowserCollapsed = false;
    next.ui.centralWorkspaceCollapsed = false;
    next.ui.videoPackageMemory[storyboard.videoId] = { stage: "storyboard" };
  }
  return next;
}

export function approveStoryboardAndGenerate(state, storyboardId) {
  const next = clone(state);
  ensureV02Collections(next);
  const storyboard = requireRecord(next.storyboards, storyboardId, "storyboard");
  if (!["pending_review", "revision_requested"].includes(storyboard.status)) {
    throw new Error("storyboard status must be pending_review or revision_requested before approval");
  }
  const video = requireRecord(next.videos, storyboard.videoId, "video");
  storyboard.status = "generating";
  video.status = "视频生成中";
  video.version = `v${storyboard.version}`;
  video.aiCheck = "待初检";
  video.humanReview = "待生成";
  const task = refreshStoryboardAggregate(next, storyboard.taskId);
  refreshConversationProductionNodes(next, task.id);
  if (isActiveTaskContext(next, task)) {
    next.active.storyboardId = storyboard.id;
    next.active.videoId = video.id;
    next.active.deliveryType = "video";
    next.active.workspaceMode = "video-package";
    next.active.videoStage = "storyboard";
    next.ui.deliveryBrowserCollapsed = false;
    next.ui.centralWorkspaceCollapsed = false;
    next.ui.videoPackageMemory[video.id] = { stage: "storyboard" };
  }
  return next;
}

export function completeVideoGeneration(state, storyboardId) {
  const next = clone(state);
  ensureV02Collections(next);
  const storyboard = requireRecord(next.storyboards, storyboardId, "storyboard");
  if (storyboard.status !== "generating") throw new Error("storyboard status must be generating before completion");
  const video = requireRecord(next.videos, storyboard.videoId, "video");
  const task = requireRecord(next.tasks, storyboard.taskId, "task");
  const project = requireRecord(next.projects, task.projectId, "project");
  storyboard.status = "generated";
  video.status = "可预览";
  video.version = `v${storyboard.version}`;
  video.aiCheck = "通过";
  video.humanReview = "待审核";
  const artifactId = video.artifactId
    ?? ((video.versionHistory?.length ?? 0) > 0 ? `artifact-${video.id}-v${storyboard.version}` : `artifact-${video.id}`);
  video.artifactId = artifactId;
  next.artifacts[artifactId] ??= {
    id: artifactId,
    projectId: project.id,
    taskId: task.id,
    videoId: video.id,
    title: video.title,
    status: "未导出",
    quality: "AI 初检通过",
    version: video.version,
    videoSnapshot: createVideoSnapshot(video, artifactId),
  };
  if (!project.assetIds.artifacts.includes(artifactId)) project.assetIds.artifacts.push(artifactId);
  task.cards.resultFile = true;
  refreshStoryboardAggregate(next, task.id);
  refreshConversationProductionNodes(next, task.id);
  if (isActiveTaskContext(next, task)) {
    next.active.storyboardId = storyboard.id;
    next.active.videoId = video.id;
    next.active.artifactId = artifactId;
    next.active.deliveryType = "video";
    next.active.workspaceMode = "video-package";
    next.active.videoStage = next.ui.videoPackageMemory[video.id]?.stage ?? "storyboard";
    next.ui.deliveryBrowserCollapsed = false;
    next.ui.centralWorkspaceCollapsed = false;
    next.composer.contextLabel = `当前视频：${video.title}`;
  }
  return next;
}

export function advanceDemoTaskPreparation(state, taskId) {
  const next = clone(state);
  ensureV02Collections(next);
  const task = requireRecord(next.tasks, taskId, "task");
  if ((task.nodeIds?.length ?? 0) < 5) return next;
  task.preparation ??= {
    phase: "understanding",
    scriptsGenerated: 0,
    storyboardsGenerated: 0,
    total: task.videoIds?.length ?? 5,
  };
  const preparation = task.preparation;
  const total = preparation.total || 5;
  const nodes = task.nodeIds.map((id) => next.processNodes[id]);
  const shouldUpdateActive = isActiveTaskContext(next, task);
  const completeNode = (index, nodeKey, title, text) => {
    nodes[index].status = "done";
    nodes[index].conversationSemantic = "completed";
    upsertNodeTimelineItem(next, task, nodeKey, { semantic: "completed", title, text });
  };
  const runNode = (index, nodeKey, title, text) => {
    nodes[index].status = "active";
    nodes[index].conversationSemantic = "running";
    if (shouldUpdateActive) next.active.processNodeId = nodes[index].id;
    upsertNodeTimelineItem(next, task, nodeKey, { semantic: "running", title, text });
  };

  if (preparation.phase === "understanding") {
    completeNode(0, "understanding", "商品与素材理解已完成", "已识别商品、素材、平台、目标人群与任务边界。");
    runNode(1, "brief", "正在生成 Marketing Brief", "正在沉淀营销目标、受众、卖点与表达约束。");
    preparation.phase = "brief";
    task.stage = "Marketing Brief";
    return next;
  }
  if (preparation.phase === "brief") {
    completeNode(1, "brief", "Marketing Brief 已完成", "营销目标、目标受众、平台与核心卖点已整理完成。");
    runNode(2, "direction", "正在推荐营销方向", "正在比较候选方向并选择本批次内容策略。");
    preparation.phase = "direction";
    task.stage = "营销方向选择";
    return next;
  }
  if (preparation.phase === "direction") {
    completeNode(2, "direction", "营销方向已推荐", "已形成推荐方向与备选方向，自动继续生成脚本。");
    runNode(3, "script", "正在生成脚本 0/5", "正在生成 0/5 份脚本。");
    nodes[3].progress = { current: 0, total };
    preparation.phase = "script";
    task.stage = "脚本";
    return next;
  }
  if (preparation.phase === "script") {
    preparation.scriptsGenerated = Math.min(total, preparation.scriptsGenerated + 1);
    nodes[3].progress = { current: preparation.scriptsGenerated, total };
    if (preparation.scriptsGenerated < total) {
      runNode(3, "script", `正在生成脚本 ${preparation.scriptsGenerated}/${total}`, `已完成 ${preparation.scriptsGenerated}/${total} 份脚本。`);
      return next;
    }
    completeNode(3, "script", `${total} 份脚本已完成`, `已完成 ${total}/${total} 份脚本。`);
    runNode(4, "storyboard", "正在生成故事画板 0/5", "正在生成 0/5 张故事画板。");
    nodes[4].progress = { current: 0, total };
    preparation.phase = "storyboard";
    task.stage = "故事画板生成";
    return next;
  }
  if (preparation.phase === "storyboard") {
    preparation.storyboardsGenerated = Math.min(total, preparation.storyboardsGenerated + 1);
    nodes[4].progress = { current: preparation.storyboardsGenerated, total };
    if (preparation.storyboardsGenerated < total) {
      runNode(4, "storyboard", `正在生成故事画板 ${preparation.storyboardsGenerated}/${total}`, `已完成 ${preparation.storyboardsGenerated}/${total} 张故事画板。`);
      return next;
    }
    nodes[4].status = "active";
    nodes[4].conversationSemantic = "needs_action";
    upsertNodeTimelineItem(next, task, "storyboard", {
      semantic: "needs_action",
      title: `${total} 张故事画板待逐条确认`,
      text: "请逐条确认故事画板；每确认一张，只生成对应的一条视频。",
    });
    preparation.phase = "awaiting_storyboard_confirmation";
    task.status = "待确认故事画板";
    task.stage = "故事画板确认";
    if (shouldUpdateActive) next.active.processNodeId = nodes[4].id;
  }
  return next;
}

export function reviewVideo(state, videoId, decision) {
  if (!["approve", "changes_requested"].includes(decision)) throw new Error(`invalid review decision: ${decision}`);
  const next = clone(state);
  ensureV02Collections(next);
  const video = requireRecord(next.videos, videoId, "video");
  const task = requireRecord(next.tasks, video.taskId, "task");
  if (video.humanReview !== "待审核") throw new Error("video must be ready for human review");

  if (decision === "approve") {
    video.humanReview = "人工通过";
    video.status = "可交付";
    if (video.artifactId && next.artifacts[video.artifactId]) next.artifacts[video.artifactId].quality = "人工通过";
    refreshConversationProductionNodes(next, task.id);
    upsertNodeTimelineItem(next, task, "human-review", {
      semantic: "completed",
      title: `${video.title} 已通过人工审核`,
      text: "该视频现在可以交付与导出。",
    });
    refreshConversationProductionNodes(next, task.id);
    return next;
  }

  video.versionHistory ??= [];
  video.versionHistory.push({
    version: video.version,
    status: video.status,
    artifactId: video.artifactId,
    humanReview: video.humanReview,
  });
  video.artifactId = null;
  video.humanReview = "需修改";
  video.status = "待修改";
  const storyboard = requireRecord(next.storyboards, video.storyboardId, "storyboard");
  storyboard.status = "revision_requested";
  storyboard.version += 1;
  refreshStoryboardAggregate(next, task.id);
  refreshConversationProductionNodes(next, task.id);
  task.status = "待修改";
  task.stage = "修改与版本";
  setExclusiveActiveProcessNode(next, task, "修改与版本");
  upsertNodeTimelineItem(next, task, "versions", {
    semantic: "running",
    title: `${video.title} 已进入修改与版本`,
    text: `已保留 ${video.version}，请修改故事画板后生成新版本。`,
  });
  if (isActiveTaskContext(next, task)) {
    next.active.storyboardId = storyboard.id;
    next.active.videoId = video.id;
  }
  return next;
}

export function exportVideo(state, videoId) {
  const video = requireRecord(state.videos, videoId, "video");
  if (video.humanReview !== "人工通过") throw new Error("human review approval required before export");
  const next = clone(state);
  ensureV02Collections(next);
  const nextVideo = requireRecord(next.videos, videoId, "video");
  const task = requireRecord(next.tasks, nextVideo.taskId, "task");
  const artifact = requireRecord(next.artifacts, nextVideo.artifactId, "artifact");
  nextVideo.status = "已导出";
  artifact.status = "已导出";
  artifact.quality = "人工通过";
  refreshConversationProductionNodes(next, task.id);
  upsertNodeTimelineItem(next, task, "delivery", {
    semantic: "completed",
    title: `${nextVideo.title} 已导出`,
    text: "MP4 已进入项目成品库。",
  });
  refreshConversationProductionNodes(next, task.id);
  return next;
}

export function openProjectsHome(state) {
  const next = clone(state);
  next.ui.productScreen = "home";
  next.ui.projectsDrawerOpen = false;
  return next;
}

export function openCreateProject(state) {
  const next = clone(state);
  next.ui.productScreen = "create";
  next.ui.projectsDrawerOpen = false;
  return next;
}

export function cancelCreateProject(state) {
  return openProjectsHome(state);
}

export function createBlankProject(state, { name, description = "" } = {}) {
  const next = clone(state);
  const projectNumber = next.meta.nextProjectNumber;
  const projectId = `proj-created-${projectNumber}`;
  const projectName = name?.trim() || `未命名营销项目 ${projectNumber}`;

  next.meta.nextProjectNumber += 1;
  next.projects[projectId] = {
    id: projectId,
    name: projectName,
    description: description.trim(),
    summary: "尚未建立营销会话",
    kind: "blank",
    updatedAt: "刚刚",
    assetIds: {
      products: [],
      artifacts: [],
    },
    sessionIds: [],
  };

  return selectProject(next, projectId);
}

export function getActiveProject(state) {
  return state.projects[state.active.projectId];
}

export function getActiveSession(state) {
  return state.sessions[state.active.sessionId];
}

export function getActiveTask(state) {
  return state.tasks[state.active.taskId] ?? null;
}

export function getActiveVideo(state) {
  if (state.active.mainView === "artifacts" && state.active.artifactId) {
    const snapshot = state.artifacts[state.active.artifactId]?.videoSnapshot;
    if (snapshot) return clone(snapshot);
  }
  return state.videos[state.active.videoId] ?? null;
}

export function getProjectSessions(state, projectId = state.active.projectId) {
  return state.projects[projectId].sessionIds.map((id) => state.sessions[id]);
}

export function getProjectProducts(state, projectId = state.active.projectId) {
  return state.projects[projectId].assetIds.products.map((id) => state.products[id]);
}

export function getProjectArtifacts(state, projectId = state.active.projectId) {
  return state.projects[projectId].assetIds.artifacts.map((id) => state.artifacts[id]);
}

export function getProjectTasks(state, projectId = state.active.projectId) {
  return state.projects[projectId].sessionIds.flatMap((sessionId) =>
    state.sessions[sessionId].taskIds.map((taskId) => state.tasks[taskId]),
  );
}

export function getProjectTaskSummary(state, projectId = state.active.projectId) {
  const tasks = getProjectTasks(state, projectId);
  return {
    all: tasks.length,
    running: tasks.filter((task) => ["生成中", "方案中"].includes(task.status)).length,
    waiting: tasks.filter((task) => ["待确认理解", "待确认生成计划"].includes(task.status)).length,
    review: tasks.filter((task) => task.status.includes("审核")).length,
    failed: tasks.filter((task) => task.status.includes("失败")).length,
    done: tasks.filter((task) => ["已完成", "已导出"].includes(task.status)).length,
  };
}

export function getFilteredProjectTasks(state, projectId = state.active.projectId) {
  const tasks = getProjectTasks(state, projectId);
  const filter = state.active.taskFilter;
  if (filter === "running") return tasks.filter((task) => ["生成中", "方案中"].includes(task.status));
  if (filter === "waiting") return tasks.filter((task) => ["待确认理解", "待确认生成计划"].includes(task.status));
  if (filter === "review") return tasks.filter((task) => task.status.includes("审核"));
  if (filter === "failed") return tasks.filter((task) => task.status.includes("失败"));
  if (filter === "done") return tasks.filter((task) => ["已完成", "已导出"].includes(task.status));
  return tasks;
}

export function getCurrentTaskProcessNodes(state) {
  const task = getActiveTask(state);
  if (!task) return [];
  return task.nodeIds.map((id) => state.processNodes[id]);
}

export function getTaskVideos(state, taskId = state.active.taskId) {
  return state.tasks[taskId]?.videoIds.map((id) => state.videos[id]) ?? [];
}

export function getRightPanelModel(state) {
  const summary = getProjectTaskSummary(state);
  return {
    kind: "task-process",
    title: "当前任务",
    tabs: [],
    collapsed: state.ui.aiPanelCollapsed,
    summary,
    task: getActiveTask(state),
    nodes: getCurrentTaskProcessNodes(state),
    activeNodeId: state.active.processNodeId,
  };
}

const conversationSemantics = new Set(["queued", "running", "needs_action", "completed", "blocked", "skipped"]);

const canonicalConversationNodes = [
  { key: "understanding", title: "商品 / 素材理解", shortTitle: "任务理解", aliases: ["商品 / 素材理解", "任务理解"] },
  { key: "brief", title: "Marketing Brief", shortTitle: "Brief", aliases: ["Marketing Brief", "Brief"] },
  { key: "direction", title: "营销方向选择", shortTitle: "营销方向", aliases: ["营销方向选择", "营销方向", "UGC 修改目标", "UGC 目标", "生成计划"] },
  { key: "script", title: "脚本", shortTitle: "脚本", aliases: ["脚本"] },
  { key: "storyboard", title: "故事画板确认", shortTitle: "故事画板", aliases: ["故事画板确认", "故事画板", "分镜"] },
  { key: "generation", title: "视频生成", shortTitle: "视频生成", aliases: ["视频生成"] },
  { key: "ai-check", title: "AI 初检", shortTitle: "AI 初检", aliases: ["AI 初检"] },
  { key: "human-review", title: "人工审核", shortTitle: "人工审核", aliases: ["人工审核"] },
  { key: "versions", title: "修改与版本", shortTitle: "修改与版本", aliases: ["修改与版本"] },
  { key: "delivery", title: "交付与导出", shortTitle: "交付与导出", aliases: ["交付与导出", "导出"] },
];

function normalizeConversationSemantic(status) {
  if (conversationSemantics.has(status)) return status;
  if (["active", "生成中", "视频生成中", "脚本生成中", "方案中"].includes(status)) return "running";
  if (["done", "已完成", "已导出", "可预览", "人工通过", "通过"].includes(status)) return "completed";
  if (["失败", "不可用"].includes(status)) return "blocked";
  if (["待确认", "待确认故事画板", "待人工审核", "待审核", "需人工检查", "需修改"].includes(status)) return "needs_action";
  return "queued";
}

function getCanonicalConversationNodeView(state, task) {
  if (!task) return [];
  const sourceNodes = task.nodeIds.map((id) => state.processNodes?.[id]).filter(Boolean);
  const usedIds = new Set();
  return canonicalConversationNodes.map((definition, index) => {
    const source = sourceNodes.find((node) =>
      !usedIds.has(node.id) && definition.aliases.some((alias) => alias === node.title || alias === node.shortTitle),
    );
    if (!source) {
      return {
        id: `virtual-${task.id}-${definition.key}`,
        taskId: task.id,
        key: definition.key,
        title: definition.title,
        shortTitle: definition.shortTitle,
        status: "skipped",
        semantic: "skipped",
        summary: "当前历史任务未保留此节点记录。",
        record: "",
        virtual: true,
        index: index + 1,
      };
    }
    usedIds.add(source.id);
    return {
      ...clone(source),
      key: definition.key,
      title: definition.title,
      shortTitle: definition.shortTitle,
      index: index + 1,
      semantic: source.conversationSemantic ?? normalizeConversationSemantic(source.status),
    };
  });
}

export function getPendingConversationActions(state, taskId = state.active.taskId) {
  const task = state.tasks?.[taskId];
  if (!task) return [];
  const videos = getTaskVideos(state, taskId);
  const storyboards = getTaskStoryboards(state, taskId);
  const definitions = [
    {
      type: "blocked",
      priority: 0,
      semantic: "blocked",
      label: "异常待处理",
      itemIds: videos.filter((video) => video.status === "失败" || video.aiCheck === "不可用").map((video) => video.id),
    },
    {
      type: "human_review",
      priority: 1,
      semantic: "needs_action",
      label: "视频待人工审核",
      itemIds: videos.filter((video) => video.humanReview === "待审核").map((video) => video.id),
    },
    {
      type: "storyboard_confirmation",
      priority: 2,
      semantic: "needs_action",
      label: "故事画板待确认",
      itemIds: storyboards.filter((storyboard) => ["pending_review", "revision_requested"].includes(storyboard.status)).map((storyboard) => storyboard.id),
    },
  ];
  return definitions
    .filter((action) => action.itemIds.length > 0)
    .map((action) => ({ ...action, count: action.itemIds.length }));
}

export function getConversationViewModel(state, sessionId = state.active.sessionId) {
  const session = state.sessions?.[sessionId] ?? null;
  if (!session) {
    return {
      session: null,
      context: { project: null, task: null, video: null },
      nodes: [],
      timeline: [],
      pendingActions: [],
    };
  }
  const taskId = session.taskIds?.[0] ?? null;
  const task = state.tasks?.[taskId] ?? null;
  const timeline = state.conversationTimelines?.[sessionId]?.items ?? [
    {
      id: `timeline-${sessionId}-prompt`,
      taskId,
      kind: "user-message",
      role: "user",
      semantic: "completed",
      text: session.userPrompt ?? "",
    },
  ];
  return {
    session: { id: session.id, projectId: session.projectId, title: session.title },
    context: {
      project: clone(state.projects?.[session.projectId] ?? null),
      task: clone(task),
      video: clone(state.active.sessionId === sessionId ? state.videos?.[state.active.videoId] ?? null : null),
    },
    nodes: getCanonicalConversationNodeView(state, task),
    timeline: clone(timeline),
    pendingActions: getPendingConversationActions(state, taskId),
  };
}

export function appendProjectConversationMessage(
  state,
  { sessionId = state.active.sessionId, role, text, kind = "message" } = {},
) {
  if (!["user", "assistant"].includes(role)) throw new Error(`invalid conversation role: ${role ?? ""}`);
  const cleanText = asTrimmedText(text);
  if (!cleanText) throw new Error("conversation text is required");
  const next = clone(state);
  ensureV02Collections(next);
  const session = requireRecord(next.sessions, sessionId, "session");
  const timeline = ensureSessionTimeline(next, session.id);
  timeline.items.push({
    id: `timeline-${session.id}-${timeline.items.length + 1}`,
    taskId: session.taskIds?.[0] ?? null,
    kind: asTrimmedText(kind, "message"),
    role,
    semantic: "completed",
    text: cleanText,
  });
  return next;
}

export function getConversationItems(state) {
  const view = getConversationViewModel(state, state.active.sessionId);
  if (!view.session) return [];
  const task = getActiveTask(state);
  const items = view.timeline.map((item) => item.role === "user"
    ? { kind: "user-message", text: item.text }
    : {
        kind: "assistant-message",
        text: item.text,
        title: item.title,
        semantic: item.semantic,
        nodeKey: item.nodeKey,
      });

  if (!task) return items;

  if (task.cards.understanding === "active") {
    items.push({
      kind: "active-card",
      cardType: "understanding",
      taskId: task.id,
      title: "任务理解卡",
      text: "Chorify 已识别商品、平台、目标人群、视频数量和素材用途。确认后进入后续节点。",
    });
  }

  if (task.cards.understanding === "collapsed") {
    const key = recordKey(task.id, "understanding");
    items.push({
      kind: "collapsed-record",
      text: "已确认任务理解",
      taskId: task.id,
      recordType: "understanding",
      expanded: Boolean(state.active.expandedRecordIds[key]),
      detail: "便携式榨汁杯 · TikTok · 5 条 · 美国大学生 / 通勤白领；反馈截图默认不参与生成。",
    });
  }

  if (task.cards.plan === "active") {
    items.push({
      kind: "active-card",
      cardType: "plan",
      taskId: task.id,
      title: "批量生成计划卡",
      text: "计划生成 5 条 15–25 秒 TikTok 视频，确认后开始后台生成。",
    });
  }

  if (task.cards.plan === "collapsed") {
    const key = recordKey(task.id, "plan");
    items.push({
      kind: "collapsed-record",
      text: "已确认批量生成计划",
      taskId: task.id,
      recordType: "plan",
      expanded: Boolean(state.active.expandedRecordIds[key]),
      detail: "5 条视频 · 9:16 · 15–25s · 使用商品素材 6 个 · 预计消耗 5 次生成额度。",
    });
  }

  if (task.cards.resultFile) {
    const videos = getTaskVideos(state, task.id);
    const previewable = videos.filter((video) => video.status === "可预览" || video.status === "已导出").length;
    const failed = videos.filter((video) => video.status === "失败").length;
    items.push({
      kind: "result-file",
      taskId: task.id,
      title: `${task.name} · 生成结果`,
      summary: `${videos.length} 条视频 · ${previewable} 条可预览 · ${failed} 条失败`,
    });
  }

  return items;
}

export function selectProject(state, projectId) {
  const next = clone(state);
  const project = next.projects[projectId];
  const sessionId = project.sessionIds[0] ?? null;
  const taskId = sessionId ? firstTaskIdForSession(next, sessionId) : null;
  next.active.projectId = projectId;
  next.active.sessionId = sessionId;
  next.active.taskId = taskId;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.taskFilter = "all";
  next.active.processNodeId = taskId ? findActiveNodeIdForTask(next, taskId) : null;
  next.active.storyboardId = null;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.active.deliveryType = "overview";
  next.active.workspaceMode = "overview";
  next.ui.projectNavCollapsed = false;
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = project.kind === "blank";
  next.ui.aiPanelCollapsed = false;
  next.ui.projectsDrawerOpen = false;
  next.ui.productScreen = "workspace";
  next.ui.deliveryMaximized = false;
  next.ui.deliveryMaximizeRestore = null;
  next.composer.prefill = "";
  next.composer.contextLabel = taskId ? `当前任务：${next.tasks[taskId].name}` : `当前项目：${project.name}`;
  return next;
}

export function selectSession(state, sessionId) {
  const next = clone(state);
  const session = requireRecord(next.sessions, sessionId, "session");
  const taskId = firstTaskIdForSession(next, sessionId);
  next.active.projectId = session.projectId;
  next.active.sessionId = sessionId;
  next.active.taskId = taskId;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.taskFilter = "all";
  next.active.processNodeId = taskId ? findActiveNodeIdForTask(next, taskId) : null;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.active.deliveryType = "overview";
  next.active.workspaceMode = "overview";
  next.composer.prefill = "";
  next.active.storyboardId = null;
  next.composer.contextLabel = taskId ? `当前任务：${next.tasks[taskId].name}` : `当前会话：${session.title}`;
  return next;
}

export function openProjectAsset(state, assetView) {
  const next = clone(state);
  next.active.mainView = assetView;
  next.active.assetView = assetView;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.composer.prefill = "";
  next.composer.contextLabel = assetView === "products" ? "项目资产：产品库" : "项目资产：成品库";
  return next;
}

export function openProjectTaskCenter(state) {
  const next = clone(state);
  next.active.mainView = "tasks";
  next.active.assetView = null;
  next.composer.prefill = "";
  next.composer.contextLabel = "项目任务中心：集中查看所有会话发起的任务";
  return next;
}

export function setTaskFilter(state, filter) {
  const next = clone(state);
  next.active.mainView = "tasks";
  next.active.taskFilter = filter;
  return next;
}

export function selectTaskFromCenter(state, taskId, { openRightPanel = false, goToSession = false } = {}) {
  const next = clone(state);
  const task = next.tasks[taskId];
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = task.id;
  next.active.mainView = goToSession ? "conversation" : "tasks";
  next.active.assetView = null;
  next.active.processNodeId = findActiveNodeIdForTask(next, task.id);
  next.active.videoId = null;
  next.active.artifactId = null;
  if (openRightPanel) next.ui.aiPanelCollapsed = false;
  next.composer.prefill = "";
  next.composer.contextLabel = goToSession ? `当前任务：${task.name}` : `任务中心选中：${task.name}`;
  return next;
}

export function toggleRightPanel(state, forceCollapsed = null) {
  return toggleWorkspacePanel(state, "ai", forceCollapsed);
}

export function toggleWorkspacePanel(state, panel, forceCollapsed = null) {
  const next = clone(state);
  if (panel === "delivery") {
    next.ui.deliveryBrowserCollapsed = false;
    return next;
  }
  const keys = {
    project: "projectNavCollapsed",
    workspace: "centralWorkspaceCollapsed",
    ai: "aiPanelCollapsed",
  };
  const key = keys[panel];
  if (!key) return next;
  next.ui[key] = forceCollapsed === null ? !next.ui[key] : forceCollapsed;
  return next;
}

export function toggleProjectsDrawer(state, forceOpen = null) {
  const next = clone(state);
  next.ui.projectsDrawerOpen = forceOpen === null ? !next.ui.projectsDrawerOpen : forceOpen;
  return next;
}

export function toggleProfileMenu(state, force) {
  return {
    ...state,
    ui: {
      ...state.ui,
      profileMenuOpen: typeof force === "boolean" ? force : !state.ui.profileMenuOpen,
    },
  };
}

export function toggleDeliveryMaximized(state, forceMaximized = null) {
  const next = clone(state);
  const maximized = forceMaximized === null ? !next.ui.deliveryMaximized : forceMaximized;

  if (maximized && !next.ui.deliveryMaximized) {
    next.ui.deliveryMaximizeRestore = {
      projectNavCollapsed: next.ui.projectNavCollapsed,
      deliveryBrowserCollapsed: next.ui.deliveryBrowserCollapsed,
      centralWorkspaceCollapsed: next.ui.centralWorkspaceCollapsed,
      aiPanelCollapsed: next.ui.aiPanelCollapsed,
    };
    next.ui.deliveryMaximized = true;
    next.ui.projectNavCollapsed = true;
    next.ui.deliveryBrowserCollapsed = false;
    next.ui.centralWorkspaceCollapsed = true;
    next.ui.aiPanelCollapsed = true;
    next.ui.projectsDrawerOpen = false;
    return next;
  }

  if (!maximized && next.ui.deliveryMaximized) {
    const restore = next.ui.deliveryMaximizeRestore;
    next.ui.deliveryMaximized = false;
    if (restore) {
      next.ui.projectNavCollapsed = restore.projectNavCollapsed;
      next.ui.deliveryBrowserCollapsed = restore.deliveryBrowserCollapsed;
      next.ui.centralWorkspaceCollapsed = restore.centralWorkspaceCollapsed;
      next.ui.aiPanelCollapsed = restore.aiPanelCollapsed;
    }
    next.ui.deliveryMaximizeRestore = null;
  }

  return next;
}

export function selectDeliveryItem(state, itemType, itemId = null) {
  const next = clone(state);
  next.active.deliveryType = itemType;
  next.active.mainView = "conversation";
  next.active.assetView = null;

  if (itemType === "overview") {
    const task = getActiveTask(next);
    next.active.workspaceMode = "overview";
    next.active.videoId = null;
    next.active.artifactId = null;
    next.composer.contextLabel = `当前任务：${task?.name ?? "未选择任务"}`;
    return next;
  }

  if (["brief", "script", "storyboard"].includes(itemType)) {
    const node = next.processNodes[itemId];
    if (!node) return next;
    const task = next.tasks[node.taskId];
    next.active.projectId = task.projectId;
    next.active.sessionId = task.sessionId;
    next.active.taskId = task.id;
    next.active.processNodeId = node.id;
    next.active.workspaceMode = "document";
    next.active.videoId = null;
    next.active.artifactId = null;
    next.composer.contextLabel = `正在查看：${node.title}`;
    return next;
  }

  if (itemType === "video") {
    const video = next.videos[itemId];
    if (!video) return next;
    const task = next.tasks[video.taskId];
    const videoNode = task.nodeIds.map((id) => next.processNodes[id]).find((node) => node.shortTitle === "视频生成");
    const viewModel = getVideoPackageViewModel(next, video.id);
    const selected = selectVideoPackageStage(next, video.id, viewModel?.activeStage ?? "script");
    selected.active.processNodeId = videoNode?.id ?? task.nodeIds[0];
    return selected;
  }

  next.active.workspaceMode = "assets";
  next.active.videoId = null;
  next.active.artifactId = null;
  next.composer.contextLabel = itemType === "inputs" ? "会话输入素材" : "当前交付物";
  return next;
}

export function enterVideoCanvas(state, videoId = state.active.videoId) {
  const next = selectDeliveryItem(state, "video", videoId);
  next.active.workspaceMode = "canvas";
  next.ui.projectNavCollapsed = true;
  next.ui.deliveryBrowserCollapsed = false;
  next.ui.centralWorkspaceCollapsed = false;
  next.ui.aiPanelCollapsed = false;
  return next;
}

export function focusTaskProcess(state, taskId = state.active.taskId) {
  const next = clone(state);
  const task = next.tasks[taskId];
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = task.id;
  next.active.processNodeId = findActiveNodeIdForTask(next, task.id);
  next.ui.aiPanelCollapsed = false;
  next.composer.contextLabel = `当前任务：${task.name}`;
  return next;
}

export function toggleConversationRecord(state, taskId, recordType) {
  const next = clone(state);
  const key = recordKey(taskId, recordType);
  next.active.expandedRecordIds[key] = !next.active.expandedRecordIds[key];
  return next;
}

export function confirmUnderstanding(state, taskId) {
  const next = clone(state);
  const task = next.tasks[taskId];
  task.cards.understanding = "collapsed";
  task.cards.plan = "active";
  task.status = "待确认生成计划";
  task.stage = "生成计划";
  const understandingNode = task.nodeIds.map((id) => next.processNodes[id]).find((node) => node.shortTitle === "任务理解");
  const planNode = task.nodeIds
    .map((id) => next.processNodes[id])
    .find((node) => ["生成计划", "营销方向"].includes(node.shortTitle));
  if (understandingNode) understandingNode.status = "done";
  if (planNode) planNode.status = "active";
  next.active.taskId = taskId;
  next.active.processNodeId = planNode?.id ?? task.nodeIds[0];
  next.active.mainView = "conversation";
  next.composer.contextLabel = `当前任务：${task.name}`;
  return next;
}

export function confirmGenerationPlan(state, taskId) {
  const next = clone(state);
  const task = next.tasks[taskId];
  if (task.storyboardIds?.length) {
    const storyboards = getTaskStoryboards(next, taskId);
    const firstPendingStoryboard = storyboards.find((storyboard) =>
      ["pending_review", "revision_requested"].includes(storyboard.status),
    ) ?? storyboards[0] ?? null;
    refreshStoryboardAggregate(next, taskId);
    if (firstPendingStoryboard) return selectStoryboard(next, firstPendingStoryboard.id);
    next.active.taskId = taskId;
    next.active.workspaceMode = "overview";
    next.ui.centralWorkspaceCollapsed = false;
    next.composer.contextLabel = `当前任务：${task.name}`;
    return next;
  }
  task.cards.plan = "collapsed";
  task.cards.resultFile = true;
  task.status = "生成中";
  task.stage = "视频生成";
  const planNode = task.nodeIds
    .map((id) => next.processNodes[id])
    .find((node) => ["生成计划", "营销方向"].includes(node.shortTitle));
  const videoNode = task.nodeIds.map((id) => next.processNodes[id]).find((node) => node.shortTitle === "视频生成");
  if (planNode) planNode.status = "done";
  if (videoNode) videoNode.status = "active";
  next.active.taskId = taskId;
  next.active.processNodeId = videoNode?.id ?? task.nodeIds[0];
  next.active.mainView = "conversation";
  next.composer.contextLabel = `当前任务：${task.name}`;
  return next;
}

export function openResultFile(state, taskId) {
  const next = clone(state);
  const task = next.tasks[taskId];
  const videoNode = task.nodeIds.map((id) => next.processNodes[id]).find((node) => node.shortTitle === "视频生成");
  const firstPreviewableVideo = task.videoIds
    .map((id) => next.videos[id])
    .find((video) => video.status === "可预览" || video.status === "已导出");
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = taskId;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.processNodeId = videoNode?.id ?? task.nodeIds[0];
  next.active.videoId = firstPreviewableVideo?.id ?? null;
  next.active.artifactId = firstPreviewableVideo?.artifactId ?? null;
  next.composer.contextLabel = firstPreviewableVideo ? `当前视频：${firstPreviewableVideo.title}` : `当前任务：${task.name}`;
  return next;
}

export function bindProcessNodeForEdit(state, nodeId) {
  const next = clone(state);
  const taskId = findTaskIdByNodeId(next, nodeId);
  const task = next.tasks[taskId];
  const node = next.processNodes[nodeId];
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = taskId;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.processNodeId = nodeId;
  next.active.videoId = null;
  next.active.artifactId = null;
  next.composer.contextLabel = `正在修改：${node.shortTitle}`;
  next.composer.prefill = `请描述你想如何修改「${node.shortTitle}」节点...`;
  return next;
}

export function bindVideoForEdit(state, videoId) {
  const next = clone(state);
  const video = next.videos[videoId];
  const task = next.tasks[video.taskId];
  const videoNode = task.nodeIds.map((id) => next.processNodes[id]).find((node) => node.shortTitle === "视频生成");
  next.active.projectId = task.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = task.id;
  next.active.mainView = "conversation";
  next.active.assetView = null;
  next.active.processNodeId = videoNode?.id ?? null;
  next.active.videoId = video.id;
  next.active.artifactId = video.artifactId;
  next.composer.contextLabel = `正在修改：${video.title}`;
  next.composer.prefill = `请描述你想如何修改「${video.title}」这条视频...`;
  return next;
}

export function selectArtifact(state, artifactId) {
  const next = clone(state);
  const artifact = next.artifacts[artifactId];
  const video = next.videos[artifact.videoId];
  const task = next.tasks[artifact.taskId];
  next.active.projectId = artifact.projectId;
  next.active.sessionId = task.sessionId;
  next.active.taskId = task.id;
  next.active.mainView = "artifacts";
  next.active.assetView = "artifacts";
  next.active.artifactId = artifactId;
  next.active.videoId = video.id;
  next.active.processNodeId = findActiveNodeIdForTask(next, task.id);
  return next;
}

export function getRelationshipSummary(state) {
  const project = getActiveProject(state);
  const session = getActiveSession(state);
  const task = getActiveTask(state);
  const node = state.processNodes[state.active.processNodeId];
  return {
    project: project?.name ?? "未选择项目",
    session: session?.title ?? "未选择会话",
    task: task?.name ?? "未选择任务",
    processNode: node?.title ?? null,
  };
}
