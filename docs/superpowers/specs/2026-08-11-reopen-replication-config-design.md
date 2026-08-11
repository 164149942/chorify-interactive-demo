# Reopen Replication Configuration Design

## Goal

Allow a running or completed marketing-factory order to reopen its existing structured replication configuration from the conversation summary.

## Confirmed interaction

- The locked configuration summary exposes a `重新打开配置` action.
- Clicking the action expands the same embedded form in the conversation timeline with all existing values prefilled.
- Opening or editing the form does not delete candidates, version history, review decisions, pending material, or pane selections.
- The open form shows `取消修改` and `保存配置并重新生成`.
- `取消修改` restores the last submitted configuration and returns to the locked summary.
- `保存配置并重新生成` validates the required reference, product, and market fields, then starts a new generation round. Existing candidates remain visible as the previous round until the new round starts, at which point they are replaced by the new candidate slots through the normal progress flow.

## State boundary

`formCollapsed` remains the UI visibility flag. An `editingConfiguration` flag distinguishes reopening an existing submitted order from the initial draft. A `submittedDraft` snapshot provides cancel semantics without coupling the form to rendered HTML.

## Verification

- Model test: reopen keeps candidate, selected video, version history, and review state.
- Model test: cancel restores submitted values.
- View test: running order renders the reopen action, and reopened state renders the prefilled form with cancel/save actions.
- Browser test: a completed sample can reopen the form without closing the results or detail panes.
