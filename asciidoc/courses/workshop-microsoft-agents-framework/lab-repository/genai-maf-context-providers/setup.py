"""
Setup script for the MAF Context Providers course.

Run this after connecting to your Neo4j recommendations sandbox
to load movie plot embeddings and create required indexes.

Usage:
    python genai-maf-context-providers/setup.py
"""
import csv
import json
import os
import time

from dotenv import load_dotenv
load_dotenv(override=True)

from neo4j import GraphDatabase


def main():
    uri = os.environ["NEO4J_URI"]
    username = os.environ["NEO4J_USERNAME"]
    password = os.environ["NEO4J_PASSWORD"]

    driver = GraphDatabase.driver(uri, auth=(username, password))

    # Verify connection
    print("Connecting to Neo4j...")
    driver.verify_connectivity()
    print(f"  Connected to {uri}")

    # Check that movies exist
    with driver.session() as session:
        result = session.run("MATCH (m:Movie) RETURN count(m) AS count")
        count = result.single()["count"]
        if count == 0:
            print("\nERROR: No Movie nodes found. Make sure you are using")
            print("the Recommendations sandbox from https://sandbox.neo4j.com")
            driver.close()
            return
        print(f"  Found {count} movies in database")

    # Step 1: Load embeddings from CSV
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    csv_path = os.path.join(data_dir, "movie_embeddings.csv")

    if not os.path.exists(csv_path):
        print(f"\nERROR: {csv_path} not found")
        driver.close()
        return

    print("\nStep 1: Loading movie plot embeddings from CSV...")
    embeddings = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            embeddings.append(
                {
                    "movieId": row["movieId"],
                    "embedding": json.loads(row["embedding"]),
                }
            )
    print(f"  Read {len(embeddings)} embeddings from CSV")

    # Load embeddings in batches
    batch_size = 100
    loaded = 0
    with driver.session() as session:
        for i in range(0, len(embeddings), batch_size):
            batch = embeddings[i : i + batch_size]
            session.run(
                """
                UNWIND $batch AS item
                MATCH (m:Movie {movieId: item.movieId})
                SET m.plotEmbedding = item.embedding
                """,
                batch=batch,
            )
            loaded += len(batch)
            print(f"  Loaded {loaded}/{len(embeddings)} embeddings...")

    print(f"  Done — {loaded} movies updated with plotEmbedding")

    # Step 2: Create vector index
    print("\nStep 2: Creating vector index on Movie.plotEmbedding...")
    with driver.session() as session:
        # Drop existing index if it exists
        try:
            session.run("DROP INDEX moviePlots IF EXISTS")
        except Exception:
            pass

        session.run(
            """
            CREATE VECTOR INDEX moviePlots IF NOT EXISTS
            FOR (m:Movie)
            ON m.plotEmbedding
            OPTIONS {indexConfig: {
                `vector.dimensions`: 1536,
                `vector.similarity_function`: 'cosine'
            }}
            """
        )
    print("  Created index: moviePlots (vector, 1536 dims, cosine)")

    # Step 3: Create fulltext index
    print("\nStep 3: Creating fulltext index on Movie.plot...")
    with driver.session() as session:
        session.run(
            """
            CREATE FULLTEXT INDEX moviePlotsFulltext IF NOT EXISTS
            FOR (m:Movie)
            ON EACH [m.plot]
            """
        )
    print("  Created index: moviePlotsFulltext (fulltext)")

    # Wait for indexes to come online
    print("\nWaiting for indexes to come online...")
    with driver.session() as session:
        for _ in range(30):
            result = session.run(
                """
                SHOW INDEXES
                YIELD name, state
                WHERE name IN ['moviePlots', 'moviePlotsFulltext']
                RETURN name, state
                """
            )
            states = {r["name"]: r["state"] for r in result}
            all_online = all(s == "ONLINE" for s in states.values())
            if all_online and len(states) == 2:
                break
            time.sleep(1)

    print(f"  moviePlots: {states.get('moviePlots', 'UNKNOWN')}")
    print(f"  moviePlotsFulltext: {states.get('moviePlotsFulltext', 'UNKNOWN')}")

    # Verify
    print("\nVerification:")
    with driver.session() as session:
        result = session.run(
            "MATCH (m:Movie) WHERE m.plotEmbedding IS NOT NULL "
            "RETURN count(m) AS count"
        )
        emb_count = result.single()["count"]
        print(f"  Movies with embeddings: {emb_count}")

        result = session.run(
            "CALL db.index.fulltext.queryNodes('moviePlotsFulltext', 'space') "
            "YIELD node RETURN count(node) AS count"
        )
        ft_count = result.single()["count"]
        print(f"  Fulltext search for 'space': {ft_count} results")

    driver.close()
    print("\nSetup complete! You can now run the course exercises.")


if __name__ == "__main__":
    main()
