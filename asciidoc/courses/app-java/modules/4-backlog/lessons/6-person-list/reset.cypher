//Adam: interesting that you needed to do some cleaup!
MATCH (p:Person)
SET p.name = trim(p.name)