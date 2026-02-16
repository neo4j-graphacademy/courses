// Verify Supplier nodes and SUPPLIES relationships were imported
RETURN COUNT { (:Supplier) } > 0 AND COUNT { ()-[:SUPPLIES]->() } > 0 AS outcome,
       CASE
           WHEN COUNT { (:Supplier) } = 0
           THEN 'No Supplier nodes found. Make sure you created the Supplier node mapping and ran the import.'
           WHEN COUNT { (:Supplier) } < 29
           THEN 'Only ' + COUNT { (:Supplier) } + ' Supplier nodes found. Expected 29.'
           WHEN COUNT { ()-[:SUPPLIES]->() } = 0
           THEN 'No SUPPLIES relationships found. Make sure you created the SUPPLIES relationship mapping.'
           WHEN COUNT { ()-[:SUPPLIES]->() } < 77
           THEN 'Only ' + COUNT { ()-[:SUPPLIES]->() } + ' SUPPLIES relationships found. Expected 77.'
           ELSE 'Success! You imported ' + COUNT { (:Supplier) } + ' Supplier nodes and ' + COUNT { ()-[:SUPPLIES]->() } + ' SUPPLIES relationships.'
       END AS reason;
