import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createUser, getUserByUsername, getUserById } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-fallback-12345"

export async function hashPassword(password: string) {
  console.log("[auth] Hashing password")
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  console.log("[auth] Verifying password")
  return bcrypt.compare(password, hashedPassword)
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function generateToken(userId: string) {
  console.log("[auth] Generating token for user:", userId)
  try {
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)
    console.log("[auth] Token generated successfully")
    return token
  } catch (error) {
    console.error("[auth] Token generation failed:", error)
    throw error
  }
}

export async function verifyToken(token: string) {
  try {
    console.log("[auth] Verifying token")
    const { payload } = await jwtVerify<{ userId: string }>(token, secret)
    console.log("[auth] Token verified successfully for user:", payload.userId)
    return payload
  } catch (error) {
    console.error("[auth] Token verification failed:", error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    console.log("[auth] Getting current user")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("[auth-getCurrentUser] Token from cookie:", token ? "Found" : "Not Found")

    if (!token) {
      console.log("[auth] No token found")
      return null
    }

    const decoded = await verifyToken(token)
    console.log("[auth-getCurrentUser] Decoded payload:", decoded)
    if (!decoded) {
      console.log("[auth] Token verification failed")
      return null
    }

    const user = await getUserById(decoded.userId)
    console.log("[auth-getCurrentUser] User from DB:", user ? user.username : "Not Found")
    console.log("[auth] User retrieved:", user?.username)
    return user
  } catch (error) {
    console.error("[auth] getCurrentUser error:", error)
    return null
  }
}

export async function signUp(username: string, password: string, signupCode?: string) {
  console.log("[auth] Starting signup for username:", username)

  try {
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      console.log("[auth] Username already taken:", username)
      throw new Error("Username already taken")
    }

    const hashedPassword = await hashPassword(password)
    const user = await createUser(username, hashedPassword, signupCode)
    console.log("[auth] User created:", user.username)

    const token = await generateToken(user.id)
    console.log("[auth] Signup successful for:", username)

    return { user, token }
  } catch (error) {
    console.error("[auth] Signup error:", error)
    throw error
  }
}

export async function signIn(username: string, password: string) {
  console.log("[auth] Starting signin for username:", username)

  try {
    const user = await getUserByUsername(username)
    if (!user) {
      console.log("[auth] User not found:", username)
      throw new Error("Invalid username or password")
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      console.log("[auth] Invalid password for:", username)
      throw new Error("Invalid username or password")
    }

    const token = await generateToken(user.id)
    console.log("[auth] Signin successful for:", username)

    return { user: { ...user, password_hash: undefined }, token }
  } catch (error) {
    console.error("[auth] Signin error:", error)
    throw error
  }
}

// Consolidated helper for convenient named import elsewhere
export const auth = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getCurrentUser,
  signUp,
  signIn,
}
