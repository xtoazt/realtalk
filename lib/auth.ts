import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
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
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      console.log("[auth] No session token found")
      return null
    }

    console.log("[auth] Looking up user with session token")

    const users = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, 
             has_gold_animation, notifications_enabled, theme, hue, 
             profile_picture, bio, created_at
      FROM users 
      WHERE id = ${sessionToken}
    `

    if (users.length === 0) {
      console.log("[auth] No user found for session token")
      return null
    }

    const user = users[0] as User
    console.log("[auth] Found user:", user.username)
    return user
  } catch (error) {
    console.error("[auth] Error getting current user:", error)
    return null
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  return getCurrentUser()
}

export async function signIn(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    console.log("[auth] Sign in attempt for:", username)

    const users = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, 
             has_gold_animation, notifications_enabled, theme, hue, 
             profile_picture, bio, created_at, password_hash
      FROM users 
      WHERE username = ${username}
    `

    if (users.length === 0) {
      console.log("[auth] User not found:", username)
      return null
    }

    const user = users[0]

    // Simple password check (in production, use bcrypt)
    if (user.password_hash !== password) {
      console.log("[auth] Invalid password for:", username)
      return null
    }

    console.log("[auth] Sign in successful for:", username)

    // Remove password from user object
    const { password_hash, ...userWithoutPassword } = user
    
    return {
      user: userWithoutPassword as User,
      token: user.id
    }
  } catch (error) {
    console.error("[auth] Sign in error:", error)
    return null
  }
}

export async function signUp(username: string, password: string, email?: string, signupCode?: string): Promise<{ user: User; token: string } | null> {
  try {
    console.log("[auth] Sign up attempt for:", username)

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username}
    `

    if (existingUsers.length > 0) {
      console.log("[auth] User already exists:", username)
      return null
    }

    // Create new user
    const newUsers = await sql`
      INSERT INTO users (username, email, password_hash, signup_code, theme, hue, notifications_enabled, has_gold_animation)
      VALUES (${username}, ${email || null}, ${password}, ${signupCode || null}, 'dark', 'gray', false, ${signupCode === 'asdf'})
      RETURNING id, username, email, signup_code, name_color, custom_title, 
                has_gold_animation, notifications_enabled, theme, hue, 
                profile_picture, bio, created_at
    `

    if (newUsers.length === 0) {
      console.log("[auth] Failed to create user:", username)
      return null
    }

    const user = newUsers[0] as User
    console.log("[auth] Sign up successful for:", username)

    return {
      user,
      token: user.id
    }
  } catch (error) {
    console.error("[auth] Sign up error:", error)
    return null
  }
}

export async function verifyAuth(token: string): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
