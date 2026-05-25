'use client'

import { useState } from 'react'
import { signIn } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await signIn(email, password)

    if (!error) {
      router.push('/chat')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-[400px] p-8 bg-zinc-900 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          className="w-full p-3 rounded bg-zinc-800 mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-zinc-800 mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 p-3 rounded"
        >
          Login
        </button>
      </div>
    </div>
  )
}