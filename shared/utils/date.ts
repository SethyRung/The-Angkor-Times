import dayjs from "dayjs";

import type { Dayjs } from "dayjs";

import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

export const PHNOM_PENH_TZ = "Asia/Phnom_Penh";

dayjs.tz.setDefault(PHNOM_PENH_TZ);

export function now(): Dayjs {
  return dayjs().tz(PHNOM_PENH_TZ);
}

/**
 * Parse a date string or Date into a Dayjs instance in Phnom Penh time.
 * Throws on bad input so invalid data fails loudly instead of rendering
 * "Invalid Date" in the UI.
 */
export function toDayJS(value: string | Date | null | undefined, format?: string): Dayjs {
  if (value == null) {
    throw new Error(`Invalid date: ${value}`);
  }
  const d = format ? dayjs(value, format, true) : dayjs(value);
  if (!d.isValid()) {
    throw new Error(`Invalid date: ${value}`);
  }
  return d.tz(PHNOM_PENH_TZ);
}
