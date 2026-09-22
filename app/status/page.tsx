"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPublicSiteServices,
  getSiteIncidents,
} from "../../services/site-status.service";

import type {
  SiteIncidentStatus,
  SiteIncidentWithDetails,
  SiteService,
  SiteServiceStatus,
} from "../../types/site-status";


type OverallStatus = {
  label: string;
  description: string;
  tone:
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "blue";
};


const SERVICE_STATUS_ORDER:
  Record<
    SiteServiceStatus,
    number
  > = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  partial_outage: 3,
  major_outage: 4,
};


const SERVICE_STATUS_LABELS:
  Record<
    SiteServiceStatus,
    string
  > = {
  operational:
    "Operational",

  degraded:
    "Degraded Performance",

  partial_outage:
    "Partial Outage",

  major_outage:
    "Major Outage",

  maintenance:
    "Maintenance",
};


const INCIDENT_STATUS_LABELS:
  Record<
    SiteIncidentStatus,
    string
  > = {
  investigating:
    "Investigating",

  identified:
    "Identified",

  monitoring:
    "Monitoring",

  scheduled:
    "Scheduled",

  in_progress:
    "In Progress",

  resolved:
    "Resolved",

  completed:
    "Completed",
};


function getServiceTone(
  status:
    SiteServiceStatus
) {
  switch (
    status
  ) {
    case "operational":
      return {
        color:
          "#68f7b0",

        background:
          "rgba(35, 197, 126, 0.11)",

        border:
          "rgba(60, 229, 151, 0.22)",
      };

    case "maintenance":
      return {
        color:
          "#70dfff",

        background:
          "rgba(44, 190, 255, 0.10)",

        border:
          "rgba(70, 213, 255, 0.22)",
      };

    case "degraded":
      return {
        color:
          "#ffd76a",

        background:
          "rgba(255, 190, 65, 0.10)",

        border:
          "rgba(255, 210, 91, 0.22)",
      };

    case "partial_outage":
      return {
        color:
          "#ffad66",

        background:
          "rgba(255, 139, 55, 0.10)",

        border:
          "rgba(255, 155, 74, 0.24)",
      };

    case "major_outage":
      return {
        color:
          "#ff7588",

        background:
          "rgba(255, 73, 105, 0.10)",

        border:
          "rgba(255, 91, 119, 0.24)",
      };
  }
}


function getIncidentTone(
  incident:
    SiteIncidentWithDetails
) {
  if (
    incident.status ===
      "resolved" ||
    incident.status ===
      "completed"
  ) {
    return {
      color:
        "#68f7b0",

      background:
        "rgba(35, 197, 126, 0.10)",

      border:
        "rgba(60, 229, 151, 0.22)",
    };
  }


  if (
    incident.type ===
    "maintenance"
  ) {
    return {
      color:
        "#70dfff",

      background:
        "rgba(44, 190, 255, 0.10)",

      border:
        "rgba(70, 213, 255, 0.22)",
    };
  }


  switch (
    incident.severity
  ) {
    case "minor":
      return {
        color:
          "#ffd76a",

        background:
          "rgba(255, 190, 65, 0.10)",

        border:
          "rgba(255, 210, 91, 0.22)",
      };

    case "major":
      return {
        color:
          "#ffad66",

        background:
          "rgba(255, 139, 55, 0.10)",

        border:
          "rgba(255, 155, 74, 0.24)",
      };

    case "critical":
      return {
        color:
          "#ff7588",

        background:
          "rgba(255, 73, 105, 0.10)",

        border:
          "rgba(255, 91, 119, 0.24)",
      };
  }
}


