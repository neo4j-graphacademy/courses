import asyncio
from typing import Any

from dotenv import load_dotenv
load_dotenv(override=True)

from agent_framework import (
    AgentSession,
    BaseContextProvider,
    SessionContext,
    SupportsChatGetResponse,
)
from llm_provider import get_client
from pydantic import BaseModel

# tag::model[]
class UserInfo(BaseModel):
    name: str | None = None
    age: int | None = None
# end::model[]

# tag::provider[]
class UserInfoMemory(BaseContextProvider):
    """Context provider that extracts and remembers user info (name, age)."""

    def __init__(self, client: SupportsChatGetResponse):
        super().__init__("user-info-memory")
        self._chat_client = client

    async def before_run(
        self,
        *,
        agent: Any,
        session: AgentSession | None,
        context: SessionContext,
        state: dict[str, Any],
    ) -> None:
        """Inject dynamic instructions based on stored user info."""
        user_info = state.setdefault("user_info", UserInfo())

        instructions: list[str] = []

        if user_info.name is None:
            instructions.append(
                "Ask the user for their name and politely decline "
                "to answer any questions until they provide it."
            )
        else:
            instructions.append(f"The user's name is {user_info.name}.")

        if user_info.age is None:
            instructions.append(
                "Ask the user for their age and politely decline "
                "to answer any questions until they provide it."
            )
        else:
            instructions.append(f"The user's age is {user_info.age}.")

        context.extend_instructions(self.source_id, " ".join(instructions))

    async def after_run(
        self,
        *,
        agent: Any,
        session: AgentSession | None,
        context: SessionContext,
        state: dict[str, Any],
    ) -> None:
        """Extract user info from the conversation after each turn."""
        user_info = state.setdefault("user_info", UserInfo())
        if user_info.name is not None and user_info.age is not None:
            return

        request_messages = context.get_messages(
            include_input=True, include_response=True
        )
        user_messages = [
            msg for msg in request_messages
            if hasattr(msg, "role") and msg.role == "user"
        ]
        if not user_messages:
            return

        try:
            result = await self._chat_client.get_response(
                messages=request_messages,
                instructions=(
                    "Extract the user's name and age from the message "
                    "if present. If not present return nulls."
                ),
                options={"response_format": UserInfo},
            )
            extracted = result.value
            if extracted and user_info.name is None and extracted.name:
                user_info.name = extracted.name
            if extracted and user_info.age is None and extracted.age:
                user_info.age = extracted.age
            state["user_info"] = user_info
        except Exception:
            pass
# end::provider[]

# tag::agent[]
async def main():
    client = get_client()

    agent = client.as_agent(
        name="context-provider-agent",
        instructions=(
            "You are a friendly assistant. Always address the user "
            "by their name when you know it."
        ),
        context_providers=[UserInfoMemory(client)],
    )

    session = agent.create_session()
    # end::agent[]

    # tag::run[]
    queries = [
        "Hello, what is the square root of 9?",
        "My name is Alex and I am 30 years old",
        "Now, what is the square root of 9?",
    ]

    for query in queries:
        print(f"User: {query}\n")
        print("Answer: ", end="", flush=True)
        response = await agent.run(query, session=session)
        print(response.text)
        print()

    user_info = session.state.get("user-info-memory", {}).get(
        "user_info", UserInfo()
    )
    print(f"Extracted Name: {user_info.name}")
    print(f"Extracted Age: {user_info.age}")
    # end::run[]

asyncio.run(main())
