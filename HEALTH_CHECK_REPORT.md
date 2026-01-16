# Health Check Report - Aura Fundamentals Course
Generated: $(date)

## Summary

This report checks the `aura-fundamentals` course against cursor rules and QA requirements.

## 1. Video Formatting Issues

### ❌ Consecutive Videos Without Explanations

**Issue:** The video formatting rule requires explanatory text before and between consecutive videos.

**Found violations:**

1. **`4-dashboard/lesson.adoc`** (lines 154-160):
   - Two videos back-to-back: "Edit Card" → "Save Card"
   - Missing: Explanatory text before "Edit Card" video
   - Missing: Explanatory text between videos explaining connection

2. **`3-explore/lesson.adoc`** (lines 28-39):
   - Two videos in close proximity: "Explore Options" → "Explore UI"
   - Missing: Explanatory text before "Explore Options" video
   - Missing: Explanatory text between videos

**Recommendation:** Add explanatory text before each video and between consecutive videos as per the video formatting rule.

## 2. Cursor Rule Violations

### ❌ "Integrated" Terminology

**Rule:** Do not use "integrated" before tool names (e.g., "Query tool" not "integrated Query tool")

**Found violations (31 instances):**

- `summary.adoc`: "integrated query tool"
- `4-dashboard/lesson.adoc`: "integrated dashboard tool" (3 instances)
- `3-explore/lesson.adoc`: "integrated explore tool" (3 instances)
- `2-query/lesson.adoc`: "integrated query tool" (2 instances)
- `1-import/lesson.adoc`: "integrated service", "integrated data importer service", "integrated query tool" (3 instances)
- `5-connecting/lesson.adoc`: "integrated Importing tool", "integrated tools", "integrated Query tool" (3 instances)
- Quiz questions: Multiple instances in `1-purpose.adoc` files

**Recommendation:** Remove "integrated" from all tool references. Use "Query tool", "Explore tool", "Dashboard tool", "Data Importer service" instead.

### ❌ "Powerful" Marketing Language

**Rule:** Do not use words like "powerful", "core feature", "with confidence", or similar marketing terms.

**Found violations (3 instances):**

- `3-explore/lesson.adoc` (line 20): "The **Explore** tool is a **powerful** interface..."
- `3-explore/lesson.adoc` (line 145): "The **Explore** tool is a **powerful** way to visualize..."
- `2-query/lesson.adoc` (line 85): "The **Query Tool** is a **powerful** interface..."

**Recommendation:** Replace "powerful" with descriptive language:
- "The Explore tool provides a visual interface..."
- "The Explore tool enables you to visualize..."
- "The Query Tool provides an interface..."

### ❌ "Think about" / "Think of" Phrases

**Rule:** Remove or rephrase "Think about..." and "Think of..." phrases. Provide direct explanations instead.

**Found violations (16 instances):**

**In quiz hints:**
- `4-operations/2-security-and-logs/questions/1-logs.adoc`: "Think about scenarios..."
- `4-operations/1-shared-responsibility/questions/1-choosing.adoc`: "Think about the permissions..."
- `3-services-tools/4-dashboard/questions/1-purpose.adoc`: "Think about what 'time-to-value' means..."
- `3-services-tools/3-explore/questions/1-purpose.adoc`: "Think about who would benefit..."
- `3-services-tools/2-query/questions/1-purpose.adoc`: "Think about the purpose..."
- `3-services-tools/1-import/questions/2-reuse.adoc`: "Think about the purpose..."
- `2-getting-started/5-connecting/questions/1-connection.adoc`: "Think of the essential details..."
- `2-getting-started/4-backup-and-restore/questions/1-snapshot-purpose.adoc`: "Think about what you need most..."
- `2-getting-started/3-manage-instance/questions/1-inspect.adoc`: "Think about what you can see..."
- `2-getting-started/2-create-instance/questions/1-location.adoc`: "Think about data compliance..."
- `2-getting-started/1-layout-console/questions/1-structure.adoc`: "Think about the hierarchy..."
- `1-introduction/4-understand-costs/questions/1-cost-determination.adoc`: "Think about how general cloud services..."
- `1-introduction/2-tiers/questions/1-choosing.adoc`: "Think about the features..."

