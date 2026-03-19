const { join, sep, basename } = require("path");
const { readdirSync, readFileSync, existsSync } = require("fs");
const { globSync } = require("glob");
const { getAttribute, globJoin } = require("./utils");

// ---------------------------------------------------------------------------
// Load reference data once
// ---------------------------------------------------------------------------

const categoryDir = join(__dirname, "..", "asciidoc", "categories");

/** All valid category slugs derived from files on disk */
const validCategorySlugs = new Set(
  readdirSync(categoryDir)
    .filter((f) => f.endsWith(".adoc"))
    .map((f) => basename(f, ".adoc")),
);

/**
 * Internal classification slugs — any category whose :parent: includes
 * "internal". Derived dynamically so adding/removing children of `internal`
 * automatically updates this check.
 */
const internalClassifications = new Set(
  readdirSync(categoryDir)
    .filter((f) => f.endsWith(".adoc"))
    .filter((f) => {
      const content = readFileSync(join(categoryDir, f)).toString();
      return /^:parent:.*\binternal\b/m.test(content);
    })
    .map((f) => basename(f, ".adoc")),
);

/** All course directories that contain a course.adoc */
const coursePaths = globSync(
  globJoin(__dirname, "..", "asciidoc", "courses", "*"),
).filter((p) => existsSync(join(p, "course.adoc")));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the :categories: attribute value into a flat array of slugs,
 * stripping any order suffix (e.g. "beginners:2" → "beginners").
 */
function parseCategorySlugs(attr) {
  if (!attr) return [];
  return attr
    .split(",")
    .map((s) => s.split(":")[0].trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Homepage children", () => {
  const categoryFiles = readdirSync(categoryDir).filter((f) =>
    f.endsWith(".adoc"),
  );

  // Collect all categories that declare homepage as a parent, keyed by order
  const homepageChildren = [];
  for (const file of categoryFiles) {
    const slug = basename(file, ".adoc");
    const content = readFileSync(join(categoryDir, file)).toString();
    const parentAttr = content.match(/^:parent:\s+(.*)/m)?.[1];
    if (!parentAttr) continue;

    for (const entry of parentAttr.split(",").map((e) => e.trim())) {
      const [parentSlug, order] = entry.split(":");
      if (parentSlug.trim() === "homepage" && order !== undefined) {
        homepageChildren.push({ slug, order: parseInt(order, 10) });
      }
    }
  }
});

describe("Category parent references", () => {
  const categoryFiles = readdirSync(categoryDir).filter((f) =>
    f.endsWith(".adoc"),
  );

  for (const file of categoryFiles) {
    const slug = basename(file, ".adoc");
    const content = readFileSync(join(categoryDir, file)).toString();
    const parentAttr = content.match(/^:parent:\s+(.*)/m)?.[1];

    if (!parentAttr) continue;

    const parentSlugs = parentAttr
      .split(",")
      .map((e) => e.split(":")[0].trim())
      .filter(Boolean);

    describe(slug, () => {
      it("all :parent: entries should reference existing category files", () => {
        const missing = parentSlugs.filter((s) => !validCategorySlugs.has(s));
        if (missing.length > 0) {
          throw new Error(`Unknown parent categories: ${missing.join(", ")}`);
        }
      });
    });
  }
});

describe("Category Validation", () => {
  for (const coursePath of coursePaths) {
    const slug = coursePath.split(sep).reverse()[0];
    const courseAdoc = readFileSync(join(coursePath, "course.adoc")).toString();
    const categoriesAttr = getAttribute(courseAdoc, "categories");
    const categorySlugs = parseCategorySlugs(categoriesAttr);

    describe(slug, () => {
      it("should have a :categories: attribute with at least one entry", () => {
        if (!categoriesAttr || categorySlugs.length === 0) {
          throw new Error(
            "Course is missing a :categories: attribute. Add at least one category slug.",
          );
        }
      });

      it("all :categories: should reference existing category files", () => {
        const missing = categorySlugs.filter((s) => !validCategorySlugs.has(s));
        if (missing.length > 0) {
          throw new Error(
            `The following categories do not exist: ${missing.join(", ")}`,
          );
        }
      });

      it(`should include at least one internal classification (${[...internalClassifications].join(", ")})`, () => {
        const hasInternal = categorySlugs.some((s) =>
          internalClassifications.has(s),
        );
        if (!hasInternal) {
          throw new Error(
            `Course must include at least one internal classification. ` +
              `Valid options: ${[...internalClassifications].sort().join(", ")}`,
          );
        }
      });

      if (slug.startsWith("workshop-")) {
        it("workshop courses must include the 'workshops' category", () => {
          if (!categorySlugs.includes("workshops")) {
            throw new Error(
              `Workshop course is missing the 'workshops' category. ` +
                `Current categories: ${categorySlugs.join(", ")}`,
            );
          }
        });
      }
    });
  }
});
