// Basic Cypher Queries - Sandbox Exercises
// Module 1: Graph Basics - Lesson 3

// 1. Explore the graph structure
MATCH (n) RETURN DISTINCT labels(n) AS node_types, count(n) AS count ORDER BY count DESC;

// 2. Find customers
MATCH (c:Customer) RETURN c.name, c.email, c.age LIMIT 10;

// 3. Find customers with accounts
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
RETURN c.name, a.type, a.balance
LIMIT 10;

// 4. Filter customers by age
MATCH (c:Customer)
WHERE c.age > 30
RETURN c.name, c.age, c.city
ORDER BY c.age DESC;

// 5. Find customers with multiple accounts
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WITH c, count(a) AS account_count
WHERE account_count > 1
RETURN c.name, account_count
ORDER BY account_count DESC;

// 6. Find large transactions
MATCH (from:Account)-[t:TRANSACTION]->(to:Account)
WHERE t.amount > 5000
RETURN from.number AS from_account, 
       to.number AS to_account,
       t.amount, t.date
ORDER BY t.amount DESC
LIMIT 10;

// 7. Customer similarity (shared account types)
MATCH (c1:Customer)-[:HAS_ACCOUNT]->(a1:Account)
MATCH (c2:Customer)-[:HAS_ACCOUNT]->(a2:Account)
WHERE c1 <> c2 AND a1.type = a2.type
RETURN c1.name, c2.name, a1.type AS shared_account_type
LIMIT 20;

// 8. Find customers without transactions
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WHERE NOT (a)-[:TRANSACTION]-()
RETURN c.name, a.number, a.type;

// 9. Account balance statistics
MATCH (a:Account)
RETURN a.type, 
       count(a) AS total_accounts,
       avg(a.balance) AS average_balance,
       max(a.balance) AS max_balance,
       min(a.balance) AS min_balance
ORDER BY total_accounts DESC;

// 10. Transaction patterns by hour
MATCH ()-[t:TRANSACTION]-()
WHERE t.hour_of_day IS NOT NULL
RETURN t.hour_of_day, count(t) AS transaction_count
ORDER BY t.hour_of_day;