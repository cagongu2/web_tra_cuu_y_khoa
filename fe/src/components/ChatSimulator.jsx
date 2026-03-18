import React, { useState, useRef, useEffect } from "react";
import getBaseUrl from "../util/chatBaseUrl";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import { getImgUrl } from "../util/getImgUrl";
import { Link } from "react-router-dom";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoAdd, IoTrashOutline, IoMenuOutline, IoClose, IoSend } from "react-icons/io5";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          assistantMessage += parsed.text;

          let displayMessage = assistantMessage;
          const jsonMatch = displayMessage.match(/```json\s*([\s\S]*?)```/);

          if (jsonMatch) {
            console.log("Tìm thấy JSON block rùi nha!", jsonMatch[0]);
            try {
              const data = JSON.parse(jsonMatch[1]);
              console.log("Parse thành công dữ liệu JSON:", data);
              let extracted = data.extracted_results || data.answer || "";

              // Nếu extracted lại là một JSON string (double encoded)
              if (typeof extracted === 'string' && extracted.includes('```json')) {
                const innerMatch = extracted.match(/```json\s*([\s\S]*?)```/);
                if (innerMatch) {
                  try {
                    extracted = JSON.parse(innerMatch[1]);
                  } catch (e) { }
                }
              }

              // Xử lý nếu kết quả là object chứa question/answer
              let formattedContent = "";
              if (typeof extracted === 'object' && extracted !== null) {
                formattedContent = Object.values(extracted)
                  .map(item => {
                    if (typeof item === 'object' && item.answer) return item.answer;
                    return typeof item === 'string' ? item : JSON.stringify(item);
                  })
                  .join('\n\n');
              } else {
                formattedContent = String(extracted);
              }

              // Hiển thị nguồn và độ tương thích
              if (data.source) {
                console.log("Phát hiện source thành công:", data.source, "Score:", data.similarity_score);
                const scoreHtml = (data.similarity_score && data.similarity_score !== "N/A")
                  ? ` | **Độ tương thích:** ${data.similarity_score}`
                  : '';
                formattedContent += `\n\n---\n*🔍 Nguồn: ${data.source}${scoreHtml}*`;
              } else {
                console.log("Không tìm thấy trường 'source' trong JSON trả về!");
              }

              // Thay thế cục JSON bằng chuỗi hiển thị
              displayMessage = displayMessage.replace(jsonMatch[0], formattedContent);

            } catch (err) {
              console.log("JSON lấp lửng / lỗi cú pháp:", err.message);
              // JSON chưa parse được (có thể đang stream chưa xong dấu ```)
            }
          } else {
             // console.log("Chunk này ko chứa format markdown json...");
          }

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];

            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content = displayMessage;
            } else {
              newMessages.push({
                role: "assistant",
                content: displayMessage,
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
    <div className="flex h-screen bg-gradient-to-br from-sky-50 to-white relative overflow-hidden">
      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 lg:relative z-50 transform ${sidebarOpen ? "translate-x-0 w-[280px] sm:w-80" : "-translate-x-full w-0"
          } transition-all duration-300 ease-in-out bg-white flex flex-col shadow-2xl lg:shadow-xl border-r border-gray-100 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={createNewChat}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] group"
          >
            <IoAdd size={20} className="transition-transform group-hover:rotate-90" />
            <span className="font-semibold text-sm tracking-wide">Tạo Chat Mới</span>
          </button>

          {/* Close button for mobile sidebar */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold text-sky-600 mb-3 px-3 uppercase tracking-wider">
            Lịch sử trò chuyện
          </div>

          {isLoadingChats ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-gray-200 border-t-sky-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <IoChatbubbleEllipsesOutline size={16} className="text-sky-500" />
                </div>
              </div>
              <p className="text-gray-500 text-xs">Đang tải...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IoChatbubbleEllipsesOutline size={24} className="text-sky-400" />
              </div>
              <p className="text-gray-500 text-xs text-balance px-4">Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentChatId === chat.id
                    ? "bg-gradient-to-r from-sky-50 to-cyan-50 shadow-sm border-l-4 border-sky-500"
                    : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                    }`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${currentChatId === chat.id
                    ? "bg-sky-100 text-sky-600"
                    : "bg-gray-100 text-gray-500"
                    }`}>
                    <IoChatbubbleEllipsesOutline size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm text-gray-800">
                      {chat.title || "Cuộc trò chuyện mới"}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{chat.lastMessage || "Bắt đầu trò chuyện..."}</div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="lg:opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-500"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                U
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs mb-0.5 text-gray-800">Người dùng</div>
              <div className="text-[10px] text-gray-500 font-mono truncate">ID: {userId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-sm z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 sm:p-3 hover:bg-sky-50 rounded-xl transition-all duration-200 hover:shadow-sm active:scale-95 text-gray-600 hover:text-sky-600"
          >
            <div className="hidden lg:block">
              {sidebarOpen ? <IoClose size={22} /> : <IoMenuOutline size={22} />}
            </div>
            <div className="lg:hidden">
              <IoMenuOutline size={22} />
            </div>
          </button>

          <Link to={"/"} className="flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 p-1.5 sm:p-2 shadow-md">
              <img
                src={getImgUrl(logo?.url)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent truncate">
              Chatbot Y Khoa
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-sm truncate">Trợ lý y tế AI thông minh</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-sky-50/30 to-white">
          {currentChatId ? (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div className={`flex gap-3 sm:gap-4 max-w-[92%] sm:max-w-[85%] lg:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className="flex-shrink-0 self-end sm:self-start">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-base font-bold shadow-md ${msg.role === "user"
                          ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                          }`}
                      >
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div
                        className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm ${msg.role === "user"
                          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                          }`}
                      >
                        <div className={`text-sm sm:text-[15px] leading-relaxed break-words ${msg.role === "assistant" ? "prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 text-black" : ""
                          }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className={`text-[10px] sm:text-xs mt-1.5 px-1 ${msg.role === "user"
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
                  <div className="flex gap-3 sm:gap-4 max-w-[92%] sm:max-w-[85%]">
                    <div className="flex-shrink-0 self-end sm:self-start">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs sm:text-base font-bold text-gray-700 shadow-md">
                        AI
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.2">
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-400 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-[11px] sm:text-sm text-gray-500 ml-2">Đang trả lời...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 sm:p-8">
              <div className="text-center max-w-sm sm:max-w-md">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sky-100 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg border border-sky-100">
                  <IoChatbubbleEllipsesOutline size={40} className="sm:text-[48px] text-sky-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                  Chào mừng đến với Y Khoa Trí Tuệ
                </h2>
                <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed px-6">
                  Bạn có thắc mắc gì về da liễu? Mình sẵn sàng hỗ trợ tra cứu thông tin y tế chính xác 24/7.
                </p>
                <button
                  onClick={createNewChat}
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <IoAdd size={20} />
                  Bắt đầu trò chuyện mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {currentChatId && (
          <div className="border-t border-gray-100 bg-white p-4 sm:p-6 pb-6 sm:pb-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 sm:gap-4 items-end">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-2xl blur opacity-5"></div>
                  <div className="relative bg-white border border-gray-200 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 transition-all duration-200">
                    <textarea
                      rows="1"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Nhập câu hỏi..."
                      className="w-full bg-transparent outline-none text-[14px] sm:text-[15px] placeholder-gray-400 resize-none max-h-32 py-0.5"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0 ${isLoading || !input.trim()
                    ? "bg-gray-200 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl"
                    }`}
                >
                  <IoSend size={20} className="text-white sm:text-[22px]" />
                </button>
              </div>
              <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400 text-center flex items-center justify-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="max-w-[280px] sm:max-w-none">Thông tin tham khảo, không thay thế chẩn đoán bác sĩ</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};