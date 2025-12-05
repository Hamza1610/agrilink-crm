/**
 * ChatSidebar Component
 * Collapsible sidebar showing chat session history
 */
'use client';

import { useState } from 'react';
import { X, Plus, Trash2, MessageSquare, PanelRightClose } from 'lucide-react';

interface ChatSession {
    session_id: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    preview: string;
}

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    isLoading?: boolean;
}

export default function ChatSidebar({
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    isOpen,
    onToggle,
    isLoading = false
}: ChatSidebarProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent session selection

        if (confirm('Delete this chat? This cannot be undone.')) {
            setDeletingId(sessionId);
            await onDeleteSession(sessionId);
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
          fixed md:static inset-y-0 right-0 z-50
          w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Chat History
                    </h2>
                    {/* Toggle button - always visible */}
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Hide chat history"
                    >
                        <PanelRightClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => {
                            onNewChat();
                            onToggle(); // Toggle sidebar after new chat
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            Loading sessions...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No chat history yet</p>
                            <p className="text-sm mt-1">Start a new conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {sessions.map((session) => (
                                <div
                                    key={session.session_id}
                                    onClick={() => {
                                        onSelectSession(session.session_id);
                                        onToggle(); // Toggle after selection
                                    }}
                                    className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors
                    ${session.session_id === currentSessionId
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }
                  `}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className={`
                        text-sm font-medium truncate
                        ${session.session_id === currentSessionId
                                                    ? 'text-blue-900 dark:text-blue-100'
                                                    : 'text-gray-900 dark:text-white'
                                                }
                      `}>
                                                {session.preview}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{formatDate(session.updated_at)}</span>
                                                <span>•</span>
                                                <span>{session.message_count} messages</span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(session.session_id, e)}
                                            disabled={deletingId === session.session_id}
                                            className={`
                        opacity-0 group-hover:opacity-100 transition-opacity
                        p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 
                        rounded text-red-600 dark:text-red-400
                        ${deletingId === session.session_id ? 'opacity-50' : ''}
                      `}
                                            title="Delete chat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
