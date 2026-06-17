CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT section_id IF NOT EXISTS FOR (s:Section) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT part_number IF NOT EXISTS FOR (p:Part) REQUIRE p.partNumber IS UNIQUE;
CREATE CONSTRAINT dtc_code IF NOT EXISTS FOR (c:DTC) REQUIRE c.code IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/documents.csv' AS row
MERGE (d:Document {id: row.doc_id})
SET d.docType = row.doc_type,
    d.title = row.title,
    d.model = row.model,
    d.published = date(row.published);

MATCH (d:Document {docType: 'Manual'}) SET d:Manual;
MATCH (d:Document {docType: 'Bulletin'}) SET d:Bulletin;
MATCH (d:Document {docType: 'RecallNotice'}) SET d:RecallNotice;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/sections.csv' AS row
MERGE (s:Section {id: row.section_id})
SET s.seq = toInteger(row.seq),
    s.title = row.title,
    s.text = row.text;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/sections.csv' AS row
WITH row WHERE row.parent_id IS NULL OR row.parent_id = ''
MATCH (d:Document {id: row.doc_id})
MATCH (s:Section {id: row.section_id})
MERGE (d)-[:HAS_SECTION]->(s);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/sections.csv' AS row
WITH row WHERE row.parent_id IS NOT NULL AND row.parent_id <> ''
MATCH (parent:Section {id: row.parent_id})
MATCH (s:Section {id: row.section_id})
MERGE (parent)-[:HAS_SECTION]->(s);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/section_refs.csv' AS row
WITH row WHERE row.ref_type = 'PART'
MATCH (s:Section {id: row.section_id})
MERGE (p:Part {partNumber: row.ref_value})
MERGE (s)-[:REFERENCES_PART]->(p);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/section_refs.csv' AS row
WITH row WHERE row.ref_type = 'CODE'
MATCH (s:Section {id: row.section_id})
MERGE (c:DTC {code: row.ref_value})
MERGE (s)-[:REFERENCES_CODE]->(c);

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
CREATE CONSTRAINT vehicle_vin IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.vin IS UNIQUE;
CREATE CONSTRAINT work_order_id IF NOT EXISTS FOR (w:WorkOrder) REQUIRE w.id IS UNIQUE;
CREATE CONSTRAINT procedure_id IF NOT EXISTS FOR (p:Procedure) REQUIRE p.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/parts.csv' AS row
MERGE (p:Part {partNumber: row.part_number})
SET p.name = row.name;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/parts.csv' AS row
WITH row WHERE row.superseded_by IS NOT NULL AND row.superseded_by <> ''
MATCH (old:Part {partNumber: row.part_number})
MATCH (new:Part {partNumber: row.superseded_by})
MERGE (old)-[:SUPERSEDED_BY]->(new);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/dtc_codes.csv' AS row
MERGE (c:DTC {code: row.code})
SET c.description = row.description;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/procedures.csv' AS row
MERGE (p:Procedure {id: row.procedure_id})
SET p.name = row.name,
    p.laborHours = toFloat(row.labor_hours);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/vehicles.csv' AS row
MERGE (v:Vehicle {vin: row.vin})
SET v.make = row.make,
    v.model = row.model,
    v.year = toInteger(row.year),
    v.engine = row.engine;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/work_orders.csv' AS row
MERGE (w:WorkOrder {id: row.wo_id})
SET w.opened = date(row.opened),
    w.odometer = toInteger(row.odometer),
    w.complaint = row.complaint,
    w.comeback = toBoolean(row.comeback)
WITH w, row
MATCH (v:Vehicle {vin: row.vin})
MERGE (v)-[:HAS_WORK_ORDER]->(w)
WITH w, row
MATCH (p:Procedure {id: row.procedure_id})
MERGE (w)-[:PERFORMED]->(p);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/work_orders.csv' AS row
WITH row WHERE row.dtc_code IS NOT NULL AND row.dtc_code <> ''
MATCH (w:WorkOrder {id: row.wo_id})
MATCH (c:DTC {code: row.dtc_code})
MERGE (w)-[:DIAGNOSED]->(c);

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/workshop-lakehouse/work_order_parts.csv' AS row
MATCH (w:WorkOrder {id: row.wo_id})
MATCH (p:Part {partNumber: row.part_number})
MERGE (w)-[r:REPLACED]->(p)
SET r.qty = toInteger(row.qty);
