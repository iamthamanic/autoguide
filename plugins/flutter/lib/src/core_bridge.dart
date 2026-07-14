import 'dart:convert';

import 'package:flutter/services.dart';

import 'models.dart';

/// Bridge to AutoGuide knowledge artifacts.
///
/// v1 loads bundled JSON (same shape as `.autoguide/*.json`).
/// Future: platform channel or FFI to `@iamthamanic/autoguide-core` Node runtime.
abstract class AutoGuideCoreBridge {
  Future<ArtifactBundle> loadArtifacts();
}

/// Loads artifacts from Flutter asset bundle (MVP).
class AssetCoreBridge implements AutoGuideCoreBridge {
  AssetCoreBridge({
    this.factsAsset = 'assets/autoguide/facts.json',
    this.pagesAsset = 'assets/autoguide/pages.json',
    this.flowsAsset = 'assets/autoguide/flows.json',
    required this.bundle,
  });

  final String factsAsset;
  final String pagesAsset;
  final String flowsAsset;
  final AssetBundle bundle;

  @override
  Future<ArtifactBundle> loadArtifacts() async {
    final factsJson = jsonDecode(await bundle.loadString(factsAsset)) as List<dynamic>;
    final pagesJson = jsonDecode(await bundle.loadString(pagesAsset)) as List<dynamic>;
    final flowsJson = jsonDecode(await bundle.loadString(flowsAsset)) as List<dynamic>;

    return ArtifactBundle(
      facts: factsJson.map((item) => Fact.fromJson(item as Map<String, dynamic>)).toList(),
      pages: pagesJson.map((item) => PageRecord.fromJson(item as Map<String, dynamic>)).toList(),
      flows: flowsJson.map((item) => FlowRecord.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }
}

/// Stub for desktop/mobile host invoking Node CLI scan (not implemented in v1).
class StubCoreBridge implements AutoGuideCoreBridge {
  StubCoreBridge(this.bundle);

  final ArtifactBundle bundle;

  @override
  Future<ArtifactBundle> loadArtifacts() async => bundle;
}
