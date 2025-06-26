// Hands-on Exercise: Exploring Financial Data
// Module 1: Graph Basics - Lesson 4

// Exercise 1: Data Exploration
// ===========================

// Explore the database schema
CALL db.schema.visualization();

// Count nodes by type
MATCH (n)
RETURN labels(n) AS nodeType, count(n) AS count
ORDER BY count DESC;

// Count relationships by type
MATCH ()-[r]-()
RETURN type(r) AS relationshipType, count(r) AS count
ORDER BY count DESC;

// Exercise 2: Customer Analysis
// =============================

// Find high-value customers (total balance > 50,000)
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WITH c, sum(a.balance) AS total_balance
WHERE total_balance > 50000
RETURN c.name, c.email, total_balance
ORDER BY total_balance DESC
LIMIT 10;

// Explore customer relationships - multiple accounts
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
RETURN c.name, 
       count(a) AS number_of_accounts,
       collect(a.type) AS account_types
ORDER BY number_of_accounts DESC
LIMIT 5;

// Exercise 3: Transaction Patterns
// ================================

// Find large transactions (amount > 5,000)
MATCH (from:Account)-[t:TRANSACTION]->(to:Account)
WHERE t.amount > 5000
RETURN from.number AS from_account,
       to.number AS to_account,
       t.amount,
       t.date
ORDER BY t.amount DESC
LIMIT 10;

// Customer transaction activity
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)-[t:TRANSACTION]-()
WITH c, count(t) AS transaction_count, sum(abs(t.amount)) AS total_volume
WHERE transaction_count > 10
RETURN c.name, transaction_count, total_volume
ORDER BY total_volume DESC
LIMIT 10;

// Exercise 4: AI Use Case Identification
// ======================================

// Potential fraud detection - unusual transaction patterns
MATCH (a:Account)-[t:TRANSACTION]-()
WITH a, 
     count(t) AS transaction_count,
     avg(t.amount) AS avg_amount,
     stdev(t.amount) AS amount_stdev
WHERE transaction_count > 5 AND amount_stdev > avg_amount * 2
RETURN a.number, transaction_count, avg_amount, amount_stdev
ORDER BY amount_stdev DESC
LIMIT 5;

// Customer similarity for recommendations - shared merchant patterns
MATCH (c1:Customer)-[:HAS_ACCOUNT]->()-[:TRANSACTION]->(m:Merchant)<-[:TRANSACTION]-()-[:HAS_ACCOUNT]-(c2:Customer)
WHERE c1 <> c2
WITH c1, c2, count(m) AS shared_merchants
WHERE shared_merchants >= 3
RETURN c1.name, c2.name, shared_merchants
ORDER BY shared_merchants DESC
LIMIT 10;

// Bonus Challenges
// ================

// Geographic analysis - customer distribution
MATCH (c:Customer)-[:LIVES_IN]->(loc:Location)
WITH loc, count(c) AS customer_count
RETURN loc.city, loc.state, customer_count
ORDER BY customer_count DESC
LIMIT 10;

// Network effects - indirect customer connections
MATCH path = (c1:Customer)-[:HAS_ACCOUNT]->()-[:TRANSACTION*2..3]-()-[:HAS_ACCOUNT]-(c2:Customer)
WHERE c1 <> c2
RETURN c1.name, c2.name, length(path) AS connection_distance
LIMIT 20;

// Advanced: Find customer influence networks
MATCH (c1:Customer)-[:HAS_ACCOUNT]->(a1:Account)-[:TRANSACTION]->(a2:Account)<-[:HAS_ACCOUNT]-(c2:Customer)
WHERE c1 <> c2
WITH c1, c2, count(*) AS transaction_frequency
WHERE transaction_frequency > 1
RETURN c1.name AS sender, c2.name AS receiver, transaction_frequency
ORDER BY transaction_frequency DESC
LIMIT 15;