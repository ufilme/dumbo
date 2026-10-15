import { format } from "date-fns";

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// The client reports memory in KiB.
export function formatBytes(kib: number): string {
  if (!kib) return "0 B";
  const sizes = ["KiB", "MiB", "GiB", "TiB"];
  const i = Math.min(
    Math.floor(Math.log(kib) / Math.log(1024)),
    sizes.length - 1,
  );
  const value = kib / Math.pow(1024, i);
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTime(date: Date | string | number) {
  return format(new Date(date), "HH:mm");
}

export function timeAgo(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

export const INFO_DEFAULT_RANGE_MS = 60 * 60 * 1000;
