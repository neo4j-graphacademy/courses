MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE a.name = 'Tom Hanks'
WITH  collect(m.imdbVotes) AS Votes
WITH reduce(Init = 0, x IN Votes | Init + x) AS TotalVotes
RETURN TotalVotes