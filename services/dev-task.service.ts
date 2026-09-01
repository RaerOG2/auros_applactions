import { supabase } from "../lib/supabase";

import type {
  DevTask,
  DevTaskInput,
  DevTaskStatus,
} from "../types/dev-tasks";


export async function getDevTasks(
  projectId: string
): Promise<DevTask[]> {
  const {
    data,
    error,
  } = await supabase
    .from("dev_tasks")
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
        ascending: true,
      }
    );


  if (error) {
    throw new Error(
      `Could not load tasks: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevTask[];
}


export async function createDevTask(
  projectId: string,
  input: DevTaskInput
): Promise<DevTask> {
  const {
    data: { user },
    error: userError,
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
    data: lastTask,
    error: sortError,
  } = await supabase
    .from("dev_tasks")
    .select("sort_order")
    .eq(
      "project_id",
      projectId
    )
    .order(
      "sort_order",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();


  if (sortError) {
    throw sortError;
  }


  const nextSortOrder =
    (
      lastTask?.sort_order ??
      -1
    ) + 1;


  const {
    data,
    error,
  } = await supabase
    .from("dev_tasks")
    .insert({
      project_id:
        projectId,

      update_id:
        input.update_id ||
        null,

      roadmap_item_id:
        input.roadmap_item_id ||
        null,

      assigned_dev_id:
        input.assigned_dev_id ||
        null,

      title:
        input.title.trim(),

      description:
        input.description.trim() ||
        null,

      status:
        input.status,

      priority:
        input.priority,

      due_date:
        input.due_date ||
        null,

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
      `Could not create task: ${error.message}`
    );
  }


  return data as DevTask;
}


export async function updateDevTask(
  id: string,
  input: DevTaskInput
): Promise<DevTask> {
  const {
    data: { user },
    error: userError,
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
  } = await supabase
    .from("dev_tasks")
    .update({
      update_id:
        input.update_id ||
        null,

      roadmap_item_id:
        input.roadmap_item_id ||
        null,

      assigned_dev_id:
        input.assigned_dev_id ||
        null,

      title:
        input.title.trim(),

      description:
        input.description.trim() ||
        null,

      status:
        input.status,

      priority:
        input.priority,

      due_date:
        input.due_date ||
        null,

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
      `Could not update task: ${error.message}`
    );
  }


  return data as DevTask;
}


export async function updateDevTaskStatus(
  task: DevTask,
  status: DevTaskStatus
): Promise<DevTask> {
  const {
    data: { user },
    error: userError,
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
  } = await supabase
    .from("dev_tasks")
    .update({
      status,

      updated_by:
        user.id,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      task.id
    )
    .select("*")
    .single();


  if (error) {
    throw new Error(
      `Could not move task: ${error.message}`
    );
  }


  return data as DevTask;
}


export async function deleteDevTask(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("dev_tasks")
    .delete()
    .eq(
      "id",
      id
    );


  if (error) {
    throw new Error(
      `Could not delete task: ${error.message}`
    );
  }
}