import { socket } from '@/services/socket/socket'

export interface SignalData {
  roomId: string
  userId: string
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit
}

export const joinCall = (roomId: string) => {
  socket.emit('join-room', roomId)
}

export const sendSignal = (data: SignalData) => {
  socket.emit('signal', data)
}