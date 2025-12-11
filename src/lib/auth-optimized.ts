import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Paso 1: Obtener solo datos básicos del usuario
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              avatar: true,
              isActive: true
            }
          })

          if (!user || !user.isActive) {
            return null
          }

          // Paso 2: Verificar contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // Paso 3: Obtener perfil específico solo si es necesario (lazy loading)
          let clientProfile: { companyName: string } | null = null
          let technicianProfile: { employeeId: string | null; specialties: any[] } | null = null
          let managerProfile: { employeeId: string | null; department: string | null } | null = null

          if (user.role === 'CLIENT') {
            clientProfile = await db.clientProfile.findUnique({
              where: { userId: user.id },
              select: { companyName: true }
            })
          } else if (user.role === 'TECHNICIAN') {
            technicianProfile = await db.technicianProfile.findUnique({
              where: { userId: user.id },
              select: { employeeId: true, specialties: true }
            })
          } else if (user.role === 'MANAGER') {
            managerProfile = await db.managerProfile.findUnique({
              where: { userId: user.id },
              select: { employeeId: true, department: true }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            clientProfile,
            technicianProfile,
            managerProfile
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.clientProfile = user.clientProfile
        token.technicianProfile = user.technicianProfile
        token.managerProfile = user.managerProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.clientProfile = token.clientProfile
        session.user.technicianProfile = token.technicianProfile
        session.user.managerProfile = token.managerProfile
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
}

export default NextAuth(authOptions)