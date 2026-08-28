"use client";

import AdminPageGuard from "../../../../components/admin/AdminPageGuard";
import NewsEditor from "../../../../components/admin/NewsEditor";

export default function NewNewsPage() {
  return (
    <AdminPageGuard>
      <NewsEditor />
    </AdminPageGuard>
  );
}