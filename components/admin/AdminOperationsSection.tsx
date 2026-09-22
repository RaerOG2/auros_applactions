"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createSiteIncident,
  createSiteIncidentUpdate,
  createSiteService,
  deleteSiteIncident,
  deleteSiteIncidentUpdate,
  deleteSiteService,
  getAllSiteServices,
  getSiteIncidents,
  updateSiteIncident,
  updateSiteService,
  updateSiteServiceStatus,
} from "../../services/site-status.service";

import {
  createAdminActivityLog,
} from "../../services/admin-log-service";

import {
  getCurrentUser,
} from "../../services/admin-service";

import type {
  SiteIncidentInput,
  SiteIncidentSeverity,
  SiteIncidentStatus,
  SiteIncidentType,
  SiteIncidentWithDetails,
  SiteService,
  SiteServiceInput,
  SiteServiceStatus,
} from "../../types/site-status";


type OperationsTab =
  | "services"
  | "incidents";


const emptyServiceForm:
  SiteServiceInput = {
  name: "",
  slug: "",
  description: "",
  status: "operational",
  public: true,
  sort_order: 0,
};


const emptyIncidentForm:
  SiteIncidentInput = {
  title: "",
  description: "",
  type: "incident",
  severity: "minor",
  status: "investigating",
  started_at: null,
  resolved_at: null,
  scheduled_for: null,
  service_ids: [],
};


const serviceStatusOptions:
  {
    value: SiteServiceStatus;
    label: string;
  }[] = [
  {
    value: "operational",
    label: "Operational",
  },
  {
    value: "degraded",
    label: "Degraded Performance",
  },
  {
    value: "partial_outage",
    label: "Partial Outage",
  },
  {
    value: "major_outage",
    label: "Major Outage",
  },
  {
    value: "maintenance",
    label: "Maintenance",
  },
];


const incidentStatusOptions:
  {
    value: SiteIncidentStatus;
    label: string;
  }[] = [
  {
    value: "investigating",
    label: "Investigating",
  },
  {
    value: "identified",
    label: "Identified",
  },
  {
    value: "monitoring",
    label: "Monitoring",
  },
  {
    value: "scheduled",
    label: "Scheduled",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "resolved",
    label: "Resolved",
  },
  {
    value: "completed",
    label: "Completed",
  },
];


function getServiceStatusLabel(
  status: SiteServiceStatus
) {
  return (
    serviceStatusOptions.find(
      (item) =>
        item.value === status
    )?.label ??
    status
  );
}


function getIncidentStatusLabel(
  status: SiteIncidentStatus
) {
  return (
    incidentStatusOptions.find(
      (item) =>
        item.value === status
    )?.label ??
    status
  );
}


function toDateTimeLocal(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset * 60_000
    );

  return local
    .toISOString()
    .slice(0, 16);
}


function fromDateTimeLocal(
  value: string
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}


