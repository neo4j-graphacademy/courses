import asyncio
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from neo4j_agent_memory import MemoryClient, MemorySettings
from llm_provider import get_provider

# tag::settings[]
if get_provider() == "azure":
    llm_model = os.getenv("AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME", "gpt-5-mini")
else:
    llm_model = os.getenv("OPENAI_RESPONSES_MODEL_ID", "gpt-5-mini")

settings = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
    extraction={
        "extractor_type": "pipeline",
        "enable_spacy": True,
        "enable_gliner": False,  # GLiNER disabled: it downloads a ~500MB model from HuggingFace on first use, which is impractical in a workshop with many participants
        "enable_llm_fallback": True,
        "confidence_threshold": 0.5,
        "llm_model": llm_model,
        "llm_temperature": 1.0,  # gpt-5-mini only supports temperature=1.0
        "entity_types": [
            "PERSON", "ORGANIZATION", "LOCATION", "EVENT", "OBJECT"
        ],
    },
)
# end::settings[]

# Lesson-only code snippet: included in the entity-extraction lesson via
# AsciiDoc tag but not executed at runtime. Demonstrates merge_strategy config.
# tag::merge_strategy[]
settings_with_merge = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
    extraction={
        "extractor_type": "pipeline",
        "merge_strategy": "confidence",
    },
)
# end::merge_strategy[]

# Lesson-only code snippet: included in the entity-extraction lesson via
# AsciiDoc tag but not executed at runtime. Demonstrates resolution config.
# tag::resolution[]
settings_with_resolution = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
    resolution={
        "strategy": "composite",
        "exact_threshold": 1.0,
        "fuzzy_threshold": 0.85,
        "semantic_threshold": 0.8,
    },
)
# end::resolution[]

# tag::manual_entity[]
async def add_manual_entity():
    async with MemoryClient(settings) as memory_client:
        entity, dedup_result = await memory_client.long_term.add_entity(
            name="Inception",
            entity_type="OBJECT",
            description="2010 science fiction film directed by Christopher Nolan",
        )
        print(f"Added entity: name={entity.name}, type={entity.entity_type}, id={entity.id}")
        await asyncio.sleep(5)
# end::manual_entity[]

asyncio.run(add_manual_entity())
