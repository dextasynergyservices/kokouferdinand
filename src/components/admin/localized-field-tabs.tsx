"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { LocalizedText } from "@/db/schema";

const LOCALES: Array<{ key: keyof LocalizedText; label: string }> = [
  { key: "fr", label: "FR" },
  { key: "en", label: "EN" },
  { key: "es", label: "ES" },
];

export function LocalizedFieldTabs({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder,
  required = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
      </div>
      <Tabs defaultValue="fr" className="w-full">
        <TabsList className="h-8">
          {LOCALES.map(({ key, label: tabLabel }) => {
            const filled = Boolean(value[key]?.trim());
            return (
              <TabsTrigger key={key} value={key} className="gap-1.5 text-xs">
                <span>{tabLabel}</span>
                <span
                  className={
                    filled
                      ? "size-1.5 rounded-full bg-emerald-500"
                      : "size-1.5 rounded-full bg-muted-foreground/30"
                  }
                  aria-hidden="true"
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
        {LOCALES.map(({ key, label: tabLabel }) => (
          <TabsContent key={key} value={key} className="mt-2">
            {multiline ? (
              <Textarea
                rows={rows}
                value={value[key] ?? ""}
                placeholder={placeholder ? `${placeholder} (${tabLabel})` : undefined}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              />
            ) : (
              <Input
                value={value[key] ?? ""}
                placeholder={placeholder ? `${placeholder} (${tabLabel})` : undefined}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
