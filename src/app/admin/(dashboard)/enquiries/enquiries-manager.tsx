"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEnquiryAction, updateEnquiryStatusAction } from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { DataTable } from "@/components/admin/data-table";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { artworks, enquiries } from "@/db/schema";
import { pickLocalized } from "@/lib/i18n-helpers";

type EnquiryWithArtwork = typeof enquiries.$inferSelect & {
  artwork: typeof artworks.$inferSelect | null;
};

export function EnquiriesManager({ initialEnquiries }: { initialEnquiries: EnquiryWithArtwork[] }) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [selected, setSelected] = useState<EnquiryWithArtwork | null>(null);

  const statusLabels = {
    unread: t.common.unread,
    read: t.common.read,
    archived: t.common.archived,
  };

  async function handleStatusChange(id: string, status: "unread" | "read" | "archived") {
    const res = await updateEnquiryStatusAction({ id, status });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`${t.enquiries.markedAs} ${statusLabels[status]}`);
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
    router.refresh();
  }

  async function handleDelete(item: EnquiryWithArtwork) {
    if (!window.confirm(`${t.enquiries.confirmDelete} (${item.name})`)) return;
    const res = await deleteEnquiryAction(item.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(t.enquiries.deletedToast);
    if (selected?.id === item.id) setSelected(null);
    router.refresh();
  }

  const columns: Array<LegacyColumnDef<EnquiryWithArtwork, unknown>> = [
    {
      accessorKey: "name",
      header: t.enquiries.colSender,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: t.enquiries.colSubject,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="line-clamp-1 text-sm">{row.original.subject}</p>
          {row.original.artwork ? (
            <Badge variant="outline" className="text-[11px]">
              {t.enquiries.workPrefix}: {pickLocalized(row.original.artwork.title, locale)}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "locale",
      header: t.enquiries.colLocale,
      cell: ({ row }) => <span className="font-mono text-xs uppercase">{row.original.locale}</span>,
    },
    {
      accessorKey: "status",
      header: t.common.status,
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(val) => {
            if (val === "unread" || val === "read" || val === "archived") {
              handleStatusChange(row.original.id, val);
            }
          }}
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unread">{t.common.unread}</SelectItem>
            <SelectItem value="read">{t.common.read}</SelectItem>
            <SelectItem value="archived">{t.common.archived}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorFn: (row) => row.createdAt.toISOString().slice(0, 10),
      id: "createdAt",
      header: t.enquiries.colDate,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <RowActionsMenu
          onView={() => {
            setSelected(row.original);
            if (row.original.status === "unread") {
              handleStatusChange(row.original.id, "read");
            }
          }}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={initialEnquiries}
        searchPlaceholder={t.enquiries.search}
        statusFilterOptions={["unread", "read", "archived"]}
        getStatusValue={(row) => row.status}
      />

      <Dialog open={Boolean(selected)} onOpenChange={(isOpen) => !isOpen && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  {t.enquiries.from} {selected.name} ({selected.email}) ·{" "}
                  {selected.createdAt.toISOString().slice(0, 10)}
                </DialogDescription>
              </DialogHeader>

              {selected.artwork ? (
                <div className="rounded-md bg-muted px-3 py-2 text-xs">
                  {t.enquiries.regardingWork}{" "}
                  <span className="font-medium">
                    {pickLocalized(selected.artwork.title, locale)}
                  </span>
                </div>
              ) : null}

              <div className="whitespace-pre-wrap rounded-md border border-border bg-card p-4 text-sm leading-relaxed">
                {selected.message}
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  <Mail className="size-3.5" />
                  {t.enquiries.replyEmail}
                </a>
                <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                  {t.common.close}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
