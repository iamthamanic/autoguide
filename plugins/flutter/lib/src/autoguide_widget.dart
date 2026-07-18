import 'package:flutter/material.dart';

import 'autoguide_scope.dart';
import 'help_context.dart';
import 'search.dart';

/// Floating Help widget (Material FAB + panel) with German UI copy.
class AutoGuideWidget extends StatefulWidget {
  const AutoGuideWidget({super.key});

  @override
  State<AutoGuideWidget> createState() => _AutoGuideWidgetState();
}

class _AutoGuideWidgetState extends State<AutoGuideWidget> {
  bool _open = false;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final scope = AutoGuideScope.of(context);
    final helpContext = resolveHelpContext(
      route: scope.route,
      pages: scope.pages,
      flows: scope.flows,
      facts: scope.facts,
      mode: scope.mode,
      userRole: scope.userRole,
    );
    final searchHits = searchKnowledge(
      query: _query,
      pages: scope.pages,
      flows: scope.flows,
      userRole: scope.userRole,
    );

    return Stack(
      children: [
        Positioned(
          right: 24,
          bottom: 24,
          child: FloatingActionButton(
            onPressed: () => setState(() => _open = !_open),
            tooltip: 'Hilfe öffnen',
            child: const Text('?'),
          ),
        ),
        if (_open)
          Positioned(
            right: 24,
            bottom: 96,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 380,
                constraints: const BoxConstraints(maxWidth: 360),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      helpContext.pageTitle != null
                          ? 'Hilfe: ${helpContext.pageTitle}'
                          : 'Hilfe',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      decoration: const InputDecoration(
                        hintText: 'Suchen…',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      onChanged: (value) => setState(() => _query = value),
                    ),
                    const SizedBox(height: 12),
                    if (_query.trim().isNotEmpty)
                      _SearchResults(hits: searchHits)
                    else if (helpContext.actions.isEmpty && helpContext.flows.isEmpty)
                      Text(
                        'Keine Dokumentation für diese Seite.'
                        '${scope.mode == 'development' ? ' (Entwicklermodus)' : ''}',
                        style: TextStyle(color: Colors.grey.shade600),
                      )
                    else ...[
                      if (helpContext.flows.isNotEmpty) ...[
                        Text('Abläufe', style: Theme.of(context).textTheme.labelLarge),
                        ...helpContext.flows.map(
                          (flow) => ListTile(
                            dense: true,
                            contentPadding: EdgeInsets.zero,
                            title: Text(flow.title),
                          ),
                        ),
                      ],
                      if (helpContext.actions.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text('Aktionen', style: Theme.of(context).textTheme.labelLarge),
                        ...helpContext.actions.map(
                          (fact) => ListTile(
                            dense: true,
                            contentPadding: EdgeInsets.zero,
                            title: Text((fact.value ?? '').toString()),
                          ),
                        ),
                      ],
                    ],
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _SearchResults extends StatelessWidget {
  const _SearchResults({required this.hits});

  final List<SearchHit> hits;

  @override
  Widget build(BuildContext context) {
    if (hits.isEmpty) {
      return const Text('Keine Treffer.');
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: hits
          .map(
            (hit) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text('${hit.title} (${hit.kind})'),
            ),
          )
          .toList(),
    );
  }
}
