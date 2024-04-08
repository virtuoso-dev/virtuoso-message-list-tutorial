"use client";
import { ChatChannel, ChatMessage } from "@/lib/ChatChannel";
import {
  VirtuosoMessageListMethods,
  VirtuosoMessageListLicense,
  VirtuosoMessageList,
  VirtuosoMessageListProps,
} from "@virtuoso.dev/message-list";
import { useEffect, useRef, useState } from "react";

interface MessageListContext {
  channel: ChatChannel;
}

type VirtuosoProps = VirtuosoMessageListProps<ChatMessage, MessageListContext>;

const EmptyPlaceholder: VirtuosoProps["EmptyPlaceholder"] = ({ context }) => {
  return <div>{!context.channel.loaded ? "Loading..." : "Empty"}</div>;
};

const ItemContent: VirtuosoProps["ItemContent"] = ({
  data: message,
  context,
}) => {
  const ownMessage = context.channel.currentUser === message.user;
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        paddingBottom: "2rem",
        flexDirection: ownMessage ? "row-reverse" : "row",
      }}
    >
      <img
        src={message.user.avatar}
        style={{
          borderRadius: "100%",
          width: 30,
          height: 30,
          border: "1px solid #ccc",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "50%",
        }}
      >
        <div
          style={{
            background: ownMessage ? "#3A5BC7" : "#F0F0F3",
            color: ownMessage ? "white" : "black",
            borderRadius: "1rem",
            padding: "1rem",
            ...(ownMessage
              ? { borderTopRightRadius: "0" }
              : { borderTopLeftRadius: "auto" }),
          }}
        >
          {message.message}
        </div>
        {!message.delivered && (
          <div style={{ textAlign: "right" }}>Delivering...</div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [channels, setChannels] = useState<ChatChannel[]>(() => [
    new ChatChannel("general", 500),
  ]);
  const [channel, setChannel] = useState(channels[0]);

  const messageListRef =
    useRef<VirtuosoMessageListMethods<ChatMessage, MessageListContext>>(null);

  useEffect(() => {
    if (!channel.loaded) {
      channel
        .getMessages({ limit: 20 })
        .then((messages) => {
          if (messages !== null) {
            messageListRef.current?.data.append(messages);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [channel]);

  return (
    <main>
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<ChatMessage, MessageListContext>
          context={{ channel }}
          EmptyPlaceholder={EmptyPlaceholder}
          ItemContent={ItemContent}
          computeItemKey={({ data }) => {
            if (data.id !== null) {
              return data.id;
            } else {
              return `l-${data.localId}`;
            }
          }}
          style={{ height: "calc(100vh - 50px)" }}
          ref={messageListRef}
          initialData={channel.messages}
          initialLocation={{ index: "LAST", align: "end" }}
        />
      </VirtuosoMessageListLicense>
    </main>
  );
}
