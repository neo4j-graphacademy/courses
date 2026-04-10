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

# Define a data model for structured extraction
class UserInfo(BaseModel):
    name: str | None = None
    age: int | None = None


# TODO: Create a UserInfoMemory class that extends BaseContextProvider
# It should:
# 1. Accept a chat client in __init__
# 2. Implement before_run() to inject instructions based on stored user info
# 3. Implement after_run() to extract user info from the conversation


async def main():
    client = get_client()

    # TODO: Create the agent with the UserInfoMemory context provider

    # TODO: Create a session and run multi-turn conversations
    # The provider should ask for the user's name, then greet them by name

    pass

asyncio.run(main())
