/**
 * Filter utilities for date range and status
 * Used by page.tsx to build Prisma queries
 */

export function getDateRangeFilter(range: string | null):
  | { gte: Date; lte: Date }
  | undefined {
  if (!range || range === "all") return undefined;

  const now = new Date();

  switch (range) {
    case "7d": {
      const start7 = new Date(now);
      start7.setDate(start7.getDate() - 7);
      return { gte: start7, lte: now };
    }
    case "30d": {
      const start30 = new Date(now);
      start30.setDate(start30.getDate() - 30);
      return { gte: start30, lte: now };
    }
    case "90d": {
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return { gte: quarterStart, lte: now };
    }
    case "prev90d": {
      const prevQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
      const prevQuarterEnd = new Date(prevQuarterStart);
      prevQuarterEnd.setMonth(prevQuarterEnd.getMonth() + 3);
      prevQuarterEnd.setDate(0);
      return { gte: prevQuarterStart, lte: prevQuarterEnd };
    }
    default:
      return undefined;
  }
}

export function getStatusFilter(status: string | null): string | undefined {
  if (!status || status === "all") return undefined;
  return status;
}
