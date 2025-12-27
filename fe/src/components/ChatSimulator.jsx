import React, { useState, useRef, useEffect } from "react";
import getBaseUrl from "../util/chatBaseUrl";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import { getImgUrl } from "../util/getImgUrl";
import { Link } from "react-router-dom";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoAdd, IoTrashOutline, IoMenuOutline, IoClose, IoSend } from "react-icons/io5";

export const ChatSimulator = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);

  const { data: logo } = useGetImageByTypeQuery("logo");
  const userId = localStorage.getItem("userId");

  // Load danh sách chat khi component mount
  useEffect(() => {
    loadUserChats();
  }, []);

  // Load messages khi chọn chat
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load danh sách chat của user
  const loadUserChats = async (skipAutoCreate = false) => {
    try {
      setIsLoadingChats(true);
      const response = await fetch(
        `${getBaseUrl()}/v1/chats?user_id=${userId}`
      );
      
      if (!response.ok) {
        console.error('Failed to load chats:', response.status);
        setChats([]);
        return;
      }
      
      const data = await response.json();
      setChats(data.chats || []);
      
      if (!skipAutoCreate && (!data.chats || data.chats.length === 0)) {
        await createNewChat();
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Tạo chat mới
  const createNewChat = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/v1/chats?user_id=${userId}`,
        { method: "POST" }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      await loadUserChats(true);
      setCurrentChatId(data.chat_id);
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Không thể tạo chat mới. Vui lòng thử lại.");
    }
  };

  // Load messages của một chat
  const loadChatMessages = async (chatId) => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/v1/chats/${chatId}/messages?user_id=${userId}`
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  // Xóa chat
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();

    if (!confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      return;
    }

    try {
      const response = await fetch(
        `${getBaseUrl()}/v1/chats/${chatId}?user_id=${userId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        await loadUserChats(true);
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Gửi message
  const handleSend = () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const esUrl = `${getBaseUrl()}/v1/chatbot?query=${encodeURIComponent(
      input
    )}&user_id=${userId}&chat_id=${currentChatId}`;
    
    const es = new EventSource(esUrl);
    let assistantMessage = "";

    es.onmessage = (event) => {
      if (!event.data) return;

      try {
        const parsed = JSON.parse(event.data);

        if (parsed.text === "[DONE]") {
          setIsLoading(false);
          es.close();
          loadUserChats(true);
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

          assistantMessage += content;

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content = assistantMessage;
            } else {
              newMessages.push({
                role: "assistant",
                content: assistantMessage,
              });
            }
            
            return newMessages;
          });
        }
      } catch (err) {
        console.error("Error parse chunk:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Lỗi khi xử lý phản hồi" },
        ]);
        setIsLoading(false);
        es.close();
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kết nối bị gián đoạn" },
      ]);
      setIsLoading(false);
      es.close();
    };
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        } transition-all duration-300 ease-in-out bg-white flex flex-col shadow-xl border-r border-gray-100 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white px-5 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] group"
          >
            <IoAdd size={22} className="transition-transform group-hover:rotate-90" />
            <span className="font-semibold text-sm tracking-wide">Tạo Chat Mới</span>
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-sky-600 mb-4 px-3 uppercase tracking-wider">
            Lịch sử trò chuyện
          </div>
          
          {isLoadingChats ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-gray-200 border-t-sky-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <IoChatbubbleEllipsesOutline size={20} className="text-sky-500" />
                </div>
              </div>
              <p className="text-gray-500 text-sm">Đang tải...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IoChatbubbleEllipsesOutline size={28} className="text-sky-400" />
              </div>
              <p className="text-gray-500 text-sm">Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`group flex items-center gap-4 p-4 rounded-xl mb-2 cursor-pointer transition-all duration-200 ${
                    currentChatId === chat.id 
                      ? "bg-gradient-to-r from-sky-50 to-cyan-50 shadow-sm border-l-4 border-sky-500" 
                      : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentChatId === chat.id 
                      ? "bg-sky-100 text-sky-600" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    <IoChatbubbleEllipsesOutline size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm mb-1 text-gray-800">
                      {chat.title || "Cuộc trò chuyện mới"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{chat.lastMessage || "Bắt đầu trò chuyện..."}</div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:text-red-500"
                  >
                    <IoTrashOutline size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-base font-bold text-white shadow-md">
                U
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-0.5 text-gray-800">Người dùng</div>
              <div className="text-xs text-gray-600 font-mono truncate">ID: {userId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 hover:bg-sky-50 rounded-xl transition-all duration-200 hover:shadow-sm active:scale-95 text-gray-600 hover:text-sky-600"
          >
            {sidebarOpen ? <IoClose size={22} /> : <IoMenuOutline size={22} />}
          </button>
          <Link to={"/"} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 p-2 shadow-md">
              <img
                src={getImgUrl(logo?.url)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Y Khoa Trí Tuệ
            </h1>
            <p className="text-gray-600 text-sm">Trợ lý y tế AI thông minh</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-sky-50/30 to-white">
          {currentChatId ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  <div
                    className={`flex gap-4 max-w-[80%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-md ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      >
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={`rounded-2xl px-5 py-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                      <div className={`text-xs mt-2 px-1 ${
                        msg.role === "user" 
                          ? "text-right text-sky-600" 
                          : "text-left text-gray-500"
                      }`}>
                        {msg.role === "user" ? "Bạn" : "Trợ lý AI"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-base font-bold text-gray-700 shadow-md">
                        AI
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-gray-600 ml-2">Đang trả lời...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-sky-100">
                  <IoChatbubbleEllipsesOutline size={48} className="text-sky-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Chào mừng đến với Y Khoa Trí Tuệ
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Hãy bắt đầu cuộc trò chuyện với trợ lý AI của chúng tôi. 
                  Chọn một chat có sẵn hoặc tạo chat mới để được tư vấn sức khỏe.
                </p>
                <button
                  onClick={createNewChat}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <IoAdd size={22} />
                  Bắt đầu trò chuyện mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {currentChatId && (
          <div className="border-t border-gray-100 bg-white p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-2xl blur opacity-10"></div>
                  <div className="relative bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 transition-all duration-200">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Nhập câu hỏi về sức khỏe của bạn..."
                      className="w-full bg-transparent outline-none text-[15px] placeholder-gray-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`p-4 rounded-2xl shadow-lg transition-all duration-200 active:scale-95 ${
                    isLoading || !input.trim()
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl"
                  }`}
                >
                  <IoSend size={22} className="text-white" />
                </button>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Thông tin được cung cấp chỉ mang tính tham khảo và không thay thế cho chẩn đoán y tế
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};