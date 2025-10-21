import { NextApiRequest,NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

const freeTemplates = ["Template 1","Template 2","Template 3"]
const allTemplates = ["Template 1","Template 2","Template 3","Template 4","Template 5"]

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"})
  
  const session = await getServerSession(req,res,authOptions)
  if(!session) return res.status(401).json({error:"Unauthorized"})
  
  const { title,audience,slidesCount,template } = req.body
  const isPro = session.user.isPro

  if(!title || !audience || !slidesCount || !template) 
    return res.status(400).json({error:"Missing fields"})

  const availableTemplates = isPro ? allTemplates : freeTemplates
  if(!availableTemplates.includes(template))
    return res.status(403).json({error:"Template not allowed for your plan"})

  const count = (!isPro && slidesCount>3)?3:slidesCount

  const slides = Array.from({length:count},(_,i)=>`Slayd ${i+1}: ${title} - ${audience} (${template})`).join("\n\n")
  res.status(200).json({raw:slides})
}
