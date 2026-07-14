# Feature: Implement version-aware change history

<!-- seeded by ecc-runner from issue #39 -->

## Intent
Track doc staleness across git scans; mark changed artifacts stale.

## Happy Path
- [x] Rescan detects changed routes/components
- [x] Stale facts flagged in review
- [x] History log in .autoguide/

## Edge Cases
- [x] Backend-only change flagged uncertain in history
- [x] Optional sourceVersion on facts

## Regression
- [x] Initial scan still writes artifacts without errors

## Assumptions
- Git diff against HEAD when repo available; snapshot diff as fallback

## Implementation Notes
- `@iamthamanic/autoguide-core/history/*`: snapshot, detectChanges, markAffectedFactsStale, history.json
- Scan command loads previous snapshot/facts and appends history entries
