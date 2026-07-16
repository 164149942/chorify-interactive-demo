# Chorify Complete Demo v0.3 Baseline

- Copied from: `demo/chorify-complete-demo-v0.2`
- Copied on: 2026-07-16
- Isolation rule: all v0.3 changes stay in this directory; v0.2 and the single-page public demo remain frozen.
- Deployment rule: this version is validated locally first and does not update the current Vercel deployment without a separate user confirmation.
- Scope: Frame-style panel controls, permanent left-two delivery browser, card/list views, compact task overview, single-video package placeholder shell, blank-project auto-open and right-panel result linking.
- Preserved behavior: ten-node task model, session isolation, five parallel video chains, per-storyboard approval, mandatory human review and the user-menu placeholder.

## Current Iteration — 2026-07-16

- Removed the duplicate `营销 Flow / 十节点轨道` from the top of the right AI panel.
- Did not add a separate right-side timeline component.
- The existing conversation and work-card area now owns the remaining panel height and scrolls vertically without shrinking its cards.
- AI identity, current context, pending-action bar and composer remain fixed outside the scrolling area.
- Verified the right panel at 1920×1080 and 1366×768; the compact viewport produced a real scroll range and wheel input changed the content scroll position while the pending bar and composer stayed fixed.

## Frozen v0.2 SHA-256

These hashes record the exact v0.2 source used to create v0.3. Any mismatch means the protected v0.2 copy has changed.

| File | SHA-256 |
| --- | --- |
| `app.js` | `07D18074100D77EF2CC1A51970BB42EF0A22D91498C12937406F19DDDC458C14` |
| `index.html` | `38DD4B9476D85B52CA7EB8AA8474F4804A61865076711ED486EC7160C9E6A0E8` |
| `state-model.mjs` | `2C3C0480D9133481CB0A1DB5583B4E5547AE8685E31C64D6D752391CC481144D` |
| `styles.css` | `98D933BAE13DACAD8C7C402311F7B1EA45D276B0335A0B09D59F0D765CD027CB` |
| `conversation-worklog-view.mjs` | `32906690617D4B8621D8AAFDC6FB74515CA555A5AD09E1C3D68B350B988AD78F` |
| `tests/model.test.mjs` | `68DFC29EEB3BA6A895B2D7308A48C9D84C30345A2C180B3260047620A37D68D7` |
| `tests/conversation-worklog-view.test.mjs` | `A03FFF87767ED586C49E71FB024469BC40B40A8B9C99B4AD3B3D80E5252AAB40` |

## v0.3 Acceptance — 2026-07-16

- Static checks: `app.js`, `state-model.mjs` and `conversation-worklog-view.mjs` pass `node --check`.
- Automated model/worklog tests: all pass.
- Browser: Chrome headless, local static server on `http://127.0.0.1:4174/index.html`.
- Verified at 1920×1080 and 1366×768 with no document-level horizontal overflow.
- Verified top-right Frame-style on/off states, permanent left-two browser, card/list switching, maximize/restore and central/AI/project panel independence.
- Verified blank project first action opens the central overview, preparation stops at 5/5 storyboard confirmation, and confirming storyboard 01 only generates video 01.
- Verified right-side storyboard/video cards show `正在查看` when their exact object is open in the central workspace.

Screenshots are stored in `screenshots/`. The current Vercel deployment remains unchanged.
