import { Skeleton } from "@/components/ui/skeleton";

export default function LocaleLoading() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-5 py-16 sm:px-8 lg:px-12">
      <div className="space-y-4 border-b border-ink-950/15 pb-8">
        <Skeleton className="h-3 w-28 bg-board-200" />
        <Skeleton className="h-14 w-2/3 bg-board-200" />
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
        <Skeleton className="aspect-[4/3] bg-board-200 lg:col-span-7" />
        <Skeleton className="aspect-[4/5] bg-board-200 lg:col-span-5" />
      </div>
    </div>
  );
}
