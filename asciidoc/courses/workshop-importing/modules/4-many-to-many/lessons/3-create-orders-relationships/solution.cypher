// Create one Order, one Product, and one CONTAINS relationship to pass verification
CREATE (:Order {id: 1})-[:CONTAINS]->(:Product {id: "1"});
