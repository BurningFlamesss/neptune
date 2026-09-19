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
