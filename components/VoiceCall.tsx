'use client'

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'
import { socket } from '@/services/socket/socket'

type SignalData = {
  signal: SimplePeer.SignalData
  callerId?: string
}

export default function VoiceCall({ roomId }: { roomId: string }) {
  const [calling, setCalling] = useState(false)

  const userAudio = useRef<HTMLAudioElement>(null)
  const partnerAudio = useRef<HTMLAudioElement>(null)

  const peerRef = useRef<SimplePeer.Instance | null>(null)

  // =========================
  // 🎧 SOCKET LISTENERS
  // =========================
  useEffect(() => {
    const handleSignal = ({ signal }: SignalData) => {
      if (peerRef.current) {
        peerRef.current.signal(signal)
      }
    }

    const handleIncomingCall = () => {
      setCalling(true)
    }

    socket.on('signal', handleSignal)
    socket.on('incoming-call', handleIncomingCall)

    return () => {
      socket.off('signal', handleSignal)
      socket.off('incoming-call', handleIncomingCall)
    }
  }, [])

  // =========================
  // 📞 START CALL
  // =========================
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false, // change to true for video calls
    })

    setCalling(true)

    if (userAudio.current) {
      userAudio.current.srcObject = stream
    }

    socket.emit('join-room', roomId)

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    })

    peerRef.current = peer

    // =========================
    // 🔁 SEND SIGNAL TO SERVER
    // =========================
    peer.on('signal', (signal) => {
      socket.emit('signal', {
        roomId,
        signal,
      })
    })

    // =========================
    // 🎧 RECEIVE REMOTE AUDIO
    // =========================
    peer.on('stream', (remoteStream) => {
      if (partnerAudio.current) {
        partnerAudio.current.srcObject = remoteStream
      }
    })
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl mb-4">Voice Call 🎤</h1>

      {!calling && (
        <button
          onClick={startCall}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Start Voice Call
        </button>
      )}

      {/* YOUR AUDIO */}
      <audio ref={userAudio} autoPlay muted />

      {/* PARTNER AUDIO */}
      <audio ref={partnerAudio} autoPlay />

      {calling && (
        <p className="text-green-400 mt-2">Call active...</p>
      )}
    </div>
  )
}