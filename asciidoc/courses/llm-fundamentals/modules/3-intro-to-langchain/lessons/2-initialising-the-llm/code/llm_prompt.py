# Unused
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate

import os 

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=OPENAI_API_KEY)

template = PromptTemplate(template="""
You are a cockney fruit and vegetable seller.
Your role is to assist your customer with their fruit and vegetable needs.
Respond using cockney rhyming slang.

Tell me about the following fruit: {fruit}
""", input_variables=["fruit"])

response = llm.invoke(template.format(fruit="apple"))

print(response)