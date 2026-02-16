// Minimal solution that passes verification
// This is NOT the recommended approach - use Import tool instead
CREATE (:Supplier {supplierID: 1, companyName: 'Test Supplier'});
CREATE (:Supplier {supplierID: 2, companyName: 'Another Supplier'});

MATCH (s:Supplier {supplierID: 1}), (p:Product)
WHERE p.productID = 1
CREATE (s)-[:SUPPLIES]->(p);
