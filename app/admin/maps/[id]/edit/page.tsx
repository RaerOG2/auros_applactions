"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminPageGuard from "../../../../../components/admin/AdminPageGuard";
import MapEditor from "../../../../../components/admin/MapEditor";
import MapMarkerEditor from "../../../../../components/admin/MapMarkerEditor";

import {
  getAdminMapById,
  updateMap,
} from "../../../../../services/map-admin.service";

import type {
  AurosMap,
  MapEditorForm,
} from "../../../../../types/maps";


export default function EditMapPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [map, setMap] =
    useState<AurosMap | null>(
      null
    );

  const [initialValue, setInitialValue] =
    useState<MapEditorForm | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (!id) {
      return;
    }

    getAdminMapById(id)
      .then((loadedMap) => {
        if (!loadedMap) {
          setError(
            "Map not found."
          );

          return;
        }

        setMap(loadedMap);

        setInitialValue({
          name:
            loadedMap.name ?? "",

          venture_name:
            loadedMap.venture_name ?? "",

          season_name:
            loadedMap.season_name ?? "",

          season_number:
            loadedMap.season_number !== null
              ? String(
                  loadedMap.season_number
                )
              : "",

          version:
            loadedMap.version ?? "",

          description:
            loadedMap.description ?? "",

          image_url:
            loadedMap.image_url ?? "",

          thumbnail_url:
            loadedMap.thumbnail_url ?? "",

          release_date:
            loadedMap.release_date ?? "",

          current:
            loadedMap.current,

          published:
            loadedMap.published,

          sort_order:
            String(
              loadedMap.sort_order ?? 0
            ),
        });
      })
      .catch((loadError) => {
        console.error(
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load map."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);


  async function handleSave(
    form: MapEditorForm
  ) {
    const updated =
      await updateMap(
        id,
        form
      );

    setMap(updated);

    router.refresh();
  }


  return (
    <AdminPageGuard>
      {loading ? (
        <div
          style={{
            padding: 40,
            color: "#8296b5",
          }}
        >
          Loading map...
        </div>
      ) : error ||
        !initialValue ||
        !map ? (
        <div
          style={{
            padding: 40,
            color: "#ff9aa5",
          }}
        >
          {error ||
            "Map could not be loaded."}
        </div>
      ) : (
        <>
          <MapEditor
            mode="edit"
            initialValue={
              initialValue
            }
            onSave={
              handleSave
            }
          />

          <div
            style={{
              maxWidth: 1500,
              margin: "0 auto",
              padding:
                "0 30px 60px",
            }}
          >
            <MapMarkerEditor
              map={map}
            />
          </div>
        </>
      )}
    </AdminPageGuard>
  );
}