"use client";

import { useRouter } from "next/navigation";

import AdminPageGuard from "../../../../components/admin/AdminPageGuard";
import MapEditor from "../../../../components/admin/MapEditor";

import {
  createMap,
} from "../../../../services/map-admin.service";

import {
  emptyMapEditorForm,
  type MapEditorForm,
} from "../../../../types/maps";

export default function NewMapPage() {
  const router = useRouter();

  async function handleSave(
    form: MapEditorForm
  ) {
    await createMap(form);

    router.push("/admin/maps");
    router.refresh();
  }

  return (
    <AdminPageGuard>
      <MapEditor
        mode="create"
        initialValue={
          emptyMapEditorForm
        }
        onSave={handleSave}
      />
    </AdminPageGuard>
  );
}