import test from "node:test";
import assert from "node:assert/strict";
import {
  renderAssetCenterView,
  renderProjectAssetBrowser,
  renderAssetPreview,
  renderSessionAssetPicker,
  renderSessionContextChips,
} from "../asset-library-view.mjs";

const assets = [
  {
    id: "asset-1",
    name: "品牌规范.pdf",
    type: "pdf",
    previewLabel: "PDF",
    version: "V3",
    aiStatus: "understood",
    summary: "品牌色和禁用表达",
    updatedAt: "2026-07-12",
  },
  {
    id: "asset-2",
    name: "产品图",
    type: "image-set",
    previewLabel: "IMG ×12",
    version: "V2",
    aiStatus: "not_understood",
    summary: "十二张产品图",
    updatedAt: "2026-07-10",
  },
];

test("project asset mode renders a flat browser and selected status", () => {
  const html = renderProjectAssetBrowser({
    assets: assets.map((asset, index) => ({ asset, origin: index ? "project-upload" : "workspace", version: asset.version })),
    selectedAssetId: "asset-1",
  });

  assert.match(html, /项目资产/);
  assert.match(html, /从工作空间添加/);
  assert.match(html, /上传项目资产/);
  assert.match(html, /正在查看/);
  assert.doesNotMatch(html, /新建文件夹/);
});

test("asset center keeps folders in the central workspace and scopes in the sidebar", () => {
  const html = renderAssetCenterView({
    scope: "workspace",
    folders: [{ id: "folder-1", name: "便携榨汁杯", assetIds: ["asset-1"] }],
    assets,
    selectedAssetId: "asset-1",
    counts: { workspace: 6, project: 2, session: 1 },
  });

  assert.match(html, /工作空间资产/);
  assert.match(html, /当前项目资产/);
  assert.match(html, /当前会话素材/);
  assert.match(html, /新建文件夹/);
  assert.match(html, /上传资产/);
  assert.match(html, /便携榨汁杯/);
  assert.doesNotMatch(html, /智能分类/);
});

test("asset preview exposes source version understanding and reference actions", () => {
  const html = renderAssetPreview({ asset: assets[0], sourceLabel: "工作空间 / 便携榨汁杯", inProject: true, inSession: false });
  assert.match(html, /品牌规范\.pdf/);
  assert.match(html, /V3/);
  assert.match(html, /AI 已理解/);
  assert.match(html, /加入当前会话/);
});

test("session picker defaults to project assets and context chips can be removed", () => {
  const picker = renderSessionAssetPicker({ open: true, scope: "project", assets, selectedIds: ["asset-1"] });
  const chips = renderSessionContextChips([assets[0]]);

  assert.match(picker, /项目资产/);
  assert.match(picker, /工作空间资产/);
  assert.match(picker, /仅用于本会话/);
  assert.match(chips, /移除 品牌规范\.pdf/);
});
