# Workshop Structure - Final As-Built

## Goal
Answer: "What products do people like me buy, that I haven't bought yet?"

## Path
`Customer -[:PLACED]-> Order -[:CONTAINS]-> Product`

## Modules

### Module 1: Aura Setup (20 min)
1. Workshop Overview (5 min)
2. Introduction to Neo4j Aura (5 min)
3. Aura Tools Overview (10 min)

### Module 2: Foundation (30-60 min core + 30 min optional)
1. Graph Elements (8 min)
2. Cypher Patterns Quiz (5 min)
3. Identifying Nodes (5 min)
4. Understanding the Import Tool (10 min)
5. Importing Product Nodes (12 min) - **CSV load button here**
6. Importing Customer Nodes (10 min, optional)
7. Importing Order Nodes (10 min, optional)
8. Importing Category Nodes (10 min, optional)

### Module 3: Modeling Relationships (25 min)
1. Understanding Relationships (PLACED and CONTAINS) (10 min)
2. Importing PLACED Relationships (10 min)
3. Optional Practice with Relationship Queries (15 min, optional)

### Module 4: Many-to-Many (35 min)
1. Transforming Pivot Tables into Graph Relationships (8 min)
2. Importing CONTAINS Relationships (12 min)
3. Multi-Hop Traversals for Recommendations (10 min)
4. Optional Practice with Multi-Hop Queries (15 min, optional)

### Module 5: Writing Queries (45 min)
1. How Cypher Queries Work (15 min)
2. Practice Questions (20 min)
3. Building the Recommendation Query (10 min)

### Module 6: Final Review (20 min)
1. Graph Data Quality with Constraints and Indexes (10 min)
2. Workshop Review and Reflection (5 min)
3. Knowledge Check (5 min)

## Total Time
- **Core path**: ~2 hours
- **With all optional lessons**: ~2.5 hours

## Key Changes from Original
- ORDERS → CONTAINS relationship
- All CSV files loaded upfront with button
- Optional node imports in Module 2
- Removed Similar Customers module
- Removed Optional Enrichments module
- New Writing Queries module with hands-on practice
- Streamlined to 6 modules
