import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: Date;
}

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/ai-sports-coach-logo-FJKcmErj6xRSE7FgfsM833.webp";

export default function CommunityChat() {
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // tRPC hooks
  const getMessages = trpc.chat.getMessages.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const sendMessage = trpc.chat.sendMessage.useMutation();

  // تحديث الرسائل
  useEffect(() => {
    if (getMessages.data) {
      setMessages(getMessages.data);
      setIsLoading(false);
    }
  }, [getMessages.data]);

  // التمرير للأسفل عند وصول رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const newMessage = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      const result = await sendMessage.mutateAsync({ content: newMessage });

      setMessages((prev) => [
        ...prev,
        {
          id: result.id,
          userId: user.id,
          userName: user.name || "Anonymous",
          content: newMessage,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(newMessage); // استرجاع الرسالة في حالة الفشل
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-primary">AI Sports Coach</span>
            </div>
            <a href="/" className="text-primary hover:underline">
              Back
            </a>
          </div>
        </nav>

        <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="p-12 text-center max-w-md">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to join the community chat and connect with other users.
            </p>
            <a href="/">
              <Button className="w-full bg-primary">Go to Home</Button>
            </a>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">AI Sports Coach</span>
          </div>
          <a href="/" className="text-primary hover:underline">
            Back
          </a>
        </div>
      </nav>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Community Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Connect with other fitness enthusiasts and share tips
                </p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-[500px] overflow-y-auto mb-6 p-4 bg-secondary/50 rounded-lg space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Be the first to start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          msg.userId === user?.id
                            ? "bg-primary text-white"
                            : "bg-background text-foreground border border-border"
                        }`}
                      >
                        {msg.userId !== user?.id && (
                          <p className="text-xs font-semibold opacity-70 mb-1">
                            {msg.userName}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim()}
                className="bg-primary"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> This chat is connected to n8n. You can integrate it with
                WhatsApp, Telegram, or other messaging platforms!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
