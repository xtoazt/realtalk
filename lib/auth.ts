import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createUser, getUserByUsername, getUserById } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-fallback"

const secret = new TextEncoder().encode(JWT_SECRET)

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(userId: string) {
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify<{ userId: string }>(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const token = cookies().get("auth-token")?.value
  if (!token) return null
  const decoded = await verifyToken(token)
  if (!decoded) return null
  return getUserById(decoded.userId)
}

// ------------------------------------------------------------------
// Public helpers required as named exports
// ------------------------------------------------------------------
/**
 * Creates a new user, returns `{ user, token }`.
 */
export async function signUp(username: string, password: string, signupCode?: string) {
  const existing = await getUserByUsername(username)
  if (existing) throw new Error("Username already taken")

  const pwHash = await hashPassword(password)
  const user = await createUser(username, pwHash, signupCode)
  const token = await generateToken(user.id)

  return { user, token }
}

/**
 * Verifies credentials, returns `{ user, token }`.
 */
export async function signIn(username: string, password: string) {
  const user = await getUserByUsername(username)
  if (!user) throw new Error("Invalid username or password")

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) throw new Error("Invalid username or password")

  const token = await generateToken(user.id)
  return { user: { ...user, password_hash: undefined }, token }
}

/* Public API (named export `auth`) --------------------------------- */
export const auth = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getCurrentUser,
  signUp,
  signIn,
}
