MATCH (daniel:Person {name: 'Daniel Kaluuya'})
OPTIONAL MATCH (getout:Movie {title: 'Get Out'})
OPTIONAL MATCH (daniel)-[r]->(getout)

UNWIND [
    [getout is not null, "There should be a Movie node with a title property equal to 'Get Out'."],
    [r is not null, "There should be a relationship between Daniel Kaluuya and Get Out."],
    [type(r) = "ACTED_IN", "The relationship should be of type ACTED_IN."]
] AS row

RETURN row[0] AS outcome, row[1] AS reason
