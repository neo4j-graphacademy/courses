import asyncio
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
)

settings = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
)

# tag::record_trace[]
from neo4j_agent_memory.integrations.microsoft_agent import (
    record_agent_trace,
)

async def record_example_trace(memory):
    trace = await record_agent_trace(
        memory=memory,
        messages=[],
        task="Find sci-fi movies about time travel",
        tool_calls=[
            {
                "name": "search_knowledge",
                "arguments": {"query": "time travel sci-fi"},
                "result": ["Interstellar", "The Matrix", "Back to the Future"],
                "status": "success",
                "duration_ms": 150,
            }
        ],
        outcome="Recommended Interstellar based on user preference for Nolan films",
        success=True,
    )
    return trace
# end::record_trace[]

# Lesson-only code snippet: included in the reasoning-memory lesson via
# AsciiDoc tag but not executed at runtime. Demonstrates StreamingTraceRecorder.
# tag::streaming_recorder[]
from neo4j_agent_memory.memory.reasoning import StreamingTraceRecorder

async def streaming_example(memory_client):
    async with StreamingTraceRecorder(
        memory_client.reasoning,
        session_id="user-123",
        task="Recommend a movie for the user",
    ) as recorder:
        step = await recorder.start_step(
            thought="User likes Christopher Nolan. Check preferences.",
            action="recall_preferences",
        )

        await recorder.record_tool_call(
            "recall_preferences",
            {"topic": "movies"},
            result={"preferences": ["Christopher Nolan", "sci-fi"]},
        )

        await recorder.add_observation(
            "User prefers Christopher Nolan and sci-fi. "
            "Recommending Interstellar."
        )
# end::streaming_recorder[]

# tag::find_similar[]
from neo4j_agent_memory.integrations.microsoft_agent import (
    get_similar_traces,
)

async def find_similar_example(memory):
    traces = await get_similar_traces(
        memory=memory,
        task="Find action movies with good ratings",
        limit=3,
    )

    for trace in traces:
        print(f"Task: {trace.task}")
        print(f"Outcome: {trace.outcome}")
        print(f"Success: {trace.success}")
        print(f"Steps: {len(trace.steps)}")
# end::find_similar[]

# tag::tool_stats[]
async def tool_stats_example(memory_client):
    stats = await memory_client.reasoning.get_tool_stats()

    for tool in stats:
        print(f"{tool.name}: {tool.success_rate:.0%} success, "
              f"avg {tool.avg_duration_ms}ms")
# end::tool_stats[]

async def main():
    memory_client = MemoryClient(settings)
    await memory_client.connect()

    try:
        memory = Neo4jMicrosoftMemory.from_memory_client(
            memory_client=memory_client,
            session_id="reasoning-demo",
            include_short_term=True,
            include_long_term=True,
            include_reasoning=True,
        )

        trace = await record_example_trace(memory)
        print(f"Recorded trace: id={trace.id}, task={trace.task}, session={trace.session_id}")

        await find_similar_example(memory)
        await tool_stats_example(memory_client)
    finally:
        await memory_client.close()

asyncio.run(main())
