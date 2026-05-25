'use client'

import dynamic from 'next/dynamic'
import { EmojiClickData } from 'emoji-picker-react'

const Picker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
)

interface Props {
  onEmojiClick: (emoji: string) => void
}

export default function EmojiPickerComponent({
  onEmojiClick,
}: Props) {
  return (
    <Picker
      onEmojiClick={(emojiData: EmojiClickData) =>
        onEmojiClick(emojiData.emoji)
      }
    />
  )
}