import { supabase } from "../lib/supabase";

import type {
  DevUpdate,
  DevUpdateInput,
} from "../types/dev-updates";


export async function getDevUpdates(
  projectId: string
): Promise<DevUpdate[]> {
  const { data, error } = await supabase
    .from("dev_updates")
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
      `Could not load updates: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevUpdate[];
}


export async function createDevUpdate(
  projectId: string,
  input: DevUpdateInput
): Promise<DevUpdate> {
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
    data: lastUpdate,
    error: sortError,
  } = await supabase
    .from("dev_updates")
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
      lastUpdate?.sort_order ??
      -1
    ) + 1;


  const progress =
    input.status ===
    "released"
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            input.progress
          )
        );


  const { data, error } =
    await supabase
      .from("dev_updates")
      .insert({
        project_id:
          projectId,

        title:
          input.title.trim(),

        code:
          input.code.trim() ||
          null,

        description:
          input.description.trim() ||
          null,

        type:
          input.type,

        status:
          input.status,

        progress,

        auto_progress:
          input.auto_progress,

        target_date:
          input.target_date ||
          null,

        release_date:
          input.release_date ||
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
      `Could not create update: ${error.message}`
    );
  }


  return data as DevUpdate;
}


export async function updateDevUpdate(
  id: string,
  input: DevUpdateInput
): Promise<DevUpdate> {
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


  const progress =
    input.status ===
    "released"
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            input.progress
          )
        );


  const { data, error } =
    await supabase
      .from("dev_updates")
      .update({
        title:
          input.title.trim(),

        code:
          input.code.trim() ||
          null,

        description:
          input.description.trim() ||
          null,

        type:
          input.type,

        status:
          input.status,

        progress,

        auto_progress:
          input.auto_progress,

        target_date:
          input.target_date ||
          null,

        release_date:
          input.release_date ||
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
      `Could not update update: ${error.message}`
    );
  }


  return data as DevUpdate;
}


export async function deleteDevUpdate(
  id: string
): Promise<void> {
  const { error } =
    await supabase
      .from("dev_updates")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw new Error(
      `Could not delete update: ${error.message}`
    );
  }
}