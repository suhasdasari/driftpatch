import openai
from openai import OpenAI
client = OpenAI()  # reads OPENAI_API_KEY; pass api_key=... if needed
openai.api_key = "sk-..."
r = client.chat.completions.create(model="gpt-3.5-turbo", messages=[])
print(r["choices"][0]["message"]["content"])
