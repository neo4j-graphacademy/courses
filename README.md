# GraphAcademy

| Website                                                                                                                                                                          | Courses                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Release](https://github.com/neo4j-graphacademy/website/actions/workflows/release.yml/badge.svg)](https://github.com/neo4j-graphacademy/website/actions/workflows/release.yml) | [![Release](https://github.com/neo4j-graphacademy/courses/actions/workflows/release.yml/badge.svg)](https://github.com/neo4j-graphacademy/courses/actions/workflows/release.yml) |

## Installation

1. Install Dependencies

```
npm install
```

2. Configure `.env`

```
ASCIIDOC_DIRECTORY=asciidoc

BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=XXX
AUTH0_CLIENT_SECRET=XXX
AUTH0_ISSUER_BASE_URL=https://neo4j-sync.auth0.com

NEO4J_HOST=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=neo

SANDBOX_URL=https://efz1cnte2e.execute-api.us-east-1.amazonaws.com/main/
```

## Author Only Method

If you are only interested in authoring a course, you can use `docker-compose` to create a standalone server and Neo4j instance.

```
docker-compose -f docker-compose.dev.yaml up
```

## Running in Development Mode

Running in development mode will start a server at http://localhost:3000 and watch for changes.

```
npm run dev
```

### Mock Sandbox Integration

To stop the server from creating sandbox databases you can configure the API to return the same credentials regardless of use case:

```
SANDBOX_DEV_INSTANCE_ID=139f44bf53e91b10e9465bb9918e1660
SANDBOX_DEV_INSTANCE_HASH_KEY=139f44bf53e91b10e9465bb9918e1660
SANDBOX_DEV_INSTANCE_SCHEME=neo4j
SANDBOX_DEV_INSTANCE_HOST=localhost
SANDBOX_DEV_INSTANCE_PORT=7687
SANDBOX_DEV_INSTANCE_USERNAME=neo4j
SANDBOX_DEV_INSTANCE_PASSWORD=neo
```

### Watch for changes to `.adoc` files

Running the following command will listen for changes and merge the course catalogue into the database.

```
npm run watch
```

## Running in Production

```
npm run build
npm start
```

## Course Structure

```
asciidoc
 + courses/
    + {course-slug}/
       + badge.svg
       + overview.adoc
       + modules/
         + {module-slug}/
           + overview.adoc
           + lessons/
             + {lesson-slug}/
               + index.adoc
               + questions/
                 + question-1.adoc
                 + question-2.adoc
```

### courses/{course-slug}/overview.adoc

Course overview file

#### Attributes

-   `caption` -
-   `usecase` - If set, a sandbox instance will be created on enrolment
-   `status` -

### courses/{course-slug}/modules/{module-slug}/overview.adoc

Module overview file.

A module overview should contain information about the upcoming lessons, and a video to explain any concepts where possible.

#### Attributes

-   `order` -
-   `duration` -

### courses/{course-slug}/modules/{module-slug}/lessons/{lesson-slug}/index.adoc

Lesson content

#### Attributes

-   `order` -
-   `duration` -
-   `sandbox` - Should the sandbox window be expanded/visible by default?

### courses/{course-slug}/modules/{module-slug}/lessons/{lesson-slug}/sandbox.cypher

Pre-populate the sandbox query window with a cypher query

### courses/{course-slug}/modules/{module-slug}/lessons/{lesson-slug}/verify.cypher

Cypher query to run against the database to check that the challenge has been completed. Combine with a `[.verify]` question.

### courses/{course-slug}/modules/{module-slug}/lessons/{lesson-slug}/questions/{question}.adoc

Question title, text and answer

#### Attributes

-   `id` - Only required for challenges. if not set, a hashed version of the title will be used

## Question Types

### `[.question]`

Single or multiple choice questions. Use the checklist syntax and mark the correct answer(s) with an `[x]`.

```
[.question]
=== Which of the following are valid Cypher clauses?

* [x] `MERGE`
* [ ] `SELECT`
* [x] `MATCH`
* [ ] `FROM`

[TIP]
This is a tip if you get the answer wrong...
```

### `[.question.select-in-source]`

Adds a dropdown to the code block within the question. Use the checklist syntax to provide options and mark the correct answer with an `[x]`. To choose where the dropdown goes, add a comment to the code block, starting with `/*select:*/`

```
[.question.select-in-source]
=== Reversing the relationship direction

Say we wrote our query above differently and started with the `:Movie` node.
Use the dropdown below to traverse the relationship in an incoming direction.

Once you have selected your option, click the **Check Results** query button to continue.


[source,cypher]
----
MATCH (m:Movie)/*select:<-[:ACTED_IN]-*/(p:Person)
RETURN m.title, p.name
----

[TIP]
Remember that relationships can be traversed in either direction.

* [ ] `-[:ACTED_IN]->`
* [x] `<-[:ACTED_IN]-`

```

### `[.question.freetext]`

Free text question. Use the `input::answer[]` macro to add a textbox to the question.

```
[.question.freetext]
== Which movie has `Emil Eifrem` has acted in?

Use the Neo4j Browser window to the right of the screen to modify the query and enter the answer in the box below.

input::answer[]

* [x] The Matrix
```

### `[.verify]`

Use the `:verify: attribute assigned to the lesson to check the database

-   lesson/index.adoc

```
= Merge Challenge
:order: 4
:verify: RETURN true AS outcome
```

-   lesson/questions/challenge.adoc:

```
:id: _challenge

[.verify]
== Validate Results

Once you have run the query, click the **Check Database** button and we will check the database for you.

[TIP]
====
To find the node in the database, we would run the following Cypher query:

[source,cypher]
MATCH (p:Person {name: "Daniel Kaluuya"})
RETURN p

**Hint:** All you need to do is change the first word in the query.
====


verify::[]
```

You can also specify the button text:

```
verify::Check Database[]
```

### Mark as Read

If there are no questions to the _Lesson_, you can add a `Mark As Read` button to the page.

<!-- ```
input::read[type=button,class=btn,value=Mark as Read]
``` -->

```
read::I have added my environment variables[]
```

## Including the Browser

1. Expand Sandbox by default

    ```
    :sandbox: true
    // Optional: Pre-fill query window with a cypher query
    ```

    Add a `sandbox.cypher` file to pre-fill a query in the sandbox

2. Embed within lesson
    ```
    browser::MERGE (p:Person {name: 'Daniel Kaluuya'})[]
    ```

## Caching Pages

Page load times can be slow, so where possible, the asciidoc pages are cached. If you are using a page that replaces information using `user-*` or `sandbox-*` attributes, you can use the `:disable-cache: true` page attribute in `lesson.adoc` in order to stop the page from being cached.

```
= Your Neo4j Sandbox
:disable-cache: true
```

This value defaults to `false`.

## Deployment

The live site is hosted via AWS ECS.

To redeploy:

> To trigger build and deploy, trigger the deployment from Github Actions Panel:

1. In Github, click on the "Actions" tab located at the top of your repository page.
2. From the workflow list on the left, select "Deploy to AWS ECS" workflow.
3. Above the list of workflow runs, click "Run workflow".

   ***IMPORTANT: For the next step (4) if you use branch master, it will deploy on production. If you use branch development, it will deploy on development.***
4. Under "Use workflow from", use the dropdown to select the branch that you would like to use.
5. Click "Run workflow".

### Updating environment variables

To update environment variables for the website:

1. Log into the AWS account. Use the production account for production values and the development account for development values. 
2. Search for AWS Secrets Manager.
3. Go to the "Secrets" tab on the left.
4. Click on the secret name you want to update.
5. In the "Secret value" section, click "Retrieve secret value" on the right.
6. Click the "Edit" button on the right.
7. Edit the values and save. 
8. Trigger the "Deploy to AWS ECS" workflow from the appropriate branch. Use the master branch for production or the development branch for development.

### Updating cron schedule

To update the cron schedule, edit the `cron` attribute in the relevant item in `deployment-config/cron-config.yaml`.  
> Note: The cron string syntax is AWS EventBridge syntax, not Linux syntax. [Here you can find more information about AWS EventBridge Rules cron syntax.](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html)

### Creating new cron job

To create a new cron job, in `deployment-config/cron-config.yaml`, create a new object under the `crons` attribute.
> Note: The cron string syntax is AWS EventBridge syntax, not Linux syntax [Here you can find more information about AWS EventBridge Rules cron syntax.](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html)

### Adding new environment variables

To add a new environment variable, append the new variable name to the `env` attribute in `deployment-config/cron-config.yaml`.
Contact the deployment team to add the secret to the appropriate AWS account.
