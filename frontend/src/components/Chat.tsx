import { useState, useRef, useEffect } from "react";
import { useProcessChatMutation } from "../services/chatApi";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [processChat, { isLoading }] = useProcessChatMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await processChat({ message: input.trim() }).unwrap();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your message.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#292826] text-[#F9D342]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-3 sm:px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-gray-200">
                How can I help you today?
              </h1>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-2 sm:px-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group w-full border-b border-black/20 bg-[#292826]`}
              >
                <div className="flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 text-sm sm:text-base max-w-3xl mx-auto">
                  {/* Avatar */}
                  <div className="flex-shrink-0 flex flex-col items-end">
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center bg-[#F9D342] text-[#292826]"
                    >
                      {message.sender === "user" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-white sm:w-4 sm:h-4"
                        >
                          <path
                            d="M8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-white sm:w-4 sm:h-4"
                        >
                          <path
                            d="M8 0C3.58 0 0 3.58 0 8c0 1.54.36 2.98.97 4.29L0 16l3.71-.97C5.02 15.64 6.46 16 8 16c4.42 0 8-3.58 8-8s-3.58-8-8-8z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap break-words text-gray-100 text-sm sm:text-base">
                        {message.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="group w-full border-b border-black/20 bg-[#292826]">
                <div className="flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 text-sm sm:text-base max-w-3xl mx-auto">
                  <div className="flex-shrink-0 flex flex-col items-end">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center bg-[#F9D342] text-[#292826]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-white sm:w-4 sm:h-4"
                      >
                        <path
                          d="M8 0C3.58 0 0 3.58 0 8c0 1.54.36 2.98.97 4.29L0 16l3.71-.97C5.02 15.64 6.46 16 8 16c4.42 0 8-3.58 8-8s-3.58-8-8-8z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/20 bg-[#292826]">
        <div className="max-w-3xl mx-auto pt-2 px-2 sm:px-4">
          <div className="flex items-end gap-2 p-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                rows={1}
                className="w-full resize-none bg-[#292826] text-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#F9D342] border border-[#F9D342] placeholder-gray-400 max-h-[200px] overflow-y-auto"
                disabled={isLoading}
                style={{ minHeight: "44px" }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                variant="outline"
                className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 p-1 sm:p-1.5 h-7 w-7 sm:h-8 sm:w-8"
                title="Send message"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="sm:w-4 sm:h-4"
                >
                  <path
                    d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
}
