import { redirect } from "next/navigation";

export default function LegacyAucsAdminPage() {
  redirect("/competitive/admin/tournaments");
}
