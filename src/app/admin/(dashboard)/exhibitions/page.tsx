import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { exhibitions } from "@/db/schema";
import { ExhibitionsManager } from "./exhibitions-manager";

async function ExhibitionsContent() {
  const rows = await db.query.exhibitions.findMany({
    orderBy: [desc(exhibitions.isCurrent), desc(exhibitions.startDate)],
  });
  return <ExhibitionsManager initialExhibitions={rows} />;
}

export default function AdminExhibitionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="exhibitions" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <ExhibitionsContent />
      </Suspense>
    </div>
  );
}
