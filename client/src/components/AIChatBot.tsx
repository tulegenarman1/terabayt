import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { trpc } from "@/lib/trpc";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Привет! Я BAYTBOT — ИИ-помощник Terabayt.kz. Помогу вам подобрать идеальную электронику или компьютерную технику. Что именно вы ищете?",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const lastNormalizedInputRef = useRef<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.ai.chat.useMutation();

  const normalize = (text: string) => text.toLowerCase().trim().replace(/[!?. ,/\\-]/g, "").replace(/\s+/g, "");

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isLoading]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const handleSend = async (manual: boolean = true) => {
    const currentInput = input.trim();
    if (!currentInput || chatMutation.isLoading) return;

    const normalized = normalize(currentInput);
    
    // 1. Minimum length check
    if (currentInput.length < 5) {
      // Don't show error for auto-send, only manual
      if (manual) {
        setMessages(prev => [...prev, { role: "assistant", content: "Пожалуйста, напишите чуть подробнее (минимум 5 символов)." }]);
      }
      return;
    }

    // 2. Protection against repeated requests
    if (normalized === lastNormalizedInputRef.current && manual) {
      // If same as last, we could just show it from cache but the server does that too.
      // Let's just prevent the call if it's identical and was just sent.
    }

    // 3. Frequency control
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 2000) {
      if (manual) {
        setMessages(prev => [...prev, { role: "assistant", content: "Подождите пару секунд..." }]);
      }
      return;
    }

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const userMessage = currentInput;
    setInput("");
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    lastRequestTimeRef.current = now;
    lastNormalizedInputRef.current = normalized;

    try {
      const response = await chatMutation.mutateAsync({
        messages: [{ role: "user", content: userMessage }],
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      let errorMessage = "Извините, произошла ошибка.";
      
      if (error.message?.includes("Лимит")) {
        errorMessage = error.message;
      } else if (error.shape?.data?.code === "TOO_MANY_REQUESTS") {
        errorMessage = error.message || "Слишком много запросов. Пожалуйста, подождите.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">BAYTBOT</h3>
                  <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Terabayt.kz Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar"
            >
              <div className="space-y-4 pr-1">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-black font-medium shadow-lg shadow-emerald-500/10"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        {msg.role === "user" ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-tighter">
                          {msg.role === "user" ? "Вы" : "BAYTBOT"}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatMutation.isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground border border-border p-3 rounded-2xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span className="text-xs font-medium">Думаю...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(true);
                }}
                className="flex gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Задайте вопрос по технике..."
                    className="bg-card border-border focus:border-emerald-500 text-sm h-11 pr-10"
                  />
                  {isTyping && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || chatMutation.isLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black h-11 w-11 p-0 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 group relative"
      >
        {/* Button Background with overflow-hidden for the hover effect */}
        <div className="absolute inset-0 bg-emerald-500 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </div>
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7 text-black relative z-10" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center relative w-full h-full"
            >
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                <motion.div
                  variants={{
                    initial: { rotate: 0, y: 0 },
                    hover: { rotate: -15, y: -2 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative"
                >
                  <Bot className="w-8 h-8 text-black relative z-10" />
                  {/* Blinking Eyes Overlay */}
                  <motion.div 
                    animate={{ 
                      scaleY: [0, 0, 1, 0, 0],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      times: [0, 0.9, 0.95, 1, 1],
                      ease: "easeInOut"
                    }}
                    className="absolute top-[11px] left-[7px] right-[7px] h-[6px] bg-emerald-500 z-20 origin-center"
                  />
                </motion.div>
                <motion.span 
                  variants={{
                    initial: { opacity: 0, scale: 0, x: 0, y: 0 },
                    hover: { opacity: 1, scale: 1, x: 8, y: -8 }
                  }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-white font-black text-lg pointer-events-none z-[120] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  ?
                </motion.span>
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
