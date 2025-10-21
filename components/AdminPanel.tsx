import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface User {
  _id: string
  username: string
  email: string
  role: string
  isPro: boolean
  createdAt: string
  lastLoginAt: string
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handlePro = async (userId: string, action: "makePro" | "revokePro") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  if (!session || session.user.role !== "admin") return <p>Unauthorized</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>
      {loading && <p>Yüklənir...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Pro</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isPro ? "✅" : "❌"}</td>
              <td>
                {!u.isPro ? 
                  <button onClick={() => handlePro(u._id, "makePro")}>Give Pro</button> :
                  <button onClick={() => handlePro(u._id, "revokePro")}>Revoke Pro</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
