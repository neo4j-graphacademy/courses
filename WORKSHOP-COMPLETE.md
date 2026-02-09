# Neo4j Workshop: Importing Data - Complete Structure

## Goal
Build a recommendation system that answers: **"What products do people like me buy, that I haven't bought yet?"**

## Data Model
`Customer -[:PLACED]-> Order -[:CONTAINS]-> Product`

---

## Module 1: Aura Setup (20 minutes)

1. **Workshop Overview** (5 min)
   - Introduces the recommendation challenge
   - Shows the goal query
   - Module overview

2. **Introduction to Neo4j Aura** (5 min)
   - What is Neo4j Aura
   - Free tier setup
   - Platform basics

3. **Aura Tools Overview** (10 min)
   - Data Importer tool
   - Query tool
   - Explore tool

---

## Module 2: Foundation (30-60 minutes)

### Core Lessons (30 min):
1. **Graph Elements** (8 min)
   - Nodes, relationships, properties, labels
   
2. **Cypher Patterns Quiz** (5 min)
   - Quick knowledge check

3. **Identifying Nodes** (5 min)
   - What makes something a node
   - Product as example

4. **Understanding the Import Tool** (10 min)
   - How Data Importer works
   - Source of truth for import mechanics

5. **Importing Product Nodes** (12 min)
   - **CSV Load Button** - loads all files
   - Hands-on import of Products
   - Validation queries

### Optional Lessons (30 min):
6. **Importing Customer Nodes** (10 min, optional)
   - Practice import independently
   
7. **Importing Order Nodes** (10 min, optional)
   - Practice import independently

8. **Importing Category Nodes** (10 min, optional)
   - Practice import independently

---

## Module 3: Modeling Relationships (25 minutes)

1. **Understanding Relationships (PLACED and CONTAINS)** (10 min)
   - Direct relationship vs intermediate node
   - When to promote relationship to node
   - PLACED and CONTAINS explained

2. **Importing PLACED Relationships** (10 min)
   - Connect Customers to Orders
   - Create PLACED relationships
   - Validation queries

3. **Optional Practice with Relationship Queries** (15 min, optional)
   - Traversal practice
   - Business questions

---

## Module 4: Many-to-Many (35 minutes)

1. **Transforming Pivot Tables into Graph Relationships** (8 min)
   - Pivot table problem
   - order_details → CONTAINS relationships
   - Relationship properties

2. **Importing CONTAINS Relationships** (12 min)
   - Transform 2,155 rows into relationships
   - Complete Customer→Order→Product path
   - Validation queries

3. **Multi-Hop Traversals for Recommendations** (10 min)
   - Two-hop patterns
   - Aggregations
   - Foundation of recommendations

4. **Optional Practice with Multi-Hop Queries** (15 min, optional)
   - Complex business questions
   - Multi-hop patterns

---

## Module 5: Writing Queries (45 minutes)

1. **How Cypher Queries Work** (15 min)
   - Anchor nodes
   - Following relationships
   - 5 detailed examples with explanations

2. **Practice Questions** (20 min)
   - 12 business questions
   - Collapsible answers
   - Hands-on query writing

3. **Building the Recommendation Query** (10 min)
   - Step-by-step construction
   - Collaborative filtering
   - SQL comparison (11 lines vs 38 lines)

---

## Module 6: Final Review (20 minutes)

1. **Graph Data Quality with Constraints and Indexes** (10 min)
   - Uniqueness constraints
   - Indexes for performance
   - Best practices

2. **Workshop Review and Reflection** (5 min)
   - What you built
   - What you learned
   - Next steps

3. **Knowledge Check** (5 min)
   - 10 quiz questions
   - Test understanding

---

## Timing Summary

**Core Path:** ~2 hours
- Module 1: 20 min
- Module 2: 30 min (core only)
- Module 3: 20 min (core only)
- Module 4: 30 min (core only)
- Module 5: 45 min
- Module 6: 20 min

**With All Optional Lessons:** ~2.5 hours
- Adds 30 min optional node imports (Module 2)
- Adds 15 min optional queries (Module 3)
- Adds 15 min optional queries (Module 4)

---

## Key Features

✅ **Single CSV load** - All files loaded with one button click
✅ **Progressive building** - Each module adds one piece
✅ **Optional practice** - Flexibility for different skill levels
✅ **Hands-on focus** - Import, query, build throughout
✅ **Real-world problem** - Build actual recommendation system
✅ **SQL comparisons** - Show graph advantages
✅ **Complete code** - Every query is runnable

---

## Learning Outcomes

Students will be able to:
- Import CSV data into Neo4j using Data Importer
- Design graph models (nodes, relationships, properties)
- Write Cypher queries for business questions
- Build collaborative filtering algorithms
- Understand graph advantages over relational databases
- Create production-ready recommendation systems

---

## Technical Details

- **Nodes:** Product, Customer, Order, Category (optional)
- **Relationships:** PLACED, CONTAINS, IN_CATEGORY (optional)
- **Dataset:** Northwind (77 products, 91 customers, 830 orders, 2155 order items)
- **Final Query:** 11 lines Cypher vs 38 lines SQL
- **Performance:** O(k) graph traversal vs O(n×m) SQL joins
