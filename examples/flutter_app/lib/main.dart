import 'package:autoguide_flutter/autoguide_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final bridge = AssetCoreBridge(bundle: rootBundle);
  final artifacts = await bridge.loadArtifacts();
  runApp(ExampleApp(artifacts: artifacts));
}

class ExampleApp extends StatefulWidget {
  const ExampleApp({super.key, required this.artifacts});

  final ArtifactBundle artifacts;

  @override
  State<ExampleApp> createState() => _ExampleAppState();
}

class _ExampleAppState extends State<ExampleApp> {
  String _route = '/vacation';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AutoGuide Flutter Example',
      home: AutoGuideScope(
        appId: 'example-flutter-app',
        userRole: 'Mitarbeiter',
        mode: 'published',
        route: _route,
        facts: widget.artifacts.facts,
        pages: widget.artifacts.pages,
        flows: widget.artifacts.flows,
        child: Scaffold(
          appBar: AppBar(title: const Text('AutoGuide Flutter')),
          body: Stack(
            children: [
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Aktuelle Route: $_route'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => setState(() => _route = '/vacation'),
                      child: const Text('Urlaub'),
                    ),
                    ElevatedButton(
                      onPressed: () => setState(() => _route = '/dashboard'),
                      child: const Text('Dashboard'),
                    ),
                  ],
                ),
              ),
              const AutoGuideWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
