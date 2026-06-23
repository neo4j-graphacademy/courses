// Minimal passing graph — the real path is: python load/build_connections.py
MERGE (s:Schema {name: 'autofix_service'})
WITH s
UNWIND ['vehicles','dtc_codes','procedures','parts','work_orders','work_order_parts'] AS tn
MERGE (s)-[:HAS_TABLE]->(t:Table {name: tn});
MATCH (wo:Table {name:'work_orders'}), (v:Table {name:'vehicles'}),
      (d:Table {name:'dtc_codes'}), (pr:Table {name:'procedures'}),
      (p:Table {name:'parts'}), (wop:Table {name:'work_order_parts'})
MERGE (wo)-[:HAS_COLUMN]->(c1:Column {name:'vin'})
MERGE (v)-[:HAS_COLUMN]->(c2:Column {name:'vin'}) MERGE (c1)-[:REFERENCES]->(c2)
MERGE (wo)-[:HAS_COLUMN]->(c3:Column {name:'dtc_code'})
MERGE (d)-[:HAS_COLUMN]->(c4:Column {name:'code'}) MERGE (c3)-[:REFERENCES]->(c4)
MERGE (wo)-[:HAS_COLUMN]->(c5:Column {name:'procedure_id'})
MERGE (pr)-[:HAS_COLUMN]->(c6:Column {name:'procedure_id'}) MERGE (c5)-[:REFERENCES]->(c6)
MERGE (wop)-[:HAS_COLUMN]->(c7:Column {name:'wo_id'})
MERGE (wo)-[:HAS_COLUMN]->(c8:Column {name:'wo_id'}) MERGE (c7)-[:REFERENCES]->(c8)
MERGE (wop)-[:HAS_COLUMN]->(c9:Column {name:'part_number'})
MERGE (p)-[:HAS_COLUMN]->(c10:Column {name:'part_number'}) MERGE (c9)-[:REFERENCES]->(c10);
