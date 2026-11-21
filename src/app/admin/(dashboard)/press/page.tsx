import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { pressItems } from "@/db/schema";
import { PressManager } from "./press-manager";

async function PressContent() {
  const rows = await db.query.pressItems.findMany({
    orderBy: [desc(pressItems.publishedDate)],
  });
  return <PressManager initialPress={rows} />;
}

export default function AdminPressPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="press" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <PressContent />
      </Suspense>
    </div>
  );
}
