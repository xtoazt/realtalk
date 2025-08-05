import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

interface User {
  id: string
  username: string
  email?: string
  signup_code?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled?: boolean
  theme?: string
  hue?: string
  profile_picture?: string
  bio?: string
  created_at: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      console.log("[getCurrentUser] No auth token found")
      return null
    }

    // Simple token validation - in production you'd want proper JWT
    const users = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, 
             has_gold_animation, notifications_enabled, theme, hue, 
             profile_picture, bio, created_at
      FROM users 
      WHERE id = ${token}
    `

    if (users.length === 0) {
      console.log("[getCurrentUser] User not found in database")
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("[getCurrentUser] Error:", error)
    return null
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, 
             has_gold_animation, notifications_enabled, theme, hue, 
             profile_picture, bio, created_at
      FROM users 
      WHERE id = ${token}
    `

    return users.length > 0 ? (users[0] as User) : null
  } catch (error) {
    console.error("[verifyToken] Error:", error)
    return null
  }
}

export async function signIn(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const users = await sql`
      SELECT id, username, email, password_hash, signup_code, name_color, 
             custom_title, has_gold_animation, notifications_enabled, theme, hue, 
             profile_picture, bio, created_at
      FROM users 
      WHERE username = ${username}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0] as User & { password_hash: string }
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return null
    }

    // Use user ID as token for simplicity
    const token = user.id

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  } catch (error) {
    console.error("[signIn] Error:", error)
    return null
  }
}

export async function signUp(
  username: string,
  password: string,
  email?: string,
  signupCode?: string,
): Promise<{ user: User; token: string } | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = Math.random().toString(36).substring(2, 15)

    // Set defaults based on signup code
    let nameColor = null
    let hasGoldAnimation = false

    if (signupCode === "asdf") {
      nameColor = "#6366f1"
    } else if (signupCode === "qwea") {
      hasGoldAnimation = true
    }

    const users = await sql`
      INSERT INTO users (id, username, password_hash, email, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, created_at)
      VALUES (${userId}, ${username}, ${hashedPassword}, ${email || null}, ${signupCode || null}, ${nameColor}, ${hasGoldAnimation}, 'dark', 'gray', false, NOW())
      RETURNING id, username, email, signup_code, name_color, custom_title, 
                has_gold_animation, notifications_enabled, theme, hue, 
                profile_picture, bio, created_at
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0] as User
    const token = user.id

    return { user, token }
  } catch (error) {
    console.error("[signUp] Error:", error)
    return null
  }
}

export async function verifyAuth(token: string): Promise<boolean> {
  try {
    const user = await verifyToken(token)
    return user !== null
  } catch (error) {
    return false
  }
}
