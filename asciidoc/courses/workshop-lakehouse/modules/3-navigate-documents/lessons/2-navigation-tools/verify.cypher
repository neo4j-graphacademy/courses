WITH COUNT { (:Document) } AS docs,
     COUNT { (:Section) } AS sections,
     COUNT { ()-[:LINKS_TO]->() } AS links,
     COUNT { (:Vehicle) } AS vehicles,
     COUNT { (:Section)-[:REFERENCES_PART]->(:Part)<-[:REPLACED]-(:WorkOrder) } AS bridges
RETURN docs = 10 AND sections = 37 AND links > 0 AND vehicles = 30 AND bridges > 0 AS outcome,
       CASE
           WHEN docs = 0
           THEN 'No Document nodes found. Run the load pipeline: python load/load_graph.py'
           WHEN docs <> 10 OR sections <> 37
           THEN 'Found ' + toString(docs) + ' documents and ' + toString(sections) + ' sections but expected 10 and 37. Re-run python load/load_graph.py - it is safe to re-run.'
           WHEN links = 0
           THEN 'No LINKS_TO relationships found. Re-run python load/load_graph.py.'
           WHEN vehicles <> 30
           THEN 'Found ' + toString(vehicles) + ' vehicles but expected 30. Re-run python load/load_graph.py.'
           WHEN bridges = 0
           THEN 'No Part bridges documents and work orders - the two halves did not merge. Re-run python load/load_graph.py.'
           ELSE 'Success! One graph spans both halves: 10 documents, 37 sections, ' + toString(links) + ' links, 30 vehicles.'
       END AS reason
