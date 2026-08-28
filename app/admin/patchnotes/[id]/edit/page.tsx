"use client";

import { useParams } from "next/navigation";

import AdminPageGuard from "../../../../../components/admin/AdminPageGuard";
import PatchnoteEditor from "../../../../../components/admin/PatchnoteEditor";

export default function EditPatchnotePage() {
  const params = useParams<{
    id: string;
  }>();

  return (
    <AdminPageGuard>
      <PatchnoteEditor patchnoteId={params.id} />
    </AdminPageGuard>
  );
}