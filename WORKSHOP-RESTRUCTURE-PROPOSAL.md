# Workshop-Importing Restructure Proposal

## The Framing: One Problem, One Journey

**The Challenge:** Build a product recommendation system that answers:

> "What products do people like me buy, that I haven't bought yet?"

This single query showcases every graph advantage:
- **Tables → Labels** (Customer, Order, Product nodes)
- **Foreign keys → Relationships** (PLACED, ORDERS)
- **Many-to-many pivot tables → Relationships with properties** (order_details table → ORDERS relationship with quantity)

### The Money Query

**SQL (nightmare - 6+ JOINs, self-joins, subquery):**
```sql
SELECT DISTINCT p.productName, p.productId, COUNT(DISTINCT c2.customerId) AS recommendations
FROM customers c1
JOIN orders o1 ON c1.customerId = o1.customerId
JOIN order_details od1 ON o1.orderId = od1.orderId
-- Find other customers who bought similar products
JOIN order_details od2 ON od1.productId = od2.productId
JOIN orders o2 ON od2.orderId = od2.orderId
JOIN customers c2 ON o2.customerId = c2.customerId
  AND c2.customerId != c1.customerId
-- Find products those customers bought
JOIN orders o3 ON c2.customerId = o3.customerId
JOIN order_details od3 ON o3.orderId = od3.orderId
JOIN products p ON od3.productId = p.productId
-- Exclude products I already bought
WHERE c1.customerId = 'ALFKI'
  AND p.productId NOT IN (
    SELECT od.productId
    FROM orders o
    JOIN order_details od ON o.orderId = od.orderId
    WHERE o.customerId = 'ALFKI'
  )
GROUP BY p.productName, p.productId
ORDER BY recommendations DESC
LIMIT 5;
```

**Cypher (reads like English):**
```cypher
// Find products I bought
MATCH (me:Customer {customerId: 'ALFKI'})-[:PLACED]->(:Order)-[:ORDERS]->(myProduct:Product)
WITH me, collect(myProduct) AS myProducts

// Find customers like me (bought same products)
MATCH (me)-[:PLACED]->(:Order)-[:ORDERS]->(:Product)<-[:ORDERS]-(:Order)<-[:PLACED]-(other:Customer)

// Find what they bought that I haven't
MATCH (other)-[:PLACED]->(:Order)-[:ORDERS]->(rec:Product)
WHERE NOT rec IN myProducts

RETURN rec.productName, count(*) AS recommendations
ORDER BY recommendations DESC
LIMIT 5;
```

**Every cycle in the workshop builds toward this query.** Each modeling decision they make adds a piece to the final solution.

---

## Current Structure (Problem)

**Module 1: Aura Setup** ✅ KEEP AS-IS
- 1. Workshop Overview
- 2. About Aura
- 4. Aura Tools

**Module 2: Data Modeling** ❌ ALL THEORY
- 1. What is Modeling
- 2. Understanding Domain
- 3. Nodes and Labels
- 4. Relationships
- 5. Properties
- 6. Testing Model
- 7. Refactoring

**Module 3: Importing Data** ❌ ALL IMPORTING
- 1. Import Overview
- 2. Data Importer Intro
- 3. Importing Nodes
- 4. Importing Relationships
- 5. Constraints and Indexes
- 6. Complete Import

**Module 4: Querying Data** ❌ ALL QUERYING
- 1. Intro to Cypher
- 2. Reading Data
- 3. Pattern Matching
- 4. Filtering Data
- 5. Aggregating Data

**Problem:** Theory → Practice → Application structure delays hands-on work and doesn't show WHY decisions matter.

---

## Proposed Structure (Solution)

**Module 1: Aura Setup** ✅ NO CHANGES
- 1. Workshop Overview
- 2. About Aura
- 4. Aura Tools

**Module 2: Building Your Graph Database** 🔄 ITERATIVE CYCLES

**Each cycle builds toward the final recommendation query.**

### Cycle 1: Foundation (Nodes and Cypher Basics)

