import { supabase } from "../lib/supabase";

import type {
  DevConcept,
  DevConceptInput,
} from "../types/dev-concepts";


export async function getDevConcepts(
  projectId: string
): Promise<DevConcept[]> {
  const { data, error } = await supabase
    .from("dev_concepts")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load concepts: ${error.message}`
    );
  }

  return (data ?? []) as DevConcept[];
}


export async function createDevConcept(
  projectId: string,
  input: DevConceptInput
): Promise<DevConcept> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("dev_concepts")
    .insert({
      project_id: projectId,
      title: input.title.trim(),
      codename: input.codename.trim() || null,
      summary: input.summary.trim() || null,
      content: input.content.trim() || null,
      internal_notes: input.internalNotes.trim() || null,
      type: input.type,
      status: input.status,
      target_window: input.targetWindow.trim() || null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not create concept: ${error.message}`
    );
  }

  return data as DevConcept;
}


export async function updateDevConcept(
  id: string,
  input: DevConceptInput
): Promise<DevConcept> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("dev_concepts")
    .update({
      title: input.title.trim(),
      codename: input.codename.trim() || null,
      summary: input.summary.trim() || null,
      content: input.content.trim() || null,
      internal_notes: input.internalNotes.trim() || null,
      type: input.type,
      status: input.status,
      target_window: input.targetWindow.trim() || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not update concept: ${error.message}`
    );
  }

  return data as DevConcept;
}


export async function deleteDevConcept(
  id: string
) {
  const { error } = await supabase
    .from("dev_concepts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not delete concept: ${error.message}`
    );
  }
}
