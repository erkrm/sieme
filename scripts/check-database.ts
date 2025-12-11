import { db } from '@/lib/db'

async function checkDatabase() {
  try {
    console.log('Checking database contents...')
    
    const userCount = await db.user.count()
    console.log(`Users: ${userCount}`)
    
    const workOrderCount = await db.workOrder.count()
    console.log(`Work Orders: ${workOrderCount}`)
    
    const messageCount = await db.message.count()
    console.log(`Messages: ${messageCount}`)
    
    if (userCount === 0) {
      console.log('No users found. Running demo setup...')
      const response = await fetch('http://localhost:3000/api/setup/demo', {
        method: 'POST'
      })
      console.log('Demo setup response:', response.status)
    }
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDatabase()