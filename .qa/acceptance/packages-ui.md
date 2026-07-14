# Acceptance: packages-ui

Issue: #82

## Criteria
- [x] packages/ui builds standalone
- [x] React widget uses shared tokens
- [x] No React in packages/ui

## Implementation Notes
- `packages/ui` — tokens, `getReviewBadgeState`, `listOrderedFlowSteps`, `resolveWidgetPanelStatus`
- `plugins/react` imports `@iamthamanic/autoguide-ui`; removed `ag-tokens.ts`
- `tokens.css` export for host apps
