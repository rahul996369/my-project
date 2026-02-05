import { useState, useRef, useEffect } from "react";
import { MessageCircle, Plus, RefreshCw, Send, User, X } from "lucide-react";
import { useProcessChatMutation } from "../services/chatApi";
import { Button } from "@/components/ui/button";
import { usePdfSummarizer } from "./usePdfSummarizer";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [processChat, { isLoading: isChatLoading }] = useProcessChatMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    selectedPdf,
    selectedPdfName,
    isPdfLoading,
    fileInputRef,
    openPicker,
    handlePdfSelect,
    clearSelectedPdf,
    summarizeSelectedPdf,
  } = usePdfSummarizer();

  const isLoading = isChatLoading || isPdfLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (isLoading) return;

    const hasPdf = selectedPdf != null;
    const hasText = input.trim().length > 0;
    if (!hasPdf && !hasText) return;

    if (hasPdf) {
      const pdfName = selectedPdf?.name ?? "PDF";
      const optionalMessage = input.trim();

      const userMessage: Message = {
        id: Date.now().toString(),
        text: optionalMessage.length > 0 ? `📎 ${pdfName}\n\n${optionalMessage}` : `📎 ${pdfName}`,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const result = await summarizeSelectedPdf(optionalMessage);
      const assistantText = result.reply ?? result.error ?? "Sorry, there was an error summarizing the PDF.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: assistantText,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await processChat({ message: input.trim() }).unwrap();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, there was an error processing your message.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setInput("");
    clearSelectedPdf();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    <div className="flex flex-col flex-1 min-h-0 bg-[#292826] text-[#F9D342]">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto">
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
                        <User className="h-3.5 w-3.5 text-[#292826] sm:h-4 sm:w-4" />
                      ) : (
                        <MessageCircle className="h-3.5 w-3.5 text-[#292826] sm:h-4 sm:w-4" />
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
                      <MessageCircle className="h-3.5 w-3.5 text-[#292826] sm:h-4 sm:w-4" />
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

      {/* Input Area - flex-shrink-0 keeps it at the bottom */}
      <div className="flex-shrink-0 border-t border-white/20 bg-[#292826]">
        <div className="max-w-3xl mx-auto pt-2 px-2 sm:px-4">
          <div className="flex items-end gap-2 p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
              aria-hidden
            />
            <div className="flex-1 relative">
              {selectedPdfName && (
                <div className="absolute left-2 top-2 z-10">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300 bg-black/20 rounded px-2 py-1 max-w-[calc(100%-6.5rem)]">
                    <Plus className="h-3.5 w-3.5 text-[#F9D342]" />
                    <span className="truncate">{selectedPdfName}</span>
                    <button
                      type="button"
                      onClick={clearSelectedPdf}
                      className="p-0.5 rounded hover:bg-white/10"
                      title="Remove PDF"
                      aria-label="Remove PDF"
                      disabled={isLoading}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={selectedPdfName ? "" : "Ask any thing.."}
                rows={1}
                className={`w-full resize-none bg-[#292826] text-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-20 sm:pr-24 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#F9D342] border border-[#F9D342] placeholder-gray-400 max-h-[200px] break-words overflow-x-hidden overflow-y-hidden ${selectedPdfName ? "pt-10" : ""}`}
                disabled={isLoading}
                style={{ minHeight: "44px" }}
              />
              <div className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 flex items-center gap-1">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  size="icon"
                  variant="outline"
                  className="p-1 sm:p-1.5 h-7 w-7 sm:h-8 sm:w-8"
                  title="Clear chat"
                >
                  <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  onClick={openPicker}
                  disabled={isLoading}
                  size="icon"
                  variant="outline"
                  className="p-1 sm:p-1.5 h-7 w-7 sm:h-8 sm:w-8"
                  title="Attach PDF"
                  aria-label="Attach PDF"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedPdf) || isLoading}
                  size="icon"
                  variant="outline"
                  className="p-1 sm:p-1.5 h-7 w-7 sm:h-8 sm:w-8"
                  title="Send message"
                >
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
