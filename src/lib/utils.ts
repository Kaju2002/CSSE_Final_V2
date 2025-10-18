import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflicting classes
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Format time to readable string
 * @param time - Time string (HH:MM format)
 * @returns Formatted time string
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return time
  }
}

/**
 * Validate Sri Lankan NIC number
 * @param nic - NIC number to validate
 * @returns True if valid NIC
 */
export function validateNIC(nic: string): boolean {
  // Old format: 9 digits + V/X
  const oldFormat = /^[0-9]{9}[vVxX]$/
  // New format: 12 digits
  const newFormat = /^[0-9]{12}$/
  
  return oldFormat.test(nic) || newFormat.test(nic)
}

/**
 * Generate unique ID
 * @returns Unique identifier string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}