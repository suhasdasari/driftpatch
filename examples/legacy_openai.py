import openai
openai.api_key = "sk-..."
r = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[])
print(r["choices"][0]["message"]["content"])
