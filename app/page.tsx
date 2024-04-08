"use client";
import { ChatChannel, ChatMessage } from "@/lib/ChatChannel";
import {
  VirtuosoMessageListMethods,
  VirtuosoMessageListLicense,
  VirtuosoMessageList,
  VirtuosoMessageListProps,
  ListScrollLocation,
  useVirtuosoLocation,
  useVirtuosoMethods,
} from "@virtuoso.dev/message-list";
import React from "react";
import { useEffect, useRef, useState } from "react";

interface MessageListContext {
  channel: ChatChannel;
  loadingNewer: boolean;
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

const Header: VirtuosoProps["Header"] = ({ context }) => {
  return (
    <div style={{ height: 30 }}>{context.loadingNewer ? "Loading..." : ""}</div>
  );
};

const StickyFooter: VirtuosoProps["StickyFooter"] = () => {
  const location = useVirtuosoLocation();
  const virtuosoMethods = useVirtuosoMethods();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 50,
      }}
    >
      {location.bottomOffset > 200 && (
        <>
          <button
            style={{
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: "100%",
              width: 30,
              height: 30,
              color: "black",
            }}
            onClick={() => {
              virtuosoMethods.scrollToItem({
                index: "LAST",
                align: "end",
                behavior: "auto",
              });
            }}
          >
            &#9660;
          </button>
        </>
      )}
    </div>
  );
};

export default function Home() {
  const [channels, setChannels] = useState<ChatChannel[]>(() => [
    new ChatChannel("general", 500),
  ]);
  const [channel, setChannel] = useState(channels[0]);
  const [loadingNewer, setLoadingNewer] = React.useState(false);

  const messageListRef =
    useRef<VirtuosoMessageListMethods<ChatMessage, MessageListContext>>(null);

  const firstMessageId = useRef<number | null>(null);

  const onScroll = React.useCallback(
    (location: ListScrollLocation) => {
      // offset is 0 at the top, -totalScrollSize + viewportHeight at the bottom
      if (
        location.listOffset > -100 &&
        !loadingNewer &&
        firstMessageId.current
      ) {
        setLoadingNewer(true);
        channel
          .getMessages({ limit: 20, before: firstMessageId.current })
          .then((messages) => {
            if (messages !== null) {
              firstMessageId.current = messages[0].id;
              messageListRef.current?.data.prepend(messages);
              setLoadingNewer(false);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    [channel, loadingNewer],
  );
  useEffect(() => {
    if (!channel.loaded) {
      channel
        .getMessages({ limit: 20 })
        .then((messages) => {
          if (messages !== null) {
            firstMessageId.current = messages[0].id;
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
          onScroll={onScroll}
          context={{ loadingNewer, channel }}
          EmptyPlaceholder={EmptyPlaceholder}
          ItemContent={ItemContent}
          Header={Header}
          StickyFooter={StickyFooter}
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
