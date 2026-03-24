import openai
from ..core.config import settings

class AIService:
    @staticmethod
    def generate_ticket_summary(subject: str, description: str, messages: list = []) -> str:
        if not settings.OPENAI_API_KEY:
            return "AI Summary not available (API Key missing)."
        
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
