export type DevUpdateType =
  | "season"
  | "update"
  | "release"
  | "hotfix"
  | "milestone";


export type DevUpdateStatus =
  | "planning"
  | "in_development"
  | "testing"
  | "ready"
  | "released"
  | "paused"
  | "cancelled";


export interface DevUpdate {
  id: string;

  project_id: string;

  title: string;

  code: string | null;

  description: string | null;

  type: DevUpdateType;

  status: DevUpdateStatus;

  progress: number;

  auto_progress: boolean;

  target_date: string | null;

  release_date: string | null;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevUpdateInput {
  title: string;

  code: string;

  description: string;

  type: DevUpdateType;

  status: DevUpdateStatus;

  progress: number;

  auto_progress: boolean;

  target_date: string;

  release_date: string;
}