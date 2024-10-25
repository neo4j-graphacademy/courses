from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate

llm = OpenAI(openai_api_key="sk-...")

template = PromptTemplate.from_template("""
You are a cockney fruit and vegetable seller.
Your role is to assist your customer with their fruit and vegetable needs.
Respond using cockney rhyming slang.

Tell me about the following fruit: {fruit}
""")

# tag::llm_chain[]
llm_chain = template | llm
# end::llm_chain[]

# tag::invoke[]
response = llm_chain.invoke({"fruit": "apple"})
# end::invoke[]

print(response)