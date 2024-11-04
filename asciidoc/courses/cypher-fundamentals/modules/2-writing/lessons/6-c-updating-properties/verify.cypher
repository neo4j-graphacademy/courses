MATCH (getout:Movie {title: 'Get Out'})

UNWIND [
    [getout.tagline is not null, "There should be a tagline property."],
    [getout.released is not null, "There should be a released property."]
] AS row

RETURN row[0] AS outcome, row[1] AS reason