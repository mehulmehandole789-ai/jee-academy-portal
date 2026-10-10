/**
 * Date and timezone utilities for JEE Academy (Asia/Kolkata)
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns whether a given Date is a Tuesday (2) or Saturday (6) in Asia/Kolkata timezone.
 */
export const isTuesdayOrSaturdayIST = (date) => {
  const d = new Date(date);
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
  }).format(d);

  return weekdayStr === 'Tuesday' || weekdayStr === 'Saturday';
};

/**
 * Returns formatted IST string from a UTC date
 */
export const formatToIST = (date, includeTime = true) => {
  if (!date) return '';
  const d = new Date(date);
  const options = {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime
      ? { hour: '2-digit', minute: '2-digit', hour12: true }
      : {}),
  };
  return new Intl.DateTimeFormat('en-IN', options).format(d);
};

/**
 * Computes the next upcoming Tuesday or Saturday from a given reference date
 */
export const getNextTuesdayOrSaturday = (fromDate = new Date(), dayOfWeek = 2, hour = 10, minute = 0) => {
  // dayOfWeek: 2 = Tuesday, 6 = Saturday
  const d = new Date(fromDate);
  const currentDay = d.getDay();
  let daysUntil = (dayOfWeek - currentDay + 7) % 7;
  if (daysUntil === 0) daysUntil = 7; // next week if today
  d.setDate(d.getDate() + daysUntil);
  d.setHours(hour, minute, 0, 0);
  return d;
};
