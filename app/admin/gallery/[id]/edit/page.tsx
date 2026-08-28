"use client";

import {
  useParams,
} from "next/navigation";

import AdminPageGuard from "../../../../../components/admin/AdminPageGuard";
import GalleryEditor from "../../../../../components/admin/GalleryEditor";

export default function EditGalleryPage() {
  const params =
    useParams<{
      id: string;
    }>();

  return (
    <AdminPageGuard>
      <GalleryEditor
        galleryId={
          params.id
        }
      />
    </AdminPageGuard>
  );
}