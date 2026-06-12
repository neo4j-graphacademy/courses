// Minimal trail matching what the agent writes via write_recommendation.py
MATCH (v:Vehicle {vin: 'CM-FAL-2020-0451'})
MERGE (w:WorkOrder {id: 'WO-2026-0117'})
SET w.opened = date('2026-06-15'), w.status = 'open',
    w.complaint = 'Check engine light flashing, rough idle at stops'
MERGE (v)-[:HAS_WORK_ORDER]->(w)
WITH w
MATCH (c:DTC {code: 'P0301'})
MERGE (w)-[:DIAGNOSED]->(c)
WITH w
MERGE (w)-[:HAS_RECOMMENDATION]->(r:Recommendation {id: 'WO-2026-0117-R1'})
SET r.action = 'repair', r.createdAt = datetime(),
    r.summary = 'Replace coils with IC-2042-B per TSB-21-114 and bundle recall RC-2021-04'
WITH r
MATCH (p:Part {partNumber: 'IC-2042-B'})
MERGE (r)-[:RECOMMENDS_PART]->(p)
WITH r
MATCH (rc:RecallNotice {id: 'RC-2021-04'})
MERGE (r)-[:BUNDLES_RECALL]->(rc)
WITH r
MATCH (s:Section) WHERE s.id IN ['S-TSB21114-3', 'S-RC202104-2']
MERGE (r)-[:GROUNDED_IN]->(s);
