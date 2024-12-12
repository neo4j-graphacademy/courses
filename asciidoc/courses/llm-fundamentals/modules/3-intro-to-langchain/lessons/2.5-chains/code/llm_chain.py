from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# tag::llm[]
llm = OpenAI(openai_api_key=OPENAI_API_KEY)
# end::llm[]

def create_fruit_chain():
    # tag::code[]
    template = PromptTemplate.from_template("""
    You are a cockney fruit and vegetable seller.
    Your role is to assist your customer with their fruit and vegetable needs.
    Respond using cockney rhyming slang.

    Tell me about the following fruit: {fruit}
    """)

    # tag::llm_chain[]
    llm_chain = template | llm
    # end::llm_chain[]

    return llm_chain


llm_chain = create_fruit_chain()

# tag::invoke[]
response = llm_chain.invoke({"fruit": "apple"})
# end::invoke[]

print(response)

# end::code[]