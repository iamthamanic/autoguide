/**
 * @autoguide/runtime — DOM element capture types.
 */

export interface RuntimeElement {
  id: string;
  tagName: string;
  selector: string;
  label?: string;
  role?: string;
  route?: string;
  interactive: boolean;
}

export interface RuntimeSnapshot {
  capturedAt: string;
  route: string;
  elements: RuntimeElement[];
}
