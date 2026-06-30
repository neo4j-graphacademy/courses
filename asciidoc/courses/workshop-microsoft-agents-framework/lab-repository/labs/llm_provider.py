"""
LLM Provider abstraction for switching between OpenAI and Azure AI Foundry.

Set LLM_PROVIDER environment variable to "azure" to use Azure AI Foundry,
or leave as "openai" (default) to use OpenAI directly.

Azure env vars: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT,
                AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME,
                AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
                AZURE_OPENAI_API_VERSION (optional, default: 2025-03-01-preview)
OpenAI env vars: OPENAI_API_KEY, OPENAI_RESPONSES_MODEL_ID
"""

import os


def get_provider():
    return os.getenv("LLM_PROVIDER", "openai").lower()


def get_client():
    """Return the appropriate LLM client based on LLM_PROVIDER env var."""
    if get_provider() == "azure":
        from agent_framework.azure import AzureOpenAIResponsesClient
        return AzureOpenAIResponsesClient()
    else:
        from agent_framework.openai import OpenAIResponsesClient
        return OpenAIResponsesClient()


def get_embedder():
    """Return the appropriate embedder based on LLM_PROVIDER env var."""
    if get_provider() == "azure":
        from neo4j_graphrag.embeddings.openai import AzureOpenAIEmbeddings
        return AzureOpenAIEmbeddings(
            model=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME", "text-embedding-3-small"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview"),
        )
    else:
        from neo4j_graphrag.embeddings.openai import OpenAIEmbeddings
        return OpenAIEmbeddings(model="text-embedding-3-small")
