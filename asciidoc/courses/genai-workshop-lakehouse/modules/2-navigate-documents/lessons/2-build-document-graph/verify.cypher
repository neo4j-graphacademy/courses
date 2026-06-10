WITH COUNT { (:Document) } AS docs,
     COUNT { (:Section) } AS sections,
     COUNT { ()-[:LINKS_TO]->() } AS links
RETURN docs = 10 AND sections = 37 AND links > 0 AS outcome,
       CASE
           WHEN docs = 0
           THEN 'No Document nodes found. Run Step 2 to load documents.csv.'
           WHEN docs <> 10
           THEN 'Found ' + toString(docs) + ' Document nodes but expected 10. Re-run Step 2.'
           WHEN sections <> 37
           THEN 'Found ' + toString(sections) + ' Section nodes but expected 37. Re-run Step 3.'
           WHEN links = 0
           THEN 'No LINKS_TO relationships found. Run Step 5 to derive cross-document links.'
           ELSE 'Success! 10 documents, 37 sections, and ' + toString(links) + ' LINKS_TO relationships.'
       END AS reason
