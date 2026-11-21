import { asc, desc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { VideosManager } from "./videos-manager";

async function VideosContent() {
  const rows = await db.query.videos.findMany({
    orderBy: [asc(videos.sortOrder), desc(videos.year)],
  });
  return <VideosManager initialVideos={rows} />;
}

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader section="videos" />
      <Suspense fallback={<Skeleton className="h-96 bg-board-200" />}>
        <VideosContent />
      </Suspense>
    </div>
  );
}
