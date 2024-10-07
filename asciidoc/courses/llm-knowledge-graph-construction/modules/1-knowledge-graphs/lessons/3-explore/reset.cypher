MATCH (n) WHERE n.neo4jImportId IS NOT NULL DETACH DELETE n;
CREATE CONSTRAINT Article_neo4jImportId IF NOT EXISTS FOR (n:Article) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT Person_neo4jImportId IF NOT EXISTS FOR (n:Person) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT Location_neo4jImportId IF NOT EXISTS FOR (n:Location) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT Party_neo4jImportId IF NOT EXISTS FOR (n:`Political party`) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT Building_neo4jImportId IF NOT EXISTS FOR (n:Building) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT Organization_neo4jImportId IF NOT EXISTS FOR (n:Organization) REQUIRE n.neo4jImportId IS UNIQUE;
CREATE CONSTRAINT State_neo4jImportId IF NOT EXISTS FOR (n:State) REQUIRE n.neo4jImportId IS UNIQUE;
CALL apoc.import.json("https://raw.githubusercontent.com/neo4j-graphacademy/courses/llm-kg/asciidoc/courses/llm-knowledge-graph-construction/modules/1-knowledge-graphs/lessons/3-explore/data/jimmy_carter.json");
