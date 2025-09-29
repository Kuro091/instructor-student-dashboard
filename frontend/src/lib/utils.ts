import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface FirestoreTimestamp {
  _seconds: number
  _nanoseconds: number
}

export function firestoreTimestampToDate(timestamp: string | FirestoreTimestamp): Date {
  if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000)
  }
  return new Date(timestamp)
}