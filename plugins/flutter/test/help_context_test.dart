import 'package:autoguide_flutter/autoguide_flutter.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final pages = [
    const PageRecord(
      id: 'p1',
      route: '/vacation',
      title: 'Urlaub',
      factIds: ['f1'],
    ),
  ];

  final flows = [
    const FlowRecord(
      id: 'fl1',
      title: 'Urlaub beantragen',
      steps: [FlowStep(order: 1, title: 'Antrag öffnen')],
      pageIds: ['p1'],
    ),
  ];

  final facts = [
    const Fact(
      id: 'f1',
      entityId: 'btn',
      key: 'action',
      value: 'Antrag stellen',
      status: 'verified',
      reviewStatus: 'approved',
      confidence: 0.95,
    ),
  ];

  test('resolveHelpContext returns page title and flows', () {
    final ctx = resolveHelpContext(
      route: '/vacation',
      pages: pages,
      flows: flows,
      facts: facts,
      mode: 'published',
    );
    expect(ctx.pageTitle, 'Urlaub');
    expect(ctx.flows.first.title, 'Urlaub beantragen');
  });

  test('searchKnowledge finds pages', () {
    final hits = searchKnowledge(query: 'Urlaub', pages: pages, flows: flows);
    expect(hits.any((hit) => hit.kind == 'page'), isTrue);
  });
}
