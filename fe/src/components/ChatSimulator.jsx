import React, { useState } from "react";
import { FaFacebookMessenger, FaTimes, FaPaperPlane } from "react-icons/fa";
import useAuth from "../hook/useAuth";

export const ChatSimulator = () => {
  const { isAuthenticated, isLoading: isAuthenticationLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi là AI giả lập, bạn cần gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Giả lập phản hồi
    setTimeout(() => {
      const fakeReply = {
        role: "assistant",
        content: `Tôi đã nhận được: "${userMessage.content}". Đây là phản hồi mẫu.`,
      };
      setMessages((prev) => [...prev, fakeReply]);
      setIsLoading(false);
    }, 1000);
  };
  if (isAuthenticationLoading || isLoading) {
    return (
      <div className="mt-4 md:mt-10 mx-2 md:mx-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  } else
    return (
      <>
        {/* Nút tròn nổi */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          {isOpen ? <FaTimes size={20} /> : <FaFacebookMessenger size={22} />}
        </button>

        {/* Hộp chat nổi */}
        {isOpen && (
          <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 font-semibold text-center text-sm">
              Chat AI Giả Lập
            </div>

            {/* Nội dung chat */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-80 min-h-80">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-500 px-3 py-2 rounded-xl animate-pulse text-sm">
                    Đang trả lời...
                  </div>
                </div>
              )}
            </div>

            {/* Ô nhập tin nhắn */}
            <div className="flex border-t p-2 items-center gap-2">
              <input
                type="text"
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        )}
      </>
    );
};
