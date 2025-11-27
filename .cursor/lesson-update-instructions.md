# Course Lesson Update Instructions

## Overview

These instructions document the changes made to the Out of Memory Errors lesson and should be applied to future lessons for consistency and improved pedagogy.

## 1. Structure and Organization

### 1.1 Follow WHY-WHAT-HOW Framework

- **Introduction**: Two-part structure (see section 1.2)
- **Understanding [Topic]** (WHY): Explain what the concept is, why it matters, and common causes
- **Monitoring [Topic]** (WHAT): Show what metrics/data are available and what to look for
- **Mitigating [Topic]** (HOW): Provide actionable steps to address issues
- **When you should scale [Topic]**: A careful consideration of the factors that lead to needing to increase the size of the instance. Scaling is not always the answer.
- **Questions**: Test understanding with 2-3 focused questions
- **Summary**: Recap key points in 3-4 sentences

### 1.2 Introduction Structure

The introduction must follow this two-part pattern:

1. **Opening statement** (1-2 sentences): Choose the appropriate approach:

   - **Option A - Direct continuation**: If building directly on previous lesson knowledge (e.g., learned MATCH, now CREATE), reference what was learned AND explain why the current topic follows naturally
   - **Option B - New/related topic**: If NOT directly continuing, make a statement about the primary topic being taught

2. **Learning objective** (1 sentence): Start with "In this lesson, you will learn..." and clearly state what the learner will gain

**Examples:**

✅ **Good - Direct continuation:**

```
You learned how to use MATCH to read data from the graph. To modify the graph, you need to learn how to create nodes and relationships.

In this lesson, you will learn how to use the CREATE clause to add data to your graph.
```

✅ **Good - New/related topic:**

```
Heap memory usage directly relates to how often the Java Virtual Machine must perform garbage collection. When heap usage is high, garbage collection runs more frequently, which can cause query pauses and performance degradation.

In this lesson, you will learn how to monitor garbage collection metrics and understand their impact on database performance.
```

✅ **Good - New/related topic:**

```
The heap is a critical memory area where Neo4j stores temporary data during query execution and transaction processing.

In this lesson, you'll learn how to monitor heap memory usage and identify when memory pressure is affecting your performance.
```

❌ **Bad - Combines everything into one sentence:**

```
Now that you understand heap memory usage, you'll learn how to monitor garbage collection and its impact on performance.
```

_Why: Combines context and learning objective into one sentence without the explicit "In this lesson, you will learn..." pattern._

❌ **Bad - Generic opening without context:**

```
In modern databases, garbage collection is an important aspect of memory management.

This lesson covers how to optimize garbage collection.
```

_Why: Generic opening that doesn't connect to course context, and doesn't use the "In this lesson, you will learn..." pattern._

❌ **Bad - References previous but doesn't explain why:**

```
In the last lesson, you learned about heap memory.

In this lesson, you will learn about garbage collection.
```

_Why: References previous lesson but doesn't explain the connection or why garbage collection follows naturally from heap memory._

### 1.3 Opening Statement Guidelines

**When building directly on previous lesson:**

- Reference what was learned in the previous lesson
- Explain WHY the current topic follows naturally
- Example: "You learned how to use MATCH to read data from the graph. To modify the graph, you need to learn how to create nodes and relationships."

**When NOT directly building on previous lesson:**

- Make a statement about the primary topic being taught
- Can establish importance or connect to broader course themes
- Example: "Heap memory usage directly relates to how often the Java Virtual Machine must perform garbage collection."

**Never:**

- Use generic openings like "In modern databases..."
- Reference previous lesson without explaining the connection
- Combine the opening statement and learning objective into one sentence

### 1.4 Section Headers

- Use action-oriented Level 2 headers (e.g., "Monitoring Out of Memory Errors", "Mitigating Out of Memory Errors")
- Keep headers clear and descriptive
- Use Level 3 headers for subsections that break down approaches (e.g., "Scheduled Out of Memory Errors", "Intermittent Out of Memory Errors")

## 2. Writing Style

### 2.1 Paragraphs Over Bullet Points

- **Use short paragraphs** instead of bullet lists for explanations
- Each paragraph should be 2-4 sentences maximum
- Break long paragraphs into shorter ones for better readability
- Use bullet points ONLY for:
  - Lists of status codes or error codes
  - Step-by-step instructions where order doesn't matter
  - Options or choices

### 2.2 Sentence Structure

- **Keep sentences short** (15-20 words maximum when possible)
- Break compound sentences into separate sentences
- One idea per sentence
- Example:
  - ❌ "When an Out of Memory error occurs, the JVM attempts to allocate memory for an operation but finds insufficient space available, and the garbage collector runs to free up memory, but if it cannot reclaim enough space, the JVM throws an OutOfMemoryError."
  - ✅ "When an Out of Memory error occurs, the JVM attempts to allocate memory for an operation but finds insufficient space available. The garbage collector runs to free up memory. If it cannot reclaim enough space, the JVM throws an `OutOfMemoryError`."

### 2.3 Avoid Abbreviations in Body Text

- Never abbreviate terms in the lesson body (e.g., write "Out of Memory" not "OOM")
- Exception: Abbreviations are acceptable in:
  - Code comments
  - UI descriptions (comments at top of file)
  - File names (e.g., `7-oom-errors`)

### 2.4 Terminology

- **Highlight key terms** with bold formatting the first time they appear in a section
- Terms to highlight:
  - Technical concepts (JVM, garbage collection, heap memory, transactions)
  - Important metrics (Out of Memory metric, OOM error count)
  - Critical actions (scale your instance, optimize queries)
  - Problem categories (Query-level issues, Memory-intensive operations)