function getOverallStatus(
  services:
    SiteService[]
): OverallStatus {
  if (
    services.length ===
    0
  ) {
    return {
      label:
        "Status Unavailable",

      description:
        "No public Auros services are currently configured.",

      tone:
        "blue",
    };
  }


  const worstStatus =
    services.reduce<SiteServiceStatus>(
      (
        current,
        service
      ) => {
        if (
          SERVICE_STATUS_ORDER[
            service.status
          ] >
          SERVICE_STATUS_ORDER[
            current
          ]
        ) {
          return service.status;
        }

        return current;
      },
      "operational"
    );


  switch (
    worstStatus
  ) {
    case "operational":
      return {
        label:
          "All Systems Operational",

        description:
          "All public Auros services are operating normally.",

        tone:
          "green",
      };

    case "maintenance":
      return {
        label:
          "Scheduled Maintenance",

        description:
          "Maintenance is currently affecting one or more Auros services.",

        tone:
          "blue",
      };

    case "degraded":
      return {
        label:
          "Degraded Performance",

        description:
          "One or more Auros services are currently experiencing degraded performance.",

        tone:
          "yellow",
      };

    case "partial_outage":
      return {
        label:
          "Partial System Outage",

        description:
          "One or more Auros services are currently partially unavailable.",

        tone:
          "orange",
      };

    case "major_outage":
      return {
        label:
          "Major System Outage",

        description:
          "One or more Auros services are currently unavailable.",

        tone:
          "red",
      };
  }
}


function getOverallTone(
  tone:
    OverallStatus["tone"]
) {
  switch (
    tone
  ) {
    case "green":
      return {
        color:
          "#68f7b0",

        background:
          "linear-gradient(135deg, rgba(28, 196, 123, 0.16), rgba(10, 24, 43, 0.88))",

        border:
          "rgba(68, 237, 159, 0.30)",

        glow:
          "rgba(50, 226, 147, 0.12)",
      };

    case "yellow":
      return {
        color:
          "#ffd76a",

        background:
          "linear-gradient(135deg, rgba(255, 190, 65, 0.14), rgba(10, 24, 43, 0.88))",

        border:
          "rgba(255, 210, 91, 0.28)",

        glow:
          "rgba(255, 199, 71, 0.10)",
      };

    case "orange":
      return {
        color:
          "#ffad66",

        background:
          "linear-gradient(135deg, rgba(255, 132, 46, 0.14), rgba(10, 24, 43, 0.88))",

        border:
          "rgba(255, 155, 74, 0.28)",

        glow:
          "rgba(255, 139, 55, 0.10)",
      };

    case "red":
      return {
        color:
          "#ff7588",

        background:
          "linear-gradient(135deg, rgba(255, 65, 99, 0.15), rgba(10, 24, 43, 0.88))",

        border:
          "rgba(255, 91, 119, 0.30)",

        glow:
          "rgba(255, 73, 105, 0.11)",
      };

    case "blue":
      return {
        color:
          "#70dfff",

        background:
          "linear-gradient(135deg, rgba(44, 190, 255, 0.13), rgba(10, 24, 43, 0.88))",

        border:
          "rgba(70, 213, 255, 0.26)",

        glow:
          "rgba(44, 190, 255, 0.10)",
      };
  }
}


