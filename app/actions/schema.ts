"use server"

import { sql } from "@/lib/db"

export async function inspectTableSchema(tableName: string) {
  try {
    // Query to get column information for the specified table
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    return {
      success: true,
      columns: result,
    }
  } catch (error) {
    console.error(`Error inspecting schema for table ${tableName}:`, error)
    return {
      success: false,
      error: String(error),
    }
  }
}

export async function listTables() {
  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    return {
      success: true,
      tables: result,
    }
  } catch (error) {
    console.error("Error listing tables:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
