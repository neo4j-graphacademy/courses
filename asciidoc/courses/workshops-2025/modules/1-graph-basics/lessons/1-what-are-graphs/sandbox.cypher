// What are Graphs? - Sandbox Introduction
// Module 1: Graph Basics - Lesson 1

// Welcome to Neo4j! These are your first graph queries
// Each query demonstrates key graph concepts

// 1. Your first graph query - see what's in the database
MATCH (n) RETURN n LIMIT 25;

// 2. See the different types of nodes (entities)
MATCH (n) RETURN DISTINCT labels(n) AS node_types;

// 3. See the different types of relationships (connections)  
MATCH ()-[r]-() RETURN DISTINCT type(r) AS relationship_types;

// 4. Explore a simple pattern - customers and their accounts
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
RETURN c.name, a.type, a.balance
LIMIT 10;

// 5. The power of relationships - find connected data
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)-[:TRANSACTION]->(other:Account)
RETURN c.name, a.number AS from_account, other.number AS to_account
LIMIT 10;

// 6. Difference from SQL - this would require multiple JOINs in relational
MATCH (c:Customer)-[:LIVES_IN]->(loc:Location),
      (c)-[:HAS_ACCOUNT]->(a:Account)
RETURN c.name, loc.city, loc.state, a.type, a.balance
LIMIT 10;

// 7. Pattern matching - find specific scenarios
MATCH (c:Customer)
WHERE c.age > 30
RETURN c.name, c.age, c.city
LIMIT 10;

// 8. Graph traversal - follow paths through data
MATCH path = (c:Customer)-[:HAS_ACCOUNT]->(a:Account)-[:TRANSACTION*1..2]->()
RETURN c.name, length(path) AS path_length
LIMIT 10;