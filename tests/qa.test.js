const { config } = require("dotenv");
const { join, sep, resolve } = require("path");
const { globSync } = require("glob");
const { readFileSync, existsSync } = require("fs");
const {
  getAttribute,
  globJoin,
  getStatusCode,
  findLinks,
  findCypherStatements,
} = require("./utils");
const { explainCypherError, initDriver, closeDriver } = require("./cypher");

describe("QA Tests", () => {
  beforeAll(() => {
    config({ path: resolve(__dirname, "..", ".env") });
    initDriver();
  });

  afterAll(async () => await closeDriver());

  const skipLinkChecks = process.env.SKIP_LINK_CHECKS === "true";
  const skipCypherChecks = process.env.SKIP_CYPHER_CHECKS === "true";

  if (skipLinkChecks) {
    console.log("Skipping link checks (SKIP_LINK_CHECKS=true)");
  }
  if (skipCypherChecks) {
    console.log("Skipping Cypher validation checks (SKIP_CYPHER_CHECKS=true)");
  }

  const exclude = ["30-days", "how-we-teach"];
  let coursePaths = globSync(
    globJoin(__dirname, "..", "asciidoc", "courses", "*"),
  )
    .filter((path) => !exclude.some((folder) => path.endsWith(folder)))
    .filter((path) => existsSync(join(path, "course.adoc")));

  if (process.env.COURSES) {
    const targetCourses = process.env.COURSES.split(",").map((c) =>
      c.trim().toLowerCase(),
    );
    coursePaths = coursePaths.filter((path) => {
      const slug = path.split(sep).reverse()[0].toLowerCase();
      return targetCourses.some((term) => slug.includes(term));
    });
    console.log(
      `Filtering QA tests to courses matching: ${coursePaths.join(", ")} (${
        coursePaths.length
      })`,
    );
  }

  for (const coursePath of coursePaths) {
    const slug = coursePath.split(sep).reverse()[0];

    const courseAdoc = readFileSync(join(coursePath, "course.adoc")).toString();
    const status = getAttribute(courseAdoc, "status");
    const certification = getAttribute(courseAdoc, "certification");

    if (["active", "draft"].includes(status) && certification !== "true") {
      describe(slug, () => {
        const modulePaths = globSync(
          globJoin(
            __dirname,
            "..",
            "asciidoc",
            "courses",
            slug,
            "modules",
            "*",
          ),
        );

        it("should have a caption", () => {
          expect(getAttribute(courseAdoc, "caption")).toBeDefined();
        });

        // it("should have a level", () => {
        //   expect(getAttribute(courseAdoc, "categories")).toBeDefined();

        //   const categories = getAttribute(courseAdoc, "categories")
        //     .split(",")
        //     .map((e) => e.split(":")[0])
        //     .map((e) => e.trim());
        //   expect(categories.length).toBeGreaterThan(0);

        //   const levels = ["beginners", "intermediate", "advanced", "workshops"];
        //   expect(levels.some((level) => categories.includes(level))).toBe(true);
        // });

        it("should have a duration", () => {
          expect(getAttribute(courseAdoc, "duration")).toBeDefined();
        });

        it("should have key-points with 3-5 items", () => {
          const keyPoints = getAttribute(courseAdoc, "key-points");
          expect(keyPoints).toBeDefined();

          const points = keyPoints
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e !== "");
          expect(points.length).toBeGreaterThanOrEqual(3);
          expect(points.length).toBeLessThanOrEqual(5);
        });

        it("should have redirect URL when status is redirect", () => {
          const redirect = getAttribute(courseAdoc, "redirect");
          if (status === "redirect") {
            expect(redirect).toBeDefined();
            expect(redirect).toMatch(/^\/courses\/[a-z0-9-]+\/?$/);
          }
        });

        if (!skipLinkChecks) {
          it("should have valid GitHub repository if repository is defined", async () => {
            const repository = getAttribute(courseAdoc, "repository");
            if (repository) {
              expect(repository).toMatch(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/);

              const url = `https://github.com/${repository}`;
              const statusCode = await getStatusCode(url);
              try {
                expect(statusCode).toBe(200);
              } catch (e) {
                throw new Error(
                  `Repository ${repository} does not exist on GitHub (${url} returns ${statusCode})`,
                );
              }
            }
          }, 10000);
        }

        it("should have one or more modules", () => {
          if (status === "active") {
            expect(modulePaths.length).toBeGreaterThan(0);
          }
        });

        it("should have an illustration", () => {
          if (!courseAdoc.includes("workshop")) {
            const illustrationPath = join(
              __dirname,
              "..",
              "asciidoc",
              "courses",
              slug,
              "illustration.svg",
            );
            const exists = existsSync(illustrationPath);

            expect(exists).toBe(true);
          }
        });

        it("should have a banner image", () => {
          const bannerPath = join(
            __dirname,
            "..",
            "asciidoc",
            "courses",
            slug,
            "banner.png",
          );
          const exists = existsSync(bannerPath);

          expect(exists).toBe(true);
        });

        it("should end with a newline", () => {
          expect(courseAdoc.endsWith("\n")).toBe(true);
        });

        for (const modulePath of modulePaths) {
          const moduleSlug = modulePath.split(sep).reverse()[0];
          const moduleAdocPath = join(modulePath, "module.adoc");
          const moduleAdoc = readFileSync(moduleAdocPath).toString();
          const lessonPaths = globSync(
            globJoin(
              __dirname,
              "..",
              "asciidoc",
              "courses",
              slug,
              "modules",
              moduleSlug,
              "lessons",
              "*",
            ),
          );

          describe(moduleSlug, () => {
            it("should have a title", () => {
              const titleMatch = moduleAdoc.match(/^=\s+(.+)$/m);
              expect(titleMatch).toBeTruthy();
              expect(titleMatch[1].trim().length).toBeGreaterThan(0);
            });

            it("should have an :order: attribute", () => {
              expect(getAttribute(moduleAdoc, "order")).toBeDefined();
            });

            it("should have a link to the first lesson", () => {
              const linkMatch = moduleAdoc.match(/link:\.\/([^\/\[]+)\/\[/);

              expect(Array.isArray(linkMatch)).toBe(
                true,
                "No lesson link found",
              );
              expect(linkMatch.length).toBeGreaterThan(0);

              const lessonSlug = linkMatch[1];
              const lessonAdocPath = join(
                modulePath,
                "lessons",
                lessonSlug,
                "lesson.adoc",
              );
              expect(existsSync(lessonAdocPath)).toBe(
                true,
                `Lesson ${lessonSlug} does not exist`,
              );
            });

            it("should have introductory content", () => {
              const lines = moduleAdoc.split("\n");
              const content = lines.slice(1).join("\n").trim();
              expect(content.length).toBeGreaterThanOrEqual(300);
            });

            it("should have at least one list item", () => {
              expect(moduleAdoc).toContain("\n* ");
            });

            it("should have one or more lessons", () => {
              expect(lessonPaths.length).toBeGreaterThan(0);
            });

            it("should end with a newline", () => {
              expect(moduleAdoc.endsWith("\n")).toBe(true);
            });

            for (const lessonPath of lessonPaths) {
              const lessonSlug = lessonPath.split(sep).reverse()[0];

              const lessonAdoc = readFileSync(
                join(lessonPath, "lesson.adoc"),
              ).toString();

              const optional = getAttribute(lessonAdoc, "optional") === "true";
              const hasReadButton = lessonAdoc.match(/read::(.*)\[\]/) !== null;
              const includesSandbox = lessonAdoc.includes(
                'sandbox.adoc[tags="summary',
              );

              describe(lessonSlug, () => {
                const questionPaths = globSync(
                  globJoin(
                    __dirname,
                    "..",
                    "asciidoc",
                    "courses",
                    slug,
                    "modules",
                    moduleSlug,
                    "lessons",
                    lessonSlug,
                    "questions",
                    "*.adoc",
                  ),
                );

                it("should have a title", () => {
                  const titleMatch = lessonAdoc.match(/^=\s+(.+)$/m);
                  expect(titleMatch).toBeTruthy();
                  expect(titleMatch[1].trim().length).toBeGreaterThan(0);
                });

                it("should have an :order: attribute", () => {
                  expect(getAttribute(lessonAdoc, "order")).toBeDefined();
                });

                it("should have a valid :type: attribute if defined", () => {
                  const type = getAttribute(lessonAdoc, "type");
                  if (type) {
                    const validTypes = [
                      "video",
                      "lesson",
                      "text",
                      "quiz",
                      "activity",
                      "challenge",
                      "conversation",
                    ];
                    expect(validTypes).toContain(type);
                  }
                });

                it("should have a [.summary] section", () => {
                  if (!includesSandbox) {
                    const hasSummary =
                      lessonAdoc.match(/^\[\.summary/m) ||
                      lessonAdoc.match(/tag="summary/m) ||
                      lessonAdoc.match(/conversation/m);
                    if (!hasSummary) {
                      throw new Error(
                        'Lesson is missing a summary section ([.summary] or [tag="summary"]).',
                      );
                    }
                    expect(hasSummary).toBeTruthy();
                  }
                });

                it("should have meaningful content", () => {
                  const lines = lessonAdoc.split("\n");
                  const content = lines.slice(1).join("\n").trim();
                  expect(content.length).toBeGreaterThanOrEqual(200);
                });

                it("should end with a newline", () => {
                  expect(lessonAdoc.endsWith("\n")).toBe(true);
                });

                it("should have blank line after headers", () => {
                  const lines = lessonAdoc.split("\n");
                  const violations = [];

                  for (let i = 0; i < lines.length - 1; i++) {
                    const currentLine = lines[i];
                    const nextLine = lines[i + 1];

                    // Check if current line is a header (2 or more = followed by space and text)
                    if (/^={2,}\s+.+/.test(currentLine)) {
                      // Check if next line is not empty and not an attribute/directive/include
                      if (
                        nextLine.trim() !== "" &&
                        !/^:/.test(nextLine) &&
                        !/^\[/.test(nextLine) &&
                        !/^=/.test(nextLine) &&
                        !/^image::/.test(nextLine) &&
                        !/^video::/.test(nextLine) &&
                        !/^include::/.test(nextLine)
                      ) {
                        violations.push({
                          line: i + 1,
                          header: currentLine,
                          nextLine: nextLine.substring(0, 60),
                        });
                      }
                    }
                  }

                  if (violations.length > 0) {
                    const errorMsg = violations
                      .map(
                        (v) =>
                          `Line ${v.line}: "${v.header}" followed by "${v.nextLine}..."`,
                      )
                      .join("\n");
                    throw new Error(
                      `Headers must be followed by a blank line:\n${errorMsg}`,
                    );
                  }
                });

                it("should have blank line before lists", () => {
                  const lines = lessonAdoc.split("\n");
                  const violations = [];

                  for (let i = 0; i < lines.length - 1; i++) {
                    const currentLine = lines[i];
                    const nextLine = lines[i + 1];

                    // Check if current line is text (not empty, not already a list, not a directive)
                    // Also exclude indented list items (lines starting with spaces followed by list markers)
                    if (
                      currentLine.trim() !== "" &&
                      !/^[\*\-]/.test(currentLine) &&
                      !/^\s+[\*\-]/.test(currentLine) &&
                      !/^:/.test(currentLine) &&
                      !/^\[/.test(currentLine) &&
                      !/^=/.test(currentLine) &&
                      !/^----/.test(currentLine) &&
                      !/^====/.test(currentLine) &&
                      !/^</.test(currentLine) &&
                      !/^\./.test(currentLine) &&
                      !/^image::/.test(currentLine) &&
                      !/^video::/.test(currentLine) &&
                      !/^include::/.test(currentLine) &&
                      !/^\/\//.test(currentLine)
                    ) {
                      // Check if next line starts with list marker
                      if (/^[\*\-]\s/.test(nextLine)) {
                        violations.push({
                          line: i + 1,
                          text: currentLine.substring(0, 60),
                          nextLine: nextLine.substring(0, 60),
                        });
                      }
                    }
                  }

                  if (violations.length > 0) {
                    const errorMsg = violations
                      .map(
                        (v) =>
                          `Line ${v.line}: "${v.text}..." followed by list "${v.nextLine}..."`,
                      )
                      .join("\n");
                    throw new Error(
                      `Paragraphs must be followed by a blank line before lists:\n${errorMsg}`,
                    );
                  }
                });

                it("should have only one [.summary] section", () => {
                  const lines = lessonAdoc.split("\n");
                  let summaryCount = 0;
                  let inCodeBlock = false;
                  
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // Track code block state
                    if (/^----/.test(line) || /^====/.test(line)) {
                      inCodeBlock = !inCodeBlock;
                    }
                    
                    // Count [.summary] only outside code blocks
                    if (!inCodeBlock && /^\[\.summary\]/.test(line)) {
                      summaryCount++;
                    }
                  }
                  
                  if (summaryCount > 1) {
                    throw new Error(
                      `Lesson should have only one [.summary] section, found ${summaryCount}`,
                    );
                  }
                });

                it("should include {instance-database} if {instance-ip} is present", () => {
                  const hasInstanceIp = lessonAdoc.includes("{instance-ip}");
                  const hasInstanceDatabase = lessonAdoc.includes(
                    "{instance-database}",
                  );
                  if (hasInstanceIp) {
                    expect(hasInstanceDatabase).toBe(
                      true,
                      "Files containing {instance-ip} must also include {instance-database}",
                    );
                  }
                });

                it("should have at most one read button", () => {
                  const readButtonCount = [
                    ...lessonAdoc.matchAll(/read::(.*)\[\]/g),
                  ].length;
                  expect(readButtonCount).toBeLessThanOrEqual(1);
                });

                it("all admonitions should have titles", () => {
                  const admonitionRegex =
                    /^\[(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]/gm;
                  const admonitions = [...lessonAdoc.matchAll(admonitionRegex)];

                  for (const match of admonitions) {
                    const startIndex = match.index;
                    const afterAdmonition = lessonAdoc.substring(startIndex);
                    const nextLines = afterAdmonition.split("\n").slice(1, 3);

                    const hasTitle =
                      nextLines[0] && nextLines[0].trim().startsWith(".");
                    if (!hasTitle) {
                      const firstNewlineIndex = afterAdmonition.indexOf("\n");
                      const openingContent = afterAdmonition
                        .slice(firstNewlineIndex + 1)
                        .trim()
                        .slice(0, 100);
                      throw new Error(
                        `Admonition ${match[0]} does not have an action oriented title. Opening content: "${openingContent}..."`,
                      );
                    }
                  }
                });

                it("should be optional, mark as read or have one or more questions", () => {
                  expect(
                    optional ||
                      hasReadButton ||
                      includesSandbox ||
                      questionPaths.length > 0,
                  ).toBe(true);
                });

                // TODO: Test all verify & solution cypher files
                // if (type === 'challenge' && !optional) {
                //     it('should contain a valid verify.cypher', async () => {
                //         expect(existsSync(join(__dirname, '..', 'asciidoc',
                //             'courses', slug, 'modules', moduleSlug, 'lessons',
                //             lessonSlug, 'verify.cypher'))
                //         ).toBe(true)

                //         const cypher = readFileSync(join(lessonPath, 'verify.cypher')).toString()
                //         expect(await explainCypherError(cypher)).toBeUndefined()
                //     })

                //     it('should contain a valid solution.cypher', async () => {
                //         expect(existsSync(join(__dirname, '..', 'asciidoc',
                //             'courses', slug, 'modules', moduleSlug, 'lessons',
                //             lessonSlug, 'solution.cypher'))
                //         ).toBe(true)
                //     })
                // }

                if (!skipLinkChecks) {
                  describe("Links", () => {
                    for (const link of findLinks(lessonAdoc)) {
                      it(
                        link,
                        async () => {
                          if (
                            !link.includes("openai") &&
                            !link.includes("example") &&
                            !link.includes("localhost")
                          ) {
                            const statusCode = await getStatusCode(link);
                            try {
                              expect([200, 401, 402, 403, 408, 429]).toContain(
                                statusCode,
                              );
                            } catch (e) {
                              throw new Error(`${link} returns ${statusCode}`);
                            }
                          }
                        },
                        10000,
                      );
                    }
                  });
                }

                it("should contain valid [source,cypher] blocks", async () => {
                  if (!skipCypherChecks) {
                    for (const cypher of findCypherStatements(lessonAdoc)) {
                      const error = await explainCypherError(cypher);
                      if (error) {
                        throw new Error(
                          `Invalid Cypher query:\n\nQuery:\n${JSON.stringify(cypher)}\n\nError:\n${JSON.stringify(error)}`,
                        );
                      }
                      expect(error).toBeUndefined();
                    }
                  }
                });

                if (!optional && !hasReadButton) {
                  for (const questionPath of questionPaths) {
                    const questionSlug = questionPath.split(sep).reverse()[0];
                    const asciidoc = readFileSync(questionPath).toString();
                    const isVerificationQuestion =
                      asciidoc.includes("verify::");

                    describe(questionSlug, () => {
                      it("should have [.question] or [.verify] marker", () => {
                        expect(asciidoc).toMatch(/^\[\.question|\[\.verify/m);
                      });

                      it("should have a title", () => {
                        const titleMatch = asciidoc.match(/^=\s+(.+)$/m);
                        expect(titleMatch).toBeTruthy();
                        expect(titleMatch[1].trim().length).toBeGreaterThan(0);
                      });

                      it("should not have its title appear in the lesson content", () => {
                        const titleMatch = asciidoc.match(/^=\s+(.+)$/m);

                        if (titleMatch) {
                          const title = titleMatch[1].trim();

                          // Check if the question title appears in the lesson content
                          if (
                            lessonAdoc
                              .toLowerCase()
                              .includes(`= ${title.toLowerCase()}`)
                          ) {
                            throw new Error(
                              `Question title "${title}" should not appear as a heading in the lesson content`,
                            );
                          }
                        }
                      });

                      it(`should have a hint`, () => {
                        expect(asciidoc).toContain("\n[TIP,role=hint]");
                      });

                      it(`should have a solution`, () => {
                        expect(asciidoc).toContain("\n[TIP,role=solution]");
                      });

                      it("should end with a newline", () => {
                        expect(asciidoc.endsWith("\n")).toBe(true);
                      });

                      if (isVerificationQuestion) {
                        describe("Verify Question", () => {
                          it("should have a valid verify.cypher", async () => {
                            expect(
                              existsSync(
                                join(
                                  __dirname,
                                  "..",
                                  "asciidoc",
                                  "courses",
                                  slug,
                                  "modules",
                                  moduleSlug,
                                  "lessons",
                                  lessonSlug,
                                  "verify.cypher",
                                ),
                              ),
                            ).toBe(true);

                            if (!skipCypherChecks) {
                              const contents = readFileSync(
                                join(lessonPath, "verify.cypher"),
                              ).toString();

                              for (const cypher of contents
                                .split(";")
                                .filter((e) => e.trim() != "")) {
                                expect(
                                  await explainCypherError(cypher),
                                ).toBeUndefined();
                              }
                            }
                          });

                          it("should have a valid solution.cypher", async () => {
                            expect(
                              existsSync(
                                join(
                                  __dirname,
                                  "..",
                                  "asciidoc",
                                  "courses",
                                  slug,
                                  "modules",
                                  moduleSlug,
                                  "lessons",
                                  lessonSlug,
                                  "solution.cypher",
                                ),
                              ),
                            ).toBe(true);

                            if (!skipCypherChecks) {
                              const contents = readFileSync(
                                join(lessonPath, "solution.cypher"),
                              ).toString();

                              for (const cypher of contents
                                .split(";")
                                .filter((e) => e.trim() != "")) {
                                expect(
                                  await explainCypherError(cypher),
                                ).toBeUndefined();
                              }
                            }
                          });
                        });
                      } else {
                        describe("Multiple Choice Question", () => {
                          it("should have at least 1 answer option", () => {
                            const answerMatches = asciidoc.match(
                              /^[\*\-]\s*\[[\sxX\*]\]/gm,
                            );
                            expect(answerMatches).toBeTruthy();
                            expect(answerMatches.length).toBeGreaterThanOrEqual(
                              1,
                            );
                          });

                          it("should have a correct answer", () => {
                            const hasCorrectAnswer =
                              asciidoc.includes("* [x] ") ||
                              asciidoc.includes("* [*] ") ||
                              asciidoc.includes("- [x] ") ||
                              asciidoc.includes("- [*] ");
                            expect(hasCorrectAnswer).toBe(true);
                          });
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  }
});
