// Introduction to Neo4j - Getting Started
// Module 1: Graph Basics - Lesson 2

// Welcome to Neo4j Browser! Let's explore the interface and basic commands

// 1. Get system information
CALL dbms.components() YIELD name, versions, edition;

// 2. Show database schema visualization
CALL db.schema.visualization();

// 3. Check database statistics
CALL apoc.meta.stats() YIELD labels, relTypesCount, nodeCount, relCount
RETURN labels, relTypesCount, nodeCount, relCount;

// 4. Explore data samples from each node type
MATCH (c:Customer) RETURN c LIMIT 3;
MATCH (a:Account) RETURN a LIMIT 3;
MATCH (l:Location) RETURN l LIMIT 3;

// 5. See relationship examples
MATCH (c:Customer)-[r:HAS_ACCOUNT]->(a:Account) 
RETURN c.name, type(r), a.type, a.balance 
LIMIT 5;

// 6. Browser interface practice - see the graph visualization
MATCH (c:Customer {name: 'Alice Johnson'})-[:HAS_ACCOUNT]->(a:Account)
RETURN c, a;

// 7. Try the table view vs graph view toggle
MATCH (c:Customer)-[:LIVES_IN]->(loc:Location) 
RETURN c.name, c.age, loc.city, loc.state 
LIMIT 10;

// 8. Export functionality test
MATCH (c:Customer)
RETURN c.name, c.email, c.age
ORDER BY c.age DESC
LIMIT 5;

// 9. Schema exploration - understand the data model
CALL db.schema.nodeTypeProperties() YIELD nodeType, propertyName, propertyTypes
RETURN nodeType, collect(propertyName) AS properties;

// 10. Query performance - see execution plan
EXPLAIN MATCH (c:Customer {name: 'Alice Johnson'}) RETURN c;