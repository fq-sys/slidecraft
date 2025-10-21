import { NextApiRequest,NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  const session = await getServerSession(req,res,authOptions)
  if(!session || session.user.role!=="admin") return res.status(403).json({error:"Forbidden"})

  const client = await clientPromise
  const db = client.db("slidecraft")
  
  if(req.method==="POST"){
    const { email, action } = req.body
    const user = await db.collection("users").findOne({ email })
    if(!user) return res.status(404).json({error:"User not found"})
    
    if(action==="makePro") await db.collection("users").updateOne({email},{$set:{isPro:true}})
    if(action==="revokePro") await db.collection("users").updateOne({email},{$set:{isPro:false}})
    
    return res.json({ok:true})
  }

  if(req.method==="GET"){
    const users = await db.collection("users").find({}).toArray()
    return res.json({users})
  }

  return res.status(405).json({error:"Method not allowed"})
}
