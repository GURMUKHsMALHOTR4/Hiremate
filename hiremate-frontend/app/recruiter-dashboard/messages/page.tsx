"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hiremate-backend-zaoc.onrender.com";

interface Conversation {
  userId: number;
  username: string;
  lastMessage?: string;
  updatedAt?: string;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  text: string;
  sentAt: string;
}

export default function RecruiterMessagesPage() {

  const { toast } = useToast();

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [search, setSearch] =
    useState("");

  const [filtered, setFiltered] =
    useState<Conversation[]>([]);

  const [selected, setSelected] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [newMsg, setNewMsg] =
    useState("");

  const currentUserId =
    typeof window !== "undefined"
      ? Number(
          localStorage.getItem(
            "hiremate_userId"
          )
        )
      : 0;

  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  // ✅ LOAD CHATS FROM LOCAL STORAGE
  useEffect(() => {

    const storedChats =
      JSON.parse(
        localStorage.getItem(
          "hiremate_chats"
        ) || "[]"
      );

    const formattedChats =
      storedChats.map((chat: any) => ({
        userId: Number(chat.userId),
        username: chat.username,
        lastMessage: "Start chatting...",
        updatedAt: new Date().toISOString(),
      }));

    setConversations(formattedChats);

    setFiltered(formattedChats);

    // ✅ AUTO OPEN CHAT FROM URL
    const params =
      new URLSearchParams(
        window.location.search
      );

    const receiverId =
      params.get("receiverId");

    const receiverUsername =
      params.get("receiverUsername");

    if (
      receiverId &&
      receiverUsername
    ) {

      const selectedConv = {
        userId: Number(receiverId),
        username: receiverUsername,
        lastMessage:
          "Start chatting...",
        updatedAt:
          new Date().toISOString(),
      };

      setSelected(selectedConv);

      const exists =
        formattedChats.some(
          (c: any) =>
            Number(c.userId) ===
            Number(receiverId)
        );

      if (!exists) {

        const updated = [
          ...formattedChats,
          selectedConv,
        ];

        setConversations(updated);

        setFiltered(updated);

        localStorage.setItem(
          "hiremate_chats",
          JSON.stringify(updated)
        );
      }

      fetchMessages(
        Number(receiverId)
      );
    }

  }, []);

  const fetchMessages = (
    peerId: number
  ) => {

    fetch(
      `${API_BASE_URL}/api/messages/conversations/${peerId}/messages`,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`,
        },
      }
    )
      .then(async (r) => {

        if (!r.ok) {

          setMessages([]);

          return;
        }

        const data =
          await r.json();

        setMessages(data);

      })
      .catch(() => {

        setMessages([]);
      });
  };

  const openChat = (
    conv: Conversation
  ) => {

    setSelected(conv);

    fetchMessages(conv.userId);
  };

  const sendMessage = () => {

    if (
      !selected ||
      !newMsg.trim()
    ) {
      return;
    }

    const payload = {
      text: newMsg,
    };

    fetch(
      `${API_BASE_URL}/api/messages/conversations/${selected.userId}/messages`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${getToken()}`,
        },

        body: JSON.stringify(payload),
      }
    )
      .then((r) => {

        if (!r.ok) {

          throw new Error(
            "Send failed"
          );
        }

        return r.json();
      })
      .then((msg: Message) => {

        setMessages((prev) => [
          ...prev,
          msg,
        ]);

        setNewMsg("");

        // ✅ UPDATE LAST MESSAGE
        setConversations((prev) =>
          prev.map((c) =>
            c.userId ===
            selected.userId
              ? {
                  ...c,
                  lastMessage:
                    msg.text,
                  updatedAt:
                    new Date().toISOString(),
                }
              : c
          )
        );
      })
      .catch((err) =>

        toast({
          title: "Error",
          description:
            err.message,
          variant:
            "destructive",
        })

      );
  };

  // ✅ SEARCH
  useEffect(() => {

    if (!search) {

      setFiltered(
        conversations
      );

      return;
    }

    const q =
      search.toLowerCase();

    setFiltered(
      conversations.filter(
        (c) =>
          c.username
            .toLowerCase()
            .includes(q) ||
          String(c.userId)
            .startsWith(q)
      )
    );

  }, [search, conversations]);

  return (

    <div className="min-h-screen p-8 max-w-7xl mx-auto">

      <div className="flex items-center gap-4 mb-6">

        <BackButton />

        <h1 className="text-3xl font-bold">
          Messages
        </h1>

      </div>

      <div className="flex h-[80vh] border rounded overflow-hidden">

        {/* LEFT SIDEBAR */}

        <div className="w-1/3 border-r p-4 flex flex-col">

          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="mb-4"
          />

          <div className="flex-1 overflow-y-auto">

            {filtered.map((conv) => (

              <button
                key={conv.userId}
                onClick={() =>
                  openChat(conv)
                }
                className={`w-full text-left p-3 rounded mb-2 ${
                  selected?.userId ===
                  conv.userId
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >

                <div className="font-medium">
                  @{conv.username}
                </div>

                <div className="text-xs text-muted-foreground line-clamp-1">
                  {conv.lastMessage}
                </div>

                {conv.updatedAt && (

                  <div className="text-[10px] text-muted-foreground mt-1">

                    {new Date(
                      conv.updatedAt
                    ).toLocaleString()}

                  </div>

                )}

              </button>

            ))}

            {filtered.length === 0 && (

              <p className="text-sm text-muted-foreground mt-4">

                No conversations found.

              </p>

            )}

          </div>

        </div>

        {/* RIGHT CHAT AREA */}

        <div className="w-2/3 flex flex-col">

          {!selected ? (

            <div className="flex-1 flex items-center justify-center text-muted-foreground">

              Select a conversation

            </div>

          ) : (

            <>

              <div className="flex items-center justify-between border-b p-4">

                <h2 className="text-lg font-semibold">

                  Chat with @{selected.username}

                </h2>

                <button
                  onClick={() =>
                    setSelected(null)
                  }
                >

                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />

                </button>

              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

                {messages.map((m) => (

                  <div
                    key={m.id}
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm whitespace-pre-line ${
                      m.senderId ===
                      currentUserId
                        ? "bg-blue-600 text-white self-end"
                        : "bg-gray-100 text-gray-900 self-start"
                    }`}
                  >

                    {m.text}

                    <div className="text-[10px] text-right mt-1 opacity-70">

                      {new Date(
                        m.sentAt
                      ).toLocaleTimeString()}

                    </div>

                  </div>

                ))}

                <div ref={messagesEndRef} />

              </div>

              <div className="border-t p-4 flex gap-2">

                <Input
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) =>
                    setNewMsg(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>

                    e.key === "Enter" &&
                    sendMessage()

                  }
                  className="flex-1"
                />

                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={
                    !newMsg.trim()
                  }
                >

                  <Send className="w-5 h-5" />

                </Button>

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}