"use client";

import {
  useParams,
} from "next/navigation";

import AdminPageGuard from "../../../../../../components/admin/AdminPageGuard";
import NewsEditor from "../../../../../../components/admin/NewsEditor";

export default function EditNewsPage() {
  const params =
    useParams<{
      id: string;
    }>();

  return (
    <AdminPageGuard>
      <NewsEditor
        newsId={
          params.id
        }
      />
    </AdminPageGuard>
  );
}