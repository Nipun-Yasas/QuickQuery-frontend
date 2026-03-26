"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import {
  Bot,
  Send,
  Plus,
  Menu,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { ThemeToggle } from "../components/ThemeToggle";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}


export default function QuickQuery() {
  const { isLoaded } = useAuth();
  const { authFetch } = useApi();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeMessages: Message[] = useMemo(
    () => (activeDocumentId ? chatHistories[activeDocumentId] ?? [] : []),
    [activeDocumentId, chatHistories]
  );

  const activeDocument = documents.find((d) => d.id === activeDocumentId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isSending]);

  useEffect(() => {
    if (!isLoaded) return;

    const loadDocuments = async () => {
      setIsLoadingDocs(true);
      setDocsError(null);
      try {
        const res = await authFetch("/documents");
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        const docs: Document[] = (data.documents ?? []).map(
          (d: any): Document => ({
            id: d.id ?? d.document_id ?? d._id ?? "",
            name: d.name ?? d.filename ?? d.file_name ?? "Untitled",
            uploadedAt: d.uploadedAt ?? d.uploaded_at ?? d.created_at ?? new Date().toISOString(),
          })
        );
        setDocuments(docs);
        if (docs.length > 0) setActiveDocumentId(docs[0].id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load documents";
        setDocsError(msg);
        toast.error("Could not load documents. Is the backend running?");
      } finally {
        setIsLoadingDocs(false);
      }
    };

    loadDocuments();
  }, [isLoaded]);

  useEffect(() => {
    if (!activeDocumentId) return;
    if (chatHistories[activeDocumentId] !== undefined) return;

    const loadChat = async () => {
      setIsLoadingChat(true);
      try {
        const res = await authFetch(`/documents/${activeDocumentId}/chat`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        const history: Message[] = (data.messages ?? []).map(
          (m: { id: string; role: string; content: string }) => ({
            id: m.id,
            // Backend uses "assistant", frontend uses "bot"
            role: (m.role === "assistant" ? "bot" : m.role) as "user" | "bot",
            content: m.content,
          })
        );
        setChatHistories((prev) => ({ ...prev, [activeDocumentId]: history }));
      } catch {
        toast.error("Could not load chat history for this document.");
        setChatHistories((prev) => ({ ...prev, [activeDocumentId]: [] }));
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChat();
  }, [activeDocumentId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeDocumentId || isSending) return;

    const question = input.trim();
    const userMsg: Message = { id: `tmp-${Date.now()}`, role: "user", content: question };

    setChatHistories((prev) => ({
      ...prev,
      [activeDocumentId]: [...(prev[activeDocumentId] ?? []), userMsg],
    }));
    setInput("");
    setIsSending(true);

    try {
      const res = await authFetch("/query", {
        method: "POST",
        body: JSON.stringify({ question, document_id: activeDocumentId }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: data.answer,
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeDocumentId]: [...(prev[activeDocumentId] ?? []), botMsg],
      }));
    } catch {
      toast.error("Failed to get a response. Please try again.");
      // Remove the optimistically added user message on failure
      setChatHistories((prev) => ({
        ...prev,
        [activeDocumentId]: (prev[activeDocumentId] ?? []).filter(
          (m) => m.id !== userMsg.id
        ),
      }));
      setInput(question); // Restore input so the user doesn't lose their message
    } finally {
      setIsSending(false);
    }
  }, [input, activeDocumentId, isSending, authFetch]);

  // ── Upload document ────────────────────────────────────────────────────────
  const handleUpload = useCallback(
    async (file: File) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported.");
        return;
      }

      setIsUploading(true);
      toast.loading("Uploading and indexing document…", { id: "upload" });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await authFetch("/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail ?? `Server responded with ${res.status}`);
        }
        const data = await res.json();

        const newDoc: Document = {
          id: data.document_id,
          name: file.name,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments((prev) => [newDoc, ...prev]);
        // Pre-seed an empty chat history for the new doc
        setChatHistories((prev) => ({ ...prev, [newDoc.id]: [] }));
        setActiveDocumentId(newDoc.id);
        toast.success("Document uploaded and indexed!", { id: "upload" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(msg, { id: "upload" });
      } finally {
        setIsUploading(false);
        // Reset the file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [authFetch]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      toast.loading("Deleting document…", { id: "delete" });
      try {
        const res = await authFetch(`/documents/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail ?? `Server responded with ${res.status}`);
        }
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setChatHistories((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        if (activeDocumentId === id) {
          setActiveDocumentId((prev) => {
            const remaining = documents.filter((d) => d.id !== id);
            return remaining.length > 0 ? remaining[0].id : null;
          });
        }
        toast.success("Document deleted.", { id: "delete" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Delete failed";
        toast.error(msg, { id: "delete" });
      }
    },
    [authFetch, activeDocumentId, documents]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-backgroundSecondary/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-80 shadow-2xl lg:shadow-none" : "w-0"
          } transition-all duration-300 ease-in-out border-r border-borderPrimary lg:relative fixed inset-y-0 left-0 z-50 bg-background overflow-hidden`}
      >
        <Sidebar
          documents={documents}
          activeDocumentId={activeDocumentId}
          isLoading={isLoadingDocs}
          error={docsError}
          isUploading={isUploading}
          onSelectDocument={(id) => {
            setActiveDocumentId(id);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          onNewChat={() => fileInputRef.current?.click()}
          onDeleteDocument={handleDelete}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-background border border-borderPrimary p-1 rounded-r-lg hover:bg-hoverPrimary transition-colors group"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-textSecondary group-hover:text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary" />
          )}
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
            <ThemeToggle />
            <div className="hidden sm:block">
              <UserButton />
            </div>
            <button
              className="lg:hidden p-2 -mr-2 hover:bg-hoverPrimary rounded-lg text-textSecondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 no-visible-scrollbar bg-[radial-gradient(circle_at_top_right,var(--primary)/3%,transparent_30%),radial-gradient(circle_at_bottom_left,var(--primary)/2%,transparent_40%)]">
          <div className="max-w-3xl mx-auto w-full space-y-8">

            {/* ── Loading chat history ────────────────────────────── */}
            {isLoadingChat && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex items-start gap-4 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                    <div className="w-8 h-8 rounded-full bg-backgroundSecondary border border-borderPrimary animate-pulse flex-shrink-0" />
                    <div
                      className={`h-12 rounded-2xl animate-pulse bg-backgroundSecondary border border-borderPrimary ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Messages ────────────────────────────────────────── */}
            {!isLoadingChat &&
              activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${msg.role === "bot"
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-backgroundSecondary border-borderPrimary"
                      }`}
                  >
                    {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <UserButton />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed transition-all duration-300 ${msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10"
                        : "bg-backgroundSecondary text-textPrimary border border-borderPrimary rounded-tl-sm shadow-sm"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

            {/* ── Bot typing indicator ─────────────────────────────── */}
            {isSending && (
              <div className="flex items-start gap-4 flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-backgroundSecondary border border-borderPrimary rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-textSecondary">Thinking…</span>
                </div>
              </div>
            )}

            {/* ── Empty state ──────────────────────────────────────── */}
            {!isLoadingChat && !isLoadingDocs && activeMessages.length === 0 && !isSending && (
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
                    {activeDocumentId ? "Start asking questions" : "Welcome to QuickQuery"}
                  </h2>
                  <p className="text-sm text-textSecondary max-w-md mx-auto">
                    {activeDocumentId
                      ? "Ask anything about the selected document — I'll find the answers for you."
                      : "Upload a PDF and ask questions to uncover insights instantly."}
                  </p>
                </div>

                {activeDocumentId ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                    {["Summarize this document", "Extract key findings", "What are the limitations?", "Explain like I'm five"].map(
                      (prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="text-left px-4 py-3 rounded-xl border border-borderPrimary bg-backgroundSecondary/50 hover:bg-hoverPrimary hover:border-primary/30 transition-all text-xs text-textSecondary hover:text-primary font-medium"
                        >
                          {prompt}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-hover transition-all shadow-md shadow-primary/20 active:scale-95 disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">Upload a PDF</span>
                  </button>
                )}
              </div>
            )}

            {/* ── Docs loading skeleton ────────────────────────────── */}
            {isLoadingDocs && activeMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-textSecondary">Loading your documents…</p>
              </div>
            )}

            {/* ── Docs error ───────────────────────────────────────── */}
            {docsError && !isLoadingDocs && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm text-textSecondary text-center max-w-xs">
                  Could not connect to the backend. Make sure the FastAPI server is running at{" "}
                  <code className="text-primary text-xs">
                    {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
                  </code>
                  .
                </p>
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
                disabled={!activeDocumentId || isSending}
                placeholder={
                  !activeDocumentId
                    ? "Upload a document to start chatting…"
                    : "Ask anything about your document…"
                }
                rows={1}
                className="w-full bg-transparent px-5 pt-4 pb-20 text-sm outline-none placeholder:text-textSecondary/70 resize-none min-h-[120px] disabled:opacity-50"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />

              {/* Action Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border-t border-borderPrimary/50 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 rounded-lg bg-background border border-borderPrimary hover:bg-hoverPrimary transition-all group disabled:opacity-50"
                    title="Upload a PDF"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                    )}
                  </button>
                  <span className="text-[10px] text-textSecondary font-medium">
                    {isUploading ? "Uploading…" : "Add document"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="hidden sm:block text-[10px] text-textSecondary italic">
                    AI can make mistakes. Verify important info.
                  </p>
                  <button
                    type="button"
                    id="send-message-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || !activeDocumentId || isSending}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white hover:bg-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 active:scale-95"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span className="text-xs font-semibold">Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
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
