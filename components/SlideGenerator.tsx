"use client"
import React, { useState } from "react"
import jsPDF from "jspdf"

const freeTemplates = ["Template 1","Template 2","Template 3"]
const allTemplates = ["Template 1","Template 2","Template 3","Template 4","Template 5"]

interface Props { isPro:boolean }

export default function SlideGenerator({ isPro }:Props){
  const [title,setTitle] = useState("")
  const [audience,setAudience] = useState("")
  const [slidesCount,setSlidesCount] = useState(3)
  const [template,setTemplate] = useState(isPro ? allTemplates[0] : freeTemplates[0])
  const [result,setResult] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const handleGenerate = async () => {
    setLoading(true); setError(""); setResult("")
    try{
      const res = await fetch("/api/slides/generate",{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title,audience,slidesCount,template })
      })
      const data = await res.json()
      if(data.error) setError(data.error)
      else setResult(data.raw)
    }catch(err:any){
      setError(err.message)
    }
    setLoading(false)
  }

  const handlePDF = () => {
    const doc = new jsPDF()
    doc.text(result,10,10)
    doc.save(`${title}.pdf`)
  }

  const availableTemplates = isPro ? allTemplates : freeTemplates

  return (
    <div style={{ marginTop:20 }}>
      <h2>Slide Generator</h2>
      <input type="text" placeholder="Başlıq" value={title} onChange={e=>setTitle(e.target.value)} style={{ marginRight:10 }}/>
      <input type="text" placeholder="Auditoriya" value={audience} onChange={e=>setAudience(e.target.value)} style={{ marginRight:10 }}/>
      <input type="number" min={1} max={12} value={slidesCount} onChange={e=>setSlidesCount(Number(e.target.value))} style={{ width:60, marginRight:10 }}/>
      <select value={template} onChange={e=>setTemplate(e.target.value)} style={{ marginRight:10 }}>
        {availableTemplates.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <button onClick={handleGenerate} disabled={loading}>{loading ? "Yaradılır..." : "Yarat"}</button>

      {error && <p style={{ color:"red" }}>{error}</p>}
      {result && (
        <div style={{ whiteSpace:"pre-wrap", border:"1px solid #ccc", padding:10, marginTop:10 }}>
          {result}
          <br/>
          <button onClick={handlePDF}>PDF olaraq export et</button>
        </div>
      )}
    </div>
  )
}
