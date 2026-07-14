import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import {
  AutoGuideProvider,
  AutoGuideWidget,
  InspectorOverlay,
} from '@iamthamanic/autoguide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AutoGuideProvider, AutoGuideWidget, InspectorOverlay],
  template: `
    <ag-autoguide-provider appId="example-angular-vite" userRole="Admin">
      <main style="font-family: system-ui, sans-serif; padding: 24px">
        <h1>AutoGuide Angular Beispiel-App</h1>
        <p>Willkommen in der Angular-Referenz-App für AutoGuide.</p>
        <button type="button">Aktion speichern</button>
      </main>
      <ag-autoguide-widget />
      <ag-inspector-overlay />
    </ag-autoguide-provider>
  `,
})
class AppComponent {}

bootstrapApplication(AppComponent).catch(console.error);
