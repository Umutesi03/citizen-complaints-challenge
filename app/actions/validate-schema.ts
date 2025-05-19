"use server"

import { sql } from "@/lib/db"

// Define the expected schema for each table
const expectedSchema = {
  complaints: [
    { name: "id", type: "integer", nullable: false },
    { name: "tracking_id", type: "character varying", nullable: false },
    { name: "title", type: "character varying", nullable: false },
    { name: "description", type: "text", nullable: false },
    { name: "category_id", type: "integer", nullable: false },
    { name: "subcategory_id", type: "integer", nullable: true },
    { name: "status", type: "character varying", nullable: false },
    { name: "priority", type: "character varying", nullable: false },
    { name: "location", type: "text", nullable: false },
    { name: "province", type: "character varying", nullable: false },
    { name: "district", type: "character varying", nullable: false },
    { name: "sector", type: "character varying", nullable: true },
    { name: "citizen_id", type: "integer", nullable: true },
    { name: "institution_id", type: "integer", nullable: true },
    { name: "is_anonymous", type: "boolean", nullable: false },
    { name: "contact_info", type: "character varying", nullable: true },
    { name: "created_at", type: "timestamp with time zone", nullable: false },
    { name: "updated_at", type: "timestamp with time zone", nullable: true },
  ],
  // Add other tables as needed
}

export async function validateTableSchema(tableName: string) {
  try {
    // Get the actual schema
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    // If we don't have expected schema for this table, return success
    if (!expectedSchema[tableName]) {
      return {
        success: true,
        message: `No expected schema defined for ${tableName}`,
      }
    }

    // Compare with expected schema
    const actualColumns = result.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
    }))

    const missingColumns = expectedSchema[tableName].filter(
      (expected) => !actualColumns.some((actual) => actual.name === expected.name),
    )

    const typeMismatches = expectedSchema[tableName]
      .filter((expected) =>
        actualColumns.some(
          (actual) =>
            actual.name === expected.name && (actual.type !== expected.type || actual.nullable !== expected.nullable),
        ),
      )
      .map((expected) => {
        const actual = actualColumns.find((a) => a.name === expected.name)
        return {
          column: expected.name,
          expectedType: expected.type,
          actualType: actual?.type,
          expectedNullable: expected.nullable,
          actualNullable: actual?.nullable,
        }
      })

    return {
      success: missingColumns.length === 0 && typeMismatches.length === 0,
      missingColumns,
      typeMismatches,
      actualColumns,
    }
  } catch (error) {
    console.error(`Error validating schema for table ${tableName}:`, error)
    return {
      success: false,
      error: String(error),
    }
  }
}
