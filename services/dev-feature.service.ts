import { supabase } from "../lib/supabase";

import type {
  DevFeature,
  DevFeatureInput,
  DevFeatureStatus,
} from "../types/dev-features";


export async function getDevFeatures(
  projectId: string
): Promise<DevFeature[]> {
  const {
    data,
    error,
  } = await supabase
    .from("dev_features")
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
      `Could not load features: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevFeature[];
}


export async function createDevFeature(
  projectId: string,
  input: DevFeatureInput
): Promise<DevFeature> {
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
      lastFeature,
    error:
      sortError,
  } =
    await supabase
      .from(
        "dev_features"
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
      lastFeature?.sort_order ??
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


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_features"
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

        status:
          input.status,

        priority:
          input.priority,

        progress,

        target_date:
          input.target_date ||
          null,

        release_date:
          input.release_date ||
          null,

        internal_notes:
          input.internal_notes.trim() ||
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
      `Could not create feature: ${error.message}`
    );
  }


  return data as DevFeature;
}


export async function updateDevFeature(
  id: string,
  input: DevFeatureInput
): Promise<DevFeature> {
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


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_features"
      )
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

        category:
          input.category.trim() ||
          null,

        status:
          input.status,

        priority:
          input.priority,

        progress,

        target_date:
          input.target_date ||
          null,

        release_date:
          input.release_date ||
          null,

        internal_notes:
          input.internal_notes.trim() ||
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
      `Could not update feature: ${error.message}`
    );
  }


  return data as DevFeature;
}


export async function updateDevFeatureStatus(
  feature: DevFeature,
  status: DevFeatureStatus
): Promise<DevFeature> {
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


  const progress =
    status ===
    "released"
      ? 100
      : feature.progress;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_features"
      )
      .update({
        status,

        progress,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        feature.id
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not update feature status: ${error.message}`
    );
  }


  return data as DevFeature;
}


export async function deleteDevFeature(
  id: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "dev_features"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw new Error(
      `Could not delete feature: ${error.message}`
    );
  }
}