"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageGuard from "../../../components/admin/AdminPageGuard";

import {
  deleteMap,
  getAdminMaps,
  setCurrentMap,
  setMapPublished,
} from "../../../services/map-admin.service";

import type {
  AurosMap,
} from "../../../types/maps";


export default function AdminMapsPage() {
  const [maps, setMaps] =
    useState<AurosMap[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "all" | "published" | "draft"
    >("all");


  async function loadMaps() {
    setLoading(true);

    try {
      const data =
        await getAdminMaps();

      setMaps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadMaps();
  }, []);


  const filteredMaps =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return maps.filter(
        (map) => {
          if (
            status ===
              "published" &&
            !map.published
          ) {
            return false;
          }

          if (
            status === "draft" &&
            map.published
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            map.name,
            map.venture_name,
            map.season_name,
            map.version,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query)
            );
        }
      );
    }, [
      maps,
      search,
      status,
    ]);


  async function handlePublish(
    map: AurosMap
  ) {
    await setMapPublished(
      map.id,
      !map.published
    );

    await loadMaps();
  }


  async function handleCurrent(
    map: AurosMap
  ) {
    if (map.current) {
      return;
    }

    await setCurrentMap(
      map.id
    );

    await loadMaps();
  }


  async function handleDelete(
    map: AurosMap
  ) {
    const accepted =
      window.confirm(
        `Delete "${map.name}"?\n\nThis cannot be undone.`
      );

    if (!accepted) {
      return;
    }

    await deleteMap(
      map.id
    );

    await loadMaps();
  }


  return (
    <AdminPageGuard>
      <div className="mapsAdminPage">
        <header className="mapsAdminHeader">
          <div>
            <span>
              AUROS WORLD CMS
            </span>

            <h1>
              Maps
            </h1>

            <p>
              Manage every version of the
              Auros island and build the
              historical map archive.
            </p>
          </div>

          <Link
            href="/admin/maps/new"
            className="newMapButton"
          >
            + New Map
          </Link>
        </header>

        <div className="mapsStats">
          <div>
            <span>
              TOTAL MAPS
            </span>

            <strong>
              {maps.length}
            </strong>
          </div>

          <div>
            <span>
              PUBLISHED
            </span>

            <strong>
              {
                maps.filter(
                  (map) =>
                    map.published
                ).length
              }
            </strong>
          </div>

          <div>
            <span>
              ARCHIVED
            </span>

            <strong>
              {
                maps.filter(
                  (map) =>
                    !map.current
                ).length
              }
            </strong>
          </div>

          <div>
            <span>
              CURRENT
            </span>

            <strong className="currentStat">
              {maps.find(
                (map) =>
                  map.current
              )?.name || "—"}
            </strong>
          </div>
        </div>

        <div className="mapsToolbar">
          <input
            type="search"
            placeholder="Search maps, seasons or versions..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <div className="mapStatusFilters">
            {(
              [
                "all",
                "published",
                "draft",
              ] as const
            ).map((value) => (
              <button
                key={value}
                type="button"
                className={
                  status === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatus(value)
                }
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mapsEmpty">
            Loading maps...
          </div>
        ) : filteredMaps.length ===
          0 ? (
          <div className="mapsEmpty">
            No maps found.
          </div>
        ) : (
          <div className="mapsGrid">
            {filteredMaps.map(
              (map) => (
                <article
                  key={map.id}
                  className="adminMapCard"
                >
                  <div className="adminMapImage">
                    <img
                      src={
                        map.thumbnail_url ||
                        map.image_url
                      }
                      alt={
                        map.name
                      }
                    />

                    <div className="adminMapBadges">
                      {map.current && (
                        <span className="currentBadge">
                          CURRENT
                        </span>
                      )}

                      <span
                        className={
                          map.published
                            ? "publishedBadge"
                            : "draftBadge"
                        }
                      >
                        {map.published
                          ? "PUBLISHED"
                          : "DRAFT"}
                      </span>
                    </div>
                  </div>

                  <div className="adminMapContent">
                    <div className="adminMapContext">
                      {[
                        map.venture_name,
                        map.season_number !==
                        null
                          ? `Season ${map.season_number}`
                          : null,
                        map.season_name,
                      ]
                        .filter(Boolean)
                        .join(" · ") ||
                        "AUROS MAP"}
                    </div>

                    <h2>
                      {map.name}
                    </h2>

                    <p>
                      {map.version
                        ? `Version: ${map.version}`
                        : "No version label"}
                    </p>

                    <div className="adminMapActions">
                      <Link
                        href={`/admin/maps/${map.id}/edit`}
                      >
                        Edit
                      </Link>

                      {!map.current && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCurrent(
                              map
                            )
                          }
                        >
                          Make Current
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handlePublish(
                            map
                          )
                        }
                      >
                        {map.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="deleteMapButton"
                        onClick={() =>
                          handleDelete(
                            map
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .mapsAdminPage {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 30px;
        }

        .mapsAdminHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 22px;
        }

        .mapsAdminHeader > div > span {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .mapsAdminHeader h1 {
          margin: 6px 0;
          font-size: 36px;
          letter-spacing: -0.04em;
        }

        .mapsAdminHeader p {
          margin: 0;
          color: #8296b4;
          font-size: 11px;
        }

        .newMapButton {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          padding: 0 15px;
          border-radius: 9px;
          background: #63ddff;
          color: #04101c;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .mapsStats {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          gap: 10px;
          margin-bottom: 15px;
        }

        .mapsStats > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-height: 80px;
          justify-content: center;
          padding: 14px;
          border: 1px solid rgba(112, 147, 202, 0.11);
          border-radius: 12px;
          background: rgba(7, 16, 32, 0.7);
        }

        .mapsStats span {
          color: #637998;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .mapsStats strong {
          font-size: 20px;
        }

        .mapsStats .currentStat {
          color: #63ddff;
          font-size: 13px;
        }

        .mapsToolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 15px;
        }

        .mapsToolbar > input {
          width: min(100%, 420px);
          min-height: 39px;
          padding: 0 12px;
          border: 1px solid rgba(112, 147, 202, 0.13);
          border-radius: 9px;
          outline: none;
          background: rgba(5, 13, 27, 0.78);
          color: white;
          font-size: 9px;
        }

        .mapStatusFilters {
          display: flex;
          gap: 6px;
        }

        .mapStatusFilters button {
          min-height: 35px;
          padding: 0 11px;
          border: 1px solid rgba(112, 147, 202, 0.11);
          border-radius: 8px;
          background: rgba(8, 18, 34, 0.7);
          color: #7186a5;
          font-size: 8px;
          font-weight: 800;
          text-transform: capitalize;
          cursor: pointer;
        }

        .mapStatusFilters button.active {
          border-color: rgba(99, 221, 255, 0.25);
          background: rgba(99, 221, 255, 0.08);
          color: #b8f3ff;
        }

        .mapsGrid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 12px;
        }

        .adminMapCard {
          overflow: hidden;
          border: 1px solid rgba(112, 147, 202, 0.11);
          border-radius: 14px;
          background: rgba(7, 16, 32, 0.78);
        }

        .adminMapImage {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #020711;
        }

        .adminMapImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .adminMapBadges {
          position: absolute;
          top: 9px;
          left: 9px;
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .adminMapBadges span {
          padding: 5px 7px;
          border-radius: 999px;
          backdrop-filter: blur(5px);
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .currentBadge {
          background: rgba(99, 221, 255, 0.85);
          color: #03101a;
        }

        .publishedBadge {
          background: rgba(49, 210, 138, 0.75);
          color: white;
        }

        .draftBadge {
          background: rgba(8, 16, 30, 0.8);
          color: #91a3bd;
        }

        .adminMapContent {
          padding: 13px;
        }

        .adminMapContext {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .adminMapContent h2 {
          margin: 6px 0 4px;
          font-size: 17px;
        }

        .adminMapContent > p {
          margin: 0;
          color: #7186a5;
          font-size: 8px;
        }

        .adminMapActions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 13px;
          padding-top: 11px;
          border-top: 1px solid rgba(112, 147, 202, 0.08);
        }

        .adminMapActions a,
        .adminMapActions button {
          min-height: 31px;
          display: inline-flex;
          align-items: center;
          padding: 0 9px;
          border: 1px solid rgba(112, 147, 202, 0.13);
          border-radius: 7px;
          background: rgba(9, 20, 38, 0.78);
          color: #a9bad0;
          font-size: 7px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .adminMapActions a:hover,
        .adminMapActions button:hover {
          border-color: rgba(99, 221, 255, 0.25);
          color: white;
        }

        .adminMapActions .deleteMapButton {
          margin-left: auto;
          color: #ff9ca6;
        }

        .mapsEmpty {
          padding: 50px 20px;
          border: 1px dashed rgba(112, 147, 202, 0.12);
          border-radius: 13px;
          text-align: center;
          color: #647a9a;
          font-size: 10px;
        }

        @media (max-width: 1100px) {
          .mapsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 750px) {
          .mapsAdminPage {
            padding: 20px 12px;
          }

          .mapsAdminHeader,
          .mapsToolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .mapsStats {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .mapsGrid {
            grid-template-columns: 1fr;
          }

          .mapsToolbar > input {
            width: 100%;
          }
        }
      `}</style>
    </AdminPageGuard>
  );
}