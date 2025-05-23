import os
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
# tag::import[]
from langchain.output_parsers.json import SimpleJsonOutputParser
# end::import[]

llm = OpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY")
    )

template = PromptTemplate.from_template("""
You are a cockney fruit and vegetable seller.
Your role is to assist your customer with their fruit and vegetable needs.
Respond using cockney rhyming slang.

Output JSON as {{"description": "your response here"}}

Tell me about the following fruit: {fruit}
""")

# tag::llm_chain[]
llm_chain = template | llm | SimpleJsonOutputParser()
# end::llm_chain[]

response = llm_chain.invoke({"fruit": "apple"})

print(response)
