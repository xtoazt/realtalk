import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

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
  const cookieStore = cookies()
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

  const users = await query`
    INSERT INTO users (username, password, signup_code, theme, hue, notifications_enabled)
    VALUES (${username}, ${hashedPassword}, ${signupCode || null}, 'light', 'blue', false)
    RETURNING *
  `

  return users[0]
}

export async function signIn(username: string, password: string) {
  const users = await query`SELECT * FROM users WHERE username = ${username}`
  const user = users[0]

  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  return isValid ? user : null
}

export const auth = {
  encrypt,
  decrypt,
  verifyToken,
  getCurrentUser,
  hashPassword,
  signUp,
  signIn,
}
