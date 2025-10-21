import { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Slide from "@/models/Slide"
import { getToken } from "next-auth/jwt"

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"})
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if(!token) return res.status(401).json({error:"Unauthorized"})
  await dbConnect()
  const { title, audience, slidesCount } = req.body
  try {
    const prompt = `Mənə ${slidesCount} slayd üçün mətni hazırla, başlıq: ${title}, auditoriya: ${audience}`
    const gpt = await openai.createChatCompletion({ model:"gpt-3.5-turbo", messages:[{role:"user",content:prompt}] })
    const raw = gpt.data.choices[0].message?.content || ""
    await Slide.create({ userId: token.sub, title, audience, slides:[raw] })
    res.json({ ok:true, raw })
  } catch(err:any){ console.error(err); res.status(500).json({ error:"Failed to generate slides" }) }
}
