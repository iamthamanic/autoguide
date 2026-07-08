import 'models.dart';

const double publishedThreshold = 0.85;

List<Fact> filterFactsForMode(List<Fact> facts, String mode) {
  if (mode == 'development') return facts;
  return facts
      .where(
        (fact) =>
            fact.reviewStatus == 'approved' && fact.confidence >= publishedThreshold,
      )
      .toList();
}

bool isVisibleForRole(List<String> roleIds, String? userRole) {
  if (roleIds.isEmpty) return true;
  if (userRole == null || userRole.isEmpty) return true;
  return roleIds.contains(userRole);
}

List<T> filterByRole<T>(List<T> items, String? userRole, List<String> Function(T) roleIds) {
  return items.where((item) => isVisibleForRole(roleIds(item), userRole)).toList();
}

List<Fact> filterFactsByRole(List<Fact> facts, String? userRole) {
  return facts.where((fact) => isVisibleForRole(fact.roleIds, userRole)).toList();
}
