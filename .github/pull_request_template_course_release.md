---
name: Course Release
about: Use this template for releasing courses to production
title: "[Course Release] "
labels: course-release
---

### Pre-Release Checklist

#### Content Finalization

- [ ] Gather and incorporate all feedback from draft phase
- [ ] Complete final content review and QA
- [ ] Update course status to `:status: active` in course.adoc
- [ ] Ensure all assets (banner.png, badge.svg) are in place
- [ ] Verify course structure
- [ ] Add to [/knowledge-graph-rag/](https://graphacademy.neo4j.com/knowledge-graph-rag/) via [website repo](https://github.com/neo4j-graphacademy/website) (if GenAI course)
- [ ] Create course videos (if applicable - see create-videos.adoc)

#### Testing & Quality Assurance

- [ ] Verify all links work
- [ ] Check Cypher queries and code samples are valid (if applicable)
- [ ] Check includes display correctly in production environment
- [ ] Ensure course can be completed in production

#### Blog & Documentation

- [ ] Write promotional blog post for Developer Blog
- [ ] Create additional teaser content, shorts, etc
- [ ] Notify TWIN4J of release
- [ ] Announce the course release in `#graphacademy`
- [ ] Post to Social Media
- [ ] Create `ad.adoc` and/or `promo.adoc` and notify `#team-documentation` for inclusion in Docs

### Success Metrics

- [ ] Define success metrics for the course
- [ ] Set up tracking for course completion rates
- [ ] Plan follow-up review schedule (30/60/90 days)
