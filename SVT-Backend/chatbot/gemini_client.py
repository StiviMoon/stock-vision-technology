import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")

def chat_with_gemini(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text
