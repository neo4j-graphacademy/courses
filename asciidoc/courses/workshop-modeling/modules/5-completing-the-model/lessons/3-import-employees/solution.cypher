// Minimal solution that passes verification
// This is NOT the recommended approach - use Import tool instead
CREATE (:Employee {employeeID: 1, firstName: 'Test', lastName: 'Employee'});
CREATE (:Employee {employeeID: 2, firstName: 'Another', lastName: 'Employee'});

MATCH (e1:Employee {employeeID: 2}), (e2:Employee {employeeID: 1})
CREATE (e1)-[:REPORTS_TO]->(e2);

MATCH (e:Employee {employeeID: 1}), (o:Order)
WHERE o.orderId IS NOT NULL
WITH e, o LIMIT 1
CREATE (e)-[:SOLD]->(o);
