import { supabase } from "../lib/supabase";

import type {
  DevRoadmapItem,
  DevRoadmapItemInput,
  DevRoadmapStatus,
} from "../types/dev-roadmap";


export async function getDevRoadmapItems(
  projectId: string
): Promise<DevRoadmapItem[]> {
  const { data, error } = await supabase
    .from("dev_roadmap_items")
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
      `Could not load roadmap: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevRoadmapItem[];
}


export async function createDevRoadmapItem(
  projectId: string,
  input: DevRoadmapItemInput
): Promise<DevRoadmapItem> {
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
    data: lastItem,
    error: sortError,
  } = await supabase
    .from("dev_roadmap_items")
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
      lastItem?.sort_order ??
      -1
    ) + 1;


  const progress =
    input.status ===
    "done"
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
      .from("dev_roadmap_items")
      .insert({
        project_id:
          projectId,

        update_id:
          input.update_id ||
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

        progress,

        target:
          input.target.trim() ||
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
      `Could not create roadmap item: ${error.message}`
    );
  }


  return data as DevRoadmapItem;
}


export async function updateDevRoadmapItem(
  id: string,
  input: DevRoadmapItemInput
): Promise<DevRoadmapItem> {
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
    "done"
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
      .from("dev_roadmap_items")
      .update({
        update_id:
          input.update_id ||
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

        progress,

        target:
          input.target.trim() ||
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
      `Could not update roadmap item: ${error.message}`
    );
  }


  return data as DevRoadmapItem;
}


export async function updateDevRoadmapItemStatus(
  item: DevRoadmapItem,
  status: DevRoadmapStatus
): Promise<DevRoadmapItem> {
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


  const nextProgress =
    status ===
    "done"
      ? 100
      : item.progress;


  const { data, error } =
    await supabase
      .from("dev_roadmap_items")
      .update({
        status,

        progress:
          nextProgress,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        item.id
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not move roadmap item: ${error.message}`
    );
  }


  return data as DevRoadmapItem;
}


export async function assignDevRoadmapItemToUpdate(
  itemId: string,
  updateId: string | null
): Promise<DevRoadmapItem> {
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


  const { data, error } =
    await supabase
      .from("dev_roadmap_items")
      .update({
        update_id:
          updateId,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        itemId
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not assign roadmap item: ${error.message}`
    );
  }


  return data as DevRoadmapItem;
}


export async function deleteDevRoadmapItem(
  id: string
): Promise<void> {
  const { error } =
    await supabase
      .from("dev_roadmap_items")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw new Error(
      `Could not delete roadmap item: ${error.message}`
    );
  }
}