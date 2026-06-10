WITH COUNT { (:Vehicle) } AS vehicles,
     COUNT { (:WorkOrder) } AS workOrders,
     COUNT { (:Part) } AS parts,
     COUNT { (:Section)-[:REFERENCES_PART]->(:Part)<-[:REPLACED]-(:WorkOrder) } AS bridges
RETURN vehicles = 30 AND workOrders = 39 AND parts = 11 AND bridges > 0 AS outcome,
       CASE
           WHEN vehicles = 0
           THEN 'No Vehicle nodes found. Run Step 2 to load vehicles.csv.'
           WHEN vehicles <> 30
           THEN 'Found ' + toString(vehicles) + ' Vehicle nodes but expected 30. Re-run Step 2.'
           WHEN workOrders <> 39
           THEN 'Found ' + toString(workOrders) + ' WorkOrder nodes but expected 39. Re-run Step 2.'
           WHEN parts <> 11
           THEN 'Found ' + toString(parts) + ' Part nodes but expected 11. If there are more, parts were duplicated instead of merged - check the MERGE key is partNumber.'
           WHEN bridges = 0
           THEN 'No Part node is referenced by a Section and replaced on a WorkOrder. Run Step 3 to load work_order_parts.csv.'
           ELSE 'Success! The warehouse is merged - parts now bridge documents and work orders.'
       END AS reason
