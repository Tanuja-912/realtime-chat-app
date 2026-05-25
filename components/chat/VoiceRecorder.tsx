'use client'

import { useState, useRef } from 'react'

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    const mediaRecorder = new MediaRecorder(stream)

    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.start()

    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()

    setRecording(false)
  }

  return (
    <button
      onClick={
        recording
          ? stopRecording
          : startRecording
      }
      className="bg-red-500 px-4 py-2 rounded-lg"
    >
      {recording ? 'Stop' : 'Record'}
    </button>
  )
}