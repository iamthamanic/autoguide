# Acceptance: recommendation-engine-complete

Issue: #80

## Criteria
- [x] Missing aria/label detection creates recommendation
- [x] doctor command surfaces recommendations
- [x] Tests for recommendation engine output

## Implementation Notes
- `packages/core/src/recommendations/` — clusters, review-queue links, priority sort
- `packages/cli/src/commands/doctor.ts` — prioritized list with review hints
- Scan writes `recommendations.json` linked to `reviews.json` pending items
