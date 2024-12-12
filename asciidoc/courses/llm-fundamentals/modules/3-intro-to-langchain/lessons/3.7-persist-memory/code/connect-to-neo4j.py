from langchain_neo4j import Neo4jGraph

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="pleaseletmein"
)

result = graph.query("""
MATCH (m:Movie{title: 'Toy Story'})
RETURN m.title, m.plot, m.poster
""")

print(result)