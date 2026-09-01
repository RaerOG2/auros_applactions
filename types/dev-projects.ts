export type DevProjectStatus =
  | "active"
  | "planning"
  | "paused"
  | "archived";

export type DevProjectModuleStatus =
  | "ready"
  | "planned";

export interface DevProjectModule {
  title: string;
  description: string;
  status: DevProjectModuleStatus;
}

export interface DevProject {
  id: string;

  name: string;
  slug: string;
  short_name: string;

  description: string | null;
  accent: string;

  status: DevProjectStatus;

  modules: DevProjectModule[];

  sort_order: number;

  created_by: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateDevProjectInput {
  name: string;
  slug: string;
  short_name: string;

  description: string;

  accent: string;

  status: DevProjectStatus;
}