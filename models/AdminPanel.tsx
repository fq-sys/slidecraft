"use client"
import React, { useEffect, useState } from "react"

interface User { _id:string, username:string, email:string, role:string, isPro:boolean }

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if(data.error) setError(data.error)
      else setUsers(data)
    } catch(err:any){
      setError(err.message)
    }
    setLoading(false)
  }

  const togglePro = async (user:User) => {
    try{
      const action = user.isPro ? "revokePro" : "makePro"
      const res = await fetch("/api/admin/users", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userId:user._id, action })
      })
      const data = await res.json()
      if(data.error) alert(data.error)
      else fetchUsers()
    } catch(err:any){ alert(err.message) }
  }

  useEffect(()=>{ fetchUsers() },[])

  return (
    <div style={{ padding:20 }}>
      <h2>Admin Panel</h2>
      {loading && <p>Yüklənir...</p>}
      {error && <p style={{ color:"red" }}>{error}</p>}
      <table border={1} cellPadding={5} style={{ borderCollapse:"collapse" }}>
        <thead>
          <tr><th>Username</th><th>Email</th><th>Role</th><th>Pro</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u=>(
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isPro?"Yes":"No"}</td>
              <td><button onClick={()=>togglePro(u)}>{u.isPro?"Revoke Pro":"Give Pro"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
