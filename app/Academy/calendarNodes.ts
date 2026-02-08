/**
 * Academy calendar node definitions.
 * Tool slots (e.g. Sanctum) have no lessons; they are pointers only.
 */

export type CalendarNodeType = "learning" | "tool";

export type CalendarNode = {
  id: string;
  label: string;
  type: CalendarNodeType;
  route: string;
  description?: string;
};

/** Sanctum calendar entry: no lessons, no exercises, pointer to /sanctum only. */
export const SANCTUM_CALENDAR_NODE = {
  id: "sanctum",
  label: "Sanctum",
  type: "tool",
  route: "/sanctum",
} satisfies CalendarNode;

/** All calendar nodes that represent self-work or tool slots (no lesson content). */
export const TOOL_CALENDAR_NODES: CalendarNode[] = [SANCTUM_CALENDAR_NODE];
