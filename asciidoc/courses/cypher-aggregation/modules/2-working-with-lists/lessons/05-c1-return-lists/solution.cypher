MATCH (m:Movie)<-[r:RATED]-(u:User)
WHERE m.title = "Toy Story"
// create the timestamp/name pair as a list
WITH [datetime({epochseconds:r.timestamp}),u.name] AS Reviews ORDER BY r.timestamp
RETURN Reviews