**In lesson content:**
- `3-services-tools/4-dashboard/lesson.adoc` (line 25): "Think of dashboards as the 'storefront window'..."
- `2-getting-started/4-backup-and-restore/lesson.adoc` (line 27): "Think of them as save points in a video game..."

**Recommendation:** Replace all "Think about/think of" phrases with direct explanations:
- Quiz hints: Provide clear explanations of the answer
- Lesson content: Use direct descriptions (e.g., "Dashboards serve as the 'storefront window'..." instead of "Think of dashboards as...")

### ⚠️ "This is..." Ambiguous Phrasing

**Found instances (6):**
- `2-getting-started/3-manage-instance/lesson.adoc`: "This is perfect for...", "This is a permanent action..."
- `1-introduction/3-sign-up/lesson.adoc`: "This is the official portal...", "This is less of a problem...", "This is fixed for..."

**Status:** Some instances are acceptable (referring to specific UI elements), but should be reviewed for clarity.

## 3. QA Test Status

### ❌ QA Tests Cannot Run

**Issue:** `npm run test:qa` fails with:
```
Error: Cannot find module '@jest/test-sequencer'
```

**Status:** Dependencies need to be reinstalled. After `npm install --force`, the module issue persists.

**Recommendation:** 
1. Try `rm -rf node_modules package-lock.json && npm install`
2. Check if `@jest/test-sequencer` is in `package.json` dependencies
3. Verify Jest configuration

## 4. Positive Findings

### ✅ No Consecutive Videos Without Slide Breaks

All consecutive videos are separated by `[.slide]` breaks, which is good.

### ✅ Section Titles Use Gerund Form

Most section titles follow the continuous tense (gerund) form as required.

### ✅ No "Day 0" Phrasing

The course uses "fixed at creation" or similar phrasing instead of "Day 0".

## 5. Recommendations Priority

### High Priority (Must Fix)

1. **Remove "integrated" terminology** (31 instances)
   - Affects: Multiple lesson files and quiz questions
   - Impact: Violates cursor rule for terminology

2. **Remove "powerful" marketing language** (3 instances)
   - Affects: `3-explore/lesson.adoc`, `2-query/lesson.adoc`
   - Impact: Violates cursor rule for marketing language

3. **Fix quiz hints with "think about"** (14 instances)
   - Affects: All quiz question files
   - Impact: Violates cursor rule for quiz hints

4. **Add video explanations** (2 locations)
   - Affects: `4-dashboard/lesson.adoc`, `3-explore/lesson.adoc`
   - Impact: Violates video formatting rule

### Medium Priority (Should Fix)

5. **Fix "think of" in lesson content** (2 instances)
   - Affects: `4-dashboard/lesson.adoc`, `4-backup-and-restore/lesson.adoc`
   - Impact: Violates cursor rule for direct explanations

6. **Review "this is..." phrasing** (6 instances)
   - Affects: Multiple lesson files
   - Impact: May cause ambiguity

### Low Priority (Nice to Have)

7. **Fix QA test dependencies**
   - Impact: Cannot verify course structure automatically

## 6. Action Items

- [ ] Remove all "integrated" terminology from tool references
- [ ] Replace "powerful" with descriptive language
- [ ] Replace all "think about/think of" in quiz hints with direct explanations
- [ ] Add explanatory text before and between consecutive videos
- [ ] Replace "think of" in lesson content with direct descriptions
- [ ] Review and clarify "this is..." ambiguous phrasing
- [ ] Fix QA test dependencies to enable automated testing

## 7. Files Requiring Updates

1. `modules/3-services-tools/lessons/4-dashboard/lesson.adoc`
2. `modules/3-services-tools/lessons/3-explore/lesson.adoc`
3. `modules/3-services-tools/lessons/2-query/lesson.adoc`
4. `modules/3-services-tools/lessons/1-import/lesson.adoc`
5. `modules/2-getting-started/lessons/5-connecting/lesson.adoc`
6. `modules/2-getting-started/lessons/4-backup-and-restore/lesson.adoc`
7. `modules/2-getting-started/lessons/3-manage-instance/lesson.adoc`
8. `modules/1-introduction/lessons/3-sign-up/lesson.adoc`
9. `summary.adoc`
10. All quiz question files (14 files)

