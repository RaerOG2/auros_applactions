export type DevKnownIssueStatus =
  | "investigating"
  | "identified"
  | "fix_in_progress"
  | "testing"
  | "resolved"
  | "wont_fix";


export type DevKnownIssueSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";


export interface DevKnownIssue {
  id: string;

  project_id: string;

  update_id: string | null;

  roadmap_item_id: string | null;

  task_id: string | null;

  assigned_dev_id: string | null;

  title: string;

  description: string | null;

  category: string | null;

  affected_version: string | null;

  internal_notes: string | null;

  status: DevKnownIssueStatus;

  severity: DevKnownIssueSeverity;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevKnownIssueInput {
  title: string;

  description: string;

  category: string;

  affected_version: string;

  internal_notes: string;

  status: DevKnownIssueStatus;

  severity: DevKnownIssueSeverity;

  assigned_dev_id: string | null;

  update_id: string | null;

  roadmap_item_id: string | null;

  task_id: string | null;
}