import { format, formatDistanceToNowStrict, isPast } from "date-fns";

export function formatDate(value: string | null) {
  if (!value) return "No date";
  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelative(value: string | null) {
  if (!value) return "—";
  return `${formatDistanceToNowStrict(new Date(value))} ${isPast(new Date(value)) ? "ago" : "left"}`;
}

export function isOverdue(value: string | null) {
  return Boolean(value && isPast(new Date(value)));
}
