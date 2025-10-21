import bcrypt from "bcrypt"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcrypt"

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name:"Credentials",
      credentials:{
        email:{label:"Email", type:"text"},
        password:{label:"Password", type:"password"}
      },
      async authorize(credentials){
        const client = await clientPromise
        const db = client.db("slidecraft")
        const user = await db.collection("users").findOne({ email: credentials?.email })
        if(!user) return null
        const isValid = await bcrypt.compare(credentials!.password, user.password)
        if(!isValid) return null
        return { id:user._id, name:user.username, email:user.email, isPro:user.isPro, role:user.role }
      }
    })
  ],
  callbacks:{
    async jwt({token,user}){
      if(user){
        token.isPro = user.isPro
        token.role = user.role
      }
      return token
    },
    async session({session,token}){
      session.user.isPro = token.isPro
      session.user.role = token.role
      return session
    }
  }
}

export default NextAuth(authOptions)
