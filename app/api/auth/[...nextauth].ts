import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { getToken } from "next-auth/jwt"
import Audit from "@/models/Audit"

const SALT_ROUNDS = 12

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await dbConnect()

        const user = await User.findOne({ email: credentials?.email })
        if (!user) throw new Error("Email və ya şifrə yanlış")

        // Hesab bloklanma yoxlaması
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new Error("Hesab bloklanıb. Son cəhd: " + user.lockUntil.toISOString())
        }

        // Şifrə yoxlaması
        const isValid = await bcrypt.compare(credentials!.password, user.passwordHash)
        if (!isValid) {
          user.failedLoginCount = (user.failedLoginCount || 0) + 1
          if (user.failedLoginCount >= 5) {
            user.lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 dəq blok
            user.failedLoginCount = 0
          }
          await user.save()
          throw new Error("Email və ya şifrə yanlış")
        }

        // Uğurlu login → counters reset
        user.failedLoginCount = 0
        user.lockUntil = null
        user.lastLoginAt = new Date()
        await user.save()

        // Audit log
        await Audit.create({
          userId: user._id,
          action: "login_success",
          ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"]
        })

        // MFA varsa → needMFA flag
        if (user.mfaEnabled) {
          return { id: user._id.toString(), email: user.email, name: user.username, needMFA: true }
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          isPro: user.isPro
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 gün
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.isPro = (user as any).isPro
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: token.role,
        isPro: token.isPro
      }
      return session
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  debug: process.env.NODE_ENV === "development"
}

export default NextAuth(authOptions)
