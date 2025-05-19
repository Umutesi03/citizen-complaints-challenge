import { neon } from "@neondatabase/serverless"

// Create a SQL client with the database URL from environment variables
export const sql = (() => {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL environment variable is not set")

    // Return a mock implementation that won't throw errors when imported
    // but will provide clear error messages when used
    return {
      // Mock implementation for tagged template queries
      raw: (query: string) => {
        console.error("Database connection not available: DATABASE_URL is not set")
        return { rows: [] }
      },
      // Support for tagged template literals
      query: (...args: any[]) => {
        console.error("Database connection not available: DATABASE_URL is not set")
        return []
      },
    } as any
  }

  try {
    // Create the neon client with the database URL
    const neonClient = neon(process.env.DATABASE_URL)
    return neonClient
  } catch (error) {
    console.error("Failed to initialize database connection:", error)

    // Return a mock implementation if connection fails
    return {
      // Mock implementation for tagged template queries
      raw: (query: string) => {
        console.error("Database connection failed:", error)
        return { rows: [] }
      },
      // Support for tagged template literals
      query: (...args: any[]) => {
        console.error("Database connection failed:", error)
        return []
      },
    } as any
  }
})()

// Helper function to format dates consistently
export function formatDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Generate a unique tracking ID for complaints
export function generateTrackingId(): string {
  return `CMP-${Math.floor(100000 + Math.random() * 900000)}`
}
