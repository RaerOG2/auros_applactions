import { supabase } from "../lib/supabase";
import type {
  AdminActivityLog,
  AdminAuthLog,
  CreateAdminActivityLogInput,
  CreateAdminAuthLogInput,
} from "../types/admin-logs";

export async function createAdminActivityLog(
  input: CreateAdminActivityLogInput
) {
  const payload = {
    admin_user_id: input.adminUserId ?? null,
    admin_email: input.adminEmail ?? null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    target_label: input.targetLabel ?? null,
    details: input.details ?? null,
  };

  const { error } = await supabase.from("admin_activity_logs").insert(payload);

  if (error) {
    console.error("[AdminLog] createAdminActivityLog failed:", error);
  }
}

export async function createAdminAuthLog(input: CreateAdminAuthLogInput) {
  const payload = {
    user_id: input.userId ?? null,
    email: input.email ?? null,
    event_type: input.eventType,
    success: input.success ?? true,
    details: input.details ?? null,
  };

  const { error } = await supabase.from("admin_auth_logs").insert(payload);

  if (error) {
    console.error("[AdminLog] createAdminAuthLog failed:", error);
  }
}

export async function getAdminActivityLogs(limit = 50) {
  const { data, error } = await supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[AdminLog] getAdminActivityLogs failed:", error);
    return [];
  }

  return (data ?? []) as AdminActivityLog[];
}

export async function getAdminAuthLogs(limit = 50) {
  const { data, error } = await supabase
    .from("admin_auth_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[AdminLog] getAdminAuthLogs failed:", error);
    return [];
  }

  return (data ?? []) as AdminAuthLog[];
}