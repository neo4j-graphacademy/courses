OPTIONAL MATCH (rocketman:Movie {title: 'Rocketman'})

UNWIND [
    [rocketman is not null, "There should be a Movie node with the title 'Rocketman'."],
    [rocketman.createdAt is not null, "The node should have a createdAt property."],
    [rocketman.updatedAt is not null, "The node should have an updatedAt property."]
] AS row

RETURN row[0] AS outcome, row[1] AS reason