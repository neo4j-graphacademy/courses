"""
One-time script used to generate the movie plot embeddings CSV.

This script was run once to create genai-maf-context-providers/data/movie_embeddings.csv.
It fetches the top 500 rated movies from a Neo4j recommendations sandbox,
generates embeddings using OpenAI's text-embedding-3-small model, and saves
the results as a CSV file.

Students do NOT need to run this script. The pre-computed embeddings are
already included in the repo. Instead, run setup.py to load them into
your Neo4j instance:

    python genai-maf-context-providers/setup.py
"""
import csv
import json
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from neo4j import GraphDatabase
from openai import OpenAI


def main():
    driver = GraphDatabase.driver(
        os.environ["NEO4J_URI"],
        auth=(os.environ["NEO4J_USERNAME"], os.environ["NEO4J_PASSWORD"]),
    )

    # Get 500 movies with plots, prefer highest rated
    with driver.session() as s:
        result = s.run(
            """
            MATCH (m:Movie)
            WHERE m.plot IS NOT NULL AND m.plot <> ''
            RETURN m.movieId AS movieId, m.title AS title, m.plot AS plot
            ORDER BY coalesce(m.imdbRating, 0) DESC
            LIMIT 500
            """
        )
        movies = [dict(r) for r in result]

    driver.close()
    print(f"Fetched {len(movies)} movies from Neo4j")

    # Generate embeddings in batches of 100
    client = OpenAI()
    all_embeddings = []
    batch_size = 100

    for i in range(0, len(movies), batch_size):
        batch = movies[i : i + batch_size]
        plots = [m["plot"] for m in batch]
        print(
            f"  Embedding batch {i // batch_size + 1}/"
            f"{(len(movies) - 1) // batch_size + 1} ({len(plots)} plots)..."
        )

        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=plots,
        )

        for j, emb_data in enumerate(response.data):
            all_embeddings.append(
                {
                    "movieId": batch[j]["movieId"],
                    "embedding": emb_data.embedding,
                }
            )

    print(f"Generated {len(all_embeddings)} embeddings")

    # Save to CSV in the main project data directory
    data_dir = os.path.join(
        os.path.dirname(__file__), "..", "genai-maf-context-providers", "data"
    )
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "movie_embeddings.csv")

    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["movieId", "embedding"])
        for item in all_embeddings:
            writer.writerow([item["movieId"], json.dumps(item["embedding"])])

    file_size = os.path.getsize(csv_path) / (1024 * 1024)
    print(f"Saved to {csv_path} ({file_size:.1f} MB)")


if __name__ == "__main__":
    main()
