import { NextApiRequest, NextApiResponse } from "next"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { encrypt, decrypt } from "@/lib/crypto"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import { getToken } from "next-auth/jwt"
import Audit from "@/models/Audit"

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await dbConnect()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if(!token) return res.status(401).json({ error:"Unauthorized" })
  const user = await User.findById(token.sub)
  if(!user) return res.status(404).json({ error:"User not found" })

  if(req.method==="POST" && req.body.action==="create"){
    const secret = speakeasy.generateSecret({ length:20, name:`SlideCraft (${user.email})` })
    const svg = await qrcode.toDataURL(secret.otpauth_url)
    user.mfaEncryptedSecret = encrypt(secret.base32)
    user.mfaEnabled = false
    await user.save()
    return res.json({ qr:svg })
  }

  if(req.method==="POST" && req.body.action==="verify"){
    const { token:userToken } = req.body
    if(!user.mfaEncryptedSecret) return res.status(400).json({ error:"MFA secret yoxdu" })
    const secret = decrypt(user.mfaEncryptedSecret)
    const verified = speakeasy.totp.verify({ secret, encoding:"base32", token:userToken, window:1 })
    if(!verified){ await Audit.create({userId:user._id, action:"mfa_failed"}); return res.status(400).json({ error:"MFA kodu səhvdir" }) }
    user.mfaEnabled = true
    await user.save()
    await Audit.create({ userId:user._id, action:"mfa_verified" })
    return res.json({ ok:true, message:"MFA təsdiqləndi" })
  }

  return res.status(405).json({ error:"Method not allowed" })
}
