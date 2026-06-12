// Module 2 — Build the document graph from parsed PDFs
// Tree shape: Document -[:HAS_SECTION*]-> Section
// Shared keys: Section -[:REFERENCES_PART]-> Part, Section -[:REFERENCES_CODE]-> DTC

CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT section_id IF NOT EXISTS FOR (s:Section) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT part_number IF NOT EXISTS FOR (p:Part) REQUIRE p.partNumber IS UNIQUE;
CREATE CONSTRAINT dtc_code IF NOT EXISTS FOR (c:DTC) REQUIRE c.code IS UNIQUE;

// Documents — one node per PDF
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/documents.csv' AS row
MERGE (d:Document {id: row.doc_id})
SET d.docType = row.doc_type,
    d.title = row.title,
    d.model = row.model,
    d.published = date(row.published);

// Secondary labels by document type
MATCH (d:Document {docType: 'Manual'}) SET d:Manual;
MATCH (d:Document {docType: 'Bulletin'}) SET d:Bulletin;
MATCH (d:Document {docType: 'RecallNotice'}) SET d:RecallNotice;

// Sections — the tree
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/sections.csv' AS row
MERGE (s:Section {id: row.section_id})
SET s.seq = toInteger(row.seq),
    s.title = row.title,
    s.text = row.text;

// Top-level sections hang off the document...
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/sections.csv' AS row
WITH row WHERE row.parent_id IS NULL OR row.parent_id = ''
MATCH (d:Document {id: row.doc_id})
MATCH (s:Section {id: row.section_id})
MERGE (d)-[:HAS_SECTION]->(s);

// ...subsections hang off their parent section
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/sections.csv' AS row
WITH row WHERE row.parent_id IS NOT NULL AND row.parent_id <> ''
MATCH (parent:Section {id: row.parent_id})
MATCH (s:Section {id: row.section_id})
MERGE (parent)-[:HAS_SECTION]->(s);

// Shared keys — part numbers mentioned in section text
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/section_refs.csv' AS row
WITH row WHERE row.ref_type = 'PART'
MATCH (s:Section {id: row.section_id})
MERGE (p:Part {partNumber: row.ref_value})
MERGE (s)-[:REFERENCES_PART]->(p);

// Shared keys — diagnostic trouble codes mentioned in section text
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/section_refs.csv' AS row
WITH row WHERE row.ref_type = 'CODE'
MATCH (s:Section {id: row.section_id})
MERGE (c:DTC {code: row.ref_value})
MERGE (s)-[:REFERENCES_CODE]->(c);

// Derive LINKS_TO — sections in different documents that share a key
MATCH (s1:Section)-[:REFERENCES_PART|REFERENCES_CODE]->(key)
      <-[:REFERENCES_PART|REFERENCES_CODE]-(s2:Section)
WHERE s1.id < s2.id
MATCH (d1:Document)-[:HAS_SECTION*]->(s1)
MATCH (d2:Document)-[:HAS_SECTION*]->(s2)
WHERE d1 <> d2
WITH s1, s2,
     collect(DISTINCT coalesce(key.partNumber, key.code)) AS sharedKeys
MERGE (s1)-[l:LINKS_TO]->(s2)
SET l.sharedKeys = sharedKeys,
    l.strength = size(sharedKeys);
