import { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcrypt"

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"})

  const { username,email,password } = req.body
  if(!username || !email || !password) return res.status(400).json({error:"Missing fields"})

  const client = await clientPromise
  const db = client.db("slidecraft")
  const exists = await db.collection("users").findOne({ email })
  if(exists) return res.status(400).json({error:"User already exists"})

  const hashed = await bcrypt.hash(password,10)
  await db.collection("users").insertOne({ username,email,password:hashed,isPro:false,role:"user" })

  res.status(201).json({ok:true})
}
