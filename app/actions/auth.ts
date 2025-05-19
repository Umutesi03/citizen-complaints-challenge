"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      error: "Email and password are required",
    }
  }

  try {
    // In a real app, you would verify the password hash
    // For demo purposes, we're just checking if the user exists
    const result = await sql`
      SELECT id, email, full_name, role, institution_id 
      FROM users 
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return {
        error: "Invalid email or password",
      }
    }

    const user = result[0]

    // Set a cookie with the user info
    cookies().set(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        institutionId: user.institution_id,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      },
    )

    return { success: true, role: user.role }
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: "An error occurred during login",
    }
  }
}

export async function logout() {
  cookies().delete("user")
  redirect("/")
}

export async function getUser() {
  const userCookie = cookies().get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}
