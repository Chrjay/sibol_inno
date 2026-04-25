import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Sprout, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";

const QUICK_QUESTIONS = [
  "Paano ako makakapag-apply sa TESDA?",
  "What programs are available for small business?",
  "Ano ang SLP program ng DSWD?",
  "How do I start a sari-sari store?",
  "Paano makakuha ng livelihood kit?",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: history = [], isLoading } = trpc.chat.history.useQuery();
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => {
      utils.chat.history.invalidate();
    },
    onError: () => toast.error("Hindi mapadala ang mensahe. / Could not send message."),
  });
  const clearChat = trpc.chat.clear.useMutation({
    onSuccess: () => {
      utils.chat.history.invalidate();
      toast.success("Naliinis ang chat. / Chat cleared.");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sendMessage.isPending]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    sendMessage.mutate({ message: msg });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.16 145)" }}>
            AI Gabay / AI Guide
          </p>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>
            Sibol Chat
          </h1>
        </div>
        {history.length > 0 && (
          <button onClick={() => clearChat.mutate()}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground touch-target"
            title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Bot avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, oklch(0.88 0.08 145), oklch(0.93 0.05 165))" }}>
              <Sprout className="w-8 h-8" style={{ color: "oklch(0.52 0.16 145)" }} />
            </div>
            <h2 className="font-serif text-lg font-semibold mb-2" style={{ color: "oklch(0.28 0.04 280)" }}>
              Kumusta! Ako si Sibol AI.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Tanungin mo ako tungkol sa iyong kabuhayan, mga programa ng gobyerno, o anumang tulong na kailangan mo. Ask me anything about livelihood programs and opportunities!
            </p>

            {/* Quick questions */}
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Subukan ang mga tanong na ito / Try these:</p>
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all hover:border-primary/40 touch-target"
                  style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)", color: "oklch(0.38 0.06 280)" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {history.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  msg.role === "user"
                    ? "bg-primary"
                    : "bg-gradient-to-br from-[oklch(0.88_0.08_145)] to-[oklch(0.93_0.05_165)]"
                )}>
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Sprout className="w-3.5 h-3.5" style={{ color: "oklch(0.52 0.16 145)" }} />
                  )}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : "rounded-tl-sm"
                )}
                  style={msg.role === "user"
                    ? { background: "oklch(0.52 0.16 145)", color: "white" }
                    : { background: "oklch(0.99 0.005 280 / 0.85)", border: "1px solid oklch(0.9 0.02 280 / 0.6)", color: "oklch(0.28 0.04 280)" }
                  }>
                  {msg.role === "assistant" ? (
                    <Streamdown className="prose prose-sm max-w-none text-inherit">{msg.content}</Streamdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sendMessage.isPending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, oklch(0.88 0.08 145), oklch(0.93 0.05 165))" }}>
                  <Sprout className="w-3.5 h-3.5" style={{ color: "oklch(0.52 0.16 145)" }} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
                  style={{ background: "oklch(0.99 0.005 280 / 0.85)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 p-2 rounded-2xl"
          style={{ background: "oklch(0.99 0.005 280 / 0.85)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Magtanong sa Filipino o English..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm px-2"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            size="icon"
            className="w-10 h-10 rounded-xl flex-shrink-0"
            style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Sumasagot sa Filipino at English / Responds in Filipino and English
        </p>
      </div>
    </div>
  );
}
