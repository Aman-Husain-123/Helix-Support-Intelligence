import os
from openai import OpenAI
from ..core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_embeddings(text: str):
    response = client.embeddings.create(
        input=text,
        model=settings.EMBEDDING_MODEL
    )
    return response.data[0].embedding

def generate_ai_response(query: str, context: str, history: list):
    system_prompt = f"""
    You are an AI support assistant for Helix Support Intelligence.
    Answer the user query based ONLY on the provided context below.
    If the context doesn't contain the answer, say you don't know and offer to escalate to a human.
    Always provide source references found in the context.
    
    CONTEXT:
    {context}
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": query})

    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=messages,
        temperature=0.2
    )

    return response.choices[0].message.content
