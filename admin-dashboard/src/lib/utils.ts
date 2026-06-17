import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupee currency.
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a date as a human-readable string.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

/**
 * Generate a UUID v4.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Recursively serializes Prisma objects (converting custom class Decimals to plain numbers)
 * so they can be safely passed from Server Components to Client Components.
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(serializePrisma) as unknown as T;
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "object") {
    // Check if it is a Prisma Decimal instance
    if (data.constructor && (data.constructor.name === "Decimal" || "toFixed" in data)) {
      return Number(data.toString()) as unknown as T;
    }

    const serialized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      serialized[key] = serializePrisma((data as any)[key]);
    }
    return serialized as unknown as T;
  }

  return data;
}
