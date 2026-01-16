# Lesson Length Analysis Report

Generated: $(date)

## Summary

**Total lessons checked:** 16  
**Lessons exceeding 200 lines:** 7  
**Lessons requiring immediate splitting:** 2  
**Lessons that should be reviewed:** 5

---

## Lessons Exceeding Limits

### 🔴 Critical - Must Split (Over 300 lines)

#### 1. Backup and Restore (400 lines)
**Location:** `modules/2-getting-started/lessons/4-backup-and-restore/lesson.adoc`

**Current Structure:**
- Understanding Aura snapshots
- Scheduled vs on-demand snapshots
- Snapshot frequency by tier
- Working with snapshots
- Exporting snapshots
- Restoring from backup file
- Restoring using local files
- Planning backup strategy

**Recommended Split:**

**Lesson 4a: "Understanding backups and snapshots"** (~120 lines)
- Understanding Aura snapshots
- Scheduled vs on-demand snapshots
- Snapshot frequency and retention by tier
- When to use each snapshot type
- Snapshot use cases

**Lesson 4b: "Creating and managing snapshots"** (~140 lines)
- Working with snapshots
- Snapshot actions
- Creating on-demand snapshots
- Exporting snapshots for long-term storage
- Managing exported snapshots

**Lesson 4c: "Restoring from backups"** (~140 lines)
- Restoring from snapshots
- Restoring using local files
- Planning your backup strategy
- Best practices

---

#### 2. Import Data (371 lines)
**Location:** `modules/3-services-tools/lessons/1-import/lesson.adoc`

**Current Structure:**
- 11 steps covering: preparation, data source, model creation, import, verification

**Recommended Split:**

**Lesson 1a: "Preparing your data for import"** (~120 lines)
- Data Importer service overview
- Step 1: Prepare your movie dataset
- Step 2: Add your data source to Aura
- Step 3: Review your data structure
- Data preparation checklist

**Lesson 1b: "Creating your graph data model"** (~150 lines)
- Step 4: Create your data model
- Understanding nodes and relationships in context
- Step 5: Define Movie nodes
- Step 6: Define Person nodes
- Step 7: Define ACTED_IN relationships
- Step 8: Review and confirm your model

**Lesson 1c: "Running and verifying the import"** (~100 lines)
- Step 9: Run the import
- Step 10: Verify your import results
- Step 11: Save your data model
- Summary

---

### 🟡 Review Recommended (200-250 lines)

#### 3. Dashboard (245 lines)
**Location:** `modules/3-services-tools/lessons/4-dashboard/lesson.adoc`

**Recommendation:** Could be split if it covers multiple distinct concepts, otherwise acceptable if content is dense but focused.

---

#### 4. Manage Instance (241 lines)
**Location:** `modules/2-getting-started/lessons/3-manage-instance/lesson.adoc`

**Recommendation:** Review to see if it can be condensed or split by workflow (inspecting vs. configuring vs. upgrading).

---

#### 5. Sign Up (234 lines)
**Location:** `modules/1-introduction/lessons/3-sign-up/lesson.adoc`

**Recommendation:** Review to see if sign-up process can be split into "Creating an account" and "Creating your first instance".

---

#### 6. Query (224 lines)
**Location:** `modules/3-services-tools/lessons/2-query/lesson.adoc`

**Recommendation:** Acceptable if focused on one concept. Could split into "Basic querying" and "Advanced query patterns" if needed.

---

#### 7. Explore (215 lines)
**Location:** `modules/3-services-tools/lessons/3-explore/lesson.adoc`

**Recommendation:** Acceptable if focused. Review to ensure it's not covering too many concepts.

---

## Lessons Within Limits ✅

All other lessons are under 200 lines and within acceptable limits:
- About (149 lines) ✅
- Tiers (116 lines) ✅
- Understand Costs (174 lines) ✅
- Layout Console (162 lines) ✅
- Create Instance (144 lines) ✅
- Connecting (114 lines) ✅
- Shared Responsibility (145 lines) ✅
- Security and Logs (139 lines) ✅
- Further Steps (136 lines) ✅

---

## Implementation Plan

### Phase 1: Critical Splits (Immediate)

1. **Split Backup and Restore** into 3 lessons:
   - Update module.adoc to include 3 lessons instead of 1
   - Create new lesson directories: `4a-backup-snapshots`, `4b-manage-snapshots`, `4c-restore-backups`
   - Update lesson order numbers for subsequent lessons

2. **Split Import Data** into 3 lessons:
   - Update module.adoc to include 3 lessons instead of 1
   - Create new lesson directories: `1a-prepare-data`, `1b-create-model`, `1c-run-import`
   - Update lesson order numbers for subsequent lessons

### Phase 2: Review and Optimize (Optional)

3. Review lessons in 200-250 line range
4. Consider splitting if they cover multiple distinct concepts
5. Condense content where possible

---

## Cursor Rule Created

Created `.cursor/rules/lesson-length.mdc` with:
- Maximum length guidelines (200 lines hard limit, 100-150 ideal)
- When to split lessons
- How to split lessons
- Checklist for lesson length

---

## Next Steps

1. ✅ Cursor rule created
2. ⏳ Split backup-and-restore lesson (3 new lessons)
3. ⏳ Split import lesson (3 new lessons)
4. ⏳ Update module.adoc files to reflect new lesson structure
5. ⏳ Update course.adoc lesson count
6. ⏳ Review other lessons in 200-250 range

