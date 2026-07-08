import 'models.dart';
import 'visibility.dart';

class SearchHit {
  const SearchHit({
    required this.id,
    required this.kind,
    required this.title,
    required this.snippet,
    required this.score,
  });

  final String id;
  final String kind;
  final String title;
  final String snippet;
  final int score;
}

int scoreMatch(String query, String text) {
  final q = query.toLowerCase().trim();
  final t = text.toLowerCase();
  if (q.isEmpty) return 0;
  if (t == q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.contains(q)) return 50;
  return 0;
}

List<SearchHit> searchKnowledge({
  required String query,
  required List<PageRecord> pages,
  required List<FlowRecord> flows,
  String? userRole,
}) {
  final visiblePages = filterByRole(pages, userRole, (page) => page.roleIds);
  final visibleFlows = filterByRole(flows, userRole, (flow) => flow.roleIds);
  final q = query.trim();

  if (q.isEmpty) {
    return [
      ...visiblePages.take(5).map(
            (page) => SearchHit(
              id: page.id,
              kind: 'page',
              title: page.title,
              snippet: page.route,
              score: 10,
            ),
          ),
      ...visibleFlows.take(5).map(
            (flow) => SearchHit(
              id: flow.id,
              kind: 'flow',
              title: flow.title,
              snippet: flow.steps.isNotEmpty ? flow.steps.first.title : '',
              score: 5,
            ),
          ),
    ];
  }

  final hits = <SearchHit>[];
  for (final page in visiblePages) {
    final score = [
      scoreMatch(q, page.title),
      scoreMatch(q, page.route),
    ].reduce((a, b) => a > b ? a : b);
    if (score > 0) {
      hits.add(
        SearchHit(
          id: page.id,
          kind: 'page',
          title: page.title,
          snippet: page.route,
          score: score,
        ),
      );
    }
  }

  for (final flow in visibleFlows) {
    final stepText = flow.steps.map((step) => step.title).join(' ');
    final score = [
      scoreMatch(q, flow.title),
      scoreMatch(q, stepText),
    ].reduce((a, b) => a > b ? a : b);
    if (score > 0) {
      hits.add(
        SearchHit(
          id: flow.id,
          kind: 'flow',
          title: flow.title,
          snippet: flow.steps.isNotEmpty ? flow.steps.first.title : '',
          score: score,
        ),
      );
    }
  }

  hits.sort((a, b) => b.score.compareTo(a.score));
  return hits.take(20).toList();
}
