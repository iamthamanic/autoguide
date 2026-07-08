/**
 * @autoguide/runtime — DOM capture types (snapshot v2).
 */

export interface RuntimeElement {
  id: string;
  entityId: string;
  tagName: string;
  selector: string;
  label?: string;
  role?: string;
  route?: string;
  interactive: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface RuntimeFormField {
  id: string;
  formId: string;
  selector: string;
  name?: string;
  label?: string;
  inputType?: string;
  disabled: boolean;
  required: boolean;
}

export interface RuntimeDialog {
  id: string;
  selector: string;
  label?: string;
  open: boolean;
}

export interface RuntimeTextRegion {
  id: string;
  selector: string;
  text: string;
  headingLevel?: number;
}

export interface RuntimeNavigationEvent {
  route: string;
  capturedAt: string;
}

export interface RuntimeSnapshot {
  capturedAt: string;
  route: string;
  elements: RuntimeElement[];
  forms: RuntimeFormField[];
  dialogs: RuntimeDialog[];
  textRegions: RuntimeTextRegion[];
  navigation: RuntimeNavigationEvent[];
}
