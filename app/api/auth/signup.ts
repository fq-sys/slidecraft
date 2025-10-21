import { NextApiRequest, NextApiResponse } from "next"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Audit from "@/models/Audit"
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method!=="POST") return res.status(405).json({ error: "Method not allowed" })
  try {
    await dbConnect()
    const { username, email, password } = req.body
    const pwdRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/
    if(!pwdRe.test(password)) return res.status(400).json({ error: "Şifrə minimum 12 simvol, 1 böyük hərf, 1 rəqəm və 1 simvol olmalıdır" })
    if(await User.findOne({ email })) return res.status(400).json({ error: "Bu email artıq qeydiyyatdan keçib" })
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await User.create({ username, email, passwordHash, role:"user", isPro:false })
    await Audit.create({ userId:user._id, action:"signup" })
    res.status(201).json({ ok:true, message:"Qeydiyyat tamamlandı" })
  } catch(err:any){ console.error(err); res.status(500).json({ error:"Server xətası" }) }
}
