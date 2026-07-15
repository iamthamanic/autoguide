# @iamthamanic/autoguide-flutter (`autoguide_flutter`)

Flutter adapter for AutoGuide Help Center widget overlay.

## Architecture — Core bridge (v1)

```
┌─────────────────────┐     ┌──────────────────────────┐
│  Flutter App        │     │  @iamthamanic/autoguide-core (Node)  │
│  AutoGuideScope     │     │  scan / merge / validate │
│  AutoGuideWidget    │     │  (future FFI / channel)  │
└─────────┬───────────┘     └────────────┬─────────────┘
          │                              │
          │  v1: AssetCoreBridge         │  v2: MethodChannel /
          │  (.autoguide JSON assets)    │  dart:ffi to libautoguide
          ▼                              ▼
   assets/autoguide/*.json         .autoguide/ on device
```

| Layer | v1 (this PR) | Future |
|-------|----------------|--------|
| Help logic | Dart port (`help_context`, `search`, `visibility`) | Optional delegate to core |
| Artifacts | `AssetCoreBridge` loads bundled JSON | File bridge + CLI scan on CI |
| Scanner | Not in Flutter (use `autoguide scan` in host repo) | Platform channel stub |

API parity with `@iamthamanic/autoguide-react`:

| React | Flutter |
|-------|---------|
| `AutoGuideProvider` | `AutoGuideScope` |
| `AutoGuideWidget` | `AutoGuideWidget` |
| `userRole`, `mode`, `route` props | Same fields on scope |
| `facts`, `pages`, `flows` | Same lists |

## Install

```yaml
dependencies:
  autoguide_flutter:
    path: ../plugins/flutter   # or pub.dev when published
```

## Usage

```dart
AutoGuideScope(
  appId: 'my-app',
  userRole: 'Mitarbeiter',
  mode: 'published',
  route: '/vacation',
  facts: artifacts.facts,
  pages: artifacts.pages,
  flows: artifacts.flows,
  child: MaterialApp(
    home: Stack(
      children: [
        MyHomePage(),
        AutoGuideWidget(),
      ],
    ),
  ),
);
```

Load artifacts:

```dart
final bridge = AssetCoreBridge(bundle: rootBundle);
final artifacts = await bridge.loadArtifacts();
```

## Tests

```bash
cd plugins/flutter
flutter test
```

See `examples/flutter_app` for a runnable Material example.
