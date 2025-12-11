import { db } from '@/lib/db'

async function createClientProfiles() {
  try {
    console.log('Creating client profiles...')

    // Get client users
    const clientUsers = await db.user.findMany({
      where: { role: 'CLIENT' }
    })

    for (const user of clientUsers) {
      // Check if profile already exists
      const existingProfile = await db.clientProfile.findUnique({
        where: { userId: user.id }
      })

      if (!existingProfile) {
        let companyName = ''
        let ruc = ''
        let businessType = ''
        let industry = ''

        if (user.email === 'empresa@tecnipro.com') {
          companyName = 'Industrias ABC S.A.'
          ruc = '20123456789'
          businessType = 'MANUFACTURING'
          industry = 'Manufactura'
        } else if (user.email === 'tienda@tecnipro.com') {
          companyName = 'Comercial XYZ Ltda.'
          ruc = '20987654321'
          businessType = 'RETAIL'
          industry = 'Comercio'
        }

        await db.clientProfile.create({
          data: {
            userId: user.id,
            companyName,
            ruc,
            businessType,
            address: 'Dirección Principal 123, Ciudad',
            industry
          }
        })
        console.log(`Created profile for ${user.name}`)
      }
    }

    console.log('Client profiles created successfully!')
  } catch (error) {
    console.error('Error creating client profiles:', error)
  } finally {
    await db.$disconnect()
  }
}

createClientProfiles()