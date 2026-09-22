import {
  supabase,
} from "../lib/supabase";

import type {
  PatchnoteItem,
} from "../types/admin";


export async function getCurrentUser() {
  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();


  if (
    error
  ) {
    console.error(
      "getUser error:",
      error
    );
  }


  return user ?? null;
}


export async function getAdminAccess() {
  const user =
    await getCurrentUser();


  if (
    !user
  ) {
    return {
      user:
        null,

      userEmail:
        null,

      isAdmin:
        false,
    };
  }


  const {
    data:
      profile,

    error,
  } =
    await supabase
      .from(
        "profiles"
      )
      .select(
        "is_admin"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "profile lookup error:",
      error
    );


    return {
      user,

      userEmail:
        user.email ??
        null,

      isAdmin:
        false,
    };
  }


  return {
    user,

    userEmail:
      user.email ??
      null,

    isAdmin:
      profile?.is_admin ===
      true,
  };
}


export async function signOutAdmin() {
  const {
    error,
  } =
    await supabase.auth.signOut();


  if (
    error
  ) {
    console.error(
      "logout error:",
      error
    );

    throw error;
  }
}


export async function getPatchnotes():
  Promise<PatchnoteItem[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "patchnotes"
      )
      .select(
        "*"
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (
    error
  ) {
    console.error(
      "getPatchnotes error:",
      error
    );

    throw error;
  }


  return (
    data ??
    []
  ) as PatchnoteItem[];
}


export async function savePatchnoteRecord(
  params: {
    version:
      string;

    title:
      string;

    content:
      string;

    editingPatchId:
      string | null;
  }
) {
  const {
    version,
    title,
    content,
    editingPatchId,
  } =
    params;


  if (
    editingPatchId
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          "patchnotes"
        )
        .update({
          version,
          title,
          content,
        })
        .eq(
          "id",
          editingPatchId
        );


    if (
      error
    ) {
      throw error;
    }


    return;
  }


  const {
    error,
  } =
    await supabase
      .from(
        "patchnotes"
      )
      .insert({
        version,
        title,
        content,
      });


  if (
    error
  ) {
    throw error;
  }
}


export async function deletePatchnoteById(
  id:
    string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "patchnotes"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    throw error;
  }
}