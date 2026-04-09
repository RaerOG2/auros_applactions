export type StatusResult = {
  name: string | null;
  status: string | null;
  tracking_code: string | null;
  created_at: string | null;
  jobs?: {
    title?: string | null;
  } | null;
};

export function statusMessage(status: string | null) {
  if (status === "Accepted") return "Congratulations! Your application has been accepted.";
  if (status === "Rejected") return "Your application was not selected this time.";
  if (status === "In Review") return "Your application is currently being reviewed.";
  if (status === "New") return "Your application was received.";
  return "Status information unavailable.";
}