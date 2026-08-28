"use client";

import AdminPageGuard from "../../../../components/admin/AdminPageGuard";
import GalleryEditor from "../../../../components/admin/GalleryEditor";

export default function NewGalleryPage() {
  return (
    <AdminPageGuard>
      <GalleryEditor />
    </AdminPageGuard>
  );
}