import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-ignore - TypeScript tip fərqi üçün
  const session: any = await getServerSession(req, res, authOptions as any)

  if (!session || !session.user || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }

  const client = await clientPromise
  const db = client.db("slidecraft")
  const users = await db.collection("users").find({}).toArray()

  res.status(200).json(users)
}
