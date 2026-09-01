import { supabase } from "../lib/supabase";

import type {
  DevNote,
  DevNoteInput,
} from "../types/dev-notes";


export async function getDevNotes(
  projectId: string
): Promise<DevNote[]> {
  const {
    data,
    error,
  } = await supabase
    .from("dev_notes")
    .select("*")
    .eq(
      "project_id",
      projectId
    )
    .order(
      "pinned",
      {
        ascending: false,
      }
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );


  if (error) {
    throw new Error(
      `Could not load notes: ${error.message}`
    );
  }


  return (
    data ?? []
  ) as DevNote[];
}


export async function createDevNote(
  projectId: string,
  input: DevNoteInput
): Promise<DevNote> {
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
      lastNote,
    error:
      sortError,
  } =
    await supabase
      .from(
        "dev_notes"
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
      lastNote?.sort_order ??
      -1
    ) + 1;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "dev_notes"
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

        known_issue_id:
          input.known_issue_id ||
          null,

        title:
          input.title.trim(),

        content:
          input.content.trim() ||
          null,

        category:
          input.category.trim() ||
          null,

        pinned:
          input.pinned,

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
      `Could not create note: ${error.message}`
    );
  }


  return data as DevNote;
}


export async function updateDevNote(
  id: string,
  input: DevNoteInput
): Promise<DevNote> {
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
        "dev_notes"
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

        known_issue_id:
          input.known_issue_id ||
          null,

        title:
          input.title.trim(),

        content:
          input.content.trim() ||
          null,

        category:
          input.category.trim() ||
          null,

        pinned:
          input.pinned,

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
      `Could not update note: ${error.message}`
    );
  }


  return data as DevNote;
}


export async function setDevNotePinned(
  note: DevNote,
  pinned: boolean
): Promise<DevNote> {
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
        "dev_notes"
      )
      .update({
        pinned,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        note.id
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not update note: ${error.message}`
    );
  }


  return data as DevNote;
}


export async function deleteDevNote(
  id: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "dev_notes"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw new Error(
      `Could not delete note: ${error.message}`
    );
  }
}