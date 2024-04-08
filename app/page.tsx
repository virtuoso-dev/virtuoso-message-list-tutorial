"use client";
import { ChatChannel, ChatMessage } from "@/lib/ChatChannel";
import {
  VirtuosoMessageListMethods,
  VirtuosoMessageListLicense,
  VirtuosoMessageList,
} from "@virtuoso.dev/message-list";
import { useRef, useState } from "react";

export default function Home() {
  const [channels, setChannels] = useState<ChatChannel[]>(() => [
    new ChatChannel("general", 500),
  ]);
  const [channel, setChannel] = useState(channels[0]);

  const messageListRef =
    useRef<VirtuosoMessageListMethods<ChatMessage, {}>>(null);
  return (
    <main>
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<ChatMessage, {}>
          style={{ height: "calc(100vh - 50px)" }}
          ref={messageListRef}
          initialData={channel.messages}
        />
      </VirtuosoMessageListLicense>
    </main>
  );
}
