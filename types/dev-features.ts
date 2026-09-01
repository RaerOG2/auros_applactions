export type DevFeatureStatus =
  | "idea"
  | "planned"
  | "in_development"
  | "testing"
  | "ready"
  | "released"
  | "cancelled";


export type DevFeaturePriority =
  | "low"
  | "medium"
  | "high"
  | "critical";


export interface DevFeature {
  id: string;

  project_id: string;

  update_id: string | null;

  roadmap_item_id: string | null;

  assigned_dev_id: string | null;

  title: string;

  description: string | null;

  category: string | null;

  status: DevFeatureStatus;

  priority: DevFeaturePriority;

  progress: number;

  target_date: string | null;

  release_date: string | null;

  internal_notes: string | null;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevFeatureInput {
  title: string;

  description: string;

  category: string;

  status: DevFeatureStatus;

  priority: DevFeaturePriority;

  progress: number;

  target_date: string;

  release_date: string;

  internal_notes: string;

  assigned_dev_id: string | null;

  update_id: string | null;

  roadmap_item_id: string | null;
}