"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RowActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useAdminI18n();

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t.common.actions}
          className="inline-flex size-8 items-center justify-center border border-transparent text-ink-600 transition-colors hover:border-ink-950/15 hover:bg-board-200/70 hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxide/40"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 border border-ink-950/15 bg-board-50">
          {onView ? (
            <DropdownMenuItem onClick={onView} className="cursor-pointer text-xs">
              <Eye className="mr-2 size-3.5" />
              {t.common.view}
            </DropdownMenuItem>
          ) : null}
          {onEdit ? (
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-xs">
              <Pencil className="mr-2 size-3.5" />
              {t.common.edit}
            </DropdownMenuItem>
          ) : null}
          {(onView || onEdit) && onDelete ? <DropdownMenuSeparator /> : null}
          {onDelete ? (
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-3.5" />
              {t.common.delete}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
