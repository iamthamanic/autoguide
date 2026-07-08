import 'models.dart';
import 'visibility.dart';

class HelpContext {
  const HelpContext({
    required this.route,
    this.pageTitle,
    this.actions = const [],
    this.flows = const [],
  });

  final String route;
  final String? pageTitle;
  final List<Fact> actions;
  final List<FlowRecord> flows;
}

String normalizeRoute(String route) {
  final path = route.split('?').first.split('#').first;
  if (path.isEmpty) return '/';
  if (path.length > 1 && path.endsWith('/')) {
    return path.substring(0, path.length - 1);
  }
  return path;
}

HelpContext resolveHelpContext({
  required String route,
  required List<PageRecord> pages,
  required List<FlowRecord> flows,
  required List<Fact> facts,
  required String mode,
  String? userRole,
}) {
  final normalized = normalizeRoute(route);
  final visibleFacts = filterFactsForMode(facts, mode);
  final roleFacts = filterFactsByRole(visibleFacts, userRole);
  final roleFlows = filterByRole(flows, userRole, (flow) => flow.roleIds);

  PageRecord? page;
  for (final item in pages) {
    if (normalizeRoute(item.route) == normalized) {
      page = item;
      break;
    }
  }

  final pageVisible = page != null && isVisibleForRole(page.roleIds, userRole);
  final pageTitle = pageVisible ? page?.title : null;

  final pageFlows = roleFlows.where((flow) {
    if (!pageVisible || page == null) return flow.pageIds.isEmpty;
    return flow.pageIds.contains(page.id) || flow.pageIds.isEmpty;
  }).take(6).toList();

  final actions = roleFacts.where((fact) {
    if (pageVisible && page != null && page.factIds.contains(fact.id)) {
      return true;
    }
    return fact.key == 'action' || fact.key == 'description';
  }).take(12).toList();

  return HelpContext(
    route: normalized,
    pageTitle: pageTitle,
    actions: actions,
    flows: pageFlows,
  );
}
