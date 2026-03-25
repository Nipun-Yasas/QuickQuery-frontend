"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bot, Send, Plus, Menu, X, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

interface Document {
  id: string;
  name: string;
  updatedAt: string;
}

const initialDocuments: Document[] = [
  { id: "1", name: "DeepSeek_V3_RAG_Paper.pdf", updatedAt: "2 hours ago" },
  { id: "2", name: "Modern_Web_Development_2025.txt", updatedAt: "Yesterday" },
  { id: "3", name: "Financial_Report_Q4.pdf", updatedAt: "Mar 15, 2024" },
];

const initialChatHistories: Record<string, Message[]> = {
  "1": [
    {
      id: 1,
      role: "user",
      content: "Can you summarize the DeepSeek V3 architecture?",
    },
    {
      id: 2,
      role: "bot",
      content:
        "DeepSeek V3 utilizes a MoE (Mixture of Experts) architecture with 671B parameters. It features MLA (Multi-head Latent Attention) for efficient inference and Grouped Query Attention. The paper highlights significant improvements in RAG latency through optimized KV cache management.",
    },
  ],
  "2": [
    {
      id: 1,
      role: "user",
      content: "What are the key trends for 2025 in web dev?",
    },
    {
      id: 2,
      role: "bot",
      content: "According to the document, the key trends are: (1) AI-driven development as standard, (2) Edge-first rendering with Next.js 16, (3) WASM becoming mainstream for performance-critical modules, and (4) Decentralized identity systems using SSI.",
    },
  ],
  "3": [
    {
      id: 1,
      role: "user",
      content: "Show me the revenue growth for Q4.",
    },
    {
      id: 2,
      role: "bot",
      content: "The Q4 revenue grew by 18.5% year-over-year, reaching $24.7M. This was primarily driven by the expansion of the SaaS enterprise tier and a 12% reduction in operational churn among mid-market clients.",
    },
  ],
};

export default function QuickQuery() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(initialDocuments[0].id);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(initialChatHistories);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeMessages = useMemo(() => {
    return activeDocumentId ? chatHistories[activeDocumentId] || [] : [];
  }, [activeDocumentId, chatHistories]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = () => {
    if (!input.trim() || !activeDocumentId) return;
    
    const newMsg: Message = { id: Date.now(), role: "user", content: input };
    
    setChatHistories((prev) => ({
      ...prev,
      [activeDocumentId]: [...(prev[activeDocumentId] || []), newMsg],
    }));
    
    setInput("");
    
    // Placeholder bot reply
    setTimeout(() => {
      setChatHistories((prev) => ({
        ...prev,
        [activeDocumentId]: [
          ...(prev[activeDocumentId] || []),
          {
            id: Date.now() + 1,
            role: "bot",
            content: "I'm processing the document context to provide an accurate answer...",
          },
        ],
      }));
    }, 1000);
  };

  const handleNewChat = () => {
    const newId = (documents.length + 1).toString();
    const newDoc: Document = { 
      id: newId, 
      name: `Untitiled Document ${newId}.pdf`, 
      updatedAt: "Just now" 
    };
    setDocuments([newDoc, ...documents]);
    setActiveDocumentId(newId);
    setChatHistories(prev => ({ ...prev, [newId]: [] }));
  };

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-backgroundSecondary backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`${isSidebarOpen ? "w-80 shadow-2xl lg:shadow-none" : "w-0"} transition-all duration-300 ease-in-out border-r border-borderPrimary lg:relative fixed inset-y-0 left-0 z-50 bg-background overflow-hidden`}>
          <Sidebar 
            documents={documents} 
            activeDocumentId={activeDocumentId} 
             onSelectDocument={(id) => {
              setActiveDocumentId(id);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }} 
            onNewChat={handleNewChat}
            onClose={() => setIsSidebarOpen(false)}
          />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Toggle Sidebar Button - Desktop Overlay */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-background border border-borderPrimary p-1 rounded-r-lg hover:bg-hoverPrimary transition-colors group"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4 text-textSecondary group-hover:text-primary" /> : <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary" />}
        </button>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-hoverPrimary rounded-lg text-textSecondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
               <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Bot className="w-5 h-5" />
               </div>
               <div className="min-w-0">
                  <h1 className="font-semibold text-sm truncate">
                    {activeDocument ? activeDocument.name : "QuickQuery AI"}
                  </h1>
                  
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle/>
             <div className="hidden sm:block">
               <UserButton />
             </div>
             <button className="lg:hidden p-2 -mr-2 hover:bg-hoverPrimary rounded-lg text-textSecondary">
               <Plus className="w-5 h-5" onClick={handleNewChat} />
             </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 no-visible-scrollbar bg-[radial-gradient(circle_at_top_right,var(--primary)/3%,transparent_30%),radial-gradient(circle_at_bottom_left,var(--primary)/2%,transparent_40%)]">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {activeMessages.length > 0 ? (
              activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
                    msg.role === "bot" 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-backgroundSecondary border-borderPrimary"
                  }`}>
                    {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <UserButton />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10"
                        : "bg-backgroundSecondary text-textPrimary border border-borderPrimary rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 animate-pulse">
                     <FileText className="w-10 h-10 text-primary/40" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-background border border-borderPrimary flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-primary" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-textPrimary tracking-tight to-textPrimary/60">
                    Welcome to QuickQuery
                  </h2>
                  <p className="text-sm text-textSecondary max-w-md mx-auto">
                    Upload a document and ask questions to uncover insights instantly. I can help you summarize, analyze, and extract key information.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {["Summarize this document", "Extract key findings", "What are the limitations?", "Explain like I'm five"].map((prompt) => (
                    <button 
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="text-left px-4 py-3 rounded-xl border border-borderPrimary bg-backgroundSecondary/50 hover:bg-hoverPrimary hover:border-primary/30 transition-all text-xs text-textSecondary hover:text-primary font-medium"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-borderPrimary px-4 py-6 bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="relative flex flex-col w-full rounded-2xl border border-borderPrimary bg-backgroundSecondary shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
              {/* Textarea */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about your document..."
                rows={1}
                className="w-full bg-transparent px-5 pt-4 pb-20 text-sm outline-none placeholder:text-textSecondary/70 resize-none min-h-[120px]"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />

              {/* Action Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border-t border-borderPrimary/50 pt-3">
                <div className="flex items-center gap-2">
                   <button
                    type="button"
                    className="p-2 rounded-lg bg-background border border-borderPrimary hover:bg-hoverPrimary transition-all group"
                  >
                    <Plus className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                  </button>
                  <span className="text-[10px] text-textSecondary font-medium">Add document</span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="hidden sm:block text-[10px] text-textSecondary italic">
                    AI can make mistakes. Verify important info.
                  </p>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || !activeDocumentId}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white hover:bg-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 active:scale-95"
                  >
                    <span className="text-xs font-semibold">Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

