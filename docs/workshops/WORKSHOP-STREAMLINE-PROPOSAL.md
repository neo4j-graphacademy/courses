# Streamlined Workshop Structure (2 Hours)

## Current Problem
- 43 minutes of setup/theory before first import
- Too much tool explanation
- Students lose engagement

## Proposed Structure

### Module 1: Getting Started (15 min) 
- Lesson 1: Workshop Overview (5 min) - Keep as-is, sets the goal
- Lesson 2: Quick Setup (10 min) - Merge "About Aura" + "Create Instance" only
  - Remove: Aura tools overview (students will learn tools when they use them)

### Module 2: Your First Import (25 min)
- Lesson 1: Graph Basics (5 min) - Drastically simplified from "Graph Elements"
  - Nodes, relationships, properties only - no Cypher yet
  - Just enough to understand what they're importing
- Lesson 2: Import Products (20 min) - Merge "Import Tool Overview" INTO the import lesson
  - Learn the tool BY USING IT, not before
  - "Click here, map this, run import" - show, don't explain
  
### Module 3: Adding Relationships (25 min)
- Lesson 1: Understanding Relationships (8 min) - Cut current 10 min to 8 min
  - Keep: what relationships are, direction
  - Cut: O(n) deep dive, SQL comparison details
- Lesson 2: Import Customers & Orders (15 min) - Combined lesson
  - Import both, create PLACED, verify
- Lesson 3: Your First Query (2 min) - New micro-lesson
  - Just: MATCH (c:Customer)-[:PLACED]->(o:Order) RETURN c, o LIMIT 10
  - Proves it worked

### Module 4: Many-to-Many (20 min)
- Lesson 1: Why Graphs Win (8 min) - Pivot tables concept
- Lesson 2: Complete the Graph (10 min) - Import Categories + CONTAINS
  - Do it for them, they watch and understand why
- Lesson 3: Multi-hop Query (2 min)
  - Customer→Order→Product query
  - Sets up recommendation

### Module 5: The Money Query (15 min)
- Lesson 1: Build Recommendation (10 min)
- Lesson 2: Knowledge Check (5 min)

**Total: 100 minutes (1.67 hours) + buffer = 2 hours**

## Key Changes
1. ❌ Remove: Aura tools overview (learn tools by using them)
2. ❌ Remove: Identifying nodes as separate lesson (fold into first import)
3. ❌ Remove: Import tool overview as separate lesson (learn while importing)
4. ❌ Cut: Deep O(n) explanations, lengthy SQL comparisons
5. ✅ Add: Micro-lessons that just run one query to verify/demo
6. ✅ Merge: Import tool explanation INTO first import (just-in-time learning)
7. ✅ Simplify: Less "understanding", more "doing"

## Philosophy Shift
FROM: Explain → Understand → Do
TO: Do → See it work → Understand why

Students learn the Import tool by importing, not by studying it first.
