import { SongHistoryEntry } from "@/types/types";
import { randomUUID } from "crypto";


export function findNextSunday(date: Date) {
  const nextSunday = new Date(date);
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7;
  nextSunday.setDate(nextSunday.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
  return nextSunday;
}

export function findPreviousSunday(date: Date) {
  const previousSunday = new Date(date);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    previousSunday.setDate(date.getDate() - 7);
  } else {
    previousSunday.setDate(date.getDate() - dayOfWeek);
  }

  return previousSunday;
}

export function formatDate(date: Date) {
  const day = date.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
      ? 'nd'
      : day === 3 || day === 23
      ? 'rd'
      : 'th';

  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const year = date.getFullYear();

  return `${dayOfWeek} the ${day}${daySuffix}, ${month} ${year}`;
}

export function addSortKeys(sundaySongs: SongHistoryEntry[]) {
  sundaySongs.forEach((song, index) => {
    song.sort_key = randomUUID();
  })
}