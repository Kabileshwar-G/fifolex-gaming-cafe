import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, symbol: string = "₹"): string {
  const rupees = cents / 100;
  return `${symbol}${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Deterministic date formatter that avoids hydration mismatch between server and client
 */
export function formatDateTime(isoString: string, mounted = true): string {
  if (!mounted) return "Loading...";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string, mounted = true): string {
  if (!mounted) return "--:--";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

/**
 * Calculates remaining time on active sessions.
 * Returns a stable placeholder if not mounted, preventing React hydration mismatch (418, 423, 425).
 */
export function getTimeRemaining(endTimeIso: string, mounted = true): {
  text: string;
  isOverdue: boolean;
  isEndingSoon: boolean;
  minutesLeft: number;
} {
  if (!mounted) {
    return { text: "Active", isOverdue: false, isEndingSoon: false, minutesLeft: 60 };
  }

  try {
    const now = Date.now();
    const end = new Date(endTimeIso).getTime();
    if (isNaN(end)) {
      return { text: "Active", isOverdue: false, isEndingSoon: false, minutesLeft: 60 };
    }

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

/**
 * Convert "HH:mm" time string into total minutes from midnight for exact interval comparisons
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Check if two time intervals on the same day overlap
 */
export function checkIntervalOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number
): boolean {
  const endA = startA + durationA;
  const endB = startB + durationB;
  return Math.max(startA, startB) < Math.min(endA, endB);
}
