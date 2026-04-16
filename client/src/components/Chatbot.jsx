import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const starterMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi, I'm your PrimePhysique assistant. Ask me about workouts, diet, muscle gain, fat loss, or staying consistent."
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/chatbot", { message: trimmed });
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response.data?.reply || "I'm here to help with your fitness journey."
      };

      setMessages((previous) => [...previous, botMessage]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reach the assistant right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/95 shadow-[0_30px_80px_rgba(2,6,23,0.48)] backdrop-blur-2xl transition-all duration-300 animate-[fadeInUp_0.35s_ease-out]">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Assistant</p>
              <h3 className="mt-1 text-lg font-semibold text-white">PrimePhysique Bot</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
            >
              Close
            </button>
          </div>

          <div className="h-96 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-brand-500 text-slate-950 shadow-[0_16px_32px_rgba(20,184,166,0.18)]"
                        : "border border-white/10 bg-slate-900/90 text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                    Typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {error && (
            <div className="border-t border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="input"
                placeholder="Ask about workouts or diet..."
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-slate-950 shadow-[0_20px_45px_rgba(20,184,166,0.35)] transition duration-200 hover:-translate-y-1 hover:bg-brand-400"
        aria-label="Open chatbot assistant"
      >
        {"\uD83D\uDCAC"}
      </button>
    </div>
  );
};

export default Chatbot;
