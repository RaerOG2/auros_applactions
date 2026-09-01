export type DevTaskStatus =
  | "planned"
  | "in_progress"
  | "review"
  | "done"
  | "blocked";


export type DevTaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";


export interface DevTask {
  id: string;

  project_id: string;

  update_id: string | null;

  roadmap_item_id: string | null;

  assigned_dev_id: string | null;

  title: string;

  description: string | null;

  status: DevTaskStatus;

  priority: DevTaskPriority;

  due_date: string | null;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevTaskInput {
  title: string;

  description: string;

  status: DevTaskStatus;

  priority: DevTaskPriority;

  due_date: string;

  assigned_dev_id: string | null;

  update_id: string | null;

  roadmap_item_id: string | null;
}


export interface AssignableDevUser {
  id: string;

  displayName: string;

  username: string | null;

  avatarUrl: string | null;

  isAdmin: boolean;
}