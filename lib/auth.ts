import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const key = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

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

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  try {
    const payload = await decrypt(token)
    const users = await query`SELECT * FROM users WHERE id = ${payload.userId}`
    return users[0] || null
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function signUp(username: string, password: string, signupCode?: string) {
  const hashedPassword = await hashPassword(password)

  // Set default values based on signup code
  let nameColor = null
  let hasGoldAnimation = false

  if (signupCode === "asdf") {
    nameColor = "#6366f1" // Default indigo color
  } else if (signupCode === "qwea") {
    hasGoldAnimation = true
  }

  const users = await query`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active)
    VALUES (${username}, ${hashedPassword}, ${signupCode || null}, ${nameColor}, ${hasGoldAnimation}, 'light', 'blue', false, NOW())
    RETURNING *
  `

  const user = users[0]
  const token = await encrypt({ userId: user.id })

  return { user, token }
}

export async function signIn(username: string, password: string) {
  const users = await query`SELECT * FROM users WHERE username = ${username}`
  const user = users[0]

  if (!user) {
    throw new Error("Invalid username or password")
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    throw new Error("Invalid username or password")
  }

  const token = await encrypt({ userId: user.id })
  return { user, token }
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
