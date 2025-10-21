"use client"
import React, { useState, useEffect } from "react"

interface User { email:string, username:string, isPro:boolean, role:string }

export default function AdminPanel(){
  const [users,setUsers] = useState<User[]>([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const fetchUsers = async () => {
    setLoading(true); setError("")
    try{
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if(data.error) setError(data.error)
      else setUsers(data.users)
    }catch(err:any){ setError(err.message) }
    setLoading(false)
  }

  const togglePro = async (email:string,makePro:boolean) => {
    try{
      const res = await fetch("/api/admin/users",{ 
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ email, action: makePro ? "makePro" : "revokePro" })
      })
      const data = await res.json()
      if(data.ok) fetchUsers()
    }catch(err){ console.log(err) }
  }

  useEffect(()=>{ fetchUsers() },[])

  return (
    <div style={{ marginTop:20 }}>
      <h2>Admin Panel</h2>
      {loading && <p>Yüklənir...</p>}
      {error && <p style={{ color:"red" }}>{error}</p>}
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Pro</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.email}>
              <td>{u.email}</td>
              <td>{u.username}</td>
              <td>{u.isPro ? "Yes" : "No"}</td>
              <td>
                <button onClick={()=>togglePro(u.email,!u.isPro)}>
                  {u.isPro ? "Revoke Pro" : "Make Pro"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
