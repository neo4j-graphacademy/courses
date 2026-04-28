import asyncio
from typing import Annotated

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client
from pydantic import Field

# tag::movies[]
# Hardcoded movie data from the Neo4j recommendations dataset
MOVIES = {
    "INCEPTION": {
        "title": "Inception",
        "director": "Christopher Nolan",
        "year": "2010",
        "genres": ["Science Fiction", "Thriller"],
        "plot_summary": "A skilled thief who steals corporate secrets through dream-sharing technology is given a chance to erase his criminal record by planting an idea in a target's subconscious.",
    },
    "THE MATRIX": {
        "title": "The Matrix",
        "director": "Lana Wachowski, Lilly Wachowski",
        "year": "1999",
        "genres": ["Science Fiction", "Action"],
        "plot_summary": "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    },
    "PULP FICTION": {
        "title": "Pulp Fiction",
        "director": "Quentin Tarantino",
        "year": "1994",
        "genres": ["Crime", "Drama"],
        "plot_summary": "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    },
    "THE DARK KNIGHT": {
        "title": "The Dark Knight",
        "director": "Christopher Nolan",
        "year": "2008",
        "genres": ["Action", "Crime", "Drama"],
        "plot_summary": "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    },
}
# end::movies[]

# tag::tool[]
def get_movie_info(
    movie_title: Annotated[str, Field(description="The movie title to look up")]
) -> str:
    """Look up information about a movie including its director, year, genres, and plot summary."""
    key = movie_title.upper().strip()
    info = MOVIES.get(key)
    if not info:
        for k, v in MOVIES.items():
            if key in k or k in key:
                info = v
                break
    if info:
        return (
            f"Title: {info['title']}\n"
            f"Director: {info['director']}\n"
            f"Year: {info['year']}\n"
            f"Genres: {', '.join(info['genres'])}\n"
            f"Plot: {info['plot_summary']}"
        )
    available = ", ".join(m["title"] for m in MOVIES.values())
    return f"Movie '{movie_title}' not found. Available movies: {available}"
# end::tool[]

# tag::agent[]
async def main():
    client = get_client()

    agent = client.as_agent(
        name="movie-info-agent",
        instructions=(
            "You are a helpful movie assistant. Use your tool to look up "
            "movie information when asked about a specific movie. If the "
            "user asks about a movie not in your database, let them know "
            "which movies are available."
        ),
        tools=[get_movie_info],
    )
    # end::agent[]

    # tag::run[]
    query = "Tell me about Inception"
    print(f"User: {query}\n")
    print("Answer: ", end="", flush=True)
    async for update in agent.run(query, stream=True):
        if update.text:
            print(update.text, end="", flush=True)
    print()
    # end::run[]

asyncio.run(main())
