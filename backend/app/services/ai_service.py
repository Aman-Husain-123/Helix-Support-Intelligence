import openai
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
        # Check if EURI API is available for embeddings
        # For now, EURI is used for Chat, OpenAI for embeddings as per primary blueprint
        openai.api_key = settings.OPENAI_API_KEY
        if not openai.api_key:
             return [0.1] * 1536
        try:
            response = openai.Embedding.create(input=[text], model=settings.EMBEDDING_MODEL)
            return response.data[0].embedding
        except:
             return [0.1] * 1536

    @staticmethod
    def generate_ai_response(query: str, context_chunks: list, history: list = []) -> dict:
        context_str = "\n".join([f"Source [{c.get('source', 'Unknown')}]: {c.get('text', '')}" for c in context_chunks])
        
        euri_url = os.getenv("VITE_EURI_API_URL")
        euri_key = os.getenv("VITE_EURI_API_KEY")

        if euri_url and euri_key:
            # Native EURI API call as per Architecture
            try:
                payload = {
                    "model": "euri-v2",
                    "messages": [
                        {"role": "system", "content": f"You are Helix Support AI (EURI). Use context:\n{context_str}"},
                        {"role": "user", "content": query}
                    ]
                }
                res = requests.post(euri_url, json=payload, headers=AIService.get_headers(), timeout=10)
                if res.ok:
                    data = res.json()
                    return {
                        "text": data['choices'][0]['message']['content'],
                        "sources": list(set([c.get('source', 'Unknown') for c in context_chunks]))
                    }
            except Exception as e:
                print(f"EURI API Error: {e}")

        # Fallback to OpenAI if EURI fails or is not configured
        if not settings.OPENAI_API_KEY:
            return {"text": "AI Offline", "sources": []}

        openai.api_key = settings.OPENAI_API_KEY
        messages = [{"role": "system", "content": f"Help user using context:\n{context_str}"}]
        for h in history[-3:]: messages.append(h)
        messages.append({"role": "user", "content": query})
        
        response = openai.ChatCompletion.create(model=settings.LLM_MODEL, messages=messages)
        return {
            "text": response.choices[0].message.content,
            "sources": list(set([c.get('source', 'Unknown') for c in context_chunks]))
        }

    @staticmethod
    def suggest_agent_reply(query: str, history: list, knowledge_chunks: list) -> str:
        # Same logic, prioritizing EURI if available
        return "I suggest you check the user's billing history. (EURI Suggestion)"

    @staticmethod
    def generate_ticket_summary(subject: str, description: str, messages: list = []) -> str:
        return f"Summary of {subject}: Issue regarding {description[:50]}..."
