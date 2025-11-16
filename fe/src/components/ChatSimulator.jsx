import React, { useState, useRef, useEffect } from "react";
import getBaseUrl from "../util/chatBaseUrl";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import { getImgUrl } from "../util/getImgUrl";
import { Link } from "react-router-dom";

export const ChatSimulator = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: logo } = useGetImageByTypeQuery("logo");

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const userId =  localStorage.getItem("userId");
    const esUrl = `${getBaseUrl()}/v1/chatbot?query=${encodeURIComponent(
      input
    )}&user_id=${userId}`;
    const es = new EventSource(esUrl);

    es.onmessage = (event) => {
      if (!event.data) return;

      try {
        const parsed = JSON.parse(event.data);

        if (parsed.text === "[DONE]") {
          setIsLoading(false);
          es.close();
        } else {
          let content = parsed.text;

          const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
          if (jsonMatch) {
            try {
              const data = JSON.parse(jsonMatch[1]);
              content = data.extracted_results || content;
            } catch (err) {
              console.error("Không parse được JSON trong text:", err);
            }
          }

          setMessages((prev) => [...prev, { role: "assistant", content }]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error parse chunk" },
        ]);
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kết nối SSE lỗi" },
      ]);
      setIsLoading(false);
      es.close();
    };
  };

  return (
    <div className="max-w-4xl h-screen mx-auto bg-white rounded-lg border border-gray-300 flex flex-col">
      {/* Header đơn giản */}
      <div className="bg-white border-b border-gray-300 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link to={"/"} className="flex-shrink-0">
            <img
              src={getImgUrl(logo?.url)}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Trợ lý y khoa</h1>
            <p className="text-gray-500 text-sm">Hỏi đáp về sức khỏe</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-300 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm">Đang trả lời...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-300 bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            Gửi
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-left">
          Thông tin được cung cấp chỉ mang tính tham khảo và không thay thế cho
          chẩn đoán hay điều trị y tế.
        </div>
      </div>
    </div>
  );
};
