export type DevRoadmapStatus =
  | "planned"
  | "in_progress"
  | "testing"
  | "done"
  | "blocked";


export type DevRoadmapPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";


export interface DevRoadmapItem {
  id: string;

  project_id: string;

  update_id: string | null;

  title: string;

  description: string | null;

  status: DevRoadmapStatus;

  priority: DevRoadmapPriority;

  progress: number;

  target: string | null;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevRoadmapItemInput {
  title: string;

  description: string;

  status: DevRoadmapStatus;

  priority: DevRoadmapPriority;

  progress: number;

  target: string;

  update_id: string | null;
}