**Lesson 1: Graph Fundamentals & Cypher Primer**
- Brief recap: nodes, relationships, properties, labels
- How they fit together in a graph model
- Cypher basics: MATCH, RETURN, basic patterns
- Just enough to get started
- **Frame the goal:** "We're building toward a recommendation query"
- Show a teaser of the final query (don't explain fully yet)
- 4-5 minutes

**Lesson 2: Identifying Nodes**
- Concept: What makes something a node?
- Decision criteria: independent entities vs properties
- Example: Product is a node (has identity, own data, central to recommendations)
- **Connection to goal:** "Products are what we'll recommend"
- 2 minutes

**Challenge 3: Import Your First Nodes**
- Hands-on: Use Data Importer to import Product nodes
- Map CSV columns to node properties (productName, unitPrice, etc.)
- Run the import
- **Validation:** Test your import with a simple query:
  ```cypher
  MATCH (p:Product) RETURN p LIMIT 5;
  ```
- **Why products first:** They're the entities we're recommending
- **Building block 1:** "We can now query products - but we need connections to recommend them"
- 7 minutes

**Optional Query Challenges** ⭐ (Skip or practice)
- Practice writing queries to explore your data
- Answer business questions:
  - "Which products cost more than $50?"
  - "How many products are there in total?"
  - "What are the 5 most expensive products?"
- These are optional - advanced learners can proceed to Cycle 2
- Beginners can use these to build Cypher confidence
- 5 minutes (optional)

---

### Cycle 2: Basic Relationships

**Lesson 5: Understanding Relationships**
- Concept: How entities connect in a graph
- Relationship types, direction, properties
- Example: Customer PLACED Order
- **Connection to goal:** "To find 'people like me', we need to connect customers to their purchases"
- 2 minutes

**Challenge 6: Import Customers and Orders with PLACED Relationships**
- Hands-on: Import Customer nodes and Order nodes
- Create PLACED relationships between Customer and Order
- Map relationship properties (orderDate)
- **Building block 2:** "Now we have customers connected to orders"
- 7 minutes

**Lesson 7: Traversing Relationships**
- Proof point: "What orders did this customer place?"
- Compare graph traversal vs SQL JOIN
- Show the performance and simplicity difference
- **Building block 2:** "We can now find a customer's orders - but we need to connect orders to products"
- 4 minutes

**SQL (JOIN):**
```sql
SELECT o.*
FROM customers c
JOIN orders o ON c.customerId = o.customerId
WHERE c.customerId = 'ALFKI';
```

**Cypher (direct traversal):**
```cypher
MATCH (c:Customer {customerId: 'ALFKI'})-[:PLACED]->(o:Order)
RETURN o;
```

**Optional Query Challenges** ⭐ (Skip or practice)
- Practice relationship traversal:
  - "How many orders has customer ANTON placed?"
  - "Which customers have placed more than 10 orders?"
  - "What's the date range of ALFKI's orders?"
- 5 minutes (optional)

---

### Cycle 3: Many-to-Many Relationships ⭐ THE KEY MOMENT

**Lesson 8: Graph vs Pivot Tables**
- Concept: Why graphs excel at many-to-many relationships
- Relational: orders, order_details (pivot), products = 3 tables
- Graph: (Order)-[:ORDERS]->(Product) = direct relationship
- Properties go ON the relationship (quantity, unitPrice)
- **Connection to goal:** "This is THE key to recommendations - connecting customers to products through orders"
- **Show order_details table:** This entire table becomes relationships
- 3 minutes

**Relational structure (3 tables, 2 JOINs every time):**
```
customers → orders → order_details (pivot) → products
          (FK)      (2 FKs: orderId, productId)
```

**Graph structure (direct path):**
```
(Customer)-[:PLACED]->(Order)-[:ORDERS {quantity, unitPrice}]->(Product)
```

**Challenge 9: Create ORDERS Relationships**
- Hands-on: Create ORDERS relationships between Order and Product
- Add quantity and unitPrice as relationship properties
- **The transformation:** order_details table → ORDERS relationships
- **This is the "aha moment"** for graphs
- **Building block 3:** "We now have the complete path: Customer → Order → Product"
- 8 minutes

**Lesson 10: Multi-Hop Traversals - The Foundation of Recommendations**
- Proof point: "What products has customer ALFKI purchased?"
- This would require 3 JOINs in SQL (customers → orders → order_details → products)
- Graph: simple two-hop traversal
- **Critical insight:** "This pattern is the CORE of our recommendation query"
- Show how easy it is to extend the query
- 5 minutes

**SQL (3 JOINs, order_details pivot table, scans thousands of rows):**
```sql
SELECT DISTINCT p.productName
FROM customers c
JOIN orders o ON c.customerId = o.customerId
JOIN order_details od ON o.orderId = od.orderId
JOIN products p ON od.productId = p.productId
WHERE c.customerId = 'ALFKI';
```

**Cypher (direct two-hop traversal, constant performance):**
```cypher
MATCH (c:Customer {customerId: 'ALFKI'})-[:PLACED]->(:Order)-[:ORDERS]->(p:Product)
RETURN DISTINCT p.productName;
```

**This exact pattern is the foundation of the recommendation query we're building toward.**

**Optional Query Challenges** ⭐ (Skip or practice)
- Now you have the complete Customer→Product path!
- Answer complex business questions:
  - **"What is ANTON's most ordered product?"**
    ```cypher
    MATCH (c:Customer {customerId: 'ANTON'})-[:PLACED]->(:Order)-[o:ORDERS]->(p:Product)
    RETURN p.productName, sum(o.quantity) AS totalQuantity
    ORDER BY totalQuantity DESC
    LIMIT 1;
    ```
  - **"Which product has the highest profit margin?"** (if you have cost data)
  - **"What products are frequently bought together?"** (appear in same orders)
  - **"Which customer has spent the most money?"**
    ```cypher
    MATCH (c:Customer)-[:PLACED]->(:Order)-[o:ORDERS]->(p:Product)
    RETURN c.companyName, sum(o.quantity * o.unitPrice) AS totalSpent
    ORDER BY totalSpent DESC
    LIMIT 1;
    ```
- These queries would require multiple JOINs and aggregations in SQL
- In the graph, they're straightforward traversals
- 10 minutes (optional)

---

### Cycle 4: Finding Similar Customers

**Lesson 11: Bidirectional Traversals**
- Concept: Following relationships in both directions
- Customer → Product (what I bought)
- Customer ← Product (who else bought this)
- **Connection to goal:** "To find 'people like me', we need to traverse backward from products"
- 3 minutes

**Challenge 12: Query for Similar Customers**
- Hands-on: Write a query to find customers who bought the same products
- Start with one customer, find their products, find other customers
- **Building block 4:** "We can now find customers with similar purchase patterns"
- 5 minutes

```cypher
// Find customers who bought the same products as ALFKI
MATCH (me:Customer {customerId: 'ALFKI'})-[:PLACED]->(:Order)-[:ORDERS]->(p:Product)
MATCH (p)<-[:ORDERS]-(:Order)<-[:PLACED]-(other:Customer)
WHERE other <> me
RETURN other.companyName, count(DISTINCT p) AS sharedProducts
ORDER BY sharedProducts DESC;
```

**Lesson 13: The Pattern Emerges**
- Proof point: Show how close we are to recommendations
- Compare to SQL: would need self-joins, complex subqueries
- **Key insight:** "We're one step away from recommendations - we just need to find what THEY bought that I haven't"
- 4 minutes

---

### Cycle 5: Exclusion Patterns

**Lesson 14: Collection and Filtering**
- Concept: collect() to build lists, WHERE NOT IN to exclude
- **Connection to goal:** "Exclude products I already own from recommendations"
- 2 minutes

**Challenge 15: Complete the Recommendation Query**
- Hands-on: Build the complete recommendation query
- Collect my products, find similar customers, find their products, exclude mine
- **THE PAYOFF MOMENT** ⭐
- 8 minutes

```cypher
// Find products I bought
MATCH (me:Customer {customerId: 'ALFKI'})-[:PLACED]->(:Order)-[:ORDERS]->(myProduct:Product)
WITH me, collect(myProduct) AS myProducts

// Find customers like me
MATCH (me)-[:PLACED]->(:Order)-[:ORDERS]->(:Product)<-[:ORDERS]-(:Order)<-[:PLACED]-(other:Customer)

// Find what they bought that I haven't
MATCH (other)-[:PLACED]->(:Order)-[:ORDERS]->(rec:Product)
WHERE NOT rec IN myProducts

RETURN rec.productName, count(*) AS recommendations
ORDER BY recommendations DESC
LIMIT 5;
```

**Lesson 16: The Money Query - Graph vs SQL**
- **THE BIG REVEAL:** Show the complete SQL version side-by-side
- 6+ JOINs, self-joins, subquery, complex logic
- Compare to our readable Cypher
- **This is what we built toward through every decision**
- 5 minutes

**SQL (6+ JOINs, self-joins, subquery - nightmare):**
```sql
SELECT DISTINCT p.productName, p.productId,
       COUNT(DISTINCT c2.customerId) AS recommendations
FROM customers c1
JOIN orders o1 ON c1.customerId = o1.customerId
JOIN order_details od1 ON o1.orderId = od1.orderId
-- Find other customers who bought similar products
JOIN order_details od2 ON od1.productId = od2.productId
JOIN orders o2 ON od2.orderId = od2.orderId
JOIN customers c2 ON o2.customerId = c2.customerId
  AND c2.customerId != c1.customerId
-- Find products those customers bought
JOIN orders o3 ON c2.customerId = o3.customerId
JOIN order_details od3 ON o3.orderId = od3.orderId
JOIN products p ON od3.productId = p.productId
-- Exclude products I already bought
WHERE c1.customerId = 'ALFKI'
  AND p.productId NOT IN (
    SELECT od.productId
    FROM orders o
    JOIN order_details od ON o.orderId = od.orderId
    WHERE o.customerId = 'ALFKI'
  )
GROUP BY p.productName, p.productId
ORDER BY recommendations DESC
LIMIT 5;
```

**Graph database wins:**
- ✅ Readable: Cypher reads like the question
- ✅ Maintainable: Easy to modify and extend
- ✅ Performant: Direct traversals, no table scans
- ✅ Flexible: Add more criteria, relationships, patterns easily

---

### Cycle 6: Optional Enrichments (Stretch Goals)

**Lesson 17: Adding Categories for Better Recommendations**
- Concept: Property vs node decisions
- Make Category a node to enable category-based recommendations
- 3 minutes

**Challenge 18: Import Categories and Refine Recommendations**
- Hands-on: Import Category nodes, create IN_CATEGORY relationships
- Modify recommendation query to prioritize by category preferences
- 6 minutes

**Lesson 19: Relationship Properties for Business Logic**
- Concept: Using relationship properties in recommendations
- Weight recommendations by quantity, recency, price
- 4 minutes

---

### Final Lessons

**Lesson 20: Graph Data Quality**
- Constraints and indexes for production-ready graphs
- Performance considerations
- 5 minutes

**Lesson 21: Workshop Review - What You Built**
- Summary: Every modeling decision built toward the recommendation query
- Tables → Labels: customers, orders, products
- Foreign keys → Relationships: PLACED, ORDERS
- Pivot table → Relationships with properties: order_details → ORDERS
- **The transformation:** Relational nightmare → Graph elegance
- 3 minutes

**Lesson 22: Knowledge Check**
- Quiz questions covering all concepts
- Test understanding of modeling decisions
- Final completion
- 5 minutes

---

## Module Timing

**Module 1: Aura Setup** - 20 minutes
- Unchanged from current
- Sets up the recommendation challenge

**Module 2: Building Your Graph Database** - 100 minutes

**Core Path (Required):**
- **Cycle 1: Foundation** (12 min) - Graph fundamentals, Cypher primer, import products
- **Cycle 2: Basic Relationships** (11 min) - Import customers & orders, PLACED relationships, traversals
- **Cycle 3: Many-to-Many** ⭐ (16 min) - ORDERS relationships, Customer→Product path complete
- **Cycle 4: Similar Customers** (12 min) - Bidirectional traversals, finding patterns
- **Cycle 5: The Money Query** ⭐⭐ (15 min) - Complete recommendation query, SQL vs Cypher reveal
- **Cycle 6: Optional Enrichments** (13 min) - Categories, weighted recommendations
- **Final Lessons** (13 min) - Constraints, review, quiz

**Core subtotal: ~92 minutes**

**Optional Query Challenges (Practice):**
- After Cycle 1: Basic product queries (5 min)
- After Cycle 2: Relationship traversals (5 min)
- After Cycle 3: Complex business questions (10 min)

**Optional subtotal: ~20 minutes**

**Total: 2 hours (core path ~1.5 hours + optional practice)**

---

## Key Improvements

1. **Single compelling narrative** - Every lesson builds toward solving the recommendation query

2. **The money query reveal** - SQL nightmare vs Cypher elegance shown side-by-side at the climax

3. **Clear transformation arc:**
   - Tables → Labels (customers, orders, products)
   - Foreign keys → Relationships (PLACED, ORDERS)
   - Pivot tables → Relationships with properties (order_details → ORDERS)

4. **Hands-on progression** - Each cycle adds a piece of the final solution

5. **Start with the end in mind** - Learners see the goal (recommendation query) from lesson 1

6. **Proof points build** - Each query gets more complex, building toward the final query

7. **Real business value** - Product recommendations are immediately understandable and valuable

8. **Perfect for graph databases** - Shows exactly what graphs were designed to solve

9. **Streamlined core path** - No standalone lessons for basic queries; validation built into challenges

10. **Optional practice** - Query challenges after each cycle for learners who want more practice

---

## Content Reuse from Current Modules

**From Module 2 (Modeling):**
- ✅ Understanding domain → Lesson 1 (Graph Elements Recap)
- ✅ Nodes and labels → Lesson 3 (Identifying Nodes)
- ✅ Relationships → Lesson 6 (Understanding Relationships)
- ✅ Properties → Lessons 12, 15 (Property decisions)
- ✅ Refactoring → Lesson 18 (Specific relationships)

**From Module 3 (Importing):**
- ✅ Data Importer intro → Woven into Challenge 4
- ✅ Importing nodes → Challenges 4, 7, 10, 13, 19
- ✅ Importing relationships → Challenges 7, 10, 13, 16, 19
- ✅ Constraints → Cycle 7

**From Module 4 (Querying):**
- ✅ Intro to Cypher → Lesson 2 (Cypher Primer)
- ✅ Reading data → Lessons 5, 8, 11, 14
- ✅ Pattern matching → Lessons 11, 20
- ✅ Filtering → Lesson 14
- ✅ Aggregating → Lessons 17, 25

**Nothing is wasted** - all current content gets repurposed into the iterative cycles.

---

## Next Steps

If you approve this structure, I will:

1. ✅ Update create-new-workshop.mdc with workshop pedagogy (DONE)
2. ✅ Frame around product recommendations as the single goal (DONE)
3. Update Module 1 Lesson 1 (Workshop Overview) to introduce the recommendation challenge
4. Create new lesson outlines for Module 2 following the cycle structure
5. Adapt content from existing modules 2, 3, 4 into the new lessons
6. Build SQL vs Cypher comparison into each proof point
7. Create the "money query" reveal as the climax (Lesson 16)
8. Add hands-on Data Importer challenges for each cycle

## The Workshop Journey

**Act 1: The Challenge** (Module 1)
- Setup Aura
- Introduce the recommendation problem
- Show the complex SQL query they'll be solving
- "This workshop teaches you to solve this"

**Act 2: Building the Solution** (Module 2, Cycles 1-4)
- Import products, customers, orders
- Create PLACED and ORDERS relationships
- Build Customer→Product path
- Learn bidirectional traversals

**Act 3: The Payoff** (Module 2, Cycle 5)
- Complete recommendation query
- SQL nightmare vs Cypher elegance reveal
- "Look what you just built"

**Act 4: Polish** (Module 2, Cycle 6 + Final)
- Optional enrichments
- Production considerations
- Knowledge check

## Summary

This restructure transforms the workshop from:
- ❌ "Learn modeling, then import, then query"
- ✅ **"Solve one compelling problem by building the solution piece by piece"**

Every modeling decision is motivated by the recommendation goal. Every import brings them closer to the solution. Every query proves the graph advantage.

The final "money query" reveal shows them exactly what they accomplished - transforming a relational nightmare into graph elegance.

**Ready to proceed?**
