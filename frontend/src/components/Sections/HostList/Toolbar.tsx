import { useEffect, useRef } from "react";
import { SegmentedControl, Select, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Taller controls on small screens. Radix "sm" starts at 768px, so the
// layout below switches at Tailwind's matching "md".
const SIZE = { initial: "3", sm: "2" } as const;

export type Show = "all" | "online" | "offline";
export type Sort = "name" | "load-asc" | "load-desc";

export function Toolbar({
  query,
  show,
  sort,
  counts,
  onChange,
  onSubmit,
}: {
  query: string;
  show: Show;
  sort: Sort;
  counts: Record<Show, number>;
  onChange: (next: { q?: string; show?: Show; sort?: Sort }) => void;
  onSubmit: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  // "/" jumps to the search box from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    // Mobile: search + sort on the first row, filter full width below.
    <div className="flex flex-wrap items-center gap-2">
      <TextField.Root
        className="order-1 min-w-0 flex-1 md:max-w-xs"
        size={SIZE}
        ref={input}
        placeholder="Search machines…"
        enterKeyHint="go"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") {
            onChange({ q: "" });
            input.current?.blur();
          }
        }}
        value={query}
        onChange={(e) => onChange({ q: e.target.value })}
        type="search"
        inputMode="search"
        autoComplete="off"
        aria-label="Search machines"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />
        </TextField.Slot>
        {/* Visible hint for the "/" shortcut, desktop only. */}
        {/* Hiding the slot itself breaks the field's right border. */}
        <TextField.Slot>
          {!query && (
            <kbd className="hidden md:inline rounded border border-gray-300 px-1.5 text-xs text-gray-400">
              /
            </kbd>
          )}
        </TextField.Slot>
      </TextField.Root>
      <SegmentedControl.Root
        className="order-3 w-full md:order-2 md:w-auto"
        size="2"
        value={show}
        onValueChange={(v) => onChange({ show: v as Show })}
      >
        <SegmentedControl.Item value="all">All {counts.all}</SegmentedControl.Item>
        <SegmentedControl.Item value="online">
          Online {counts.online}
        </SegmentedControl.Item>
        <SegmentedControl.Item value="offline">
          Offline {counts.offline}
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <div className="order-2 md:order-3">
        <Select.Root
          size={SIZE}
          value={sort}
          onValueChange={(v) => onChange({ sort: v as Sort })}
        >
          <Select.Trigger aria-label="Sort machines" />
          <Select.Content position="popper">
            <Select.Item value="name">Name</Select.Item>
            <Select.Item value="load-asc">Least busy</Select.Item>
            <Select.Item value="load-desc">Most busy</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );
}
