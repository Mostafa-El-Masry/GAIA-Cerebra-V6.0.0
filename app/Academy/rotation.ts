/**
 * Academy calendar rotation: tool nodes (e.g. Sanctum) included for routing.
 * No lessons or sessions assigned to tool nodes.
 */

import { SANCTUM_CALENDAR_NODE } from "./calendarNodes";
import type { CalendarNode } from "./calendarNodes";

const rotation: CalendarNode[] = [];
rotation.push(SANCTUM_CALENDAR_NODE);

export { rotation };
