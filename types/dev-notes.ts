export interface DevNote {
  id: string;

  project_id: string;

  update_id: string | null;

  roadmap_item_id: string | null;

  task_id: string | null;

  known_issue_id: string | null;

  title: string;

  content: string | null;

  category: string | null;

  pinned: boolean;

  sort_order: number;

  created_by: string | null;

  updated_by: string | null;

  created_at: string;

  updated_at: string;
}


export interface DevNoteInput {
  title: string;

  content: string;

  category: string;

  pinned: boolean;

  update_id: string | null;

  roadmap_item_id: string | null;

  task_id: string | null;

  known_issue_id: string | null;
}