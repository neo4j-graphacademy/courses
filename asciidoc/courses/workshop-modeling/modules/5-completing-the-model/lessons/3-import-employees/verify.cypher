// Verify Employee nodes and relationships were imported
RETURN COUNT { (:Employee) } > 0 AND COUNT { ()-[:REPORTS_TO]->() } > 0 AND COUNT { ()-[:SOLD]->() } > 0 AS outcome,
       CASE
           WHEN COUNT { (:Employee) } = 0
           THEN 'No Employee nodes found. Make sure you created the Employee node mapping and ran the import.'
           WHEN COUNT { (:Employee) } < 9
           THEN 'Only ' + COUNT { (:Employee) } + ' Employee nodes found. Expected 9.'
           WHEN COUNT { ()-[:REPORTS_TO]->() } = 0
           THEN 'No REPORTS_TO relationships found. Make sure you created the REPORTS_TO relationship mapping from employees.csv.'
           WHEN COUNT { ()-[:REPORTS_TO]->() } < 8
           THEN 'Only ' + COUNT { ()-[:REPORTS_TO]->() } + ' REPORTS_TO relationships found. Expected 8.'
           WHEN COUNT { ()-[:SOLD]->() } = 0
           THEN 'No SOLD relationships found. Make sure you created the SOLD relationship mapping from orders.csv.'
           WHEN COUNT { ()-[:SOLD]->() } < 830
           THEN 'Only ' + COUNT { ()-[:SOLD]->() } + ' SOLD relationships found. Expected 830.'
           ELSE 'Success! You imported ' + COUNT { (:Employee) } + ' Employee nodes with ' + COUNT { ()-[:REPORTS_TO]->() } + ' REPORTS_TO and ' + COUNT { ()-[:SOLD]->() } + ' SOLD relationships.'
       END AS reason;