function formatDate(
  value:
    string | null
) {
  if (
    !value
  ) {
    return null;
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}


function isIncidentFinished(
  incident:
    SiteIncidentWithDetails
) {
  return (
    incident.status ===
      "resolved" ||
    incident.status ===
      "completed"
  );
}


function StatusDot({
  color,
}: {
  color:
    string;
}) {
  return (
    <span
      style={{
        display:
          "inline-block",

        width:
          9,

        height:
          9,

        flex:
          "0 0 auto",

        borderRadius:
          "999px",

        background:
          color,

        boxShadow:
          `0 0 14px ${color}`,
      }}
    />
  );
}


function IncidentCard({
  incident,
}: {
  incident:
    SiteIncidentWithDetails;
}) {
  const tone =
    getIncidentTone(
      incident
    );

  const date =
    incident.type ===
      "maintenance"
      ? formatDate(
          incident.scheduled_for
        )
      : formatDate(
          incident.started_at ??
            incident.created_at
        );


  return (
    <article className="statusIncidentCard">
      <div className="statusIncidentTop">
        <div>
          <div className="statusIncidentBadges">
            <span
              className="statusIncidentBadge"
              style={{
                color:
                  tone.color,

                background:
                  tone.background,

                borderColor:
                  tone.border,
              }}
            >
              {
                incident.type ===
                "maintenance"
                  ? "MAINTENANCE"
                  : incident.severity.toUpperCase()
              }
            </span>

            <span className="statusIncidentState">
              {
                INCIDENT_STATUS_LABELS[
                  incident.status
                ]
              }
            </span>
          </div>

          <h3>
            {
              incident.title
            }
          </h3>

          {incident.description && (
            <p className="statusIncidentDescription">
              {
                incident.description
              }
            </p>
          )}
        </div>

        {date && (
          <span className="statusIncidentDate">
            {date}
          </span>
        )}
      </div>


      {incident.services.length >
        0 && (
        <div className="statusAffected">
          <span className="statusAffectedLabel">
            Affected services
          </span>

          <div className="statusAffectedServices">
            {incident.services.map(
              (
                service
              ) => (
                <span
                  key={
                    service.id
                  }
                  className="statusAffectedService"
                >
                  {
                    service.name
                  }
                </span>
              )
            )}
          </div>
        </div>
      )}


      {incident.updates.length >
        0 && (
        <div className="statusIncidentTimeline">
          {incident.updates.map(
            (
              update,
              index
            ) => (
              <div
                key={
                  update.id
                }
                className="statusTimelineItem"
              >
                <div className="statusTimelineRail">
                  <span
                    className="statusTimelineDot"
                    style={{
                      background:
                        tone.color,
                    }}
                  />

                  {index <
                    incident
                      .updates
                      .length -
                      1 && (
                    <span className="statusTimelineLine" />
                  )}
                </div>

                <div className="statusTimelineContent">
                  <div className="statusTimelineMeta">
                    <strong>
                      {
                        INCIDENT_STATUS_LABELS[
                          update.status
                        ]
                      }
                    </strong>

                    <span>
                      {
                        formatDate(
                          update.created_at
                        )
                      }
                    </span>
                  </div>

                  <p>
                    {
                      update.message
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </article>
  );
}


export default function StatusPage() {
  const [
    services,
    setServices,
  ] =
    useState<
      SiteService[]
    >(
      []
    );

  const [
    incidents,
    setIncidents,
  ] =
    useState<
      SiteIncidentWithDetails[]
    >(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    loadError,
    setLoadError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState<
      Date | null
    >(
      null
    );


  const loadStatus =
    useCallback(
      async (
        silent =
          false
      ) => {
        if (
          !silent
        ) {
          setLoading(
            true
          );
        }

        setLoadError(
          null
        );


        try {
          const [
            serviceData,
            incidentData,
          ] =
            await Promise.all([
              getPublicSiteServices(),
              getSiteIncidents(),
            ]);


          const publicServiceIds =
            new Set(
              serviceData.map(
                (
                  service
                ) =>
                  service.id
              )
            );


          /*
           * Public status page must not
           * expose incidents that only
           * belong to private services.
           */
          const publicIncidents =
            incidentData
              .map(
                (
                  incident
                ) => ({
                  ...incident,

                  services:
                    incident.services.filter(
                      (
                        service
                      ) =>
                        publicServiceIds.has(
                          service.id
                        )
                    ),
                })
              )
              .filter(
                (
                  incident
                ) =>
                  incident.services
                    .length >
                    0
              );


          setServices(
            serviceData
          );

          setIncidents(
            publicIncidents
          );

          setLastUpdated(
            new Date()
          );
        } catch (
          error
        ) {
          console.error(
            "[StatusPage] Failed to load status:",
            error
          );

          setLoadError(
            "We could not load the current Auros system status."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(() => {
    void loadStatus();


    /*
     * Lightweight automatic refresh.
     * The page stays reasonably current
     * without requiring realtime.
     */
    const interval =
      window.setInterval(
        () => {
          void loadStatus(
            true
          );
        },
        60_000
      );


    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    loadStatus,
  ]);


  const overallStatus =
    useMemo(
      () =>
        getOverallStatus(
          services
        ),
      [
        services,
      ]
    );


  const overallTone =
    getOverallTone(
      overallStatus.tone
    );


  const activeIncidents =
    useMemo(
      () =>
        incidents.filter(
          (
            incident
          ) =>
            incident.type ===
              "incident" &&
            !isIncidentFinished(
              incident
            )
        ),
      [
        incidents,
      ]
    );


  const maintenance =
    useMemo(
      () =>
        incidents.filter(
          (
            incident
          ) =>
            incident.type ===
              "maintenance" &&
            !isIncidentFinished(
              incident
            )
        ),
      [
        incidents,
      ]
    );


  const pastIncidents =
    useMemo(
      () =>
        incidents
          .filter(
            isIncidentFinished
          )
          .slice(
            0,
            8
          ),
      [
        incidents,
      ]
    );


  if (
    loading
  ) {
    return (
      <section className="statusLoading">
        <div className="statusLoadingOrb" />

        <strong>
          Loading Auros Status
        </strong>

        <span>
          Checking public services...
        </span>

        <style jsx>{`
          .statusLoading {
            min-height:
              420px;

            display:
              flex;

            flex-direction:
              column;

            align-items:
              center;

            justify-content:
              center;

            gap:
              10px;

            color:
              #eef4ff;
          }


          .statusLoadingOrb {
            width:
              28px;

            height:
              28px;

            margin-bottom:
              8px;

            border-radius:
              999px;

            border:
              3px solid
              rgba(
                87,
                210,
                255,
                0.16
              );

            border-top-color:
              #57d2ff;

            animation:
              statusSpin
              700ms
              linear
              infinite;
          }


          .statusLoading span {
            color:
              #8193b4;

            font-size:
              13px;
          }


          @keyframes statusSpin {
            to {
              transform:
                rotate(
                  360deg
                );
            }
          }
        `}</style>
      </section>
    );
  }


  return (
    <div className="statusPage">
      <section className="statusHero">
        <div className="statusHeroCopy">
          <span className="statusEyebrow">
            AUROS SYSTEM STATUS
          </span>

          <h1>
            Live Status
          </h1>

          <p>
            Live operational information
            for Auros Royale services,
            systems and scheduled
            maintenance.
          </p>
        </div>

        <div className="statusHeroMeta">
          <span className="statusLiveBadge">
            <span />
            LIVE
          </span>

          {lastUpdated && (
            <span className="statusUpdated">
              Updated{" "}
              {
                new Intl.DateTimeFormat(
                  "en",
                  {
                    hour:
                      "2-digit",

                    minute:
                      "2-digit",
                  }
                ).format(
                  lastUpdated
                )
              }
            </span>
          )}
        </div>
      </section>


      {loadError ? (
        <section className="statusError">
          <strong>
            Status temporarily unavailable
          </strong>

          <p>
            {loadError}
          </p>

          <button
            type="button"
            onClick={
              () =>
                void loadStatus()
            }
          >
            Try Again
          </button>
        </section>
      ) : (
        <>
          <section
            className="statusOverall"
            style={{
              background:
                overallTone.background,

              borderColor:
                overallTone.border,

              boxShadow:
                `0 24px 70px ${overallTone.glow}`,
            }}
          >
            <div
              className="statusOverallIcon"
              style={{
                color:
                  overallTone.color,

                borderColor:
                  overallTone.border,

                background:
                  `${overallTone.color}12`,
              }}
            >
              <StatusDot
                color={
                  overallTone.color
                }
              />
            </div>

            <div className="statusOverallCopy">
              <span>
                CURRENT STATUS
              </span>

              <h2
                style={{
                  color:
                    overallTone.color,
                }}
              >
                {
                  overallStatus.label
                }
              </h2>

              <p>
                {
                  overallStatus.description
                }
              </p>
            </div>
          </section>


          <section className="statusSection">
            <div className="statusSectionHeader">
              <div>
                <span className="statusSectionEyebrow">
                  SERVICES
                </span>

                <h2>
                  Auros Services
                </h2>
              </div>

              <span className="statusCount">
                {
                  services.length
                }{" "}
                {
                  services.length ===
                  1
                    ? "service"
                    : "services"
                }
              </span>
            </div>


            <div className="statusServices">
              {services.length ===
              0 ? (
                <div className="statusEmpty">
                  No public services are
                  currently configured.
                </div>
              ) : (
                services.map(
                  (
                    service
                  ) => {
                    const tone =
                      getServiceTone(
                        service.status
                      );


                    return (
                      <div
                        key={
                          service.id
                        }
                        className="statusService"
                      >
                        <div className="statusServiceCopy">
                          <div className="statusServiceTitle">
                            <StatusDot
                              color={
                                tone.color
                              }
                            />

                            <strong>
                              {
                                service.name
                              }
                            </strong>
                          </div>

                          {service.description && (
                            <p>
                              {
                                service.description
                              }
                            </p>
                          )}
                        </div>

                        <span
                          className="statusServiceBadge"
                          style={{
                            color:
                              tone.color,

                            background:
                              tone.background,

                            borderColor:
                              tone.border,
                          }}
                        >
                          {
                            SERVICE_STATUS_LABELS[
                              service
                                .status
                            ]
                          }
                        </span>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </section>


          <section className="statusSection">
            <div className="statusSectionHeader">
              <div>
                <span className="statusSectionEyebrow">
                  INCIDENTS
                </span>

                <h2>
                  Active Incidents
                </h2>
              </div>
            </div>


            {activeIncidents.length ===
            0 ? (
              <div className="statusSuccessEmpty">
                <div className="statusSuccessIcon">
                  ✓
                </div>

                <div>
                  <strong>
                    No active incidents
                  </strong>

                  <p>
                    There are currently no
                    reported incidents
                    affecting public Auros
                    services.
                  </p>
                </div>
              </div>
            ) : (
              <div className="statusIncidentList">
                {activeIncidents.map(
                  (
                    incident
                  ) => (
                    <IncidentCard
                      key={
                        incident.id
                      }
                      incident={
                        incident
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>


          {maintenance.length >
            0 && (
            <section className="statusSection">
              <div className="statusSectionHeader">
                <div>
                  <span className="statusSectionEyebrow">
                    MAINTENANCE
                  </span>

                  <h2>
                    Scheduled Maintenance
                  </h2>
                </div>
              </div>

              <div className="statusIncidentList">
                {maintenance.map(
                  (
                    incident
                  ) => (
                    <IncidentCard
                      key={
                        incident.id
                      }
                      incident={
                        incident
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}


          <section className="statusSection">
            <div className="statusSectionHeader">
              <div>
                <span className="statusSectionEyebrow">
                  HISTORY
                </span>

                <h2>
                  Recent Incidents
                </h2>
              </div>
            </div>


            {pastIncidents.length ===
            0 ? (
              <div className="statusEmpty">
                No resolved incidents have
                been recorded yet.
              </div>
            ) : (
              <div className="statusIncidentList">
                {pastIncidents.map(
                  (
                    incident
                  ) => (
                    <IncidentCard
                      key={
                        incident.id
                      }
                      incident={
                        incident
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>


          <div className="statusFooterNote">
            <span className="statusFooterDot" />

            Status information automatically
            refreshes every 60 seconds.
          </div>
        </>
      )}


      <style jsx>{`
        .statusPage {
          width:
            100%;

          padding-bottom:
            30px;

          color:
            #f4f7ff;
        }


        .statusHero {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            30px;

          padding:
            46px
            4px
            28px;
        }


        .statusEyebrow,
        .statusSectionEyebrow {
          display:
            block;

          color:
            #58d6ff;

          font-size:
            11px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }


        .statusHero h1 {
          margin:
            8px
            0
            10px;

          font-size:
            clamp(
              38px,
              6vw,
              64px
            );

          line-height:
            0.98;

          letter-spacing:
            -0.045em;
        }


        .statusHero p {
          max-width:
            650px;

          margin:
            0;

          color:
            #8fa1c0;

          font-size:
            15px;

          line-height:
            1.7;
        }


        .statusHeroMeta {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          flex-wrap:
            wrap;

          justify-content:
            flex-end;
        }


        .statusLiveBadge {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          padding:
            8px
            11px;

          border:
            1px solid
            rgba(
              71,
              229,
              158,
              0.22
            );

          border-radius:
            999px;

          background:
            rgba(
              30,
              188,
              119,
              0.09
            );

          color:
            #6af1ae;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.08em;
        }


        .statusLiveBadge span {
          width:
            7px;

          height:
            7px;

          border-radius:
            999px;

          background:
            #61f0aa;

          box-shadow:
            0
            0
            12px
            rgba(
              97,
              240,
              170,
              0.8
            );
        }


        .statusUpdated {
          color:
            #7183a4;

          font-size:
            12px;
        }


        .statusOverall {
          display:
            flex;

          align-items:
            center;

          gap:
            20px;

          min-height:
            138px;

          padding:
            26px;

          border:
            1px solid;

          border-radius:
            24px;
        }


        .statusOverallIcon {
          width:
            54px;

          height:
            54px;

          display:
            grid;

          place-items:
            center;

          flex:
            0 0 auto;

          border:
            1px solid;

          border-radius:
            17px;
        }


        .statusOverallIcon
          :global(span) {
          width:
            13px !important;

          height:
            13px !important;
        }


        .statusOverallCopy
          > span {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #7486a8;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.13em;
        }


        .statusOverall h2 {
          margin:
            0;

          font-size:
            clamp(
              22px,
              4vw,
              31px
            );

          letter-spacing:
            -0.025em;
        }


        .statusOverall p {
          margin:
            7px
            0
            0;

          color:
            #91a2c0;

          line-height:
            1.6;
        }


        .statusSection {
          margin-top:
            28px;

          padding:
            22px;

          border:
            1px solid
            rgba(
              36,
              53,
              84,
              0.92
            );

          border-radius:
            24px;

          background:
            rgba(
              10,
              20,
              40,
              0.70
            );

          backdrop-filter:
            blur(
              12px
            );

          box-shadow:
            0
            18px
            50px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }


        .statusSectionHeader {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            18px;
        }


        .statusSectionHeader h2 {
          margin:
            5px
            0
            0;

          font-size:
            22px;

          letter-spacing:
            -0.02em;
        }


        .statusCount {
          color:
            #7083a6;

          font-size:
            12px;
        }


        .statusServices {
          display:
            grid;

          gap:
            10px;
        }


        .statusService {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          padding:
            17px
            18px;

          border:
            1px solid
            rgba(
              38,
              55,
              86,
              0.85
            );

          border-radius:
            17px;

          background:
            rgba(
              8,
              17,
              34,
              0.60
            );
        }


        .statusServiceTitle {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;
        }


        .statusServiceTitle
          strong {
          font-size:
            15px;
        }


        .statusServiceCopy p {
          margin:
            6px
            0
            0
            20px;

          color:
            #788bab;

          font-size:
            12px;

          line-height:
            1.55;
        }


        .statusServiceBadge {
          flex:
            0
            0
            auto;

          padding:
            7px
            10px;

          border:
            1px solid;

          border-radius:
            999px;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.055em;

          text-transform:
            uppercase;
        }


        .statusIncidentList {
          display:
            grid;

          gap:
            14px;
        }


        .statusIncidentCard {
          padding:
            20px;

          border:
            1px solid
            rgba(
              38,
              55,
              86,
              0.88
            );

          border-radius:
            19px;

          background:
            rgba(
              8,
              17,
              34,
              0.64
            );
        }


        .statusIncidentTop {
          display:
            flex;

          justify-content:
            space-between;

          gap:
            24px;
        }


        .statusIncidentBadges {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          flex-wrap:
            wrap;
        }


        .statusIncidentBadge {
          padding:
            6px
            8px;

          border:
            1px solid;

          border-radius:
            999px;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.07em;
        }


        .statusIncidentState {
          color:
            #8fa1c0;

          font-size:
            11px;

          font-weight:
            700;
        }


        .statusIncidentCard h3 {
          margin:
            11px
            0
            0;

          font-size:
            19px;
        }


        .statusIncidentDescription {
          max-width:
            760px;

          margin:
            8px
            0
            0;

          color:
            #8395b5;

          font-size:
            13px;

          line-height:
            1.65;
        }


        .statusIncidentDate {
          flex:
            0
            0
            auto;

          color:
            #667a9e;

          font-size:
            11px;
        }


        .statusAffected {
          margin-top:
            17px;

          padding-top:
            15px;

          border-top:
            1px solid
            rgba(
              37,
              53,
              83,
              0.7
            );
        }


        .statusAffectedLabel {
          display:
            block;

          margin-bottom:
            8px;

          color:
            #64789d;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;
        }


        .statusAffectedServices {
          display:
            flex;

          gap:
            7px;

          flex-wrap:
            wrap;
        }


        .statusAffectedService {
          padding:
            6px
            9px;

          border:
            1px solid
            rgba(
              55,
              82,
              121,
              0.7
            );

          border-radius:
            999px;

          background:
            rgba(
              31,
              53,
              83,
              0.32
            );

          color:
            #a9b8d3;

          font-size:
            10px;

          font-weight:
            700;
        }


        .statusIncidentTimeline {
          display:
            grid;

          gap:
            0;

          margin-top:
            18px;

          padding-top:
            17px;

          border-top:
            1px solid
            rgba(
              37,
              53,
              83,
              0.7
            );
        }


        .statusTimelineItem {
          display:
            grid;

          grid-template-columns:
            18px
            1fr;

          gap:
            10px;
        }


        .statusTimelineRail {
          position:
            relative;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;
        }


        .statusTimelineDot {
          width:
            7px;

          height:
            7px;

          margin-top:
            5px;

          flex:
            0
            0
            auto;

          border-radius:
            999px;
        }


        .statusTimelineLine {
          width:
            1px;

          min-height:
            46px;

          flex:
            1;

          margin:
            4px
            0;

          background:
            rgba(
              64,
              84,
              116,
              0.55
            );
        }


        .statusTimelineContent {
          padding-bottom:
            16px;
        }


        .statusTimelineMeta {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            16px;
        }


        .statusTimelineMeta
          strong {
          color:
            #dbe6fa;

          font-size:
            11px;
        }


        .statusTimelineMeta
          span {
          color:
            #617597;

          font-size:
            10px;
        }


        .statusTimelineContent p {
          margin:
            5px
            0
            0;

          color:
            #8294b4;

          font-size:
            12px;

          line-height:
            1.6;
        }


        .statusSuccessEmpty,
        .statusEmpty {
          border:
            1px solid
            rgba(
              38,
              55,
              86,
              0.82
            );

          border-radius:
            17px;

          background:
            rgba(
              8,
              17,
              34,
              0.55
            );
        }


        .statusSuccessEmpty {
          display:
            flex;

          align-items:
            center;

          gap:
            14px;

          padding:
            18px;
        }


        .statusSuccessIcon {
          width:
            36px;

          height:
            36px;

          display:
            grid;

          place-items:
            center;

          flex:
            0
            0
            auto;

          border:
            1px solid
            rgba(
              65,
              230,
              153,
              0.22
            );

          border-radius:
            12px;

          background:
            rgba(
              35,
              197,
              126,
              0.10
            );

          color:
            #68f7b0;

          font-weight:
            900;
        }


        .statusSuccessEmpty
          strong {
          display:
            block;

          color:
            #dfe9f9;

          font-size:
            13px;
        }


        .statusSuccessEmpty p {
          margin:
            4px
            0
            0;

          color:
            #7184a6;

          font-size:
            11px;

          line-height:
            1.5;
        }


        .statusEmpty {
          padding:
            18px;

          color:
            #7184a6;

          font-size:
            12px;
        }


        .statusError {
          padding:
            24px;

          border:
            1px solid
            rgba(
              255,
              90,
              119,
              0.28
            );

          border-radius:
            20px;

          background:
            rgba(
              255,
              64,
              98,
              0.07
            );
        }


        .statusError strong {
          color:
            #ff8293;
        }


        .statusError p {
          color:
            #8799b7;
        }


        .statusError button {
          padding:
            9px
            13px;

          border:
            1px solid
            #2b4367;

          border-radius:
            10px;

          background:
            #10203a;

          color:
            #e9f1ff;

          cursor:
            pointer;

          font-weight:
            700;
        }


        .statusFooterNote {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            22px
            10px
            0;

          color:
            #53698c;

          font-size:
            10px;
        }


        .statusFooterDot {
          width:
            6px;

          height:
            6px;

          border-radius:
            999px;

          background:
            #5beaa4;
        }


        @media (
          max-width:
            700px
        ) {
          .statusHero {
            align-items:
              flex-start;

            flex-direction:
              column;

            padding-top:
              30px;
          }


          .statusHeroMeta {
            justify-content:
              flex-start;
          }


          .statusOverall {
            align-items:
              flex-start;

            padding:
              20px;
          }


          .statusSection {
            padding:
              16px;

            border-radius:
              20px;
          }


          .statusService {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              12px;

            padding:
              15px;
          }


          .statusServiceCopy p {
            margin-left:
              20px;
          }


          .statusIncidentTop {
            flex-direction:
              column;

            gap:
              10px;
          }


          .statusIncidentDate {
            order:
              -1;
          }


          .statusTimelineMeta {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              3px;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .statusLoadingOrb {
            animation:
              none;
          }
        }
      `}</style>
    </div>
  );
}