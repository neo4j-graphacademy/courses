// Create one Customer, one Order, and one PLACED relationship to pass verification
CREATE (c:Customer {id: "TEST"})-[:PLACED]->(:Order {id: 1});
