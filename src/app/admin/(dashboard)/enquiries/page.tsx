import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { EnquiriesManager } from "./enquiries-manager";

async function EnquiriesContent() {
  const rows = await db.query.enquiries.findMany({
    orderBy: [desc(enquiries.createdAt)],
    with: { artwork: true },
  });
  return <EnquiriesManager initialEnquiries={rows} />;
}

export default function AdminEnquiriesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="enquiries" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <EnquiriesContent />
      </Suspense>
    </div>
  );
}
