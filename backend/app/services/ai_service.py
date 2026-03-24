import openai
from ..core.config import settings

class AIService:
    @staticmethod
    def get_embeddings(text: str) -> list:
        if not settings.OPENAI_API_KEY:
            # Mock 1536-dim vector
            return [0.1] * 1536
        openai.api_key = settings.OPENAI_API_KEY
        response = openai.Embedding.create(input=[text], model=settings.EMBEDDING_MODEL)
        return response.data[0].embedding

    @staticmethod
    def generate_ai_response(query: str, context_chunks: list, history: list = []) -> dict:
        """
        Grounded RAG response with source attribution.
        Returns a dict with 'text' and 'sources' (metadata).
        """
        context_str = "\n".join([f"Source [{c.get('source', 'Unknown')}]: {c.get('text', '')}" for c in context_chunks])
        
        if not settings.OPENAI_API_KEY:
            return {
                "text": f"MOCK RAG RESPONSE: Regarding '{query}', I found some info in the knowledge base. However, the EURI AI core is currently in simulated mode. Found context: {context_str[:200]}...",
                "sources": [c.get('source', 'Unknown') for c in context_chunks[:3]]
            }
        
        openai.api_key = settings.OPENAI_API_KEY
        messages = [
            {"role": "system", "content": f"You are Helix Support AI, an intelligent agent powered by EURI. Use the provided KNOWLEDGE CONTEXT to answer the user query. Always cite your sources using [Source Name].\n\nKNOWLEDGE CONTEXT:\n{context_str}"},
        ]
        
        # Add limited history for memory
        for h in history[-5:]:
            messages.append({"role": h["role"], "content": h["content"]})
        
        messages.append({"role": "user", "content": query})
        
        try:
            response = openai.ChatCompletion.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=500
            )
            return {
                "text": response.choices[0].message.content,
                "sources": list(set([c.get('source', 'Unknown') for c in context_chunks]))
            }
        except Exception as e:
            return {"text": f"Error in AI Pipeline: {str(e)}", "sources": []}

    @staticmethod
    def suggest_agent_reply(last_messages: list, context_chunks: list) -> str:
        """Logic for Agent Copilot 'Suggest Reply' feature."""
        context_str = "\n".join([c.get('text', '') for c in context_chunks])
        history_str = "\n".join([f"{m.get('sender_role', 'user')}: {m.get('content', '')}" for m in last_messages])
        
        prompt = f"Given the following support conversation history and knowledge base context, suggest a professional, empathetic response for the agent to send to the customer.\n\nCONTEXT:\n{context_str}\n\nHISTORY:\n{history_str}\n\nSUGGESTED REPLY:"
        
        if not settings.OPENAI_API_KEY:
            return "Thank you for reaching out. Based on our documentation, you can resolve this by checking your settings. (Mocked via AIService)"

        try:
            response = openai.ChatCompletion.create(
                model=settings.LLM_MODEL,
                messages=[{"role": "system", "content": "You are an expert support agent assistant. Suggest a professional reply."},
                          {"role": "user", "content": prompt}],
                max_tokens=300
            )
            return response.choices[0].message.content
        except:
            return "Unable to generate suggestion at this moment."

    @staticmethod
    def generate_ticket_summary(subject: str, description: str, messages: list = []) -> str:
        if not settings.OPENAI_API_KEY:
            return "Ticket summary unavailable: No active AI connection."
        
        openai.api_key = settings.OPENAI_API_KEY
        
        context = f"Subject: {subject}\nDescription: {description}\n"
        if messages:
            context += "\nRecent Messages:\n"
            for msg in messages[-5:]: # Last 5 messages
                context += f"- {msg.sender_role.upper()}: {msg.content[:200]}\n"
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Summarize this support ticket in 2-3 concise sentences. Focus on the core issue and current status."},
                    {"role": "user", "content": context}
                ],
                max_tokens=150
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"
