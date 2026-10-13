import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges class names, with later classes winning a Tailwind conflict. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
