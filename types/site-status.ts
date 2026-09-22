export type SiteServiceStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";


export type SiteIncidentType =
  | "incident"
  | "maintenance";


export type SiteIncidentSeverity =
  | "minor"
  | "major"
  | "critical";


export type SiteIncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "scheduled"
  | "in_progress"
  | "resolved"
  | "completed";


export type SiteService = {
  id: string;

  name: string;

  slug: string;

  description:
    string | null;

  status:
    SiteServiceStatus;

  public:
    boolean;

  sort_order:
    number;

  created_at:
    string;

  updated_at:
    string;
};


export type SiteIncident = {
  id: string;

  title: string;

  description:
    string | null;

  type:
    SiteIncidentType;

  severity:
    SiteIncidentSeverity;

  status:
    SiteIncidentStatus;

  started_at:
    string | null;

  resolved_at:
    string | null;

  scheduled_for:
    string | null;

  created_by:
    string | null;

  created_at:
    string;

  updated_at:
    string;
};


export type SiteIncidentService = {
  incident_id:
    string;

  service_id:
    string;
};


export type SiteIncidentUpdate = {
  id: string;

  incident_id:
    string;

  status:
    SiteIncidentStatus;

  message:
    string;

  created_by:
    string | null;

  created_at:
    string;
};


export type SiteIncidentWithDetails =
  SiteIncident & {
    services:
      SiteService[];

    updates:
      SiteIncidentUpdate[];
  };


export type SiteServiceInput = {
  name: string;

  slug: string;

  description: string;

  status:
    SiteServiceStatus;

  public: boolean;

  sort_order: number;
};


export type SiteIncidentInput = {
  title: string;

  description: string;

  type:
    SiteIncidentType;

  severity:
    SiteIncidentSeverity;

  status:
    SiteIncidentStatus;

  started_at:
    string | null;

  resolved_at:
    string | null;

  scheduled_for:
    string | null;

  service_ids:
    string[];
};


export type SiteIncidentUpdateInput = {
  incident_id:
    string;

  status:
    SiteIncidentStatus;

  message:
    string;
};