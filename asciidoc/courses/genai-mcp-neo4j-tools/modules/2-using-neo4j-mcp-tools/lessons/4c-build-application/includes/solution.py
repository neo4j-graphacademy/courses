#!/usr/bin/env python3

import os
import sys
from neo4j import GraphDatabase

def get_top_movies_by_genre(genre_name):
    """
    Retrieve the top 5 movies by genre ordered by imdbRating in descending order.
    
    Args:
        driver: Neo4j driver instance
        genre_name: Name of the genre to filter by
    
    Returns:
        List of dictionaries containing movie title and imdbRating
    """
    query = """
    MATCH (g:Genre)<-[:IN_GENRE]-(m:Movie)
    WHERE g.name = $genre_name AND m.imdbRating IS NOT NULL
    RETURN m.title AS title, m.imdbRating AS imdbRating
    ORDER BY m.imdbRating DESC
    LIMIT 5
    """

    # Get Neo4j connection details from environment variables
    neo4j_uri = os.getenv('NEO4J_URI')
    neo4j_username = os.getenv('NEO4J_USERNAME')
    neo4j_password = os.getenv('NEO4J_PASSWORD')

    # Connect to Neo4j
    with GraphDatabase.driver(neo4j_uri, auth=(neo4j_username, neo4j_password)) as driver:
        # Test connection
        driver.verify_connectivity()

        print(f"Connected to Neo4j at {neo4j_uri}")

        records, keys, summary = driver.execute_query(query, {"genre_name": genre_name})

        return [record.data() for record in records]
    

def main():
    """Main application function"""
    
    # Validate environment variables
    neo4j_uri = os.getenv('NEO4J_URI')
    neo4j_username = os.getenv('NEO4J_USERNAME')
    neo4j_password = os.getenv('NEO4J_PASSWORD')
    
    if not all([neo4j_uri, neo4j_username, neo4j_password]):
        print("Error: Please set the following environment variables:")
        print("- NEO4J_URI")
        print("- NEO4J_USERNAME")
        print("- NEO4J_PASSWORD")
        sys.exit(1)
    
    # Get genre input from user
    genre_name = input("Enter a genre name: ").strip()
    
    if not genre_name:
        print("Error: Genre name cannot be empty")
        sys.exit(1)
    

    try:
        # Get top movies for the specified genre
        movies = get_top_movies_by_genre(genre_name)
        
        if not movies:
            print(f"No movies found for genre: {genre_name}")
        else:
            print(f"\nTop 5 movies in '{genre_name}' genre by IMDB rating:")
            print("-" * 60)
            for i, movie in enumerate(movies, 1):
                print(f"{i}. {movie['title']} - IMDB Rating: {movie['imdbRating']}")
        
    except Exception as e:
        print(f"Error in application: {e}")
        sys.exit(1)
    


if __name__ == "__main__":
    main()
