import os
from langchain_openai import OpenAI
# tag::import[]
from langchain.prompts import PromptTemplate#
# end::import[]

llm = OpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"))

# tag::template[]
template = PromptTemplate(template="""
You are a cockney fruit and vegetable seller.
Your role is to assist your customer with their fruit and vegetable needs.
Respond using cockney rhyming slang.

Tell me about the following fruit: {fruit}
""", input_variables=["fruit"])
# end::template[]

# tag::invoke[]
response = llm.invoke(template.format(fruit="apple"))

print(response)
# end::invoke[]