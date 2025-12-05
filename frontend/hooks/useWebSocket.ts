/**
 * Custom React hook for WebSocket chat connection
 * Handles connection, reconnection, message sending/receiving
 */
import { useEffect, useRef, useState, useCallback } from 'react';

interface ChatMessage {
    type: 'text_message' | 'ai_message' | 'session_created' | 'voice_transcription' | 'error';
    content?: string;
    session_id?: string;
    timestamp?: string;
    language?: string;
    tts_audio_url?: string;
    transcription?: string;
    confidence?: number;
    error?: string;
    details?: string;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    messages: ChatMessage[];
    sessionId: string | null;
    sendMessage: (content: string) => void;
    uploadVoice: (audioBlob: Blob) => Promise<void>;
    clearMessages: () => void;
}

export function useWebSocket(userId: string, token: string): UseWebSocketReturn {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);


    const loadHistory = useCallback(async () => {
        if (!token || !userId) {
            console.log('[WS Frontend] Cannot load history - missing token or userId');
            return;
        }

        try {
            console.log('[WS Frontend] 📖 Loading chat history...');
            const response = await fetch(
                'http://localhost:8000/api/v1/chat/active-session',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('[WS Frontend] ✅ Loaded history:', data);

                // Set session ID
                setSessionId(data.session_id);

                // Convert backend messages to frontend format
                const formattedMessages: ChatMessage[] = [];
                if (data.messages && data.messages.length > 0) {
                    for (const msg of data.messages) {
                        if (msg.role === 'user') {
                            formattedMessages.push({
                                type: 'text_message',
                                content: msg.content,
                                session_id: data.session_id,
                                timestamp: msg.timestamp
                            });
                        } else if (msg.role === 'assistant') {
                            formattedMessages.push({
                                type: 'ai_message',
                                content: msg.content,
                                session_id: data.session_id,
                                timestamp: msg.timestamp
                            });
                        }
                    }
                }

                setMessages(formattedMessages);
                console.log(`[WS Frontend] 📚 Restored ${formattedMessages.length} messages`);
            } else {
                console.error('[WS Frontend] Failed to load history:', response.status);
            }
        } catch (error) {
            console.error('[WS Frontend] ❌ Error loading history:', error);
        }
    }, [token, userId]);

    const connect = useCallback(() => {
        if (!userId || !token) {
            console.log('[WS Frontend] Missing userId or token, skipping connection');
            return;
        }

        // Don't create multiple connections
        if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
            console.log('[WS Frontend] Connection already exists, skipping');
            return;
        }

        const wsUrl = `ws://localhost:8000/api/v1/chat/ws/chat/${userId}?token=${token}`;
        console.log('[WS Frontend] Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[WS Frontend] ✅ Connection opened successfully');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data: ChatMessage = JSON.parse(event.data);
                console.log('[WS Frontend] 📩 Received message:', data);

                // Handle session creation
                if (data.type === 'session_created') {
                    setSessionId(data.session_id || null);
                }

                // Add message to list
                setMessages(prev => [...prev, data]);
            } catch (error) {
                console.error('[WS Frontend] ❌ Failed to parse message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('[WS Frontend] ❌ WebSocket error:', error);
        };

        ws.onclose = (event) => {
            console.log('[WS Frontend] 🔌 Connection closed:', event.code, event.reason);
            setIsConnected(false);

            // Only auto-reconnect if not a normal closure (code 1000)
            if (event.code !== 1000) {
                console.log('[WS Frontend] 🔄 Will attempt to reconnect in 3 seconds...');
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('[WS Frontend] 🔄 Attempting to reconnect...');
                    connect();
                }, 3000);
            } else {
                console.log('[WS Frontend] Normal closure, not reconnecting');
            }
        };

        // Store the new WebSocket
        wsRef.current = ws;
    }, [userId, token]);

    useEffect(() => {
        loadHistory().then(() => connect());

        return () => {
            console.log('[WS Frontend] 🧹 Cleanup: closing connection');
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [connect]);

    const sendMessage = useCallback((content: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('[WS Frontend] ❌ WebSocket not connected, cannot send message');
            return;
        }

        const message = {
            type: 'text_message',
            content,
            ...(sessionId && { session_id: sessionId })
        };

        console.log('[WS Frontend] 📤 Sending message:', message);
        wsRef.current.send(JSON.stringify(message));

        // Optimistically add user message to UI
        setMessages(prev => [...prev, {
            type: 'text_message',
            content,
            session_id: sessionId || undefined,
            timestamp: new Date().toISOString()
        }]);
    }, [sessionId]);

    const uploadVoice = useCallback(async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');
        if (sessionId) {
            formData.append('session_id', sessionId);
        }

        try {
            const response = await fetch('http://localhost:8000/api/v1/chat/voice', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload voice note');
            }

            const data = await response.json();
            console.log('[WS Frontend] 🎤 Voice upload response:', data);

        } catch (error) {
            console.error('[WS Frontend] ❌ Error uploading voice:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                error: 'Failed to upload voice note',
                details: error instanceof Error ? error.message : 'Unknown error'
            }]);
        }
    }, [token, sessionId]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setSessionId(null);
    }, []);

    return {
        isConnected,
        messages,
        sessionId,
        sendMessage,
        uploadVoice,
        clearMessages
    };
}
