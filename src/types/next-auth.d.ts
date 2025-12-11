import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: string
    clientProfile?: any
    technicianProfile?: any
    managerProfile?: any
  }

  interface Session {
    user: {
      id: string
      role: string
      clientProfile?: any
      technicianProfile?: any
      managerProfile?: any
    } & DefaultSession['user']
  }

  interface JWT {
    role: string
    clientProfile?: any
    technicianProfile?: any
    managerProfile?: any
  }
}