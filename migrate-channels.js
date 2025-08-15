// Quick migration script for Neon
import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function runMigration() {
  try {
    console.log('Running channels migration...')
    
    // Read the SQL file
    const migrationSQL = fs.readFileSync('./scripts/010-channels.sql', 'utf8')
    
    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      await sql.unsafe(statement)
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the tables exist
    const result = await sql`SELECT name FROM channels ORDER BY is_system DESC, name`
    console.log('Created channels:', result.map(r => r.name))
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
