OPTIONAL MATCH (emil:Person {name: "Emil Eifrem"})-[]->(n)

UNWIND [
    [emil is null, "The `Person` node with the `name` 'Emil Eifrem' should be deleted."],
    [n is null, "Any relationships should also deleted."]
] AS row

RETURN row[0] AS outcome, row[1] AS reason