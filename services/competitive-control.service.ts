import { supabase } from "../lib/supabase";
import { getCompetitiveStaffAccess } from "./competitive.service";
import type { TournamentStatus } from "../types/competitive";

export type EntryCounts = {
  registered: number;
  checkedIn: number;
  waitlisted: number;
  active: number;
  total: number;
};

type TournamentAction =
  | "publish_event"
  | "open_registration"
  | "open_check_in"
  | "show_event_page";

const transitions: Record<
  Exclude<TournamentAction, "show_event_page">,
  { from: TournamentStatus; to: TournamentStatus }
> = {
  publish_event: {
    from: "draft",
    to: "scheduled",
  },
  open_registration: {
    from: "scheduled",
    to: "registration_open",
  },
  open_check_in: {
    from: "registration_open",
    to: "check_in",
  },
};

export async function getTournamentEntryCounts(
  tournamentId: string,
): Promise<EntryCounts> {
  const { data, error } = await supabase
    .from("competitive_entries")
    .select("status")
    .eq("tournament_id", tournamentId);

  if (error) {
    throw error;
  }

  const statuses = (data ?? []).map((entry) => entry.status);

  return {
    registered: statuses.filter((status) => status === "registered").length,
    checkedIn: statuses.filter((status) => status === "checked_in").length,
    waitlisted: statuses.filter((status) => status === "waitlisted").length,
    active: statuses.filter((status) => status === "active").length,
    total: statuses.length,
  };
}

export async function performTournamentAction(
  tournamentId: string,
  action: TournamentAction,
) {
  const access = await getCompetitiveStaffAccess();

  if (!access) {
    throw new Error("Competitive staff access required.");
  }

  const { data: current, error: loadError } = await supabase
    .from("competitive_tournaments")
    .select("id, status, registration_type, is_public")
    .eq("id", tournamentId)
    .single();

  if (loadError) {
    throw loadError;
  }

  if (action === "show_event_page") {
    if (current.status === "draft") {
      throw new Error("Publish the event before making it public.");
    }

    const { error } = await supabase
      .from("competitive_tournaments")
      .update({ is_public: true, updated_at: new Date().toISOString() })
      .eq("id", tournamentId)
      .eq("status", current.status);

    if (error) {
      throw error;
    }

    return;
  }

  const transition = transitions[action];

  // Invite-only, qualification and private events use manual entries,
  // so they may move directly from SCHEDULED into CHECK-IN.
  const expectedStatus: TournamentStatus =
    action === "open_check_in" &&
    current.status === "scheduled" &&
    current.registration_type !== "open"
      ? "scheduled"
      : transition.from;

  if (current.status !== expectedStatus) {
    throw new Error(
      `This action requires status ${expectedStatus.replaceAll("_", " ")}.`,
    );
  }

  if (
    action === "open_registration" &&
    current.registration_type !== "open"
  ) {
    throw new Error(
      "Online registration is currently supported for OPEN tournaments. Other types use manual player entry.",
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("competitive_tournaments")
    .update({
      status: transition.to,
      is_public: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tournamentId)
    .eq("status", expectedStatus)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }

  if (!updated) {
    throw new Error("Tournament status changed. Reload and try again.");
  }

  // Best-effort audit: a logging failure must not make a successful
  // tournament transition appear to have failed.
  const { error: auditError } = await supabase
    .from("competitive_audit_log")
    .insert({
      actor_id: access.userId,
      tournament_id: tournamentId,
      entity_type: "tournament",
      entity_id: tournamentId,
      action,
      after_data: { status: transition.to, is_public: true },
    });

  if (auditError) {
    console.error("Competitive status audit failed:", auditError);
  }
}
