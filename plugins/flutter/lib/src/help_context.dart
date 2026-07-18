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

final _handlerNoise = RegExp(r'^(on|handle|set)[A-Z][A-Za-z0-9]*$');
final _componentId = RegExp(r'^[A-Z][A-Za-z0-9]*$');
final _interiorCamel = RegExp(r'[a-z][A-Z]');

const _helpKeys = {'action', 'description', 'label'};
const _techKeys = {
  'element',
  'handler',
  'component',
  'prop',
  'props',
  'selector',
  'file',
  'filepath',
  'filePath',
  'type',
  'entity',
};

bool _isHelpNoise(Fact fact) {
  if (_techKeys.contains(fact.key)) return true;
  if (_handlerNoise.hasMatch(fact.key)) return true;
  final value = (fact.value ?? '').toString().trim();
  if (value.isEmpty) return true;
  if (_handlerNoise.hasMatch(value)) return true;
  if (value.startsWith('/') && !value.contains(RegExp(r'\s'))) return true;
  if (_componentId.hasMatch(value) && _interiorCamel.hasMatch(value)) return true;
  return false;
}

bool _isUserFacingHelpFact(Fact fact) {
  if (!_helpKeys.contains(fact.key)) return false;
  if (_isHelpNoise(fact)) return false;
  return (fact.value ?? '').toString().trim().isNotEmpty;
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
  final pageTitle = page != null && pageVisible ? page.title : null;

  final pageFlows = roleFlows.where((flow) {
    if (!pageVisible || page == null) return flow.pageIds.isEmpty;
    return flow.pageIds.contains(page.id) || flow.pageIds.isEmpty;
  }).take(6).toList();

  final actions = <Fact>[];
  if (pageVisible && page != null) {
    final linkedPage = page;
    for (final fact in roleFacts) {
      if (!_isUserFacingHelpFact(fact)) continue;
      if (!linkedPage.factIds.contains(fact.id)) continue;
      actions.add(fact);
      if (actions.length >= 12) break;
    }
  }

  return HelpContext(
    route: normalized,
    pageTitle: pageTitle,
    actions: actions,
    flows: pageFlows,
  );
}
