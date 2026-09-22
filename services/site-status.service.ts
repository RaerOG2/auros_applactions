import {
  supabase,
} from "../lib/supabase";

import type {
  SiteIncident,
  SiteIncidentInput,
  SiteIncidentService,
  SiteIncidentUpdate,
  SiteIncidentUpdateInput,
  SiteIncidentWithDetails,
  SiteService,
  SiteServiceInput,
  SiteServiceStatus,
} from "../types/site-status";


export async function getPublicSiteServices():
  Promise<SiteService[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .select(
        "*"
      )
      .eq(
        "public",
        true
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to load public services:",
      error
    );

    throw error;
  }


  return (
    data ??
    []
  ) as SiteService[];
}


export async function getAllSiteServices():
  Promise<SiteService[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .select(
        "*"
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to load services:",
      error
    );

    throw error;
  }


  return (
    data ??
    []
  ) as SiteService[];
}


export async function createSiteService(
  input:
    SiteServiceInput
): Promise<SiteService> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .insert({
        name:
          input.name.trim(),

        slug:
          input.slug.trim(),

        description:
          input.description.trim() ||
          null,

        status:
          input.status,

        public:
          input.public,

        sort_order:
          input.sort_order,
      })
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to create service:",
      error
    );

    throw error;
  }


  return data as SiteService;
}


export async function updateSiteService(
  id:
    string,

  input:
    SiteServiceInput
): Promise<SiteService> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .update({
        name:
          input.name.trim(),

        slug:
          input.slug.trim(),

        description:
          input.description.trim() ||
          null,

        status:
          input.status,

        public:
          input.public,

        sort_order:
          input.sort_order,
      })
      .eq(
        "id",
        id
      )
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to update service:",
      error
    );

    throw error;
  }


  return data as SiteService;
}


export async function updateSiteServiceStatus(
  id:
    string,

  status:
    SiteServiceStatus
) {
  const {
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .update({
        status,
      })
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to update service status:",
      error
    );

    throw error;
  }
}


export async function deleteSiteService(
  id:
    string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "site_services"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to delete service:",
      error
    );

    throw error;
  }
}


export async function getSiteIncidents():
  Promise<SiteIncidentWithDetails[]> {
  const {
    data:
      incidentData,

    error:
      incidentError,
  } =
    await supabase
      .from(
        "site_incidents"
      )
      .select(
        "*"
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (
    incidentError
  ) {
    console.error(
      "[SiteStatus] Failed to load incidents:",
      incidentError
    );

    throw incidentError;
  }


  const incidents =
    (
      incidentData ??
      []
    ) as SiteIncident[];


  if (
    incidents.length ===
    0
  ) {
    return [];
  }


  const incidentIds =
    incidents.map(
      (
        incident
      ) =>
        incident.id
    );


  const [
    serviceLinksResult,
    updatesResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "site_incident_services"
        )
        .select(
          "*"
        )
        .in(
          "incident_id",
          incidentIds
        ),

      supabase
        .from(
          "site_incident_updates"
        )
        .select(
          "*"
        )
        .in(
          "incident_id",
          incidentIds
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),
    ]);


  if (
    serviceLinksResult.error
  ) {
    console.error(
      "[SiteStatus] Failed to load incident service links:",
      serviceLinksResult.error
    );

    throw serviceLinksResult.error;
  }


  if (
    updatesResult.error
  ) {
    console.error(
      "[SiteStatus] Failed to load incident updates:",
      updatesResult.error
    );

    throw updatesResult.error;
  }


  const links =
    (
      serviceLinksResult.data ??
      []
    ) as SiteIncidentService[];


  const updates =
    (
      updatesResult.data ??
      []
    ) as SiteIncidentUpdate[];


  const serviceIds =
    [
      ...new Set(
        links.map(
          (
            link
          ) =>
            link.service_id
        )
      ),
    ];


  let services:
    SiteService[] =
      [];


  if (
    serviceIds.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "site_services"
        )
        .select(
          "*"
        )
        .in(
          "id",
          serviceIds
        );


    if (
      error
    ) {
      console.error(
        "[SiteStatus] Failed to load incident services:",
        error
      );

      throw error;
    }


    services =
      (
        data ??
        []
      ) as SiteService[];
  }


  return incidents.map(
    (
      incident
    ) => {
      const incidentServiceIds =
        links
          .filter(
            (
              link
            ) =>
              link.incident_id ===
              incident.id
          )
          .map(
            (
              link
            ) =>
              link.service_id
          );


      return {
        ...incident,

        services:
          services.filter(
            (
              service
            ) =>
              incidentServiceIds.includes(
                service.id
              )
          ),

        updates:
          updates.filter(
            (
              update
            ) =>
              update.incident_id ===
              incident.id
          ),
      };
    }
  );
}


