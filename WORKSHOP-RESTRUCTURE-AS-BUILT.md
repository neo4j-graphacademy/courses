# Workshop-Importing: As-Built Structure

## The Goal: Product Recommendations

**One problem, one journey:** Build a query that answers:

> "What products do people like me buy, that I haven't bought yet?"

Every module builds toward this single recommendation query.

---

## Core Pattern: Learn → Do → Practice

**Every module follows:**

1. **Learn the concept** (2-5 min theory)
2. **Do it immediately** (7-12 min hands-on challenge)
3. **Query the result** (3-6 min proof point comparing SQL vs Cypher)
4. **Practice optionally** (5-10 min query challenges) ⭐

**Key principle:** After you learn something, you do it as soon as possible.

---

## Module 1: Aura Setup

**Purpose:** Set up environment and learn import tool

**Lessons:**
1. Workshop Overview (introduces recommendation goal)
2. About Aura (platform introduction)
3. **Import Tool Overview** ⭐ **SOURCE OF TRUTH**
4. Aura Tools (Query, Explore, etc.)

**Critical:** Lesson 3 teaches HOW to use Data Importer. Later modules reference this lesson and focus on MODELING DECISIONS, not re-teaching import mechanics.

---

## Module 2: Foundation

**Purpose:** Import first nodes (Products)

**Structure:**

**Lesson 1: Graph Fundamentals & Cypher Primer** (5 min)
- Combined: graph elements + Cypher basics in one lesson
- Nodes, relationships, properties, labels
- MATCH, RETURN, basic patterns
- Teaser: Show final recommendation query
- "Every lesson builds toward this"

**Lesson 2: Identifying Nodes** (2-3 min)
- What makes something a node?
- Decision criteria: distinct entity, own properties, queryable, connections
- Example: Product is a node
- Why Product first: Central to recommendations

