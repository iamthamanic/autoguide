/// AutoGuide domain models (parity with @autoguide/core v0.1).
class Fact {
  const Fact({
    required this.id,
    required this.entityId,
    required this.key,
    required this.value,
    required this.status,
    required this.reviewStatus,
    required this.confidence,
    this.roleIds = const [],
    this.provenance = const [],
  });

  final String id;
  final String entityId;
  final String key;
  final Object? value;
  final String status;
  final String reviewStatus;
  final double confidence;
  final List<String> roleIds;
  final List<Provenance> provenance;

  factory Fact.fromJson(Map<String, dynamic> json) {
    return Fact(
      id: json['id'] as String,
      entityId: json['entityId'] as String,
      key: json['key'] as String,
      value: json['value'],
      status: json['status'] as String,
      reviewStatus: json['reviewStatus'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      roleIds: (json['roleIds'] as List<dynamic>? ?? [])
          .map((item) => item as String)
          .toList(),
      provenance: (json['provenance'] as List<dynamic>? ?? [])
          .map((item) => Provenance.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class Provenance {
  const Provenance({
    required this.source,
    required this.confidence,
    required this.observedAt,
    this.filePath,
    this.route,
  });

  final String source;
  final double confidence;
  final String observedAt;
  final String? filePath;
  final String? route;

  factory Provenance.fromJson(Map<String, dynamic> json) {
    return Provenance(
      source: json['source'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      observedAt: json['observedAt'] as String,
      filePath: json['filePath'] as String?,
      route: json['route'] as String?,
    );
  }
}

class PageRecord {
  const PageRecord({
    required this.id,
    required this.route,
    required this.title,
    this.roleIds = const [],
    this.factIds = const [],
    this.status = 'draft',
  });

  final String id;
  final String route;
  final String title;
  final List<String> roleIds;
  final List<String> factIds;
  final String status;

  factory PageRecord.fromJson(Map<String, dynamic> json) {
    return PageRecord(
      id: json['id'] as String,
      route: json['route'] as String,
      title: json['title'] as String,
      roleIds: (json['roleIds'] as List<dynamic>? ?? [])
          .map((item) => item as String)
          .toList(),
      factIds: (json['factIds'] as List<dynamic>? ?? [])
          .map((item) => item as String)
          .toList(),
      status: json['status'] as String? ?? 'draft',
    );
  }
}

class FlowStep {
  const FlowStep({
    required this.order,
    required this.title,
    this.description,
  });

  final int order;
  final String title;
  final String? description;

  factory FlowStep.fromJson(Map<String, dynamic> json) {
    return FlowStep(
      order: json['order'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
    );
  }
}

class FlowRecord {
  const FlowRecord({
    required this.id,
    required this.title,
    required this.steps,
    this.roleIds = const [],
    this.pageIds = const [],
    this.status = 'draft',
  });

  final String id;
  final String title;
  final List<FlowStep> steps;
  final List<String> roleIds;
  final List<String> pageIds;
  final String status;

  factory FlowRecord.fromJson(Map<String, dynamic> json) {
    return FlowRecord(
      id: json['id'] as String,
      title: json['title'] as String,
      steps: (json['steps'] as List<dynamic>)
          .map((item) => FlowStep.fromJson(item as Map<String, dynamic>))
          .toList(),
      roleIds: (json['roleIds'] as List<dynamic>? ?? [])
          .map((item) => item as String)
          .toList(),
      pageIds: (json['pageIds'] as List<dynamic>? ?? [])
          .map((item) => item as String)
          .toList(),
      status: json['status'] as String? ?? 'draft',
    );
  }
}

class ArtifactBundle {
  const ArtifactBundle({
    required this.facts,
    required this.pages,
    required this.flows,
  });

  final List<Fact> facts;
  final List<PageRecord> pages;
  final List<FlowRecord> flows;
}
