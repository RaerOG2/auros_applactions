export type DevConceptType =
  | "season"
  | "mini_season"
  | "event"
  | "feature"
  | "map_change"
  | "gameplay"
  | "website"
  | "other";

export type DevConceptStatus =
  | "idea"
  | "concept"
  | "planning"
  | "approved"
  | "in_development"
  | "implemented"
  | "on_hold"
  | "scrapped";

export interface DevConcept {
  id: string;
  project_id: string;

  title: string;
  codename: string | null;
  summary: string | null;
  content: string | null;
  internal_notes: string | null;

  type: DevConceptType;
  status: DevConceptStatus;
  target_window: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevConceptInput {
  title: string;
  codename: string;
  summary: string;
  content: string;
  internalNotes: string;
  type: DevConceptType;
  status: DevConceptStatus;
  targetWindow: string;
}
