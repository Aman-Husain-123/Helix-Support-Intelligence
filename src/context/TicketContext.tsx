import React, { createContext, useContext, useState } from 'react';

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketMessage {
    id: string;
    role: 'customer' | 'agent' | 'system' | 'ai';
    senderName: string;
    text: string;
    time: string;
}

export interface Ticket {
    id: string; // e.g., 'TCK-4821'
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    customerName: string;
    channel: 'web' | 'email' | 'phone' | 'slack';
    assignedTo?: string; // Agent name/id
    unread: number;
    updatedAt: string;
    sla_due_at?: string;
    closed_at?: string;
    aiSummary?: string;
    messages: TicketMessage[];
}

interface TicketContextValue {
    tickets: Ticket[];
    createTicket: (subject: string, description: string, priority: TicketPriority, customerName: string) => Ticket;
    updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
    addMessageToTicket: (ticketId: string, message: Omit<TicketMessage, 'id' | 'time'>) => void;
}

const TicketContext = createContext<TicketContextValue | undefined>(undefined);

// Dummy Agents for load balancing
const AGENTS = ['Alex Rivera', 'Priya Nair', 'Sam Cho'];

const INITIAL_TICKETS: Ticket[] = [
    {
        id: 'TCK-4821',
        subject: 'Invoice higher than expected',
        description: 'My last invoice looks higher than usual, can you explain the charges?',
        status: 'open',
        priority: 'high',
        customerName: 'Jordan Matthews',
        channel: 'web',
        assignedTo: 'Alex Rivera',
        unread: 2,
        updatedAt: '2m ago',
        sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        aiSummary: 'Customer is questioning unexpected charges on recent invoice.',
        messages: [
            { id: '1', role: 'customer', senderName: 'Jordan Matthews', text: 'My last invoice looks higher than usual…', time: '2m ago' }
        ]
    },
    {
        id: 'TCK-4790',
        subject: 'API timeouts in production',
        description: 'The API integration keeps timing out on the /v1/webhooks endpoint.',
        status: 'pending',
        priority: 'medium',
        customerName: 'Acme Inc.',
        channel: 'email',
        assignedTo: 'Priya Nair',
        unread: 0,
        updatedAt: '18m ago',
        sla_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        aiSummary: 'Customer reports timeouts specifically on the webhooks API endpoint.',
        messages: [
            { id: '1', role: 'customer', senderName: 'Acme Inc.', text: 'The API integration keeps timing out.', time: '18m ago' }
        ]
    },
    {
        id: 'TCK-4785',
        subject: '2FA reset request',
        description: 'I lost my phone and need to reset 2FA.',
        status: 'open',
        priority: 'urgent',
        customerName: 'Sarah Kim',
        channel: 'web',
        assignedTo: 'Alex Rivera',
        unread: 1,
        updatedAt: '34m ago',
        sla_due_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        aiSummary: 'Urgent request for 2FA reset due to lost device.',
        messages: [
            { id: '1', role: 'customer', senderName: 'Sarah Kim', text: 'Can you help me reset my 2FA?', time: '34m ago' }
        ]
    }
];

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

    // Auto-assignment — Load balancing logic
    const getNextAvailableAgent = () => {
        // Count active tickets per agent
        const agentLoad = AGENTS.reduce((acc, agent) => {
            acc[agent] = tickets.filter(t => t.assignedTo === agent && t.status !== 'closed' && t.status !== 'resolved').length;
            return acc;
        }, {} as Record<string, number>);

        // Find agent with min tickets
        let minAgent = AGENTS[0];
        let minCount = agentLoad[AGENTS[0]] ?? 0;

        for (const agent of AGENTS) {
            const count = agentLoad[agent] ?? 0;
            if (count < minCount) {
                minAgent = agent;
                minCount = count;
            }
        }
        return minAgent;
    };

    const createTicket = (subject: string, description: string, priority: TicketPriority, customerName: string) => {
        const id = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
        const assignedTo = getNextAvailableAgent();

        const newTicket: Ticket = {
            id,
            subject,
            description,
            priority,
            status: 'open',
            customerName,
            channel: 'web',
            assignedTo,
            unread: 0,
            updatedAt: 'Just now',
            sla_due_at: new Date(Date.now() + (priority === 'urgent' ? 1 : 24) * 60 * 60 * 1000).toISOString(),
            messages: [
                { id: Date.now().toString(), role: 'customer', senderName: customerName, text: description, time: 'Just now' },
                { id: (Date.now() + 1).toString(), role: 'system', senderName: 'System', text: `Ticket auto-assigned to ${assignedTo} via round-robin.`, time: 'Just now' }
            ],
            aiSummary: 'Newly created ticket. Generating summary based on initial context...',
        };

        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
    };

    const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            return {
                ...t,
                status,
                closed_at: status === 'closed' ? new Date().toISOString() : t.closed_at
            };
        }));
    };

    const addMessageToTicket = (ticketId: string, message: Omit<TicketMessage, 'id' | 'time'>) => {
        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            const newMsg: TicketMessage = {
                ...message,
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            return {
                ...t,
                updatedAt: newMsg.time,
                messages: [...t.messages, newMsg]
            };
        }));
    };

    return (
        <TicketContext.Provider value={{ tickets, createTicket, updateTicketStatus, addMessageToTicket }}>
            {children}
        </TicketContext.Provider>
    );
};

export function useTickets() {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketProvider');
    }
    return context;
}
