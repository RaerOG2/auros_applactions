"use client";

import AdminPageGuard from "../../../../components/admin/AdminPageGuard";
import PatchnoteEditor from "../../../../components/admin/PatchnoteEditor";

export default function NewPatchnotePage() {
  return (
    <AdminPageGuard>
      <PatchnoteEditor />
    </AdminPageGuard>
  );
}