"use client";

import { FileText, MessageSquare, Plus, Search, MoreVertical, X } from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  name: string;
  updatedAt: string;
}

interface SidebarProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
}

export function Sidebar({ documents, activeDocumentId, onSelectDocument, onNewChat, onClose }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-borderPrimary bg-background flex flex-col h-full transition-all duration-300 ease-in-out">
      {/* Sidebar Header */}
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
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-hover transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium text-sm">New Chat</span>
        </button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-backgroundSecondary border border-borderPrimary rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-textSecondary"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 no-visible-scrollbar">
        <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-textSecondary/60 mb-2">
          Recent Documents
        </p>
        
        {filteredDocuments.length > 0 ? (
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
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDocument(doc.id);
                }
              }}
            >
              <div className={`p-2 rounded-lg ${
                activeDocumentId === doc.id ? "bg-primary/10" : "bg-backgroundSecondary border border-borderPrimary"
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-[11px] text-textSecondary mt-0.5">{doc.updatedAt}</p>
              </div>

              {activeDocumentId === doc.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       // More options logic here if needed
                     }}
                     className="p-1 hover:bg-primary/10 rounded-md text-textSecondary hover:text-primary transition-colors"
                   >
                     <MoreVertical className="w-4 h-4" />
                   </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-3 bg-backgroundSecondary rounded-full mb-3">
              <Search className="w-5 h-5 text-textSecondary/50" />
            </div>
            <p className="text-sm text-textSecondary">No documents found</p>
            <p className="text-xs text-textSecondary/60 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      
    </aside>
  );
}
