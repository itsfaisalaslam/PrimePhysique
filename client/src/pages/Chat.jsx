import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

const socket = io("http://localhost:5000", {
  autoConnect: false
});

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef(null);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, usersResponse] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users")
        ]);

        const profileUser = profileResponse.data?.user || null;
        const availableUsers = usersResponse.data?.users || [];

        setCurrentUser(profileUser);
        setUsers(availableUsers);
        setSelectedUserId(availableUsers[0]?._id || "");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load chat.");
        setCurrentUser(null);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, []);

  useEffect(() => {
    if (!currentUser?._id) {
      return undefined;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", currentUser._id);

    const handleReceiveMessage = (message) => {
      const senderId = message?.sender?._id || message?.sender;
      const receiverId = message?.receiver?._id || message?.receiver;

      if (
        senderId === selectedUserId ||
        receiverId === selectedUserId
      ) {
        setMessages((previous) => [...previous, message]);
      }
    };

    const handleChatError = (message) => {
      setError(message || "Chat error.");
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("chatError", handleChatError);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("chatError", handleChatError);
    };
  }, [currentUser?._id, selectedUserId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUserId) {
        setMessages([]);
        return;
      }

      try {
        setError("");
        const response = await api.get(`/messages/${selectedUserId}`);
        setMessages(response.data?.messages || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load chat history.");
        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedUserId]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!messageText.trim() || !selectedUserId || !currentUser?._id) {
      return;
    }

    setSending(true);
    setError("");

    try {
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUserId,
        text: messageText
      });

      setMessageText("");
    } catch (requestError) {
      setError(requestError.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/75 p-8 text-slate-200 backdrop-blur">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Real-Time Chat</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Message your teammates instantly</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Choose a user, review your conversation history, and exchange messages in real time.
        </p>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">People</h2>
          <div className="mt-5 space-y-3">
            {users.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-400">
                No users available for chat yet.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user?._id}
                  type="button"
                  onClick={() => setSelectedUserId(user?._id || "")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedUserId === user?._id
                      ? "border-brand-500/40 bg-brand-500/10 text-white"
                      : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-brand-500/30"
                  }`}
                >
                  <p className="font-semibold">{user?.name || "User"}</p>
                  <p className="mt-1 text-sm text-slate-400">{user?.email || "No email"}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {users.find((user) => user?._id === selectedUserId)?.name || "Select a chat"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {users.find((user) => user?._id === selectedUserId)?.email || "Choose a user to start messaging."}
              </p>
            </div>
          </div>

          <div
            ref={messageListRef}
            className="h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
          >
            {messages.length === 0 ? (
              <div className="text-sm text-slate-400">No messages yet. Start the conversation below.</div>
            ) : (
              messages.map((message) => {
                const senderId = message?.sender?._id || message?.sender;
                const isCurrentUser = senderId === currentUser?._id;

                return (
                  <div
                    key={message?._id || `${senderId}-${message?.createdAt}`}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? "bg-brand-500 text-slate-950"
                          : "border border-slate-800 bg-slate-900 text-slate-100"
                      }`}
                    >
                      <p className="text-sm">{message?.text || ""}</p>
                      <p className={`mt-2 text-[11px] ${isCurrentUser ? "text-slate-900/70" : "text-slate-400"}`}>
                        {new Date(message?.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              className="input"
              placeholder="Type your message..."
              disabled={!selectedUserId}
            />
            <button type="submit" className="btn-primary" disabled={!selectedUserId || sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Chat;
