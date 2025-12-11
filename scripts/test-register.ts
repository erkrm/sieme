import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'testclient@tecnipro.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 12)

  // Clean up existing test user if any
  try {
    await prisma.user.delete({ where: { email } })
    console.log('Cleaned up existing test user')
  } catch (e) {
    // Ignore if not found
  }

  const user = await prisma.user.create({
    data: {
      name: 'Test Client',
      email,
      password: hashedPassword,
      role: 'CLIENT',
      clientProfile: {
        create: {
          companyName: 'Test Corp',
          businessType: 'Testing',
          address: '123 Test St',
        }
      }
    },
    include: {
      clientProfile: true
    }
  })

  console.log('Created user:', user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
