import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)
const key = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

export interface User {
  id: string
  username: string
  email?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
  theme?: string
  hue?: string
  notifications_enabled?: boolean
  last_active?: string
  created_at: string
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function verifyToken(token: string) {
  try {
    return await decrypt(token)
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("[getCurrentUser] Starting authentication check")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      console.log("[getCurrentUser] No auth token found")
      return null
    }

    console.log("[getCurrentUser] Token found, verifying...")
    const payload = await decrypt(token)

    if (!payload || !payload.userId) {
      console.log("[getCurrentUser] Invalid token payload")
      return null
    }

    console.log("[getCurrentUser] Token valid, querying database for user:", payload.userId)
    const users = await sql`
      SELECT id, username, email, name_color, custom_title, has_gold_animation, 
             profile_picture, theme, hue, notifications_enabled, last_active, created_at
      FROM users 
      WHERE id = ${payload.userId}
    `

    if (users.length === 0) {
      console.log("[getCurrentUser] No user found for ID:", payload.userId)
      return null
    }

    const user = users[0] as User
    console.log("[getCurrentUser] User found:", user.username)
    return user
  } catch (error) {
    console.error("[getCurrentUser] Error:", error)
    return null
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function signUp(username: string, password: string, signupCode?: string) {
  try {
    const hashedPassword = await hashPassword(password)

    // Set default values based on signup code
    let nameColor = null
    let hasGoldAnimation = false

    if (signupCode === "asdf") {
      nameColor = "#6366f1" // Default indigo color
    } else if (signupCode === "qwea") {
      hasGoldAnimation = true
    }

    const users = await sql`
      INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active)
      VALUES (${username}, ${hashedPassword}, ${signupCode || null}, ${nameColor}, ${hasGoldAnimation}, 'dark', 'gray', false, NOW())
      RETURNING *
    `

    const user = users[0] as User
    const token = await encrypt({ userId: user.id })

    return { user, token }
  } catch (error) {
    console.error("[signUp] Error:", error)
    throw new Error("Failed to create user")
  }
}

export async function signIn(username: string, password: string) {
  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`
    const user = users[0]

    if (!user) {
      throw new Error("Invalid username or password")
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new Error("Invalid username or password")
    }

    const token = await encrypt({ userId: user.id })
    return { user: user as User, token }
  } catch (error) {
    console.error("[signIn] Error:", error)
    throw error
  }
}

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = await decrypt(token)
    if (!payload || !payload.userId) {
      return null
    }

    return payload.userId
  } catch (error) {
    console.error("[verifyAuth] Error:", error)
    return null
  }
}

export async function createUser(username: string, email?: string): Promise<User | null> {
  try {
    const userId = Math.random().toString(36).substring(2, 15)

    await sql`
      INSERT INTO users (id, username, email, theme, hue, created_at)
      VALUES (${userId}, ${username}, ${email || null}, 'dark', 'gray', NOW())
    `

    return await getCurrentUserById(userId)
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getCurrentUserById(id: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT id, username, email, name_color, custom_title, has_gold_animation, 
             profile_picture, theme, hue, notifications_enabled, last_active, created_at
      FROM users 
      WHERE id = ${id}
    `

    if (users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}
