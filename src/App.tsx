import { VirtuosoMessageList, VirtuosoMessageListLicense, type DataWithScrollModifier, type ScrollModifier, type VirtuosoMessageListProps } from "@virtuoso.dev/message-list"
import { createMessage, createUser, type ChatMessage, type ChatUser } from "./chat"
import { useCallback, useEffect, useMemo, useState } from "react"

// The channel data type defines the `data` prop passed to the VirtuosoMessageList component - an object defining the data to display and optional instructions on how the scroll location should change.
type ChannelData = DataWithScrollModifier<ChatMessage> | null

type ChannelsData = Record<string, ChannelData>


interface MessageListContext {
  currentUser: ChatUser
}

type MessageListProps = VirtuosoMessageListProps<ChatMessage, MessageListContext>

// use this shape to start channels at the bottom of the list
const InitialDataScrollModifier: ScrollModifier = {
  type: 'item-location',
  location: {
    index: 'LAST',
    align: 'end',
  },
  purgeItemSizes: true,
}

// This function is used to generate key properties for the messaqge list items based on the data rendered.
// use a stable identifier to avoid unnecessary re-mounts when the message list data changes.
const computeItemKey: MessageListProps['computeItemKey'] = ({ data }) => {
  if (data.id !== null) {
    return data.id
  }
  return `l-${data.localId}`
}

const EmptyPlaceholder: MessageListProps["EmptyPlaceholder"] = () => {
  return <div>Loading...</div>;
};

const ItemContent: MessageListProps['ItemContent'] = ({ data: message, context }) => {
  const ownMessage = context.currentUser === message.user
  return (
    <div style={{ display: 'flex', gap: '1rem', paddingBottom: '2rem', flexDirection: ownMessage ? 'row-reverse' : 'row' }}>
      <img src={message.user.avatar} style={{ borderRadius: '100%', width: 30, height: 30, border: '1px solid #ccc' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '50%' }}>
        <div
          style={{
            background: ownMessage ? '#3A5BC7' : '#F0F0F3',
            color: ownMessage ? 'white' : 'black',
            borderRadius: '1rem',
            padding: '1rem',
            ...(ownMessage ? { borderTopRightRadius: '0' } : { borderTopLeftRadius: 'auto' }),
          }}
        >
          {message.message}
        </div>
        {!message.delivered && <div style={{ textAlign: 'right' }}>Delivering...</div>}
      </div>
    </div>
  )
}

function App() {
  const [channelsData, setChannelsData] = useState<ChannelsData>(() => ({
    'general': null,
  }))

  const [currentChannel, setCurrentChannel] = useState<string>('general')

  const messageListData = useMemo(() => {
    return channelsData[currentChannel] ?? null
  }, [channelsData, currentChannel])

  const setMessageListData = useCallback(
    (cb: (current: ChannelData) => ChannelData) => {
      setChannelsData((current) => {
        return {
          ...current,
          [currentChannel]: cb(current[currentChannel] ?? null),
        }
      })
    },
    [currentChannel]
  )


  const [currentUser, otherUser] = useMemo(() => {
    return [createUser(1), createUser(2)]
  }, [])

  // initial data loading
  useEffect(() => {
    if (messageListData === null || messageListData.data === null) {
      // simulate an API call to fetch initial messages
      setTimeout(() => {
        setMessageListData((current) => {
          if (current?.data?.length) {
            return current
          }
          const messages = Array.from({ length: 120 }, (_, i) => createMessage(i % 3 === 0 ? currentUser : otherUser))
          return {
            data: messages,
            scrollModifier: InitialDataScrollModifier,
          }
        })
      }, 500)
    }
  }, [currentUser, otherUser, setMessageListData, messageListData])


  return <div><VirtuosoMessageListLicense licenseKey="">
    <VirtuosoMessageList<ChatMessage, MessageListContext>
      style={{ height: '80vh' }}
      context={{ currentUser }}
      EmptyPlaceholder={EmptyPlaceholder}
      ItemContent={ItemContent}
      data={messageListData}
      computeItemKey={computeItemKey}
    />

  </VirtuosoMessageListLicense>
  </div>
}

export default App
