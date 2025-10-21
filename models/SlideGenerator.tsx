"use client"
import React, { useState, useEffect } from "react"
import { jsPDF } from "jspdf"

interface SlideGeneratorProps {
  isPro: boolean // user Pro statusu
}

export default function SlideGenerator({ isPro }: SlideGeneratorProps) {
  const [title, setTitle] = useState("")
  const [audience, setAudience] = useState("")
  const [slidesCount, setSlidesCount] = useState(3)
  const [template, setTemplate] = useState("Template 1")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Templates
  const templates = isPro
    ? ["Template 1","Template 2","Template 3","Template 4","Template 5"]
    : ["Template 1","Template 2","Template 3"]

  // Slayd limit Free
  useEffect(()=>{
    if(!isPro && slidesCount > 3) setSlidesCount(3)
  }, [slidesCount, isPro])

  const handleGenerate = async () => {
    if(!title || !audience) {
      setError("Başlıq və auditoriya daxil edin!")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const res = await fetch("/api/slides/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, audience, slidesCount, template })
      })
      const data = await res.json()
      if(data.error) setError(data.error)
      else setResult(data.raw)
    } catch(err:any){
      setError(err.message)
    }
    setLoading(false)
  }

  // PDF export
  const exportPDF = () => {
    if(!result) return
    const doc = new jsPDF()
    const lines = result.split("\n")
    let y = 10
    lines.forEach(line => {
      doc.text(line, 10, y)
      y += 10
    })
    doc.save(`${title || "slide"}.pdf`)
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h2>Slide Yaradıcı {isPro ? "(Pro)" : "(Free)"}</h2>
      
      <div style={{ marginBottom:10 }}>
        <input 
          type="text" 
          placeholder="Başlıq" 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          style={{ marginRight:10, width:200 }}
        />
        <input 
          type="text" 
          placeholder="Auditoriya" 
          value={audience} 
          onChange={e=>setAudience(e.target.value)} 
          style={{ marginRight:10, width:150 }}
        />
        <input 
          type="number" 
          min={1} 
          max={isPro?12:3} 
          value={slidesCount} 
          onChange={e=>setSlidesCount(Number(e.target.value))} 
          style={{ width:50, marginRight:10 }} 
        />
        <select value={template} onChange={e=>setTemplate(e.target.value)} style={{ marginRight:10 }}>
          {templates.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleGenerate} disabled={loading}>{loading ? "Yaradılır..." : "Yarat"}</button>
      </div>

      {error && <p style={{ color:"red" }}>{error}</p>}
      {result && 
        <div>
          <pre style={{ border:"1px solid #ccc", padding:10, whiteSpace:"pre-wrap" }}>{result}</pre>
          <button onClick={exportPDF} style={{ marginTop:10 }}>PDF kimi saxla</button>
        </div>
      }
    </div>
  )
}
