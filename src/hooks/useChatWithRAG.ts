import { useState, useRef, useEffect, useCallback } from 'react';

export interface Citation {
    id: string;
    title: string;
    snippet: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    text: string;
    time: string;
    citations?: Citation[];
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'fallback';

const KB_DOCS = [
    { id: 'kb_1', title: 'Billing Policy', snippet: 'Prorated charges apply when upgrading plans mid-cycle. Refunds are only issued within the first 7 days of a downgrade.' },
    { id: 'kb_2', title: 'API Rate Limits', snippet: 'Growth plan API timeout limit is configurable up to 120 seconds. Standard is 30 seconds.' },
    { id: 'kb_3', title: 'SSO Setup', snippet: 'SAML SSO requires Enterprise plan. You can configure Okta or Azure AD from the security settings.' },
    { id: 'kb_4', title: 'Exporting Data', snippet: 'Data exports can take up to 24 hours depending on the size. Exports are sent as CSV to the account email.' }
];

const AI_RESPONSES = [
    "Based on our knowledge base, here is what I found regarding your issue. Let me know if you need more details.",
    "I understand your concern. I verified our policies and found the relevant documentation.",
    "I've searched our internal docs and can confirm the behavior you're seeing is expected. Here's why:",
    "Great question. Let me provide the specific details you need based on our technical guides."
];

export function useChatWithRAG(userId: string) {
    const STORAGE_KEY = `helix_chat_${userId}`;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [wsStatus, setWsStatus] = useState<ConnectionStatus>('connected');
    const [aiAttempts, setAiAttempts] = useState(0);
    const [escalated, setEscalated] = useState(false);
    const [pipelineState, setPipelineState] = useState<string>(''); // For visual feedback of RAG steps

    // 1. Persistence: Load from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setMessages(parsed.messages || []);
                setAiAttempts(parsed.aiAttempts || 0);
                setEscalated(parsed.escalated || false);
            } else {
                // Initial welcome message
                const welcome: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'ai',
                    text: `Hi! 👋 I'm Helix AI. How can I help you today?`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages([welcome]);
            }
        } catch {
            // ignore
        }
    }, [STORAGE_KEY]);

    // Save to persistence on change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, aiAttempts, escalated }));
        }
    }, [messages, aiAttempts, escalated, STORAGE_KEY]);

    // Simulate WebSocket robustness
    useEffect(() => {
        const cycle = setInterval(() => {
            // Simulate 5% chance of connection drop, followed by rapid reconnect, or 1% fallback
            const rand = Math.random();
            if (rand > 0.98) {
                setWsStatus('reconnecting');
                setTimeout(() => setWsStatus('connected'), 2000);
            } else if (rand < 0.01) {
                setWsStatus('fallback'); // REST API fallback Active
            }
        }, 15000);
        return () => clearInterval(cycle);
    }, []);

    const clearHistory = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([{ id: Date.now().toString(), role: 'ai', text: `Hi! 👋 I'm Helix AI. How can I help you today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setAiAttempts(0);
        setEscalated(false);
    }, [STORAGE_KEY]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || escalated) return;

        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((p) => [...p, userMsg]);
        setIsTyping(true);

        // If already at 3 attempts, escalate!
        if (aiAttempts >= 3) {
            setPipelineState('Escalating...');
            await new Promise(r => setTimeout(r, 1000));
            const sysMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                text: 'Automatic escalation triggered. Transferring you to a human agent...',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(p => [...p, sysMsg]);
            setEscalated(true);
            setIsTyping(false);
            setPipelineState('');
            return;
        }

        // --- FULL RAG PIPELINE SIMULATION ---

        // i. Embedding via EURI Embedding API
        setPipelineState('Embedding query via EURI...');
        await new Promise(r => setTimeout(r, 600));

        // ii. pgvector similarity search finding top-K chunks
        setPipelineState('Searching knowledge base (pgvector)...');
        await new Promise(r => setTimeout(r, 500));

        // iii. Context assembly
        setPipelineState('Assembling context & citations...');
        // Random select 1-2 docs as "match"
        const k = Math.floor(Math.random() * 2) + 1;
        const shuffledDocs = [...KB_DOCS].sort(() => 0.5 - Math.random());
        const citations = shuffledDocs.slice(0, k);
        await new Promise(r => setTimeout(r, 400));

        // iv. Send System prompt + KB Context to EURI LLM
        setPipelineState('Generating response via EURI LLM...');

        let aiText = '';
        try {
            const apiKey = import.meta.env.VITE_EURI_API_KEY;
            const apiUrl = import.meta.env.VITE_EURI_API_URL || 'https://api.euri.ai/v1/chat/completions';

            if (!apiKey) throw new Error("Missing API Key");

            const contextStr = citations.map(c => c.snippet).join('\n\n');
            const messagesPayload = [
                { role: 'system', content: `You are Helix AI, a customer support agent. Answer the user based ONLY on the following knowledge base context. If the answer is not in the context, politely escalate.\n\nContext:\n${contextStr}` },
                ...messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({
                    role: m.role === 'ai' ? 'assistant' : 'user',
                    content: m.text
                })),
                { role: 'user', content: text }
            ];

            const resp = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // or EURI default
                    messages: messagesPayload,
                    temperature: 0.4
                })
            });

            if (!resp.ok) throw new Error(`API Error: ${resp.status}`);

            const data = await resp.json();
            aiText = data.choices[0].message.content;

            // v. Receive AI response
            setPipelineState('');
        } catch (err) {
            console.warn('Real AI generation failed, falling back to simulation:', err);
            // Fallback Simulation
            await new Promise(r => setTimeout(r, 1200));
            setPipelineState('');
            aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)] +
                "\n\nHere's what I found: " + citations.map(c => `"${c.snippet}"`).join(' ');
        }

        const aiMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'ai',
            text: aiText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations
        };

        setMessages(p => [...p, aiMsg]);
        setAiAttempts(a => a + 1);
        setIsTyping(false);

        // Check if that was the 3rd attempt, we immediately warn them next will be human
        if (aiAttempts + 1 >= 3) {
            setTimeout(() => {
                const warning: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'system',
                    text: 'I apologize if I haven\'t fully resolved this. If you reply again, I will automatically escalate this to our human support team.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(p => [...p, warning]);
            }, 1000);
        }
    }, [aiAttempts, escalated]);

    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, pipelineState]);

    return {
        messages,
        isTyping,
        wsStatus,
        escalated,
        pipelineState,
        sendMessage,
        clearHistory,
        endRef
    };
}
