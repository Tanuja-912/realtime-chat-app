'use client'

import { useEffect, useRef } from 'react'

export default function VideoCall({ roomId }: { roomId: string }) {
  const localVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideo.current) {
        localVideo.current.srcObject = stream
      }
    })
  }, [])

  return (
    <div className="text-white">
      <h1>Video Call 🎥</h1>
      <video ref={localVideo} autoPlay muted className="w-80 rounded" />
    </div>
  )
}