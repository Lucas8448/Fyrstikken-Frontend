import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if voting is allowed on the current date
 * @returns boolean - true if voting is allowed within the voting period, false otherwise
 */
export function isVotingAllowed(): boolean {
  const startDate =
    process.env.VOTING_START_DATE || process.env.NEXT_PUBLIC_VOTING_START_DATE;
  const endDate =
    process.env.VOTING_END_DATE || process.env.NEXT_PUBLIC_VOTING_END_DATE;

  if (!startDate || !endDate) {
    console.warn(
      "VOTING_START_DATE or VOTING_END_DATE environment variables are not set"
    );
    return false;
  }

  const today = new Date();
  const votingStartDate = new Date(startDate);
  const votingEndDate = new Date(endDate);

  // Compare only the date part (ignore time)
  const todayDateString = today.toISOString().split("T")[0];
  const startDateString = votingStartDate.toISOString().split("T")[0];
  const endDateString = votingEndDate.toISOString().split("T")[0];

  return todayDateString >= startDateString && todayDateString <= endDateString;
}

/**
 * Get the voting period from environment variables
 * @returns object with start and end dates or null if not configured
 */
export function getVotingPeriod(): {
  startDate: string;
  endDate: string;
} | null {
  const startDate =
    process.env.VOTING_START_DATE || process.env.NEXT_PUBLIC_VOTING_START_DATE;
  const endDate =
    process.env.VOTING_END_DATE || process.env.NEXT_PUBLIC_VOTING_END_DATE;

  if (!startDate || !endDate) {
    return null;
  }

  return { startDate, endDate };
}
