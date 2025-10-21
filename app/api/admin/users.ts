import { NextApiRequest, NextApiResponse } from "next"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { getToken } from "next-auth/jwt"
import Audit from "@/models/Audit"

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await dbConnect()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if(!token || token.role!=="admin") return res.status(401).json({ error:"Unauthorized" })

  if(req.method==="GET"){ const users = await User.find({}, "username email role isPro createdAt lastLoginAt"); return res.json(users) }

  if(req.method==="POST"){
    const { userId, action } = req.body
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({ error:"User not found" })
    if(action==="makePro"){ user.isPro=true; await user.save(); await Audit.create({userId:token.sub, action:`gave_pro_to_${userId}`}); return res.json({ok:true,message:`${user.username} Pro edildi`}) }
    if(action==="revokePro"){ user.isPro=false; await user.save(); await Audit.create({userId:token.sub, action:`revoked_pro_from_${userId}`}); return res.json({ok:true,message:`${user.username} Pro geri alındı`}) }
    return res.status(400).json({ error:"Invalid action" })
  }

  return res.status(405).json({ error:"Method not allowed" })
}
