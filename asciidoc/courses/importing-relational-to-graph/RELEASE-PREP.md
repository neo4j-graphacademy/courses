# Release preparation: Importing Relational Data into Neo4j

Use this checklist before opening a release PR. Pedagogical alignment is documented in `PEDAGOGY-ALIGNMENT.md`; the Workflow Gatekeeper report is in `WORKFLOW-GATEKEEPER-REPORT.md`.

---

## Pre-release checklist

### Content finalization

- [ ] Gather and incorporate all feedback from draft phase
- [ ] Complete final content review and QA
- [ ] Update course status to `:status: active` in course.adoc when ready to release
- [ ] Ensure all assets (banner.png, illustration.svg, badge if required) are in place
- [x] Verify course structure (see WORKFLOW-GATEKEEPER-REPORT.md)
- [x] Pedagogical strategy applied (see PEDAGOGY-ALIGNMENT.md)
- [x] ad.adoc created and correct (link, ref=docs-ad-importing-relational-to-graph)

### Testing & quality assurance

- [ ] Verify all links work (internal and external)
- [ ] Check Cypher and SQL snippets are valid
- [ ] Check includes display correctly in production environment
- [ ] Complete the course as a learner in local/production

### Blog & documentation

- [ ] Write promotional blog post for Developer Blog (if applicable)
- [ ] Create `ad.adoc` and/or `promo.adoc` — **Done** (ad.adoc in course root)
- [ ] Notify `#team-documentation` for inclusion in Docs with ad.adoc
- [ ] Announce the course release in `#graphacademy`

### Final quality (from how-we-teach reviewing-course)

- [ ] All lessons follow two-part opening (context + learning objective)
- [ ] Every lesson has a summary section
- [ ] All admonitions have titles
- [ ] All questions have hints and solutions
- [ ] All images have alt text
- [ ] Code blocks have appropriate syntax highlighting
- [ ] Course runs locally without errors (`npm run dev`)

---

## Course metadata (current)

- **Folder:** `importing-relational-to-graph`
- **Caption:** Learn how to import relational data into Neo4j
- **Duration:** 3 hours
- **Next course:** importing-cypher
- **GraphAcademy URL:** `https://graphacademy.neo4j.com/courses/importing-relational-to-graph/`
- **Docs ad ref:** `?ref=docs-ad-importing-relational-to-graph`

---

## When ready to release

1. Set `:status: active` in `course.adoc`.
2. Open a PR; use the checklist in `.github/PULL_REQUEST_TEMPLATE/course_release.md`.
3. After merge, notify `#team-documentation` with the ad.adoc path for Docs inclusion.