export default function AdminOperationsSection() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<OperationsTab>(
      "services"
    );

  const [
    services,
    setServices,
  ] =
    useState<SiteService[]>(
      []
    );

  const [
    incidents,
    setIncidents,
  ] =
    useState<
      SiteIncidentWithDetails[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const [
    serviceModalOpen,
    setServiceModalOpen,
  ] =
    useState(false);

  const [
    serviceForm,
    setServiceForm,
  ] =
    useState<SiteServiceInput>(
      emptyServiceForm
    );

  const [
    editingServiceId,
    setEditingServiceId,
  ] =
    useState<
      string | null
    >(null);

  const [
    incidentModalOpen,
    setIncidentModalOpen,
  ] =
    useState(false);

  const [
    incidentForm,
    setIncidentForm,
  ] =
    useState<SiteIncidentInput>(
      emptyIncidentForm
    );

  const [
    editingIncidentId,
    setEditingIncidentId,
  ] =
    useState<
      string | null
    >(null);

  const [
    updateIncidentId,
    setUpdateIncidentId,
  ] =
    useState<
      string | null
    >(null);

  const [
    updateStatus,
    setUpdateStatus,
  ] =
    useState<SiteIncidentStatus>(
      "investigating"
    );

  const [
    updateMessage,
    setUpdateMessage,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const loadData =
    useCallback(
      async () => {
        setLoading(true);
        setErrorMessage("");

        try {
          const [
            serviceData,
            incidentData,
          ] =
            await Promise.all([
              getAllSiteServices(),
              getSiteIncidents(),
            ]);

          setServices(
            serviceData
          );

          setIncidents(
            incidentData
          );
        } catch (
          error
        ) {
          console.error(
            "[AdminOperations] Failed to load:",
            error
          );

          setErrorMessage(
            "The Operations Center could not be loaded."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const activeIncidents =
    useMemo(
      () =>
        incidents.filter(
          (incident) =>
            incident.status !==
              "resolved" &&
            incident.status !==
              "completed"
        ),
      [incidents]
    );


  const operationalServices =
    useMemo(
      () =>
        services.filter(
          (service) =>
            service.status ===
            "operational"
        ).length,
      [services]
    );


  async function writeLog(
    action: string,
    targetType: string,
    targetId:
      string | null,
    targetLabel:
      string | null,
    details?:
      Record<
        string,
        unknown
      >
  ) {
    try {
      const user =
        await getCurrentUser();

      await createAdminActivityLog({
        adminUserId:
          user?.id ??
          null,

        adminEmail:
          user?.email ??
          null,

        action,
        targetType,
        targetId,
        targetLabel,
        details:
          details ??
          null,
      });
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to write activity log:",
        error
      );
    }
  }


  function openCreateService() {
    setEditingServiceId(
      null
    );

    setServiceForm({
      ...emptyServiceForm,
      sort_order:
        services.length *
          10 +
        10,
    });

    setServiceModalOpen(
      true
    );
  }


  function openEditService(
    service: SiteService
  ) {
    setEditingServiceId(
      service.id
    );

    setServiceForm({
      name:
        service.name,

      slug:
        service.slug,

      description:
        service.description ??
        "",

      status:
        service.status,

      public:
        service.public,

      sort_order:
        service.sort_order,
    });

    setServiceModalOpen(
      true
    );
  }


  async function saveService() {
    if (
      !serviceForm.name.trim() ||
      !serviceForm.slug.trim()
    ) {
      setErrorMessage(
        "Service name and slug are required."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (
        editingServiceId
      ) {
        const updated =
          await updateSiteService(
            editingServiceId,
            serviceForm
          );

        await writeLog(
          "service_updated",
          "site_service",
          updated.id,
          updated.name,
          {
            status:
              updated.status,
          }
        );

        setSuccessMessage(
          "Service updated."
        );
      } else {
        const created =
          await createSiteService(
            serviceForm
          );

        await writeLog(
          "service_created",
          "site_service",
          created.id,
          created.name,
          {
            status:
              created.status,
          }
        );

        setSuccessMessage(
          "Service created."
        );
      }

      setServiceModalOpen(
        false
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to save service:",
        error
      );

      setErrorMessage(
        "The service could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }


  async function changeServiceStatus(
    service:
      SiteService,

    status:
      SiteServiceStatus
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateSiteServiceStatus(
        service.id,
        status
      );

      await writeLog(
        "service_status_changed",
        "site_service",
        service.id,
        service.name,
        {
          previousStatus:
            service.status,

          status,
        }
      );

      setSuccessMessage(
        `${service.name} is now ${getServiceStatusLabel(
          status
        )}.`
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to change status:",
        error
      );

      setErrorMessage(
        "The service status could not be changed."
      );
    }
  }


  async function removeService(
    service:
      SiteService
  ) {
    const confirmed =
      window.confirm(
        `Delete "${service.name}"?\n\nExisting incident connections to this service will also be removed.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deleteSiteService(
        service.id
      );

      await writeLog(
        "service_deleted",
        "site_service",
        service.id,
        service.name
      );

      setSuccessMessage(
        "Service deleted."
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to delete service:",
        error
      );

      setErrorMessage(
        "The service could not be deleted."
      );
    }
  }


  function openCreateIncident() {
    setEditingIncidentId(
      null
    );

    setIncidentForm({
      ...emptyIncidentForm,

      started_at:
        new Date().toISOString(),
    });

    setIncidentModalOpen(
      true
    );
  }


  function openEditIncident(
    incident:
      SiteIncidentWithDetails
  ) {
    setEditingIncidentId(
      incident.id
    );

    setIncidentForm({
      title:
        incident.title,

      description:
        incident.description ??
        "",

      type:
        incident.type,

      severity:
        incident.severity,

      status:
        incident.status,

      started_at:
        incident.started_at,

      resolved_at:
        incident.resolved_at,

      scheduled_for:
        incident.scheduled_for,

      service_ids:
        incident.services.map(
          (service) =>
            service.id
        ),
    });

    setIncidentModalOpen(
      true
    );
  }


  async function saveIncident() {
    if (
      !incidentForm.title.trim()
    ) {
      setErrorMessage(
        "Incident title is required."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (
        editingIncidentId
      ) {
        const updated =
          await updateSiteIncident(
            editingIncidentId,
            incidentForm
          );

        await writeLog(
          "incident_updated",
          "site_incident",
          updated.id,
          updated.title,
          {
            type:
              updated.type,

            severity:
              updated.severity,

            status:
              updated.status,
          }
        );

        setSuccessMessage(
          "Incident updated."
        );
      } else {
        const created =
          await createSiteIncident(
            incidentForm
          );

        await writeLog(
          "incident_created",
          "site_incident",
          created.id,
          created.title,
          {
            type:
              created.type,

            severity:
              created.severity,

            status:
              created.status,
          }
        );

        setSuccessMessage(
          incidentForm.type ===
            "maintenance"
            ? "Maintenance created."
            : "Incident created."
        );
      }

      setIncidentModalOpen(
        false
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to save incident:",
        error
      );

      setErrorMessage(
        "The incident could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }


  async function removeIncident(
    incident:
      SiteIncidentWithDetails
  ) {
    const confirmed =
      window.confirm(
        `Delete "${incident.title}"?\n\nIts complete update history will also be deleted.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deleteSiteIncident(
        incident.id
      );

      await writeLog(
        "incident_deleted",
        "site_incident",
        incident.id,
        incident.title
      );

      setSuccessMessage(
        "Incident deleted."
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to delete incident:",
        error
      );

      setErrorMessage(
        "The incident could not be deleted."
      );
    }
  }


  function openIncidentUpdate(
    incident:
      SiteIncidentWithDetails
  ) {
    setUpdateIncidentId(
      incident.id
    );

    setUpdateStatus(
      incident.status
    );

    setUpdateMessage("");
  }


  async function saveIncidentUpdate() {
    if (
      !updateIncidentId ||
      !updateMessage.trim()
    ) {
      setErrorMessage(
        "An update message is required."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const update =
        await createSiteIncidentUpdate({
          incident_id:
            updateIncidentId,

          status:
            updateStatus,

          message:
            updateMessage,
        });

      const incident =
        incidents.find(
          (item) =>
            item.id ===
            updateIncidentId
        );

      if (
        incident &&
        incident.status !==
          updateStatus
      ) {
        await updateSiteIncident(
          incident.id,
          {
            title:
              incident.title,

            description:
              incident.description ??
              "",

            type:
              incident.type,

            severity:
              incident.severity,

            status:
              updateStatus,

            started_at:
              incident.started_at,

            resolved_at:
              updateStatus ===
                "resolved" ||
              updateStatus ===
                "completed"
                ? new Date().toISOString()
                : incident.resolved_at,

            scheduled_for:
              incident.scheduled_for,

            service_ids:
              incident.services.map(
                (service) =>
                  service.id
              ),
          }
        );
      }

      await writeLog(
        "incident_update_created",
        "site_incident",
        updateIncidentId,
        incident?.title ??
          null,
        {
          updateId:
            update.id,

          status:
            updateStatus,
        }
      );

      setUpdateIncidentId(
        null
      );

      setUpdateMessage("");

      setSuccessMessage(
        "Incident update published."
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to publish incident update:",
        error
      );

      setErrorMessage(
        "The incident update could not be published."
      );
    } finally {
      setSaving(false);
    }
  }


  async function removeIncidentUpdate(
    incident:
      SiteIncidentWithDetails,

    updateId:
      string
  ) {
    const confirmed =
      window.confirm(
        "Delete this incident update?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deleteSiteIncidentUpdate(
        updateId
      );

      await writeLog(
        "incident_update_deleted",
        "site_incident",
        incident.id,
        incident.title,
        {
          updateId,
        }
      );

      setSuccessMessage(
        "Incident update deleted."
      );

      await loadData();
    } catch (
      error
    ) {
      console.error(
        "[AdminOperations] Failed to delete incident update:",
        error
      );

      setErrorMessage(
        "The incident update could not be deleted."
      );
    }
  }


  function toggleIncidentService(
    serviceId:
      string
  ) {
    setIncidentForm(
      (current) => ({
        ...current,

        service_ids:
          current.service_ids.includes(
            serviceId
          )
            ? current.service_ids.filter(
                (id) =>
                  id !==
                  serviceId
              )
            : [
                ...current.service_ids,
                serviceId,
              ],
      })
    );
  }


  return (
    <section className="operationsPanel">
      <div className="operationsHero">
        <div>
          <span className="operationsEyebrow">
            AUROS OPERATIONS
          </span>

          <h2>
            Operations Center
          </h2>

          <p>
            Manage service health,
            incidents and scheduled
            maintenance for the public
            Auros status platform.
          </p>
        </div>

        <button
          type="button"
          className="operationsRefresh"
          onClick={() =>
            void loadData()
          }
        >
          Refresh
        </button>
      </div>


      <div className="operationsStats">
        <StatCard
          label="Services"
          value={
            services.length
          }
        />

        <StatCard
          label="Operational"
          value={
            operationalServices
          }
        />

        <StatCard
          label="Active Incidents"
          value={
            activeIncidents.length
          }
        />

        <StatCard
          label="Maintenance"
          value={
            incidents.filter(
              (incident) =>
                incident.type ===
                  "maintenance" &&
                incident.status !==
                  "completed"
            ).length
          }
        />
      </div>


      {errorMessage && (
        <div className="operationsMessage error">
          {errorMessage}
        </div>
      )}


      {successMessage && (
        <div className="operationsMessage success">
          {successMessage}
        </div>
      )}


      <div className="operationsTabs">
        <button
          type="button"
          className={
            activeTab ===
            "services"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "services"
            )
          }
        >
          Services
        </button>

        <button
          type="button"
          className={
            activeTab ===
            "incidents"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "incidents"
            )
          }
        >
          Incidents & Maintenance
        </button>
      </div>


      {loading ? (
        <div className="operationsEmpty">
          Loading Operations Center...
        </div>
      ) : activeTab ===
        "services" ? (
        <>
          <div className="operationsSectionHeader">
            <div>
              <h3>
                Services
              </h3>

              <p>
                Systems displayed on
                the Auros status page.
              </p>
            </div>

            <button
              type="button"
              className="operationsPrimary"
              onClick={
                openCreateService
              }
            >
              + Add Service
            </button>
          </div>


          <div className="serviceGrid">
            {services.map(
              (service) => (
                <article
                  key={
                    service.id
                  }
                  className="serviceCard"
                >
                  <div className="serviceCardTop">
                    <div>
                      <span
                        className={`statusPill ${service.status}`}
                      >
                        {getServiceStatusLabel(
                          service.status
                        )}
                      </span>

                      <h4>
                        {
                          service.name
                        }
                      </h4>

                      <small>
                        /
                        {
                          service.slug
                        }
                      </small>
                    </div>

                    <span
                      className={
                        service.public
                          ? "visibilityBadge public"
                          : "visibilityBadge private"
                      }
                    >
                      {service.public
                        ? "Public"
                        : "Hidden"}
                    </span>
                  </div>

                  <p>
                    {service.description ||
                      "No description."}
                  </p>

                  <label>
                    Service Status

                    <select
                      value={
                        service.status
                      }
                      onChange={(
                        event
                      ) =>
                        void changeServiceStatus(
                          service,
                          event
                            .target
                            .value as SiteServiceStatus
                        )
                      }
                    >
                      {serviceStatusOptions.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <div className="cardActions">
                    <button
                      type="button"
                      onClick={() =>
                        openEditService(
                          service
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        void removeService(
                          service
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        </>
      ) : (
        <>
          <div className="operationsSectionHeader">
            <div>
              <h3>
                Incidents & Maintenance
              </h3>

              <p>
                Publish operational
                incidents, maintenance
                and timeline updates.
              </p>
            </div>

            <button
              type="button"
              className="operationsPrimary"
              onClick={
                openCreateIncident
              }
            >
              + New Incident
            </button>
          </div>


          {incidents.length ===
          0 ? (
            <div className="operationsEmpty">
              No incidents have been
              created yet.
            </div>
          ) : (
            <div className="incidentList">
              {incidents.map(
                (incident) => (
                  <article
                    key={
                      incident.id
                    }
                    className="incidentCard"
                  >
                    <div className="incidentHeader">
                      <div>
                        <div className="incidentBadges">
                          <span
                            className={`incidentType ${incident.type}`}
                          >
                            {incident.type ===
                            "maintenance"
                              ? "Maintenance"
                              : "Incident"}
                          </span>

                          <span
                            className={`severityBadge ${incident.severity}`}
                          >
                            {
                              incident.severity
                            }
                          </span>

                          <span className="incidentStatusBadge">
                            {getIncidentStatusLabel(
                              incident.status
                            )}
                          </span>
                        </div>

                        <h4>
                          {
                            incident.title
                          }
                        </h4>

                        <p>
                          {incident.description ||
                            "No description."}
                        </p>
                      </div>

                      <div className="incidentHeaderActions">
                        <button
                          type="button"
                          onClick={() =>
                            openIncidentUpdate(
                              incident
                            )
                          }
                        >
                          Add Update
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditIncident(
                              incident
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            void removeIncident(
                              incident
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>


                    <div className="incidentMeta">
                      <div>
                        <span>
                          Started
                        </span>

                        <strong>
                          {formatDate(
                            incident.started_at
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Scheduled
                        </span>

                        <strong>
                          {formatDate(
                            incident.scheduled_for
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Resolved
                        </span>

                        <strong>
                          {formatDate(
                            incident.resolved_at
                          )}
                        </strong>
                      </div>
                    </div>


                    <div className="affectedServices">
                      <span>
                        Affected Services
                      </span>

                      <div>
                        {incident.services.length >
                        0 ? (
                          incident.services.map(
                            (
                              service
                            ) => (
                              <strong
                                key={
                                  service.id
                                }
                              >
                                {
                                  service.name
                                }
                              </strong>
                            )
                          )
                        ) : (
                          <small>
                            No services
                            selected
                          </small>
                        )}
                      </div>
                    </div>


                    {updateIncidentId ===
                      incident.id && (
                      <div className="incidentUpdateComposer">
                        <select
                          value={
                            updateStatus
                          }
                          onChange={(
                            event
                          ) =>
                            setUpdateStatus(
                              event
                                .target
                                .value as SiteIncidentStatus
                            )
                          }
                        >
                          {incidentStatusOptions.map(
                            (
                              option
                            ) => (
                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                {
                                  option.label
                                }
                              </option>
                            )
                          )}
                        </select>

                        <textarea
                          value={
                            updateMessage
                          }
                          onChange={(
                            event
                          ) =>
                            setUpdateMessage(
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Describe the latest operational update..."
                        />

                        <div>
                          <button
                            type="button"
                            className="operationsPrimary"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void saveIncidentUpdate()
                            }
                          >
                            Publish Update
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setUpdateIncidentId(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}


                    {incident.updates.length >
                      0 && (
                      <div className="incidentTimeline">
                        <h5>
                          Incident Timeline
                        </h5>

                        {incident.updates.map(
                          (
                            update
                          ) => (
                            <div
                              key={
                                update.id
                              }
                              className="timelineItem"
                            >
                              <div className="timelineDot" />

                              <div>
                                <div className="timelineTop">
                                  <strong>
                                    {getIncidentStatusLabel(
                                      update.status
                                    )}
                                  </strong>

                                  <span>
                                    {formatDate(
                                      update.created_at
                                    )}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeIncidentUpdate(
                                        incident,
                                        update.id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
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
                )
              )}
            </div>
          )}
        </>
      )}


      {serviceModalOpen && (
        <div className="operationsModalBackdrop">
          <div className="operationsModal">
            <div className="modalHeader">
              <div>
                <span>
                  SERVICE
                </span>

                <h3>
                  {editingServiceId
                    ? "Edit Service"
                    : "Add Service"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setServiceModalOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="modalGrid">
              <label>
                Name

                <input
                  value={
                    serviceForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        name:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label>
                Slug

                <input
                  value={
                    serviceForm.slug
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        slug:
                          event
                            .target
                            .value
                            .toLowerCase()
                            .replace(
                              /[^a-z0-9-]/g,
                              "-"
                            )
                            .replace(
                              /-+/g,
                              "-"
                            ),
                      })
                    )
                  }
                />
              </label>

              <label>
                Status

                <select
                  value={
                    serviceForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        status:
                          event
                            .target
                            .value as SiteServiceStatus,
                      })
                    )
                  }
                >
                  {serviceStatusOptions.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Sort Order

                <input
                  type="number"
                  value={
                    serviceForm.sort_order
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        sort_order:
                          Number(
                            event
                              .target
                              .value
                          ) ||
                          0,
                      })
                    )
                  }
                />
              </label>

              <label className="modalFull">
                Description

                <textarea
                  value={
                    serviceForm.description
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label className="checkboxField modalFull">
                <input
                  type="checkbox"
                  checked={
                    serviceForm.public
                  }
                  onChange={(
                    event
                  ) =>
                    setServiceForm(
                      (
                        current
                      ) => ({
                        ...current,
                        public:
                          event
                            .target
                            .checked,
                      })
                    )
                  }
                />

                <span>
                  Publicly visible
                </span>
              </label>
            </div>

            <div className="modalActions">
              <button
                type="button"
                onClick={() =>
                  setServiceModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="operationsPrimary"
                disabled={
                  saving
                }
                onClick={() =>
                  void saveService()
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}


      {incidentModalOpen && (
        <div className="operationsModalBackdrop">
          <div className="operationsModal large">
            <div className="modalHeader">
              <div>
                <span>
                  OPERATIONS EVENT
                </span>

                <h3>
                  {editingIncidentId
                    ? "Edit Incident"
                    : "New Incident / Maintenance"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIncidentModalOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="modalGrid">
              <label className="modalFull">
                Title

                <input
                  value={
                    incidentForm.title
                  }
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        title:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label>
                Type

                <select
                  value={
                    incidentForm.type
                  }
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        type:
                          event
                            .target
                            .value as SiteIncidentType,
                      })
                    )
                  }
                >
                  <option value="incident">
                    Incident
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>
                </select>
              </label>

              <label>
                Severity

                <select
                  value={
                    incidentForm.severity
                  }
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        severity:
                          event
                            .target
                            .value as SiteIncidentSeverity,
                      })
                    )
                  }
                >
                  <option value="minor">
                    Minor
                  </option>

                  <option value="major">
                    Major
                  </option>

                  <option value="critical">
                    Critical
                  </option>
                </select>
              </label>

              <label>
                Status

                <select
                  value={
                    incidentForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        status:
                          event
                            .target
                            .value as SiteIncidentStatus,
                      })
                    )
                  }
                >
                  {incidentStatusOptions.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Started

                <input
                  type="datetime-local"
                  value={toDateTimeLocal(
                    incidentForm.started_at
                  )}
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        started_at:
                          fromDateTimeLocal(
                            event
                              .target
                              .value
                          ),
                      })
                    )
                  }
                />
              </label>

              <label>
                Scheduled For

                <input
                  type="datetime-local"
                  value={toDateTimeLocal(
                    incidentForm.scheduled_for
                  )}
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        scheduled_for:
                          fromDateTimeLocal(
                            event
                              .target
                              .value
                          ),
                      })
                    )
                  }
                />
              </label>

              <label>
                Resolved

                <input
                  type="datetime-local"
                  value={toDateTimeLocal(
                    incidentForm.resolved_at
                  )}
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        resolved_at:
                          fromDateTimeLocal(
                            event
                              .target
                              .value
                          ),
                      })
                    )
                  }
                />
              </label>

              <label className="modalFull">
                Description

                <textarea
                  value={
                    incidentForm.description
                  }
                  onChange={(
                    event
                  ) =>
                    setIncidentForm(
                      (
                        current
                      ) => ({
                        ...current,
                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <div className="modalFull serviceSelector">
                <span>
                  Affected Services
                </span>

                <div>
                  {services.map(
                    (
                      service
                    ) => (
                      <label
                        key={
                          service.id
                        }
                      >
                        <input
                          type="checkbox"
                          checked={incidentForm.service_ids.includes(
                            service.id
                          )}
                          onChange={() =>
                            toggleIncidentService(
                              service.id
                            )
                          }
                        />

                        <span>
                          {
                            service.name
                          }
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="modalActions">
              <button
                type="button"
                onClick={() =>
                  setIncidentModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="operationsPrimary"
                disabled={
                  saving
                }
                onClick={() =>
                  void saveIncident()
                }
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        .operationsPanel {
          min-width: 0;
          padding: 22px;
          border: 1px solid rgba(34, 48, 77, 0.95);
          border-radius: 24px;
          background: rgba(15, 27, 52, 0.74);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(12px);
        }

        .operationsHero,
        .operationsSectionHeader,
        .incidentHeader,
        .serviceCardTop,
        .modalHeader,
        .modalActions,
        .timelineTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .operationsEyebrow,
        .modalHeader span {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .operationsHero h2 {
          margin: 7px 0 0;
          color: #f5f8ff;
          font-size: 28px;
        }

        .operationsHero p,
        .operationsSectionHeader p {
          max-width: 650px;
          margin: 8px 0 0;
          color: #7f93b4;
          line-height: 1.65;
        }

        .operationsRefresh,
        .operationsPrimary,
        .cardActions button,
        .incidentHeaderActions button,
        .incidentUpdateComposer button,
        .modalActions button,
        .timelineTop button,
        .modalHeader > button {
          border: 1px solid rgba(112, 145, 200, 0.18);
          border-radius: 10px;
          background: rgba(10, 20, 40, 0.9);
          color: #aebdd4;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .operationsRefresh {
          padding: 10px 14px;
        }

        .operationsPrimary {
          padding: 11px 15px !important;
          border-color: rgba(99, 221, 255, 0.25) !important;
          background: rgba(99, 221, 255, 0.09) !important;
          color: #9eeaff !important;
        }

        .operationsStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .operationsStat {
          padding: 15px;
          border: 1px solid rgba(112, 145, 200, 0.12);
          border-radius: 14px;
          background: rgba(7, 16, 32, 0.65);
        }

        .operationsStat span {
          display: block;
          color: #617796;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .operationsStat strong {
          display: block;
          margin-top: 6px;
          color: #f4f7ff;
          font-size: 25px;
        }

        .operationsMessage {
          margin-top: 16px;
          padding: 11px 13px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .operationsMessage.error {
          border: 1px solid rgba(255, 93, 120, 0.22);
          background: rgba(255, 93, 120, 0.08);
          color: #ff9caf;
        }

        .operationsMessage.success {
          border: 1px solid rgba(84, 223, 160, 0.2);
          background: rgba(84, 223, 160, 0.07);
          color: #91efc3;
        }

        .operationsTabs {
          display: flex;
          gap: 7px;
          margin: 22px 0;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(112, 145, 200, 0.1);
        }

        .operationsTabs button {
          padding: 9px 13px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #7185a4;
          font: inherit;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .operationsTabs button.active {
          border-color: rgba(99, 221, 255, 0.18);
          background: rgba(99, 221, 255, 0.07);
          color: #a8edff;
        }

        .operationsSectionHeader {
          margin-bottom: 15px;
        }

        .operationsSectionHeader h3 {
          margin: 0;
          color: #f3f7ff;
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .serviceCard,
        .incidentCard {
          border: 1px solid rgba(112, 145, 200, 0.13);
          border-radius: 16px;
          background: rgba(7, 16, 32, 0.7);
        }

        .serviceCard {
          padding: 16px;
        }

        .serviceCard h4,
        .incidentCard h4 {
          margin: 9px 0 3px;
          color: #f4f7ff;
          font-size: 16px;
        }

        .serviceCard small {
          color: #536987;
        }

        .serviceCard > p,
        .incidentHeader p {
          color: #7489a8;
          font-size: 11px;
          line-height: 1.6;
        }

        .statusPill,
        .visibilityBadge,
        .incidentType,
        .severityBadge,
        .incidentStatusBadge {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .statusPill.operational,
        .visibilityBadge.public {
          background: rgba(84, 223, 160, 0.1);
          color: #78eab2;
        }

        .statusPill.degraded,
        .statusPill.maintenance {
          background: rgba(255, 194, 91, 0.1);
          color: #ffd17d;
        }

        .statusPill.partial_outage {
          background: rgba(255, 144, 86, 0.1);
          color: #ffac7c;
        }

        .statusPill.major_outage {
          background: rgba(255, 83, 116, 0.1);
          color: #ff8da5;
        }

        .visibilityBadge.private {
          background: rgba(128, 146, 178, 0.1);
          color: #8293ad;
        }

        .serviceCard label,
        .operationsModal label {
          display: grid;
          gap: 6px;
          color: #6e83a3;
          font-size: 9px;
          font-weight: 800;
        }

        .serviceCard select,
        .operationsModal input,
        .operationsModal select,
        .operationsModal textarea,
        .incidentUpdateComposer select,
        .incidentUpdateComposer textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid #223553;
          border-radius: 10px;
          outline: none;
          background: #0b172b;
          color: #edf4ff;
          font: inherit;
          color-scheme: dark;
        }

        .serviceCard select,
        .operationsModal input,
        .operationsModal select,
        .incidentUpdateComposer select {
          min-height: 40px;
          padding: 0 10px;
        }

        .operationsModal textarea,
        .incidentUpdateComposer textarea {
          min-height: 100px;
          padding: 10px;
          resize: vertical;
        }

        select option {
          background: #0b172b;
          color: #edf4ff;
        }

        .cardActions,
        .incidentHeaderActions {
          display: flex;
          gap: 7px;
          margin-top: 13px;
        }

        .cardActions button,
        .incidentHeaderActions button {
          padding: 8px 10px;
        }

        button.danger {
          color: #ff899f !important;
        }

        .incidentList {
          display: grid;
          gap: 13px;
        }

        .incidentCard {
          padding: 17px;
        }

        .incidentHeader {
          align-items: flex-start;
        }

        .incidentBadges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .incidentType.incident {
          background: rgba(255, 93, 120, 0.08);
          color: #ff92a6;
        }

        .incidentType.maintenance {
          background: rgba(99, 221, 255, 0.08);
          color: #85e6ff;
        }

        .severityBadge.minor {
          color: #9bb0cc;
          background: rgba(155, 176, 204, 0.08);
        }

        .severityBadge.major {
          color: #ffd17d;
          background: rgba(255, 209, 125, 0.08);
        }

        .severityBadge.critical {
          color: #ff879d;
          background: rgba(255, 83, 116, 0.1);
        }

        .incidentStatusBadge {
          color: #b9aaff;
          background: rgba(151, 125, 255, 0.09);
        }

        .incidentMeta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin-top: 14px;
        }

        .incidentMeta > div {
          padding: 10px;
          border: 1px solid rgba(112, 145, 200, 0.09);
          border-radius: 10px;
          background: rgba(5, 13, 27, 0.55);
        }

        .incidentMeta span,
        .affectedServices > span {
          display: block;
          color: #536987;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .incidentMeta strong {
          display: block;
          margin-top: 4px;
          color: #aabbd3;
          font-size: 9px;
        }

        .affectedServices {
          margin-top: 14px;
        }

        .affectedServices > div {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 7px;
        }

        .affectedServices strong {
          padding: 5px 8px;
          border-radius: 7px;
          background: rgba(99, 221, 255, 0.06);
          color: #89dff7;
          font-size: 8px;
        }

        .affectedServices small {
          color: #536987;
        }

        .incidentUpdateComposer {
          display: grid;
          gap: 9px;
          margin-top: 15px;
          padding: 13px;
          border: 1px solid rgba(99, 221, 255, 0.12);
          border-radius: 12px;
          background: rgba(99, 221, 255, 0.025);
        }

        .incidentUpdateComposer > div {
          display: flex;
          gap: 8px;
        }

        .incidentUpdateComposer button {
          padding: 9px 11px;
        }

        .incidentTimeline {
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid rgba(112, 145, 200, 0.09);
        }

        .incidentTimeline h5 {
          margin: 0 0 12px;
          color: #aebed5;
          font-size: 10px;
        }

        .timelineItem {
          display: grid;
          grid-template-columns: 10px minmax(0, 1fr);
          gap: 10px;
          padding: 8px 0;
        }

        .timelineDot {
          width: 7px;
          height: 7px;
          margin-top: 4px;
          border-radius: 50%;
          background: #63ddff;
          box-shadow: 0 0 10px rgba(99, 221, 255, 0.3);
        }

        .timelineTop {
          justify-content: flex-start;
        }

        .timelineTop strong {
          color: #b7c8df;
          font-size: 9px;
        }

        .timelineTop span {
          color: #526784;
          font-size: 8px;
        }

        .timelineTop button {
          margin-left: auto;
          padding: 4px 7px;
          border: 0;
          background: transparent;
          color: #d27488;
          font-size: 8px;
        }

        .timelineItem p {
          margin: 5px 0 0;
          color: #7388a7;
          font-size: 10px;
          line-height: 1.55;
        }

        .operationsEmpty {
          padding: 40px 20px;
          border: 1px dashed rgba(112, 145, 200, 0.14);
          border-radius: 14px;
          color: #637997;
          text-align: center;
        }

        .operationsModalBackdrop {
          position: fixed;
          z-index: 10000;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(2, 7, 15, 0.78);
          backdrop-filter: blur(8px);
        }

        .operationsModal {
          width: min(620px, 100%);
          max-height: calc(100dvh - 40px);
          overflow: auto;
          padding: 20px;
          border: 1px solid #263a59;
          border-radius: 19px;
          background: #0a1427;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
        }

        .operationsModal.large {
          width: min(780px, 100%);
        }

        .modalHeader h3 {
          margin: 5px 0 0;
          color: #f3f7ff;
        }

        .modalHeader > button {
          width: 34px;
          height: 34px;
          font-size: 18px;
        }

        .modalGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
          margin-top: 18px;
        }

        .modalFull {
          grid-column: 1 / -1;
        }

        .checkboxField {
          grid-template-columns: auto 1fr !important;
          align-items: center;
          justify-content: flex-start;
        }

        .checkboxField input {
          width: 16px !important;
          min-height: 16px !important;
        }

        .serviceSelector > span {
          color: #6e83a3;
          font-size: 9px;
          font-weight: 800;
        }

        .serviceSelector > div {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
          margin-top: 8px;
        }

        .serviceSelector label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px;
          border: 1px solid rgba(112, 145, 200, 0.1);
          border-radius: 9px;
          background: rgba(5, 13, 27, 0.5);
        }

        .serviceSelector input {
          width: 15px;
          min-height: 15px;
        }

        .modalActions {
          justify-content: flex-end;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid rgba(112, 145, 200, 0.09);
        }

        .modalActions button {
          padding: 9px 13px;
        }

        @media (max-width: 850px) {
          .operationsStats,
          .serviceGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .incidentHeader {
            display: grid;
          }
        }

        @media (max-width: 600px) {
          .operationsPanel {
            padding: 15px;
          }

          .operationsHero,
          .operationsSectionHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .operationsStats,
          .serviceGrid,
          .incidentMeta,
          .modalGrid,
          .serviceSelector > div {
            grid-template-columns: 1fr;
          }

          .modalFull {
            grid-column: auto;
          }

          .operationsTabs {
            overflow-x: auto;
          }
        }
      `}</style>
    </section>
  );
}


function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="operationsStat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}