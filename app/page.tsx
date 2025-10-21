"use client"
import React, { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import SlideGenerator from "@/components/SlideGenerator"
import AdminPanel from "@/components/AdminPanel"

export default function Page() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(()=>{
    if(session?.user?.role==="admin") setIsAdmin(true)
    else setIsAdmin(false)
  },[session])

  if(!session){
    return (
      <div style={{ padding: 20 }}>
        <h1>SlideCraft</h1>
        <p>Login və ya signup etmək üçün:</p>
        <button onClick={()=>signIn()}>Login / Signup</button>
      </div>
    )
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>Salam, {session.user.name} {session.user.isPro ? "(Pro)" : "(Free)"}!</h1>
      <button onClick={()=>signOut()}>Logout</button>

      <hr style={{ margin: "20px 0" }}/>

      <SlideGenerator isPro={session.user.isPro} />

      {isAdmin && (
        <>
          <hr style={{ margin: "20px 0" }}/>
          <AdminPanel />
        </>
      )}
    </div>
  )
}
