import { asc, desc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { artworks } from "@/db/schema";
import { WorksManager } from "./works-manager";

async function WorksContent() {
  const rows = await db.query.artworks.findMany({
    orderBy: [asc(artworks.sortOrder), desc(artworks.year)],
    with: {
      media: {
        orderBy: (m, { asc: ascOrder }) => [ascOrder(m.sortOrder)],
      },
    },
  });
  return <WorksManager initialWorks={rows} />;
}

export default function AdminWorksPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="works" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <WorksContent />
      </Suspense>
    </div>
  );
}
