import { NextRequest, NextResponse } from 'next/server'
import { db as sql } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import crypto from 'crypto'

// Encryption key (should be in environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long!!'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32) as Buffer
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedData = textParts.join(':')
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32) as Buffer
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// GET - Retrieve API keys (only for gold members)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a gold member
    if (user.signup_code !== 'qwea') {
      return NextResponse.json({ error: 'Gold membership required' }, { status: 403 })
    }

    // Get all active API keys (excluding exhausted ones)
    const keysResult = await sql`
      SELECT key_encrypted, added_by, added_at, is_active 
      FROM gemini_api_keys 
      WHERE is_active = true 
      ORDER BY added_at DESC
    `

    // Decrypt and return the keys
    const decryptedKeys = keysResult.map((row: any) => decrypt(row.key_encrypted))
    return NextResponse.json(decryptedKeys)
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new API key (only for gold members)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a gold member
    if (user.signup_code !== 'qwea') {
      return NextResponse.json({ error: 'Gold membership required' }, { status: 403 })
    }

    const { key, addedBy } = await request.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 })
    }

    // Validate the API key format (basic check)
    if (!key.startsWith('AIza')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
    }

    // Hash the key for uniqueness checking
    const keyHash = hashKey(key)
    
    // Check if key already exists
    const existingKey = await sql`
      SELECT id FROM gemini_api_keys WHERE key_hash = ${keyHash}
    `

    if (existingKey.length > 0) {
      return NextResponse.json({ error: 'API key already exists' }, { status: 409 })
    }

    // Encrypt the key before storing
    const encryptedKey = encrypt(key)

    // Add the new API key
    await sql`
      INSERT INTO gemini_api_keys (key_hash, key_encrypted, added_by, added_at, is_active)
      VALUES (${keyHash}, ${encryptedKey}, ${addedBy || user.username}, NOW(), true)
    `

    return NextResponse.json({ success: true, message: 'API key added successfully' })
  } catch (error) {
    console.error('Error adding API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Mark API key as exhausted (only for gold members)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a gold member
    if (user.signup_code !== 'qwea') {
      return NextResponse.json({ error: 'Gold membership required' }, { status: 403 })
    }

    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    // Hash the key to find it in the database
    const keyHash = hashKey(key)
    
    // Mark the key as inactive (exhausted)
    await sql`
      UPDATE gemini_api_keys 
      SET is_active = false, exhausted_at = NOW() 
      WHERE key_hash = ${keyHash}
    `

    return NextResponse.json({ success: true, message: 'API key marked as exhausted' })
  } catch (error) {
    console.error('Error marking API key as exhausted:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
