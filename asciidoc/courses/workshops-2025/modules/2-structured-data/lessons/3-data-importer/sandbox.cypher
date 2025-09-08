// Data Importer Sandbox - View imported data and validate results

// 1. View all Customer nodes
MATCH (c:Customer) 
RETURN c 
LIMIT 10;

// 2. View all Account nodes  
MATCH (a:Account) 
RETURN a 
LIMIT 10;

// 3. View Customer-Account relationships
MATCH (c:Customer)-[r:HAS_ACCOUNT]->(a:Account)
RETURN c.name, a.accountType, a.balance
LIMIT 10;

// 4. Check data quality - customers without accounts
MATCH (c:Customer)
WHERE NOT (c)-[:HAS_ACCOUNT]->()
RETURN c.name, c.customerId;

// 5. Check data quality - accounts without customers  
MATCH (a:Account)
WHERE NOT ()-[:HAS_ACCOUNT]->(a)
RETURN a.accountId, a.accountType;

// 6. Customer account summary
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
RETURN c.name, 
       count(a) as accountCount,
       sum(a.balance) as totalBalance,
       avg(a.balance) as avgBalance
ORDER BY totalBalance DESC;

// 7. Account type distribution
MATCH (a:Account)
RETURN a.accountType, count(*) as count
ORDER BY count DESC;

// 8. High-value customers (total balance > 50000)
MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WITH c, sum(a.balance) as totalBalance
WHERE totalBalance > 50000
RETURN c.name, c.creditScore, totalBalance
ORDER BY totalBalance DESC;

// 9. Credit score analysis
MATCH (c:Customer)
RETURN avg(c.creditScore) as avgCreditScore,
       min(c.creditScore) as minCreditScore, 
       max(c.creditScore) as maxCreditScore;

// 10. Validate data types and constraints
MATCH (c:Customer)
WHERE c.customerId IS NULL OR c.name IS NULL
RETURN "Invalid customer data found" as warning, c;