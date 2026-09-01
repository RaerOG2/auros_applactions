import { supabase } from "../lib/supabase";

import type {
  DevKnownIssue,
  DevKnownIssueInput,
  DevKnownIssueStatus,
} from "../types/dev-known-issues";


export async function getDevKnownIssues(
  projectId: string
): Promise<DevKnownIssue[]> {
  const {
    data,
    error,
  } = await supabase
    .from("dev_known_issues")
    .select("*")
    .eq(
      "project_id",
      projectId
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );


  if (error) {
    throw new Error(
      `Could not load known issues: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevKnownIssue[];
}


export async function createDevKnownIssue(
  projectId: string,
  input: DevKnownIssueInput
): Promise<DevKnownIssue> {
  const {
    data: {
      user,
    },

    error:
      userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }


  const {
    data:
      lastIssue,

    error:
      sortError,
  } =
    await supabase
      .from(
        "dev_known_issues"
      )
      .select(
        "sort_order"
      )
      .eq(
        "project_id",
        projectId
      )
      .order(
        "sort_order",
        {
          ascending:
            false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (sortError) {
    throw sortError;
  }


  const nextSortOrder =
    (
      lastIssue?.sort_order ??
      -1
    ) + 1;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_known_issues"
      )
      .insert({
        project_id:
          projectId,

        update_id:
          input.update_id ||
          null,

        roadmap_item_id:
          input.roadmap_item_id ||
          null,

        task_id:
          input.task_id ||
          null,

        assigned_dev_id:
          input.assigned_dev_id ||
          null,

        title:
          input.title.trim(),

        description:
          input.description.trim() ||
          null,

        category:
          input.category.trim() ||
          null,

        affected_version:
          input.affected_version.trim() ||
          null,

        internal_notes:
          input.internal_notes.trim() ||
          null,

        status:
          input.status,

        severity:
          input.severity,

        sort_order:
          nextSortOrder,

        created_by:
          user.id,

        updated_by:
          user.id,
      })
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not create known issue: ${error.message}`
    );
  }


  return data as DevKnownIssue;
}


export async function updateDevKnownIssue(
  id: string,
  input: DevKnownIssueInput
): Promise<DevKnownIssue> {
  const {
    data: {
      user,
    },

    error:
      userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_known_issues"
      )
      .update({
        update_id:
          input.update_id ||
          null,

        roadmap_item_id:
          input.roadmap_item_id ||
          null,

        task_id:
          input.task_id ||
          null,

        assigned_dev_id:
          input.assigned_dev_id ||
          null,

        title:
          input.title.trim(),

        description:
          input.description.trim() ||
          null,

        category:
          input.category.trim() ||
          null,

        affected_version:
          input.affected_version.trim() ||
          null,

        internal_notes:
          input.internal_notes.trim() ||
          null,

        status:
          input.status,

        severity:
          input.severity,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        id
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not update known issue: ${error.message}`
    );
  }


  return data as DevKnownIssue;
}


export async function updateDevKnownIssueStatus(
  issue: DevKnownIssue,
  status: DevKnownIssueStatus
): Promise<DevKnownIssue> {
  const {
    data: {
      user,
    },

    error:
      userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_known_issues"
      )
      .update({
        status,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        issue.id
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not update known issue status: ${error.message}`
    );
  }


  return data as DevKnownIssue;
}


export async function deleteDevKnownIssue(
  id: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "dev_known_issues"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw new Error(
      `Could not delete known issue: ${error.message}`
    );
  }
}