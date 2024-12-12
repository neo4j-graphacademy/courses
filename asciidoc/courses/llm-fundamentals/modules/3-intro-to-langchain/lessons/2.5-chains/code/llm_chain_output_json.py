import os
from dotenv import load_dotenv
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers.json import SimpleJsonOutputParser

def create_fruit_chain():
    load_dotenv()
    
    llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    template = PromptTemplate.from_template("""
    You are a cockney fruit and vegetable seller.
    Your role is to assist your customer with their fruit and vegetable needs.
    Respond using cockney rhyming slang.

    Output JSON as {{"description": "your response here"}}

    Tell me about the following fruit: {fruit}
    """)

    return template | llm | SimpleJsonOutputParser()

def main():
    llm_chain = create_fruit_chain()
    response = llm_chain.invoke({"fruit": "apple"})
    print(response)

if __name__ == "__main__":
    main()
