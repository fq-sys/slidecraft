"use client"
import React, { useState, useEffect } from "react"
import SlideGenerator from "@/components/SlideGenerator"
import AdminPanel from "@/components/AdminPanel"
import MFASetup from "@/components/MFASetup"

// Simple Auth Mock (real project-da NextAuth istifadə etmək tövsiyə olunur)
interface User {
  username:string
  email:string
  isPro:boolean
  role:"user"|"admin"
}

export default function Page() {
  const [user,setUser] = useState<User|null>(null)
  const [view,setView] = useState<"login"|"signup"|"app">("login")

  // Dummy login/signup (backend-lə inteqrasiya olunacaq)
  const handleLogin = (email:string, password:string) => {
    // real project-da API POST /api/auth/login
    setUser({ username:"Farid", email, isPro:false, role:"user" })
    setView("app")
  }

  const handleSignup = (username:string,email:string,password:string) => {
    // real project-da API POST /api/auth/signup
    setUser({ username,email, isPro:false, role:"user" })
    setView("app")
  }

  const handleLogout = () => { setUser(null); setView("login") }

  if(view==="login") return (
    <div style={{ padding:20 }}>
      <h2>Login</h2>
      <input placeholder="Email" id="email" style={{ marginRight:10 }} />
      <input placeholder="Password" type="password" id="password" style={{ marginRight:10 }} />
      <button onClick={()=>{
        const email = (document.getElementById("email") as HTMLInputElement).value
        const password = (document.getElementById("password") as HTMLInputElement).value
        handleLogin(email,password)
      }}>Login</button>
      <p>Yoxdursa <button onClick={()=>setView("signup")}>Signup</button></p>
    </div>
  )

  if(view==="signup") return (
    <div style={{ padding:20 }}>
      <h2>Signup</h2>
      <input placeholder="Username" id="username" style={{ marginRight:10 }} />
      <input placeholder="Email" id="email" style={{ marginRight:10 }} />
      <input placeholder="Password" type="password" id="password" style={{ marginRight:10 }} />
      <button onClick={()=>{
        const username = (document.getElementById("username") as HTMLInputElement).value
        const email = (document.getElementById("email") as HTMLInputElement).value
        const password = (document.getElementById("password") as HTMLInputElement).value
        handleSignup(username,email,password)
      }}>Signup</button>
      <p>Artıq hesabınız varsa <button onClick={()=>setView("login")}>Login</button></p>
    </div>
  )

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h1>SlideCraft</h1>
      <p>Salam, {user?.username} ({user?.isPro ? "Pro" : "Free"})</p>
      <button onClick={handleLogout}>Logout</button>
      <hr/>

      {/* MFA Setup */}
      <MFASetup />

      <hr/>

      {/* Slide Generator */}
      <SlideGenerator isPro={!!user?.isPro} />

      <hr/>

      {/* Admin Panel */}
      {user?.role==="admin" && <AdminPanel />}
    </div>
  )
}
