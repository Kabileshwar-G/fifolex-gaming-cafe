import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, symbol: string = "$"): string {
  const value = (cents / 100).toFixed(2);
  return `${symbol}${value}`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function getTimeRemaining(endTimeIso: string): {
  text: string;
  isOverdue: boolean;
  isEndingSoon: boolean;
  minutesLeft: number;
} {
  try {
    const now = Date.now();
    const end = new Date(endTimeIso).getTime();
    const diffMs = end - now;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMs < 0) {
      const overdueMins = Math.abs(diffMins);
      return {
        text: `+${overdueMins}m Overdue`,
        isOverdue: true,
        isEndingSoon: true,
        minutesLeft: diffMins,
      };
    }

    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const text = hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
    const isEndingSoon = diffMins <= 15;

    return {
      text,
      isOverdue: false,
      isEndingSoon,
      minutesLeft: diffMins,
    };
  } catch {
    return { text: "--", isOverdue: false, isEndingSoon: false, minutesLeft: 0 };
  }
}
