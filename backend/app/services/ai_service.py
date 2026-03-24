import os
import requests
from ..core.config import settings

class AIService:
    @staticmethod
    def get_headers():
        return {
            "Authorization": f"Bearer {os.getenv('VITE_EURI_API_KEY')}",
            "Content-Type": "application/json",
            "X-EURI-Source": "Helix-Intelligence-System"
        }

    @staticmethod
    def get_embeddings(text: str) -> list:
        """Generate embeddings. Falls back to mock if no API key."""
        openai_key = settings.OPENAI_API_KEY
        if openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=openai_key)
                response = client.embeddings.create(input=[text], model=settings.EMBEDDING_MODEL)
                return response.data[0].embedding
            except Exception as e:
                print(f"Embedding error: {e}")
        # Mock embedding fallback (deterministic hash-based)
        import hashlib
        h = int(hashlib.md5(text.encode()).hexdigest(), 16)
        return [((h >> (i * 4)) & 0xF) / 15.0 for i in range(1536)]

    @staticmethod
    def _call_euri(messages: list) -> str | None:
        """Call EURI API. Returns text or None on failure."""
        euri_url = os.getenv("VITE_EURI_API_URL")
        euri_key = os.getenv("VITE_EURI_API_KEY")
        if not (euri_url and euri_key):
            return None
        try:
            payload = {"model": "gpt-4o-mini", "messages": messages}
            res = requests.post(euri_url, json=payload, headers=AIService.get_headers(), timeout=15)
            if res.ok:
                return res.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"EURI API Error: {e}")
        return None

    @staticmethod
    def _call_openai(messages: list) -> str | None:
        """Call OpenAI API. Returns text or None on failure."""
        if not settings.OPENAI_API_KEY:
            return None
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(model=settings.LLM_MODEL, messages=messages)
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {e}")
        return None

    @staticmethod
    def generate_ai_response(query: str, context_chunks: list, history: list = []) -> dict:
        context_str = "\n".join([f"[{c.get('source', 'KB')}]: {c.get('text', '')}" for c in context_chunks])
        
        messages = [
            {"role": "system", "content": f"You are Helix AI, a helpful customer support assistant. Use the knowledge base context below to answer accurately and concisely. If unsure, say so honestly.\n\nKnowledge Base Context:\n{context_str or 'No specific context found.'}"}
        ]
        for h in history[-10:]:
            messages.append(h)
        messages.append({"role": "user", "content": query})

        # Try EURI first, then OpenAI, then fallback
        text = AIService._call_euri(messages) or AIService._call_openai(messages)
        if not text:
            text = "I'm currently offline. Please try again in a moment or create a support ticket for urgent issues."

        return {
            "text": text,
            "sources": list(set([c.get('source', 'KB') for c in context_chunks])) if context_chunks else []
        }

    @staticmethod
    def suggest_agent_reply(query: str, history: list, knowledge_chunks: list) -> str:
        """Generate an AI-suggested reply for an agent."""
        # Handle DB message objects or plain dicts
        history_lines = []
        for m in history[-10:]:
            if hasattr(m, 'sender_role'):
                history_lines.append(f"{m.sender_role}: {m.content}")
            elif isinstance(m, dict):
                history_lines.append(f"{m.get('role', 'user')}: {m.get('content', '')}")
        history_str = "\n".join(history_lines)
        context_str = "\n".join(knowledge_chunks[:3])

        messages = [
            {"role": "system", "content": f"You are an expert support agent assistant. Generate a professional, empathetic, and concise reply for the agent to send. Knowledge context:\n{context_str}\n\nConversation history:\n{history_str}"},
            {"role": "user", "content": f"Customer query: {query}\n\nWrite a suggested agent reply:"}
        ]

        return (
            AIService._call_euri(messages)
            or AIService._call_openai(messages)
            or "Thank you for reaching out. I understand your concern and will look into this right away. Could you provide any additional details that might help me resolve this faster?"
        )

    @staticmethod
    def generate_ticket_summary(subject: str, description: str, messages: list = []) -> str:
        """Generate a concise AI summary of a support ticket."""
        history_lines = []
        for m in messages[-20:]:
            if hasattr(m, 'sender_role'):
                history_lines.append(f"{m.sender_role}: {m.content}")
            elif isinstance(m, dict):
                history_lines.append(f"{m.get('role', 'user')}: {m.get('content', '')}")
        history_str = "\n".join(history_lines)

        messages_payload = [
            {"role": "system", "content": "You are a support ticket analyst. Summarize the following ticket in 3-4 concise bullet points covering: the main issue, steps taken, current status, and recommended next action."},
            {"role": "user", "content": f"Subject: {subject}\nDescription: {description}\n\nConversation:\n{history_str or 'No messages yet.'}"}
        ]

        return (
            AIService._call_euri(messages_payload)
            or AIService._call_openai(messages_payload)
            or f"• Issue: {subject}\n• Description: {description[:100]}...\n• Status: Under review\n• Next: Agent follow-up required"
        )
