"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PatchnoteItem } from "../types/patchnotes";

export function usePatchnotes() {
  const [patchnotes, setPatchnotes] = useState<PatchnoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPatchnotes() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("patchnotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        setPatchnotes([]);
        return;
      }

      setPatchnotes((data ?? []) as PatchnoteItem[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatchnotes();
  }, []);

  return {
    patchnotes,
    loading,
    reload: loadPatchnotes,
  };
}