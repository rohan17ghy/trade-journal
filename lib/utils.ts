import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | undefined): string {
    if (!date) return new Date().toISOString().split("T")[0];
    return date.toISOString().split("T")[0];
}
