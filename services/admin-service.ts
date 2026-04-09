import { supabase } from "../lib/supabase";
import type {
  ApplicationItem,
  JobFormState,
  JobItem,
  PatchnoteItem,
  StatusHistoryItem,
} from "../types/admin";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getUser error:", error);
  }

  return user ?? null;
}

export async function getAdminAccess() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      userEmail: null,
      isAdmin: false,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("profile lookup error:", error);
    return {
      user,
      userEmail: user.email ?? null,
      isAdmin: false,
    };
  }

  return {
    user,
    userEmail: user.email ?? null,
    isAdmin: profile?.role === "admin",
  };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("logout error:", error);
    throw error;
  }
}

export async function getApplicationsWithHistory(): Promise<ApplicationItem[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      name,
      discord,
      discord_id,
      age,
      email,
      timezone,
      experience,
      motivation,
      availability,
      developer_skills,
      developer_projects,
      support_cases,
      support_communication,
      competitive_knowledge,
      competitive_plans,
      manager_leadership,
      manager_organization,
      director_vision,
      director_responsibility,
      other_strengths,
      tracking_code,
      status,
      notes,
      rating,
      review_label,
      created_at,
      score,
      jobs (
        title,
        role_category
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApplicationsWithHistory error:", error);
    throw error;
  }

  const { data: historyData, error: historyError } = await supabase
    .from("application_status_history")
    .select("id, application_id, status, changed_at, changed_by, note")
    .order("changed_at", { ascending: false });

  if (historyError) {
    console.error("getApplicationsWithHistory history error:", historyError);
  }

  const groupedHistory = new Map<string, StatusHistoryItem[]>();

  (historyData ?? []).forEach((item) => {
    const row = item as StatusHistoryItem;
    const existing = groupedHistory.get(row.application_id) ?? [];
    existing.push(row);
    groupedHistory.set(row.application_id, existing);
  });

  return ((data ?? []) as ApplicationItem[]).map((app) => ({
    ...app,
    status_history: groupedHistory.get(app.id) ?? [],
  }));
}

export async function getApplicationById(applicationId: string): Promise<{
  application: ApplicationItem | null;
  history: StatusHistoryItem[];
}> {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      name,
      discord,
      discord_id,
      age,
      email,
      timezone,
      experience,
      motivation,
      availability,
      developer_skills,
      developer_projects,
      support_cases,
      support_communication,
      competitive_knowledge,
      competitive_plans,
      manager_leadership,
      manager_organization,
      director_vision,
      director_responsibility,
      other_strengths,
      tracking_code,
      status,
      notes,
      rating,
      review_label,
      score,
      created_at,
      jobs (
        title,
        role_category
      )
    `)
    .eq("id", applicationId)
    .single();

  if (error) {
    console.error("getApplicationById error:", error);
    return {
      application: null,
      history: [],
    };
  }

  const { data: historyData, error: historyError } = await supabase
    .from("application_status_history")
    .select("id, application_id, status, changed_at, changed_by, note")
    .eq("application_id", applicationId)
    .order("changed_at", { ascending: false });

  if (historyError) {
    console.error("getApplicationById history error:", historyError);
  }

  return {
    application: data as ApplicationItem,
    history: (historyData as StatusHistoryItem[]) ?? [],
  };
}

export async function updateApplicationStatusById(
  id: string,
  status: string,
  app?: Pick<ApplicationItem, "discord_id" | "tracking_code"> | null
) {
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);

  if (error) {
    throw error;
  }

  if (app && (status === "Accepted" || status === "Rejected")) {
    try {
      await fetch("/api/notify-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discordId: app.discord_id,
          status,
          trackingCode: app.tracking_code,
        }),
      });
    } catch (notifyError) {
      console.log("Discord DM notify failed:", notifyError);
    }
  }
}

export async function updateApplicationNotesById(id: string, notes: string) {
  const { error } = await supabase.from("applications").update({ notes }).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateApplicationRatingById(id: string, rating: number) {
  const { error } = await supabase.from("applications").update({ rating }).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateApplicationScoreById(id: string, score: number) {
  const { error } = await supabase.from("applications").update({ score }).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateApplicationReviewLabelById(id: string, review_label: string) {
  const { error } = await supabase
    .from("applications")
    .update({ review_label })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteApplicationById(id: string) {
  const { error } = await supabase.from("applications").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getJobs(): Promise<JobItem[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getJobs error:", error);
    throw error;
  }

  return (data ?? []) as JobItem[];
}

export async function saveJobRecord(jobForm: JobFormState, editingJobId: string | null) {
  const requirementsArray = jobForm.requirements
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const payload = {
    title: jobForm.title,
    department: jobForm.department,
    type: jobForm.type || "Volunteer",
    location: jobForm.location || "Remote",
    description: jobForm.description,
    requirements: requirementsArray,
    role_category: jobForm.role_category || "Other",
  };

  if (editingJobId) {
    const { error } = await supabase.from("jobs").update(payload).eq("id", editingJobId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("jobs").insert({
    ...payload,
    status: "Open",
  });

  if (error) {
    throw error;
  }

  try {
    await fetch("/api/job-notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (notifyError) {
    console.error("Job Discord notify failed:", notifyError);
  }
}

export async function updateJobStatusById(
  id: string,
  status: string,
  job?: Pick<JobItem, "title" | "department" | "location" | "role_category"> | null
) {
  const { error } = await supabase.from("jobs").update({ status }).eq("id", id);

  if (error) {
    throw error;
  }

  if (job && (status === "Filled" || status === "Open")) {
    try {
      await fetch("/api/job-status-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: job.title,
          department: job.department,
          location: job.location,
          role_category: job.role_category,
          status,
        }),
      });
    } catch (notifyError) {
      console.error("Job status notify failed:", notifyError);
    }
  }
}

export async function deleteJobById(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getPatchnotes(): Promise<PatchnoteItem[]> {
  const { data, error } = await supabase
    .from("patchnotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPatchnotes error:", error);
    throw error;
  }

  return (data ?? []) as PatchnoteItem[];
}

export async function savePatchnoteRecord(params: {
  version: string;
  title: string;
  content: string;
  editingPatchId: string | null;
}) {
  const { version, title, content, editingPatchId } = params;

  if (editingPatchId) {
    const { error } = await supabase
      .from("patchnotes")
      .update({
        version,
        title,
        content,
      })
      .eq("id", editingPatchId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("patchnotes").insert({
    version,
    title,
    content,
  });

  if (error) {
    throw error;
  }
}

export async function deletePatchnoteById(id: string) {
  const { error } = await supabase.from("patchnotes").delete().eq("id", id);

  if (error) {
    throw error;
  }
}