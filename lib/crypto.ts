import crypto from "crypto"

const ALGO = "aes-256-gcm"
const KEY = crypto.scryptSync(process.env.NEXTAUTH_SECRET!, "salt", 32)

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex")
}

export function decrypt(data: string) {
  const [ivHex, tagHex, encryptedHex] = data.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const encrypted = Buffer.from(encryptedHex, "hex")
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}
