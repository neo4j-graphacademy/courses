# Course Outline Checklist & Best Practices

This checklist ensures course.adoc files follow GraphAcademy standards and best practices. Use this guide when creating or reviewing course outlines.

## Required Course Metadata Attributes

### ✅ Essential Attributes (Must Have)

- [ ] **`:status:`** - Course status (`active`, `draft`, `disabled`, `test`)
- [ ] **`:categories:`** - Category tags with priorities (e.g., `beginners:2, cypher:1`)
- [ ] **`:caption:`** - Brief, compelling course description (1-2 sentences)
- [ ] **`:duration:`** - Clear time estimate (e.g., "1 hour", "2 hours", "4 hours")
- [ ] **`:key-points:`** - 3-5 key learning topics, comma-separated

### ✅ Important Optional Attributes

- [ ] **`:next:`** - Next recommended course(s) in learning path
- [ ] **`:usecase:`** - Sandbox environment (`movies`, `recommendations`, `blank-sandbox`, etc.)
- [ ] **`:video:`** - YouTube embed URL for course introduction video
- [ ] **`:repository:`** - GitHub repository for course resources

### ✅ Advanced Optional Attributes

- [ ] **`:graph-analytics-plugin:`** - Set to `true` if requires GDS plugin
- [ ] **`:vector-optimized:`** - Set to `true` if uses vector features
- [ ] **`:database-provider:`** - Database provider (`aura`, `neo4j-desktop`)

## Category Guidelines

### ✅ Experience Level (Choose One, Required)

- [ ] `beginners:X` - No prior Neo4j experience required
- [ ] `intermediate:X` - Some Neo4j/graph database knowledge required
- [ ] `advanced:X` - Extensive Neo4j experience required
- [ ] `workshop:X` - Workshop format course

`X` denotes the order that the course should appear in the courses list in ascending order.

### ✅ Common Categories (Choose Relevant)

- [ ] `start:X` - Good starting point courses
- [ ] `foundation:X` - Fundamental concepts
- [ ] `software-development:X` - For developers
- [ ] `data-analysis:X` - For data analysts
- [ ] `reporting:X` - For reporting/BI
- [ ] `cypher:X` - Cypher query language focus
- [ ] `llms:X` - Large Language Models/AI
- [ ] `generative-ai:X` - Generative AI applications
- [ ] `administrator:X` - For database administrators
- [ ] `aura:X` - Neo4j Aura specific

**Note:** Numbers after `:` indicate priority/order within that category (lower numbers = higher priority)

## Content Structure Requirements

### ✅ Course Title & Introduction

- [ ] **Title** matches folder name convention
- [ ] **Opening paragraph** clearly explains what the course covers
- [ ] **Course value proposition** - why take this course?
- [ ] **Course context** - how it fits in the learning journey

### ✅ Duration Section

- [ ] **Duration header** (`== Duration`)
- [ ] **Explicit time estimate** restated from metadata

### ✅ Prerequisites Section (If Applicable)

- [ ] **Prerequisites header** (`== Prerequisites` or `=== Prerequisites`)
- [ ] **Clear list** of required knowledge/skills
- [ ] **Linked prerequisite courses** using proper link syntax
- [ ] **Technical requirements** (accounts, software, etc.)

### ✅ Learning Objectives

- [ ] **"What you will learn" header** (`== What you will learn` or `=== What you will learn`)
- [ ] **Bullet list** of specific, actionable learning outcomes
- [ ] **Aligned with course content** and key-points
- [ ] **Progressive learning** - builds from basic to complex

### ✅ Course Includes Section

- [ ] **Includes header** with class (`[.includes] == This course includes`)
- [ ] **Lesson count** (`[lessons]#X lessons#`)
- [ ] **Video count** (`[videos]#X videos#` or `[video]#X video lessons#`)
- [ ] **Quiz count** (`[quizes]#X multiple choice quizzes#`)
- [ ] **Challenge count** (`[challenges]#X hands-on challenges#` if applicable)

