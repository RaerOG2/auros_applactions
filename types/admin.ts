export type StatusHistoryItem = {
  id: string;
  application_id: string;
  status: string;
  changed_at: string;
  changed_by?: string | null;
  note?: string | null;
};

export type ApplicationItem = {
  id: string;
  name: string | null;
  discord: string | null;
  discord_id?: string | null;
  age: string | null;
  email?: string | null;
  timezone: string | null;
  experience: string | null;
  motivation: string | null;
  availability: string | null;

  developer_skills: string | null;
  developer_projects: string | null;
  support_cases: string | null;
  support_communication: string | null;
  competitive_knowledge: string | null;
  competitive_plans: string | null;
  manager_leadership: string | null;
  manager_organization: string | null;
  director_vision: string | null;
  director_responsibility: string | null;
  other_strengths: string | null;

  portfolio_url?: string | null;
  extra_links?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  extra_answers?: Record<string, unknown> | null;

  tracking_code: string | null;
  status: string | null;
  notes: string | null;
  rating: number | null;
  review_label: string | null;

  score?: number | null;
  auto_score?: number | null;
  manual_score?: number | null;
  final_score?: number | null;
  score_breakdown?: Record<string, number> | null;

  created_at: string | null;

  jobs?: {
    title?: string | null;
    role_category?: string | null;
  } | null;

  status_history?: StatusHistoryItem[];
};

export type JobItem = {
  id: string;
  title: string | null;
  department: string | null;
  type: string | null;
  location: string | null;
  description: string | null;
  requirements: string[] | null;
  status: string | null;
  role_category: string | null;
  created_at?: string | null;
};

export type PatchnoteItem = {
  id: string;
  version: string | null;
  title: string | null;
  content: string | null;
  created_at: string | null;
};

export type JobFormState = {
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  role_category: string;
};

export const emptyJobForm: JobFormState = {
  title: "",
  department: "",
  type: "",
  location: "",
  description: "",
  requirements: "",
  role_category: "Other",
};