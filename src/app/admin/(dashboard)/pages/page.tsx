import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { PagesEditor } from "./pages-editor";

async function PagesContent() {
  const rows = await db.query.sitePages.findMany();
  return <PagesEditor initialPages={rows} />;
}

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="pages" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <PagesContent />
      </Suspense>
    </div>
  );
}
