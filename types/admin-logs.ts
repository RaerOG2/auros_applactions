export type AdminActivityLog = {
  id: string;
  admin_user_id: string | null;
  admin_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_label: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type AdminAuthLog = {
  id: string;
  user_id: string | null;
  email: string | null;
  event_type: string;
  success: boolean;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type CreateAdminActivityLogInput = {
  adminUserId?: string | null;
  adminEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  targetLabel?: string | null;
  details?: Record<string, unknown> | null;
};

export type CreateAdminAuthLogInput = {
  userId?: string | null;
  email?: string | null;
  eventType: string;
  success?: boolean;
  details?: Record<string, unknown> | null;
};

export type AdminLogTab = "all" | "activity" | "auth";
export type AdminAuthFilter = "all" | "success" | "failed";