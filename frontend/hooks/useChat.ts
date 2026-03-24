import { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    sources?: string[];
    type?: string;
}

export function useChat(userId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        connect();
        return () => socketRef.current?.close();
    }, [userId]);

    const connect = () => {
        const wsUrl = `ws://127.0.0.1:8000/api/chat/ws/${userId}`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => setIsConnected(true);
        socketRef.current.onclose = () => {
            setIsConnected(false);
            // Auto-reconnection logic
            setTimeout(connect, 3000);
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIsTyping(false);

            const aiMsg: ChatMessage = {
                id: Math.random().toString(),
                text: data.text,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                sources: data.sources,
                type: data.type
            };

            setMessages(prev => [...prev, aiMsg]);
        };
    };

    const sendMessage = (text: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            // Fallback REST logic could be added here
            return;
        }

        const payload = JSON.stringify({ text });
        socketRef.current.send(payload);

        const userMsg: ChatMessage = {
            id: Math.random().toString(),
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
    };

    return { messages, isTyping, isConnected, sendMessage };
}
