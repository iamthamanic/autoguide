# AutoGuide Flutter Example

Minimal Material app demonstrating `AutoGuideScope` + `AutoGuideWidget`.

## Prerequisites

- Flutter SDK ≥ 3.24
- Run `autoguide scan` in your host project and copy `.autoguide/*.json` into `assets/autoguide/`, or use the bundled sample fixtures.

## Run

```bash
cd examples/flutter_app
flutter pub get
flutter run
```

Tap **?** (bottom-right) to open Help. Switch routes with the buttons to see context change.

## Integration path

1. Add `autoguide_flutter` path dependency (see `pubspec.yaml`).
2. Copy or sync scan output: `facts.json`, `pages.json`, `flows.json` → `assets/autoguide/`.
3. Wrap your app with `AutoGuideScope` (pass current route from `GoRouter` / `Navigator`).
4. Add `AutoGuideWidget()` in a top-level `Stack`.
5. CI: run `autoguide validate` on the host repo; refresh assets when docs change.

Architecture details: `plugins/flutter/README.md`.
