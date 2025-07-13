import { randFullName, randNumber, randSentence } from "@ngneat/falso"

export interface ChatUser {
  id: number
  name: string
  avatar: string
}

export interface ChatMessage {
  delivered: boolean
  localId?: number | null
  id: number | null
  user: ChatUser
  message: string
}

export function createUser(id: number): ChatUser {
  const name = randFullName()
  return {
    id,
    name,
    avatar: `https://i.pravatar.cc/30?u=${encodeURIComponent(name)}`,
  }
}

let remoteIdCounter = 0

export function createMessage(user: ChatUser): ChatMessage {
  const message = randSentence({
    length: randNumber({ min: 1, max: 5 }),
  }).join(' ')
  return {
    id: ++remoteIdCounter,
    user,
    message,
    delivered: true,
  }
}

let localIdCounter = 0

export function createLocalMessage(user: ChatUser): ChatMessage {
  const message = randSentence({
    length: randNumber({ min: 1, max: 5 }),
  }).join(' ')
  return {
    id: null,
    localId: ++localIdCounter,
    user,
    message,
    delivered: false,
  }
}
