import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { getMongoClient } from '@/lib/mongodb'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getMongoClient() as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        // @ts-ignore
        session.userId = token.sub
      }
      return session
    }
  }
}
