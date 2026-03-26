"use client";

import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  X,
  Loader2,
  Upload,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}

interface SidebarProps {
  documents: Document[];
  activeDocumentId: string | null;
  isLoading?: boolean;
  isUploading?: boolean;
  error?: string | null;
  onSelectDocument: (id: string) => void;
  /** Called when user clicks "New Chat" — parent opens the file picker */
  onNewChat: () => void;
  onDeleteDocument: (id: string) => Promise<void>;
  onClose?: () => void;
}

/** Format an ISO date string into a relative/friendly label */
function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function Sidebar({
  documents,
  activeDocumentId,
  isLoading = false,
  isUploading = false,
  error = null,
  onSelectDocument,
  onNewChat,
  onDeleteDocument,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeletingId(id);
    try {
      await onDeleteDocument(id);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-borderPrimary bg-background flex flex-col h-full transition-all duration-300 ease-in-out">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-borderPrimary space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight px-1">QuickQuery</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-hoverPrimary rounded-lg text-textSecondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload / New Chat button */}
        <button
          onClick={onNewChat}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-hover transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span className="font-medium text-sm">
            {isUploading ? "Uploading…" : "Upload Document"}
          </span>
        </button>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-backgroundSecondary border border-borderPrimary rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-textSecondary"
          />
        </div>
      </div>

      {/* ── Document List ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 no-visible-scrollbar">
        <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-textSecondary/60 mb-2">
          Your Documents
        </p>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2 px-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-backgroundSecondary border border-borderPrimary animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-3 bg-backgroundSecondary border border-borderPrimary rounded animate-pulse"
                    style={{ width: `${60 + i * 10}%` }}
                  />
                  <div className="h-2 w-16 bg-backgroundSecondary border border-borderPrimary rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-xs text-textSecondary">Could not load documents.</p>
          </div>
        )}

        {/* Empty — no documents yet */}
        {!isLoading && !error && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
            <div className="p-3 bg-backgroundSecondary rounded-full border border-borderPrimary">
              <Plus className="w-5 h-5 text-textSecondary/50" />
            </div>
            <p className="text-sm text-textSecondary">No documents yet</p>
            <p className="text-xs text-textSecondary/60">
              Click &quot;Upload Document&quot; to get started
            </p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
            <div className="p-3 bg-backgroundSecondary rounded-full">
              <Search className="w-5 h-5 text-textSecondary/50" />
            </div>
            <p className="text-sm text-textSecondary">No documents found</p>
            <p className="text-xs text-textSecondary/60">Try a different search term</p>
          </div>
        )}

        {/* Document items */}
        {!isLoading &&
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className={`w-full group flex items-start gap-3 p-3 rounded-lg transition-all text-left relative cursor-pointer ${
                activeDocumentId === doc.id
                  ? "bg-primary/5 text-primary border border-primary/10"
                  : "hover:bg-hoverPrimary text-textPrimary"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectDocument(doc.id);
              }}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  activeDocumentId === doc.id
                    ? "bg-primary/10"
                    : "bg-backgroundSecondary border border-borderPrimary"
                }`}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  {formatDate(doc.uploadedAt)}
                </p>
              </div>

              {/* ⋮ menu — visible on hover for every document */}
              <div
                ref={openMenuId === doc.id ? menuRef : null}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                  }}
                  className="p-1 hover:bg-primary/10 rounded-md text-textSecondary hover:text-primary transition-colors"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                {openMenuId === doc.id && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-background border border-borderPrimary rounded-xl shadow-xl overflow-hidden">
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      disabled={deletingId === doc.id}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete document
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}