- Don't over-bold: only highlight 1-2 terms per paragraph maximum

### 2.5 Educational Tone

- Focus on teaching, not just describing
- Explain the "why" behind recommendations
- Connect concepts to real-world impact
- Use clear cause-and-effect language
- Example: "This prevents transactions from accumulating too many changes in memory before commit."

## 3. Content Requirements

### 3.1 Remove Duplication

- Each concept should be explained once
- Avoid repeating the same information in different words
- If information appears twice, consolidate into one clear statement
- Example removed: "If Out of Memory errors occur intermittently... your instance likely lacks sufficient memory capacity. Intermittent Out of Memory errors indicate that your workload occasionally exceeds the available memory."

### 3.2 Practical Examples

- Include code examples where relevant (Cypher queries, status codes, etc.)
- Show how errors appear in application code
- Reference specific tools (EXPLAIN, PROFILE, CALL IN TRANSACTIONS)
- Include specific numbers when helpful (e.g., "1000 ROWS")

### 3.3 Expected Values

- Always state what the expected/normal value is for metrics
- Example: "The expected value is zero errors."
- Explain what non-normal values indicate

### 3.4 Actionable Guidance

- Provide specific actions, not vague suggestions
- Example: ✅ "Use `CALL { } IN TRANSACTIONS OF 1000 ROWS`" vs ❌ "Consider batching your operations"
- Separate guidance by scenario (scheduled vs intermittent errors)

## 4. Question Design

### 4.1 Question Types

- Focus on conceptual understanding, not scenarios with specific numbers
- Ask about differences between approaches
- Test application of concepts from the lesson
- 2-3 questions per lesson maximum

### 4.2 Question Structure

```
[.question]
= [Question Title in Title Case]

[Clear question statement]?

* [ ] Wrong answer 1
* [x] Correct answer
* [ ] Wrong answer 2
* [ ] Wrong answer 3

[TIP,role=hint]
.Hint
====
One sentence hint that guides without giving the answer.
====

[TIP,role=solution]
.Solution
====
**[Correct answer repeated]** is correct.

[2-3 sentences explaining why this is correct and what it accomplishes.]

**[Wrong concept 1]** - brief reason why wrong. **[Wrong concept 2]** - brief reason why wrong. **[Wrong concept 3]** - brief reason why wrong.
====
```

### 4.3 Hints

- One sentence maximum
- Guide thinking, don't give the answer
- Example: "Scheduled errors need query optimization, not scaling."

### 4.4 Solutions

- Start with the correct answer in bold
- Explain why it's correct in 2-3 sentences
- Address wrong answers briefly (one sentence each)
- Use bold for answer concepts when referencing them
- Keep solutions concise and focused

## 5. AsciiDoc Formatting

### 5.1 Line Breaks

- Two line breaks between:
  - Headers and content
  - Paragraphs
  - Lists and paragraphs
  - Sections

### 5.2 Code and Terms

- Use backticks for code elements: `LIMIT`, `CALL { } IN TRANSACTIONS`
- Use bold for emphasis on concepts: **Out of Memory errors**, **heap memory**
- Use proper AsciiDoc syntax for external links with caret: `link:url[text^]`

### 5.3 Images

- Include descriptive alt text: `image::images/oom.png[Out Of Memory errors]`
- Place images at the beginning of monitoring sections

## 6. Pedagogical Requirements

### 6.1 Bloom's Taxonomy

- Focus on "remember" and "understand" levels
- Avoid requiring higher-order thinking (analyze, evaluate, create)
- Questions should test comprehension, not problem-solving

### 6.2 Concept Limit

- Introduce no more than 2 new concepts per lesson
- Build on previous lessons explicitly
- Keep lessons under 5 minutes reading time

### 6.3 Length

- Keep total lesson under 100 lines
- Introduction: 2-4 sentences (opening statement + "In this lesson, you will learn..." sentence)
- Each major section: 10-20 lines
- Summary: 3-4 sentences

## 7. Checklist Before Completion

- [ ] Introduction follows two-part structure (opening statement + "In this lesson, you will learn...")
- [ ] No abbreviations in body text (except code comments)
- [ ] Sentences are 15-20 words or shorter
- [ ] Paragraphs are 2-4 sentences maximum
- [ ] Key terms bolded on first use in each section
- [ ] No duplicate content
- [ ] Structure follows WHY-WHAT-HOW
- [ ] Expected values stated for all metrics
- [ ] Specific, actionable guidance provided
- [ ] 2-3 questions included
- [ ] Questions test concepts, not scenarios
- [ ] Hints are one sentence
- [ ] Solutions are concise (2-3 sentences + brief wrong answer explanations)
- [ ] Two line breaks between all sections
- [ ] Links use proper AsciiDoc syntax with caret
- [ ] Lesson is under 5 minutes reading time
- [ ] No linter errors

## 8. Common Mistakes to Avoid

- ❌ Introduction that doesn't follow the two-part structure (opening statement + "In this lesson, you will learn...")
- ❌ Combining context and learning objective into one sentence
- ❌ Using bullet points for explanatory content
- ❌ Long, compound sentences with multiple clauses
- ❌ Abbreviating terms in body text
- ❌ Over-bolding (only make key terms bold the first time it is mentioned and explained)
- ❌ Repeating the same information in different words
- ❌ Vague recommendations without specific actions
- ❌ Scenario-based questions with specific metrics
- ❌ Long hints (more than one sentence)
- ❌ Verbose solutions with too much explanation
- ❌ Missing expected values for metrics
- ❌ Generic openings that don't reference previous lessons
- ❌ Introducing more than 2 new concepts
