"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, X } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Conversation {
  userId: number;
  username: string;
  lastMessage: string;
  updatedAt: string;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  text: string;
  sentAt: string;
}

export default function JobSeekerMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const currentUserId = Number(localStorage.getItem("hiremate_userId"));
  const recruiterId = Number(searchParams.get("recruiterId"));
  const recruiterUsername = searchParams.get("recruiterUsername");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = (peerId: number, reset = false) => {
    fetch(`${API_BASE_URL}/api/messages/conversations/${peerId}/messages/paginated?page=${reset ? 0 : page}&size=20`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((msgs: Message[]) => {
        if (msgs.length === 0) setHasMore(false);
        setMessages((prev) => (reset ? msgs.reverse() : [...msgs.reverse(), ...prev]));
      })
      .catch((err) =>
        toast({ title: "Error", description: err.message, variant: "destructive" })
      );
  };

  const openChat = (conv: Conversation) => {
    setSelected(conv);
    setPage(0);
    setMessages([]);
    setHasMore(true);
    fetchMessages(conv.userId, true);
  };

  const loadOlder = () => {
    if (!selected || !hasMore) return;
    setPage((p) => p + 1);
    fetchMessages(selected.userId);
  };

  const sendMessage = () => {
    if (!selected || !newMsg.trim()) return;
    const payload = { text: newMsg };
    fetch(`${API_BASE_URL}/api/messages/conversations/${selected.userId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Send failed");
        return r.json();
      })
      .then((msg: Message) => {
        setMessages((prev) => [...prev, msg]);
        setNewMsg("");
      })
      .catch((err) =>
        toast({ title: "Error", description: err.message, variant: "destructive" })
      );
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data: Conversation[]) => {
        setConversations(data);
        setFiltered(data);

        if (recruiterId && recruiterUsername) {
          const existing = data.find((c) => c.userId === recruiterId);
          if (existing) {
            openChat(existing);
          } else {
            const placeholder = {
              userId: recruiterId,
              username: recruiterUsername,
              lastMessage: "",
              updatedAt: "",
            };
            setSelected(placeholder);
            setMessages([]);
            setHasMore(true);
            fetchMessages(recruiterId, true);
          }
        }
      })
      .catch((err) =>
        toast({ title: "Error", description: err.message, variant: "destructive" })
      );
  }, [toast, searchParams]);

  useEffect(() => {
    if (!search) return setFiltered(conversations);
    const q = search.toLowerCase();
    setFiltered(
      conversations.filter((c) =>
        c.username.toLowerCase().includes(q) || String(c.userId).startsWith(q)
      )
    );
  }, [search, conversations]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      <div className="flex h-[80vh] border rounded overflow-hidden">
        <div className="w-1/3 border-r p-4 flex flex-col">
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => openChat(conv)}
                className={`w-full text-left p-3 rounded mb-2 ${
                  selected?.userId === conv.userId ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="font-medium">@{conv.username}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</div>
                <div className="text-2xs text-muted-foreground mt-1">
                  {new Date(conv.updatedAt).toLocaleString()}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No conversations found.</p>
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Chat with @{selected.username}</h2>
                <button onClick={() => setSelected(null)}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {hasMore && (
                  <div className="text-center">
                    <Button variant="outline" onClick={loadOlder} className="mb-4">
                      Load older messages
                    </Button>
                  </div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm whitespace-pre-line ${
                      m.senderId === currentUserId
                        ? "bg-blue-600 text-white self-end"
                        : "bg-gray-100 text-gray-900 self-start"
                    }`}
                  >
                    {m.text}
                    <div className="text-2xs text-muted-foreground text-right mt-1">
                      {new Date(m.sentAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4 flex gap-2">
                <Input
                  placeholder="Type a message…"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage} disabled={!newMsg.trim()}>
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
