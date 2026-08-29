"use client";

import {
  useEffect,
  useState,
} from "react";

import AdminPageGuard from "../../../../components/admin/AdminPageGuard";

import MapMarkerManager from "../../../../components/admin/MapMarkerManager";

import {
  getAdminMaps,
} from "../../../../services/map-admin.service";

import type {
  AurosMap,
} from "../../../../types/maps";

export default function MapMarkersAdminPage() {
  const [
    maps,
    setMaps,
  ] =
    useState<AurosMap[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    getAdminMaps()
      .then(
        setMaps
      )
      .catch(
        (loadError) => {
          console.error(
            loadError
          );

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load maps."
          );
        }
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  return (
    <AdminPageGuard>
      <main className="markerAdminPage">
        <header className="markerAdminPageHeader">
          <span>
            AUROS MAP SYSTEM
          </span>

          <h1>
            Marker Library
          </h1>

          <p>
            Manage map locations and migrate
            them between Auros map versions.
          </p>
        </header>

        {loading ? (
          <div className="markerAdminState">
            Loading maps...
          </div>
        ) : error ? (
          <div className="markerAdminState error">
            {error}
          </div>
        ) : (
          <MapMarkerManager
            maps={maps}
          />
        )}
      </main>

      <style jsx global>{`
        .markerAdminPage {
          width: min(
            calc(100% - 40px),
            1500px
          );

          margin: 0 auto;

          padding:
            30px
            0
            70px;
        }

        .markerAdminPageHeader {
          margin-bottom: 25px;
        }

        .markerAdminPageHeader > span {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .markerAdminPageHeader h1 {
          margin: 6px 0 5px;
          font-size: 42px;
          letter-spacing: -.04em;
        }

        .markerAdminPageHeader p {
          margin: 0;
          color: #7489a8;
          font-size: 11px;
        }

        .markerAdminState {
          padding: 50px;
          color: #7186a5;
          text-align: center;
        }

        .markerAdminState.error {
          color: #ff9ca6;
        }
      `}</style>
    </AdminPageGuard>
  );
}