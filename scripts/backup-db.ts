/**
 * Database Backup Script for SIEME
 * Creates timestamped backups of the SQLite database
 * 
 * Usage: npx tsx scripts/backup-db.ts
 * 
 * For automated backups, add to crontab:
 * 0 0,6,12,18 * * * cd /path/to/project && npx tsx scripts/backup-db.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Configuration
const CONFIG = {
  dbPath: path.join(process.cwd(), 'db', 'custom.db'),
  backupDir: path.join(process.cwd(), 'db', 'backups'),
  maxBackups: 10, // Keep last N backups
  dateFormat: 'YYYY-MM-DD_HH-mm-ss'
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir(): void {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true })
    console.log(`📁 Created backup directory: ${CONFIG.backupDir}`)
  }
}

/**
 * Get list of existing backups sorted by date (newest first)
 */
function getExistingBackups(): string[] {
  if (!fs.existsSync(CONFIG.backupDir)) {
    return []
  }
  
  return fs.readdirSync(CONFIG.backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
    .sort()
    .reverse()
}

/**
 * Remove old backups keeping only the most recent N
 */
function cleanupOldBackups(): void {
  const backups = getExistingBackups()
  
  if (backups.length <= CONFIG.maxBackups) {
    return
  }
  
  const toDelete = backups.slice(CONFIG.maxBackups)
  
  for (const backup of toDelete) {
    const backupPath = path.join(CONFIG.backupDir, backup)
    fs.unlinkSync(backupPath)
    console.log(`🗑️  Deleted old backup: ${backup}`)
  }
}

/**
 * Create a new backup
 */
function createBackup(): string | null {
  // Check if database exists
  if (!fs.existsSync(CONFIG.dbPath)) {
    console.error(`❌ Database not found: ${CONFIG.dbPath}`)
    return null
  }
  
  ensureBackupDir()
  
  const timestamp = formatDate(new Date())
  const backupFilename = `backup_${timestamp}.db`
  const backupPath = path.join(CONFIG.backupDir, backupFilename)
  
  try {
    // Copy database file
    fs.copyFileSync(CONFIG.dbPath, backupPath)
    
    // Get file size
    const stats = fs.statSync(backupPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    
    console.log(`✅ Backup created: ${backupFilename} (${sizeMB} MB)`)
    
    // Cleanup old backups
    cleanupOldBackups()
    
    return backupPath
  } catch (error) {
    console.error(`❌ Backup failed:`, error)
    return null
  }
}

/**
 * List all existing backups
 */
function listBackups(): void {
  const backups = getExistingBackups()
  
  if (backups.length === 0) {
    console.log('📋 No backups found')
    return
  }
  
  console.log(`📋 Existing backups (${backups.length}):`)
  
  for (const backup of backups) {
    const backupPath = path.join(CONFIG.backupDir, backup)
    const stats = fs.statSync(backupPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    const date = new Date(stats.mtime)
    
    console.log(`   - ${backup} (${sizeMB} MB) - ${date.toLocaleString()}`)
  }
}

/**
 * Restore from a backup
 */
function restoreBackup(backupFilename: string): boolean {
  const backupPath = path.join(CONFIG.backupDir, backupFilename)
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupFilename}`)
    return false
  }
  
  try {
    // Create a backup of current database first
    const currentBackup = `pre_restore_${formatDate(new Date())}.db`
    const currentBackupPath = path.join(CONFIG.backupDir, currentBackup)
    
    if (fs.existsSync(CONFIG.dbPath)) {
      fs.copyFileSync(CONFIG.dbPath, currentBackupPath)
      console.log(`📦 Created pre-restore backup: ${currentBackup}`)
    }
    
    // Restore
    fs.copyFileSync(backupPath, CONFIG.dbPath)
    console.log(`✅ Database restored from: ${backupFilename}`)
    
    return true
  } catch (error) {
    console.error(`❌ Restore failed:`, error)
    return false
  }
}

// Main execution
const args = process.argv.slice(2)
const command = args[0] || 'backup'

switch (command) {
  case 'backup':
    createBackup()
    break
  case 'list':
    listBackups()
    break
  case 'restore':
    if (!args[1]) {
      console.error('Usage: npx tsx scripts/backup-db.ts restore <backup_filename>')
      process.exit(1)
    }
    restoreBackup(args[1])
    break
  default:
    console.log(`
SIEME Database Backup Tool

Commands:
  backup   Create a new backup (default)
  list     List existing backups
  restore  Restore from a backup

Examples:
  npx tsx scripts/backup-db.ts
  npx tsx scripts/backup-db.ts list
  npx tsx scripts/backup-db.ts restore backup_2024-01-15_12-30-00.db
`)
}
