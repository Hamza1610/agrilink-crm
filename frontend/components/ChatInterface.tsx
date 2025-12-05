/**
 * Chat interface component with WebSocket support
 * Real-time messaging with AI agent
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Menu, X, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import ChatSidebar from './ChatSidebar';

export default function ChatInterface({ userId, token }: { userId: string; token: string }) {
    const { isConnected, messages, sessionId, sendMessage, uploadVoice, startNewChat, switchSession } = useWebSocket(userId, token);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDashboardSidebarOpen, setIsDashboardSidebarOpen] = useState(true);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/chat/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const handleDeleteSession = async (sessionIdToDelete: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/chat/sessions/${sessionIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setSessions(sessions.filter(s => s.session_id !== sessionIdToDelete));
                // If we deleted the current session, start a new one
                if (sessionIdToDelete === sessionId) {
                    startNewChat();
                }
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const handleSelectSession = async (newSessionId: string) => {
        await switchSession(newSessionId);
        // Reload sessions to get fresh data
        await loadSessions();
    };

    const handleNewChat = () => {
        startNewChat();
        loadSessions(); // Refresh the list
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await uploadVoice(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);

            // Start duration counter
            setRecordingDuration(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Microphone access denied or unavailable');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingDuration(0);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div 
            className="flex h-full overflow-hidden transition-all duration-300"
            style={{
                marginLeft: isDashboardSidebarOpen ? '0' : '-16rem'
            }}
        >
            {/* Sidebar */}
            <ChatSidebar
                sessions={sessions}
                currentSessionId={sessionId}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isLoading={isLoadingSessions}
            />

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0 h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-3 md:px-6 py-2 md:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
                                AI Assistant
                            </h1>
                            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden sm:block truncate">
                                Ask me about farming, logistics, or payments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🌾</div>
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Welcome to ShukaLink Chat
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Send a message or use voice to get started
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.type === 'text_message' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {msg.type === 'error' ? (
                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl px-4 py-3 max-w-[80%]">
                                <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                                <p className="text-red-700 dark:text-red-300 text-sm">{msg.error}</p>
                                {msg.details && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{msg.details}</p>
                                )}
                            </div>
                        ) : msg.type === 'voice_transcription' ? (
                            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-2xl px-4 py-3 max-w-[80%]">
                                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                                    🎤 Transcription ({msg.confidence && `${(msg.confidence * 100).toFixed(0)}%`})
                                </p>
                                <p className="text-blue-900 dark:text-blue-100">{msg.transcription}</p>
                            </div>
                        ) : msg.type === 'text_message' ? (
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl px-4 py-3 max-w-[80%] shadow-md">
                                <p>{msg.content}</p>
                                {msg.timestamp && (
                                    <p className="text-xs text-emerald-100 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        ) : msg.type === 'ai_message' ? (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 max-w-[80%] shadow-md">
                                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{msg.content}</p>
                                {msg.tts_audio_url && (
                                    <audio controls className="mt-2 w-full" src={msg.tts_audio_url} />
                                )}
                                {msg.timestamp && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        ) : msg.type === 'session_created' ? (
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full px-3 py-1 mx-auto">
                                Session started
                            </div>
                        ) : null}

                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-3 md:px-6 py-3 md:py-4">
                {isRecording && (
                    <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-700 dark:text-red-300 font-medium">
                                Recording... {formatDuration(recordingDuration)}
                            </span>
                        </div>
                        <button
                            onClick={stopRecording}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                        >
                            Stop
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 md:p-3 rounded-full transition-all ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }`}
                        disabled={!isConnected}
                    >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isConnected ? "Type your message..." : "Connecting..."}
                        disabled={!isConnected || isRecording}
                        className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full px-3 md:px-5 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!isConnected || !inputValue.trim() || isRecording}
                        className="p-2 md:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-full transition-all shadow-md disabled:shadow-none"
                    >
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                {sessionId && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                        Session: {sessionId}
                    </p>
                )}
            </div>
            </div>
        </div>
    );
}
