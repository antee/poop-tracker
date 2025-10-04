export type DayState = 'E' | 'P' | 'N'; // Empty, Pooped, No poop

export interface DataStoreV1 {
  version: 1;
  entries: Record<string, DayState>; // key is ISO date YYYY-MM-DD
}

export interface WeekRange {
  startIso: string; // Monday
  endIso: string;   // Sunday
}

