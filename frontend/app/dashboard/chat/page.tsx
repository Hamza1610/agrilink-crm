/**
/**
 * Chat page - AI Assistant Chat Interface
 */
'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Get token from localStorage (stored by authApi)
        const storedToken = localStorage.getItem('auth_token');
        setToken(storedToken);
    }, []);

    if (isLoading || !token) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // ProtectedRoute will handle redirect
    }

    return (
        <div className="h-screen">
            <ChatInterface userId={user.id} token={token} />
        </div>
    );
}
