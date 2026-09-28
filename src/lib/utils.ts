import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const delay = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export function formatPrice(amount: number, currency: string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount / 100);
}

export const formatError = (error: unknown) =>
	error instanceof Error ? error.message : "Unknown Error";

export function normalizeCouponCode(value: string) {
	return value.trim().toUpperCase();
}

export function formatStorageBytes(bytes: number | null | undefined): string {
	if (bytes === null || bytes === undefined) {
		return "Unlimited"
	}
	if (bytes >= 1_000_000_000) {
		return `${(bytes / 1_000_000_000).toFixed(0)} GB`
	}
	if (bytes >= 1_000_000) {
		return `${(bytes / 1_000_000).toFixed(0)} MB`
	}
	if (bytes >= 1_000) {
		return `${(bytes / 1_000).toFixed(0)} KB`
	}

	return `${bytes} Bytes`
}
