import 'package:flutter/widgets.dart';

import 'models.dart';

class AutoGuideScope extends InheritedWidget {
  const AutoGuideScope({
    super.key,
    required this.appId,
    required this.mode,
    required this.route,
    required this.facts,
    required this.pages,
    required this.flows,
    this.userRole,
    required super.child,
  });

  final String appId;
  final String? userRole;
  final String mode;
  final String route;
  final List<Fact> facts;
  final List<PageRecord> pages;
  final List<FlowRecord> flows;

  static AutoGuideScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AutoGuideScope>();
    assert(scope != null, 'AutoGuideScope not found in widget tree');
    return scope!;
  }

  @override
  bool updateShouldNotify(AutoGuideScope oldWidget) {
    return appId != oldWidget.appId ||
        userRole != oldWidget.userRole ||
        mode != oldWidget.mode ||
        route != oldWidget.route ||
        facts != oldWidget.facts ||
        pages != oldWidget.pages ||
        flows != oldWidget.flows;
  }
}
