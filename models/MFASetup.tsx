"use client"
import React, { useState } from "react"

export default function MFASetup() {
  const [qr, setQr] = useState("")
  const [token, setToken] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const generateQR = async () => {
    setLoading(true)
    try{
      const res = await fetch("/api/auth/mfa", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ action:"create" })
      })
      const data = await res.json()
      if(data.error) setMessage(data.error)
      else setQr(data.qr)
    } catch(err:any){ setMessage(err.message) }
    setLoading(false)
  }

  const verifyToken = async () => {
    setLoading(true)
    try{
      const res = await fetch("/api/auth/mfa", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ action:"verify", token })
      })
      const data = await res.json()
      if(data.error) setMessage(data.error)
      else setMessage(data.message)
    } catch(err:any){ setMessage(err.message) }
    setLoading(false)
  }

  return (
    <div style={{ padding:20 }}>
      <h2>MFA Setup</h2>
      <button onClick={generateQR} disabled={loading}>{loading?"Yüklənir...":"QR Yarat"}</button>
      {qr && <div style={{ margin:"10px 0" }}><img src={qr} alt="QR"/></div>}
      {qr && <div>
        <input type="text" placeholder="6 rəqəmli kod" value={token} onChange={e=>setToken(e.target.value)} />
        <button onClick={verifyToken} disabled={loading}>{loading?"Yoxlanılır...":"Verify"}</button>
      </div>}
      {message && <p>{message}</p>}
    </div>
  )
}
