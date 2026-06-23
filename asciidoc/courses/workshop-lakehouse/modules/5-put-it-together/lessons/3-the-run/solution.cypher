// Minimal trail matching what the agent writes via write_recommendation.py
MERGE (w:WorkOrder {id: 'WO-2026-0117'})
SET w.opened = date('2026-06-15'), w.status = 'open',
    w.complaint = 'Check engine light flashing, rough idle at stops, loss of power on hills',
    w.dtc_code = 'P0301'
MERGE (v:Vehicle {vin: 'FAL20T20220002'})
MERGE (v)-[:HAS_WORK_ORDER]->(w)
WITH w
MERGE (w)-[:HAS_RECOMMENDATION]->(r:Recommendation {id: 'WO-2026-0117-R1'})
SET r.action = 'repair', r.createdAt = datetime(),
    r.summary = 'Replace coils with IC-2042-B per TSB-22-301 and bundle recall RC-2021-11',
    r.part = 'IC-2042-B'
WITH r
MATCH (rc:Document {area: 'recalls'}) WHERE toLower(rc.id) = 'rc-2021-11'
MERGE (r)-[:BUNDLES_RECALL]->(rc)
WITH r
MATCH (s:Section) WHERE s.uri IN [
  'technical-library/bulletins/tsb-22-301.pdf#repair-procedure',
  'technical-library/bulletins/tsb-20-501.pdf#repair-procedure',
  'technical-library/recalls/rc-2021-01.pdf#remedy'
]
MERGE (r)-[:GROUNDED_IN]->(s)
WITH r
MERGE (o:PartsOrder {id: 'PO-0001'})
SET o.status = 'submitted'
MERGE (r)-[:PLACED_ORDER]->(o);
