import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret-key"
const JWT_KEY = new TextEncoder().encode(JWT_SECRET)

/** Generate a signed JWT that lasts 7 days */
export async function generateToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_KEY)
}

/**
 * verifyToken  – Named export required by other modules.
 * Returns the decoded payload on success, or `null`
 * if verification fails.
 */
export async function verifyToken(token: string | undefined) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<{ userId: string }>(token, JWT_KEY, {
      algorithms: ["HS256"],
    })
    return payload
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Password utilities                                                        */
/* -------------------------------------------------------------------------- */

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

/* -------------------------------------------------------------------------- */
/*  Session helpers (cookie: auth-token)                                      */
/* -------------------------------------------------------------------------- */

function setAuthCookie(token: string) {
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearAuthCookie() {
  cookies().delete("auth-token")
}

export async function getCurrentUser() {
  const token = cookies().get("auth-token")?.value
  const decoded = await verifyToken(token)
  if (!decoded) return null

  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, decoded.userId),
  })
}

/* -------------------------------------------------------------------------- */
/*  Auth flows (server-side)                                                  */
/* -------------------------------------------------------------------------- */

export async function signUp(username: string, password: string) {
  const existing = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  })
  if (existing) throw new Error("Username already exists")

  const password_hash = await hashPassword(password)

  const [user] = await db
    .insert(db.schema.users)
    .values({
      username,
      password_hash,
      theme: "light",
      notifications_enabled: false,
    })
    .returning()

  const token = await generateToken(user.id)
  setAuthCookie(token)

  return user
}

export async function signIn(username: string, password: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  })
  if (!user) throw new Error("Invalid credentials")

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) throw new Error("Invalid credentials")

  const token = await generateToken(user.id)
  setAuthCookie(token)

  return user
}

/* -------------------------------------------------------------------------- */
/*  Convenience export for legacy code                                        */
/* -------------------------------------------------------------------------- */

export const auth = {
  verifyToken,
  getCurrentUser,
  signIn,
  signUp,
  clearAuthCookie,
}
