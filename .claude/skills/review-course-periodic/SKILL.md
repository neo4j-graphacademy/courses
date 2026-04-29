---
name: review-course-periodic
description: Periodically review course content for accuracy, relevance, and consistency. This includes checking for deprecated Cypher syntax.
---

# Periodic Course Review

**Purpose:** To review active courses on a regular basis to ensure that all content is accurate, relevant, and consistent with the latest Neo4j features and best practices. This includes checking for any deprecated Cypher syntax in course materials and providing suggestions for updates.

**When to use:** Use this skill when you want to review an active course.

**When not to use:**

* Use `review-course` for a one-shot review of course structure before publishing. This skill is for ongoing maintenance of active courses.
* Use `deprecated-cypher` for a focused review of Cypher syntax in code files. This skill includes checking for deprecated Cypher syntax but also covers other aspects of course content.

## Overview

This skill reviews course content across all modules and lessons, checking for:

1. Deprecated Cypher syntax
2. Accuracy and relevance of content based on the latest Neo4j features and best practices
3. Generates a report of findings and suggestions for updates

## Step 1: Check course status

Before starting the review, check the course status to ensure it is active and not in draft mode. This skill is intended for ongoing maintenance of `active` courses.

The course status is stored in `status` attribute in the `course.adoc` file.

course.adoc
```
status: active
```

## Step 2: Deprecated Cypher Syntax

Use the `deprecated-cypher` skill to scan through all course materials for any instances of deprecated Cypher syntax. This includes any Cypher queries in lesson content, code examples, and supporting files.

## Step 3: Content Accuracy and Relevance

Review the last 3 months release notes at https://neo4j.com/release-notes/ to identify any new features, deprecations, or best practices that should be reflected in the course content. Check for any content that may be outdated or inaccurate based on these updates.

## Step 4: Generate Report

Compile a report of findings, including any instances of deprecated Cypher syntax, outdated content, and suggestions for updates. Save this report as `COURSE-PERIODIC-REVIEW-REPORT.md` in the course folder.

An action required flag should be included for any findings with a high priority recommendation for updates.

### Example report

```
# Course Periodic Review Report: course-slug
Date: yyyy-mm-dd
Action required? Yes/No

## Deprecated Cypher Syntax

[finding from the deprecated-cypher skill]

Include the examples of deprecated syntax found, the recommended replacement syntax, and the file/line number where it was found.

## Content Accuracy and Relevance

1. Optional modernization opportunity:

Priority: Low

Consider gradually introducing `EXISTS { ... }` subqueries in selected advanced examples where pedagogically useful. Keep current `exists((pattern))` where simplicity is preferred.

## Recommendations

1. List of prioritized recommendations for course updates based on findings.
```

## Step 5: Create Linear Issue

If any high priority updates are identifed, use the `linear-issue` skill to create a Linear issue for the GRAC team to triage the necessary course updates. 

The title should be "Course periodic review findings: course-slug" and the description should include the text from the `COURSE-PERIODIC-REVIEW-REPORT.md` for reference.
