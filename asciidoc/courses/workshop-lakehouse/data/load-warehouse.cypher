// Module 4 — Merge the Delta warehouse into the document graph
// Merge keys: Part.partNumber and DTC.code — already in the graph from the PDFs

CREATE CONSTRAINT vehicle_vin IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.vin IS UNIQUE;
CREATE CONSTRAINT work_order_id IF NOT EXISTS FOR (w:WorkOrder) REQUIRE w.id IS UNIQUE;
CREATE CONSTRAINT procedure_id IF NOT EXISTS FOR (p:Procedure) REQUIRE p.id IS UNIQUE;

// Parts catalog (Delta: autofix.service.part)
// MERGE on partNumber — enriches the Part nodes the PDFs already created
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/parts.csv' AS row
MERGE (p:Part {partNumber: row.part_number})
SET p.name = row.name;

// Supersession chain
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/parts.csv' AS row
WITH row WHERE row.superseded_by IS NOT NULL AND row.superseded_by <> ''
MATCH (old:Part {partNumber: row.part_number})
MATCH (new:Part {partNumber: row.superseded_by})
MERGE (old)-[:SUPERSEDED_BY]->(new);

// Trouble code reference (Delta: autofix.service.dtc_code)
// MERGE on code — enriches the DTC nodes the PDFs already created
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/dtc_codes.csv' AS row
MERGE (c:DTC {code: row.code})
SET c.description = row.description;

// Procedures (Delta: autofix.service.procedure)
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/procedures.csv' AS row
MERGE (p:Procedure {id: row.procedure_id})
SET p.name = row.name,
    p.laborHours = toFloat(row.labor_hours);

// Vehicles (Delta: autofix.service.vehicle)
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/vehicles.csv' AS row
MERGE (v:Vehicle {vin: row.vin})
SET v.make = row.make,
    v.model = row.model,
    v.year = toInteger(row.year),
    v.engine = row.engine;

// Work orders (Delta: autofix.service.work_order)
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/work_orders.csv' AS row
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

// Diagnosed codes — the DTC node is the same one the PDF sections reference
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/work_orders.csv' AS row
WITH row WHERE row.dtc_code IS NOT NULL AND row.dtc_code <> ''
MATCH (w:WorkOrder {id: row.wo_id})
MATCH (c:DTC {code: row.dtc_code})
MERGE (w)-[:DIAGNOSED]->(c);

// Replaced parts (Delta: autofix.service.work_order_part)
// The Part node is the same one the PDF sections reference
LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/genai-workshop-lakehouse/work_order_parts.csv' AS row
MATCH (w:WorkOrder {id: row.wo_id})
MATCH (p:Part {partNumber: row.part_number})
MERGE (w)-[r:REPLACED]->(p)
SET r.qty = toInteger(row.qty);
