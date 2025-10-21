import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import Audit from "@/models/Audit"

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await dbConnect()
        const user = await User.findOne({ email: credentials?.email })
        if (!user) throw new Error("Email və ya şifrə yanlış")
        if (user.lockUntil && user.lockUntil > new Date()) throw new Error("Hesab bloklanıb")
        const valid = await bcrypt.compare(credentials!.password, user.passwordHash)
        if (!valid) {
          user.failedLoginCount += 1
          if (user.failedLoginCount >= 5) { user.lockUntil = new Date(Date.now() + 30*60*1000); user.failedLoginCount = 0 }
          await user.save()
          throw new Error("Email və ya şifrə yanlış")
        }
        user.failedLoginCount = 0
        user.lockUntil = null
        user.lastLoginAt = new Date()
        await user.save()
        await Audit.create({ userId: user._id, action: "login_success" })
        return { id: user._id.toString(), name: user.username, email: user.email, role: user.role, isPro: user.isPro }
      }
    })
  ],
  session: { strategy: "jwt", maxAge: 30*24*60*60 },
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  callbacks: {
    async jwt({ token, user }) { if(user){ token.role = (user as any).role; token.isPro = (user as any).isPro } return token },
    async session({ session, token }) { session.user = {...session.user, role: token.role, isPro: token.isPro}; return session }
  },
  pages: { signIn: "/login", error: "/login" },
  debug: process.env.NODE_ENV==="development"
})
