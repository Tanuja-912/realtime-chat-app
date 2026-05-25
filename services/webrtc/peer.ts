import Peer from 'simple-peer'

export const createPeer = (stream: MediaStream, initiator: boolean) => {
  return new Peer({
    initiator,
    trickle: false,
    stream,
  })
}