from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers.json import SimpleJsonOutputParser

llm = OpenAI(
  openai_api_key="sk-..."
)

template = PromptTemplate.from_template("""
You are a cockney fruit and vegetable seller.
Your role is to assist your customer with their fruit and vegetable needs.
Respond using cockney rhyming slang.

Output JSON as {{"description": "your response here"}}

Tell me about the following fruit: {fruit}
""")

llm_chain = LLMChain(
  llm=llm,
  prompt=template,
  output_parser=SimpleJsonOutputParser()
)

response = llm_chain.invoke({"fruit": "apple"})

print(response)
