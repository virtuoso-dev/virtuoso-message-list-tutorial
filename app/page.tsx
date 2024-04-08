"use client";
import { ChatChannel, ChatMessage } from "@/lib/ChatChannel";
import {
  VirtuosoMessageListMethods,
  VirtuosoMessageListLicense,
  VirtuosoMessageList,
} from "@virtuoso.dev/message-list";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [channels, setChannels] = useState<ChatChannel[]>(() => [
    new ChatChannel("general", 500),
  ]);
  const [channel, setChannel] = useState(channels[0]);

  const messageListRef =
    useRef<VirtuosoMessageListMethods<ChatMessage, {}>>(null);

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
        <VirtuosoMessageList<ChatMessage, {}>
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
        />
      </VirtuosoMessageListLicense>
    </main>
  );
}
