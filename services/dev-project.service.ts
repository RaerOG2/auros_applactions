import { supabase } from "../lib/supabase";

import type {
  CreateDevProjectInput,
  DevProject,
  DevProjectModule,
} from "../types/dev-projects";

const DEFAULT_MODULES: DevProjectModule[] = [
  {
    title: "Roadmap",
    description:
      "Plan the long-term direction and major milestones of this project.",
    status: "planned",
  },

  {
    title: "Updates",
    description:
      "Plan project updates, releases and development milestones.",
    status: "planned",
  },

  {
    title: "Features",
    description:
      "Track planned, active and completed project features.",
    status: "planned",
  },

  {
    title: "Tasks",
    description:
      "Organize development tasks and production work.",
    status: "planned",
  },

  {
    title: "Known Issues",
    description:
      "Track bugs, problems and things that need investigation.",
    status: "planned",
  },

  {
    title: "Notes",
    description:
      "Store internal ideas, decisions and project development notes.",
    status: "planned",
  },
];

export async function getDevProjects(): Promise<
  DevProject[]
> {
  const { data, error } = await supabase
    .from("dev_projects")
    .select("*")
    .neq("status", "archived")
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load DEV projects: ${error.message}`
    );
  }

  return (data ?? []) as DevProject[];
}

export async function getDevProjectBySlug(
  slug: string
): Promise<DevProject | null> {
  const { data, error } = await supabase
    .from("dev_projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load DEV project: ${error.message}`
    );
  }

  return data as DevProject | null;
}

export async function createDevProject(
  input: CreateDevProjectInput
): Promise<DevProject> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "You must be logged in to create a project."
    );
  }

  const {
    data: lastProject,
    error: sortError,
  } = await supabase
    .from("dev_projects")
    .select("sort_order")
    .order("sort_order", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (sortError) {
    throw sortError;
  }

  const nextSortOrder =
    (lastProject?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("dev_projects")
    .insert({
      name: input.name.trim(),

      slug: input.slug.trim(),

      short_name:
        input.short_name
          .trim()
          .toUpperCase(),

      description:
        input.description.trim(),

      accent: input.accent,

      status: input.status,

      sort_order:
        nextSortOrder,

      created_by:
        user.id,

      modules:
        DEFAULT_MODULES,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not create DEV project: ${error.message}`
    );
  }

  return data as DevProject;
}