**Challenge 3: Import Your First Nodes** (7 min)
- **Apply immediately:** Use Data Importer to import Products
- **References Module 1 Lesson 3** for import mechanics (don't re-teach HOW)
- **Focus:** Applying the modeling decision (Product = node)
- Map properties, set ID, run import
- Validate with query
- **Building block 1:** "Products exist in the graph"

**Lesson 4: Optional Practice Queries** ⭐ (5 min - skip or do)
- **Practice immediately** after importing
- Write queries: filter by price, count products, find low stock
- **Optional:** Advanced learners skip to Module 3
- Builds confidence with Cypher

**Pattern achieved:**
- ✅ Learn concept (node criteria)
- ✅ Do it (import products)
- ✅ Query it (validate import)
- ✅ Practice it (optional challenges)

---

## Module 3: Basic Relationships

**Purpose:** Connect Customers to Orders

**Structure:**

**Lesson 1: Understanding Relationships** (4 min)
- What are relationships (type, direction, properties)
- Compare: SQL foreign keys vs graph relationships
- Example: Customer PLACED Order
- "Need Customer→Order path to find 'people like me'"

**Challenge 2: Import Customers and Orders with PLACED** (10 min)
- **Apply immediately:** Import 2 node types + create relationships
- **References Module 1 Lesson 3** for import mechanics
- **Focus:** Foreign key → relationship transformation
- Create PLACED relationships
- Validate with traversal query
- **Building block 2:** "Customer→Order path complete"

**Lesson 3: Traversing Relationships** (5 min)
- Proof point: Graph traversal vs SQL JOIN
- Query: "What orders did ALFKI place?" (no JOIN!)
- Performance: O(k) vs O(n×m)
- "Half the path to recommendations done"

**Lesson 4: Optional Practice Queries** ⭐ (5 min - skip or do)
- **Practice immediately** after creating relationships
- Customer order counts, active customers, date ranges
- Negative patterns: customers WITHOUT orders
- Foundation for recommendation query

**Pattern achieved:**
- ✅ Learn concept (relationships)
- ✅ Do it (create PLACED relationships)
- ✅ Query it (traversals, compare to SQL)
- ✅ Practice it (optional relationship queries)

---

## Module 4: Many-to-Many ⭐ THE CRITICAL MODULE

**Purpose:** Transform pivot table into relationships

**Structure:**

**Lesson 1: Graph vs Pivot Tables** (5 min)
- The many-to-many problem in relational (pivot tables)
- Show: order_details table with 2 foreign keys
- **The transformation:** Entire pivot table → ORDERS relationships
- Properties move to relationships (quantity, unitPrice)
- "This completes Customer→Order→Product path"

**Challenge 2: Create ORDERS Relationships** (12 min)
- **The big moment:** Transform 2,155 pivot table rows into relationships
- **References Module 1 Lesson 3** for import mechanics
- **Focus:** Pivot table elimination, relationship properties
- Add quantity and unitPrice ON the relationship
- Validate: Complete two-hop traversal Customer→Product
- **Building block 3:** "Complete path for recommendations exists!"

**Lesson 3: Multi-Hop Traversals** (6 min)
- Proof point: Customer→Order→Product queries
- Compare: SQL 3 JOINs vs Cypher two-hop
- Show aggregations on relationship properties
- Performance: O(k) vs O(n×m) table scans
- "Same pattern powers recommendations"

**Lesson 4: Optional Practice Queries** ⭐ (10 min - skip or do)
- **Practice immediately** with complete path
- Multi-hop patterns: ANTON's favorite product
- Products never ordered (negative patterns)
- Co-purchases, customer spending
- **Similar customers query** - foundation of collaborative filtering!

**Pattern achieved:**
- ✅ Learn concept (many-to-many, pivot tables)
- ✅ Do it (transform pivot table into relationships)
- ✅ Query it (multi-hop traversals, compare to SQL)
- ✅ Practice it (complex business questions, similar customers)

---

## Key Principles (As Built)

### 1. Module 1 Lesson 3 is Source of Truth
- **How to use Data Importer** taught ONCE comprehensively
- Later challenges say: "Use Data Importer (see Module 1 Lesson 3)"
- Focus shifts to MODELING DECISIONS, not import tool mechanics

### 2. Immediate Application
- No gap between learning and doing
- Learn concept → Apply it in next lesson (challenge)
- Not: "Learn 7 concepts, then import everything"

### 3. Optional Practice After Every Module
- Learners practice immediately after building
- **Advanced:** Skip to next module
- **Beginners:** Cement knowledge with hands-on queries
- Builds confidence incrementally

### 4. Validation Built Into Challenges
- Every import includes verification query
- Immediate feedback loop
- No separate "did it work?" lessons

### 5. SQL Comparisons Throughout
- Every proof point shows equivalent SQL
- JOINs get progressively more complex
- Graph queries stay readable
- "Look how much easier this is!"

### 6. Real Business Questions
- Optional challenges use actual scenarios
- "What is ANTON's most ordered product?"
- "Which customers have spent the most?"
- Prepares for recommendation query patterns

### 7. Progressive Building Blocks
- Module 2: Products exist (block 1)
- Module 3: Customer→Order path (block 2)
- Module 4: Customer→Order→Product complete path (block 3)
- Each block explicitly referenced

---

## What's Different from Original Proposal

### Original Proposal:
- One giant "Module 2: Building Your Graph" with 6 cycles
- Cycles numbered 1-6 within the module
- Less emphasis on optional practice
- Import mechanics explained in each cycle

### As Built:
- **Separate modules** for each concept (Modules 2-4, more coming)
- **Module per transformation** (Foundation, Basic Relationships, Many-to-Many)
- **Optional practice after each module** (⭐ skip or do)
- **Module 1 Lesson 3 as import mechanics source** (don't repeat HOW, focus on WHAT/WHY)
- **Clearer progression** - each module = one concept mastered

---

## Remaining Modules (To Be Built)

**Module 5: Similar Customers**
- Finding "people like me" based on shared purchases
- Measuring similarity with different scoring methods
- Foundation of collaborative filtering

**Module 6: The Money Query** ⭐⭐
- Complete recommendation query
- Collection and filtering (collect(), WHERE NOT IN)
- SQL nightmare vs Cypher elegance side-by-side
- THE BIG REVEAL

**Module 7: Optional Enrichments**
- Categories as nodes (optional)
- Weighted recommendations
- Advanced patterns

**Module 8: Final Review**
- Constraints and indexes
- Workshop review
- Knowledge check quiz

**Module 1 Update:**
- Update Lesson 1 (Workshop Overview) to introduce recommendation challenge upfront

---

## Timing (As Built)

**Module 1:** 20-25 minutes (includes Import Tool Overview source of truth)

**Module 2:** 15-20 min (core) + 5 min (optional practice)

**Module 3:** 15-20 min (core) + 5 min (optional practice)

**Module 4:** 20-25 min (core) + 10 min (optional practice)

**Total so far:** ~70 minutes core + 20 minutes optional practice

**Target total:** ~90 minutes core + 30 minutes optional practice = 2 hours

---

## Success Metrics

### What Makes This Workshop Work:

1. ✅ **Clear goal** - Product recommendations from lesson 1
2. ✅ **Immediate application** - Learn → Do gap is minutes, not lessons
3. ✅ **Optional practice** - Flexibility for different learner speeds
4. ✅ **Import tool mastery** - Taught once (Module 1 Lesson 3), referenced later
5. ✅ **Modeling focus** - Challenges focus on DECISIONS, not mechanics
6. ✅ **SQL comparisons** - Every module proves graph value
7. ✅ **Real queries** - Business questions throughout
8. ✅ **Progressive complexity** - Building blocks explicitly tracked
9. ✅ **Runnable code** - Every code block is a complete, executable query
10. ✅ **Modular structure** - Clear learning units with mastery points

### What Learners Get:

- **Knowledge:** Graph modeling, Cypher, import patterns
- **Skills:** Can import their own data, write complex queries
- **Confidence:** Built incrementally with optional practice
- **Proof:** See graph advantages vs SQL throughout
- **Outcome:** Working recommendation system built step-by-step