## Content Quality Standards

### ✅ Writing Style
- [ ] **Clear, engaging language** appropriate for target audience
- [ ] **Active voice** preferred over passive voice
- [ ] **Consistent terminology** with Neo4j standards
- [ ] **Proper capitalization** of Neo4j, Cypher, GraphAcademy
- [ ] **No typos or grammatical errors**

### ✅ Technical Accuracy
- [ ] **Accurate key-points** reflect actual course content
- [ ] **Correct duration estimate** based on actual course length
- [ ] **Valid links** to prerequisite courses
- [ ] **Appropriate difficulty level** for target categories

### ✅ Structural Consistency
- [ ] **Proper AsciiDoc formatting** throughout
- [ ] **Consistent section headers** following established patterns
- [ ] **Logical information flow** - intro → duration → prerequisites → objectives → includes
- [ ] **Appropriate use of includes** for shared content

## Test Validation Requirements

Based on automated test suite requirements:

### ✅ File Structure Validation

- [ ] **Course has modules** - at least one module directory exists inside `modules/` with a `module.adoc` file
- [ ] **Illustration file exists** - `illustration.svg`
- [ ] **Valid course structure** - follows expected directory hierarchy

### ✅ Content Validation

- [ ] **Categories include experience level** - one of: beginner, intermediate, advanced, workshop
- [ ] **No broken external links** - all `link:` references are valid
- [ ] **Valid Cypher code blocks** - all `[source,cypher]` blocks parse correctly
- [ ] **Proper question structure** - lessons have questions, hints, and solutions

### ✅ Database Integration

- [ ] **Course exists in database** - matches file system structure
- [ ] **Proper module relationships** - FIRST_MODULE and LAST_MODULE defined
- [ ] **Lesson navigation** - proper NEXT relationships between lessons

## Common Patterns & Examples

### ✅ Category Examples

```
:categories: beginners:1, start:1, foundation:1, cypher:1
:categories: intermediate:3, software-development:5, data-analysis:3
:categories: advanced:1, administrator:1, aura:1
```

### ✅ Key-Points Examples

```
:key-points: Graph theory, Graph structures, Elements of a graph database
:key-points: Aura tiers, Instance management, Cost optimization, Data import and querying
:key-points: Spring Data Neo4j library, Mapping graph models, Reading and writing data
```

### ✅ Learning Objectives Format

```
== What you will learn

* Basic graph theory concepts
* How to navigate a Neo4j database
* How to write simple Cypher queries
* Common graph use cases and patterns
```

### ✅ Course Includes Format

```
[.includes]
== This course includes

* [lessons]#9 lessons#
* [videos]#5 videos#
* [quizes]#8 multiple choice quizzes#
* [challenges]#3 hands-on challenges#
```

## Review Checklist

Before publishing a course outline:

### ✅ Final Review

- [ ] **All required attributes** are present and correct
- [ ] **Content aligns** with course modules and lessons
- [ ] **Links work** and point to correct destinations
- [ ] **Grammar and spelling** are correct
- [ ] **Consistent formatting** throughout document
- [ ] **Accurate lesson/quiz counts** match actual course content
- [ ] **Prerequisites** are realistic and properly linked
- [ ] **Course fits** logically in the learning path

### ✅ Testing

- [ ] **Run QA tests** - `npm test` passes for the course
- [ ] **Manual review** of generated HTML output
- [ ] **Link validation** - all external links return 200 status
- [ ] **Database sync** - course structure matches file system

---

## Notes

- **Folder naming**: Use kebab-case (e.g., `cypher-fundamentals`, `app-spring-data`)
- **Learning path flow**: Consider the `next` attribute to guide learners
- **Target audience**: Categories should clearly indicate who the course is for
- **Realistic expectations**: Duration and prerequisites should be accurate
- **Quality over quantity**: Better to have fewer, high-quality courses than many mediocre ones

This checklist is based on analysis of 80+ GraphAcademy courses and the automated test suite requirements.