export async function createSiteIncident(
  input:
    SiteIncidentInput
): Promise<SiteIncident> {
  const {
    data:
      userData,
  } =
    await supabase.auth.getUser();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_incidents"
      )
      .insert({
        title:
          input.title.trim(),

        description:
          input.description.trim() ||
          null,

        type:
          input.type,

        severity:
          input.severity,

        status:
          input.status,

        started_at:
          input.started_at,

        resolved_at:
          input.resolved_at,

        scheduled_for:
          input.scheduled_for,

        created_by:
          userData.user?.id ??
          null,
      })
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to create incident:",
      error
    );

    throw error;
  }


  const incident =
    data as SiteIncident;


  if (
    input.service_ids.length >
    0
  ) {
    const {
      error:
        linkError,
    } =
      await supabase
        .from(
          "site_incident_services"
        )
        .insert(
          input.service_ids.map(
            (
              serviceId
            ) => ({
              incident_id:
                incident.id,

              service_id:
                serviceId,
            })
          )
        );


    if (
      linkError
    ) {
      console.error(
        "[SiteStatus] Failed to connect incident services:",
        linkError
      );

      throw linkError;
    }
  }


  return incident;
}


export async function updateSiteIncident(
  id:
    string,

  input:
    SiteIncidentInput
): Promise<SiteIncident> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_incidents"
      )
      .update({
        title:
          input.title.trim(),

        description:
          input.description.trim() ||
          null,

        type:
          input.type,

        severity:
          input.severity,

        status:
          input.status,

        started_at:
          input.started_at,

        resolved_at:
          input.resolved_at,

        scheduled_for:
          input.scheduled_for,
      })
      .eq(
        "id",
        id
      )
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to update incident:",
      error
    );

    throw error;
  }


  const {
    error:
      deleteLinkError,
  } =
    await supabase
      .from(
        "site_incident_services"
      )
      .delete()
      .eq(
        "incident_id",
        id
      );


  if (
    deleteLinkError
  ) {
    throw deleteLinkError;
  }


  if (
    input.service_ids.length >
    0
  ) {
    const {
      error:
        insertLinkError,
    } =
      await supabase
        .from(
          "site_incident_services"
        )
        .insert(
          input.service_ids.map(
            (
              serviceId
            ) => ({
              incident_id:
                id,

              service_id:
                serviceId,
            })
          )
        );


    if (
      insertLinkError
    ) {
      throw insertLinkError;
    }
  }


  return data as SiteIncident;
}


export async function deleteSiteIncident(
  id:
    string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "site_incidents"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to delete incident:",
      error
    );

    throw error;
  }
}


export async function createSiteIncidentUpdate(
  input:
    SiteIncidentUpdateInput
): Promise<SiteIncidentUpdate> {
  const {
    data:
      userData,
  } =
    await supabase.auth.getUser();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_incident_updates"
      )
      .insert({
        incident_id:
          input.incident_id,

        status:
          input.status,

        message:
          input.message.trim(),

        created_by:
          userData.user?.id ??
          null,
      })
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to create incident update:",
      error
    );

    throw error;
  }


  return data as SiteIncidentUpdate;
}


export async function deleteSiteIncidentUpdate(
  id:
    string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "site_incident_updates"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[SiteStatus] Failed to delete incident update:",
      error
    );

    throw error;
  }
}