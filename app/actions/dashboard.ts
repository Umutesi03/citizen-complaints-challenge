"use server"

import { sql } from "@/lib/db"
import { getUser } from "./auth"
import { getComplaintByTrackingId } from "./complaints"

export async function getDashboardStats(institutionId?: number) {
  const user = await getUser()

  if (!user) {
    return {
      error: "You must be logged in to view dashboard statistics",
    }
  }

  try {
    // Get total complaints
    let totalResult
    if (institutionId) {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM complaints
        WHERE institution_id = ${institutionId}
      `
    } else if (user.institutionId) {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM complaints
        WHERE institution_id = ${user.institutionId}
      `
    } else {
      totalResult = await sql`
        SELECT COUNT(*) as total
        FROM complaints
      `
    }

    // Ensure total is a number and has a default value if undefined
    const total = totalResult && totalResult[0] ? Number.parseInt(totalResult[0].total) || 0 : 0

    // Get complaints by status
    let statusResult
    if (institutionId) {
      statusResult = await sql`
        SELECT status, COUNT(*) as count
        FROM complaints
        WHERE institution_id = ${institutionId}
        GROUP BY status
      `
    } else if (user.institutionId) {
      statusResult = await sql`
        SELECT status, COUNT(*) as count
        FROM complaints
        WHERE institution_id = ${user.institutionId}
        GROUP BY status
      `
    } else {
      statusResult = await sql`
        SELECT status, COUNT(*) as count
        FROM complaints
        GROUP BY status
      `
    }

    // Ensure statusResult is an array
    const byStatus = Array.isArray(statusResult) ? statusResult : []

    // Get complaints by category
    let categoryResult
    if (institutionId) {
      categoryResult = await sql`
        SELECT c.name as category, COUNT(*) as count
        FROM complaints comp
        JOIN categories c ON comp.category_id = c.id
        WHERE comp.institution_id = ${institutionId}
        GROUP BY c.name
        ORDER BY count DESC
        LIMIT 5
      `
    } else if (user.institutionId) {
      categoryResult = await sql`
        SELECT c.name as category, COUNT(*) as count
        FROM complaints comp
        JOIN categories c ON comp.category_id = c.id
        WHERE comp.institution_id = ${user.institutionId}
        GROUP BY c.name
        ORDER BY count DESC
        LIMIT 5
      `
    } else {
      categoryResult = await sql`
        SELECT c.name as category, COUNT(*) as count
        FROM complaints comp
        JOIN categories c ON comp.category_id = c.id
        GROUP BY c.name
        ORDER BY count DESC
        LIMIT 5
      `
    }

    // Ensure categoryResult is an array
    const byCategory = Array.isArray(categoryResult) ? categoryResult : []

    // Get complaints by province
    let provinceResult
    if (institutionId) {
      provinceResult = await sql`
        SELECT province, COUNT(*) as count
        FROM complaints
        WHERE institution_id = ${institutionId}
        GROUP BY province
        ORDER BY count DESC
      `
    } else if (user.institutionId) {
      provinceResult = await sql`
        SELECT province, COUNT(*) as count
        FROM complaints
        WHERE institution_id = ${user.institutionId}
        GROUP BY province
        ORDER BY count DESC
      `
    } else {
      provinceResult = await sql`
        SELECT province, COUNT(*) as count
        FROM complaints
        GROUP BY province
        ORDER BY count DESC
      `
    }

    // Ensure provinceResult is an array
    const byProvince = Array.isArray(provinceResult) ? provinceResult : []

    // Get recent complaints
    let recentResult
    if (institutionId) {
      recentResult = await sql`
        SELECT 
          comp.id, comp.tracking_id, comp.title, comp.status, comp.priority,
          comp.created_at, c.name as category_name
        FROM complaints comp
        LEFT JOIN categories c ON comp.category_id = c.id
        WHERE comp.institution_id = ${institutionId}
        ORDER BY comp.created_at DESC
        LIMIT 10
      `
    } else if (user.institutionId) {
      recentResult = await sql`
        SELECT 
          comp.id, comp.tracking_id, comp.title, comp.status, comp.priority,
          comp.created_at, c.name as category_name
        FROM complaints comp
        LEFT JOIN categories c ON comp.category_id = c.id
        WHERE comp.institution_id = ${user.institutionId}
        ORDER BY comp.created_at DESC
        LIMIT 10
      `
    } else {
      recentResult = await sql`
        SELECT 
          comp.id, comp.tracking_id, comp.title, comp.status, comp.priority,
          comp.created_at, c.name as category_name
        FROM complaints comp
        LEFT JOIN categories c ON comp.category_id = c.id
        ORDER BY comp.created_at DESC
        LIMIT 10
      `
    }

    // Ensure recentResult is an array
    const recent = Array.isArray(recentResult) ? recentResult : []

    // Calculate resolution time
    let resolutionTimeResult
    if (institutionId) {
      resolutionTimeResult = await sql`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (
            (SELECT MIN(created_at) FROM updates WHERE complaint_id = comp.id AND status = 'resolved')
            - comp.created_at
          ))/86400) as avg_days
        FROM complaints comp
        WHERE comp.status = 'resolved' AND comp.institution_id = ${institutionId}
      `
    } else if (user.institutionId) {
      resolutionTimeResult = await sql`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (
            (SELECT MIN(created_at) FROM updates WHERE complaint_id = comp.id AND status = 'resolved')
            - comp.created_at
          ))/86400) as avg_days
        FROM complaints comp
        WHERE comp.status = 'resolved' AND comp.institution_id = ${user.institutionId}
      `
    } else {
      resolutionTimeResult = await sql`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (
            (SELECT MIN(created_at) FROM updates WHERE complaint_id = comp.id AND status = 'resolved')
            - comp.created_at
          ))/86400) as avg_days
        FROM complaints comp
        WHERE comp.status = 'resolved'
      `
    }

    // Ensure avgResolutionDays is a number with a default value
    const avgResolutionDays =
      resolutionTimeResult && resolutionTimeResult[0] && resolutionTimeResult[0].avg_days
        ? Number.parseFloat(resolutionTimeResult[0].avg_days) || 0
        : 0

    return {
      total,
      byStatus,
      byCategory,
      byProvince,
      recent,
      avgResolutionDays,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      error: "Failed to fetch dashboard statistics",
      total: 0,
      byStatus: [],
      byCategory: [],
      byProvince: [],
      recent: [],
      avgResolutionDays: 0,
    }
  }
}

// Add this function to get complaint details by tracking ID
export { getComplaintByTrackingId }
