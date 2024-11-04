// MATCH (p:Person {name: 'Daniel Kaluuya'}) RETURN true AS outcome

OPTIONAL MATCH (daniel:Person) WHERE toLower(daniel.name) = "daniel kaluuya"

UNWIND [
    [daniel is not null, "The node should have a Person label."],
    [daniel.name = "Daniel Kaluuya", "The name property should be exactly equal to 'Daniel Kaluuya' including case."]
] AS row

RETURN row[0] AS outcome, row[1] AS reason