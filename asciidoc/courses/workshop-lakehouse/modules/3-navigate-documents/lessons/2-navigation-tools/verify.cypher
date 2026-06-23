WITH COUNT { (:Document) } AS docs,
     COUNT { (:Section) } AS sections,
     COUNT { ()-[:LINKS_TO]->() } AS links
RETURN docs = 183 AND sections = 985 AND links > 0 AS outcome,
       CASE
           WHEN docs = 0
           THEN 'No Document nodes found. Run the load pipeline: python load/load_documents.py'
           WHEN docs <> 183 OR sections <> 985
           THEN 'Found ' + toString(docs) + ' documents and ' + toString(sections) + ' sections but expected 183 and 985. Re-run python load/load_documents.py - it is safe to re-run.'
           WHEN links = 0
           THEN 'No LINKS_TO relationships found. Re-run python load/load_documents.py.'
           ELSE 'Success! The document library is loaded: 183 documents, 985 sections, ' + toString(links) + ' cross-reference links. The warehouse rows stay in BigQuery.'
       END AS reason
