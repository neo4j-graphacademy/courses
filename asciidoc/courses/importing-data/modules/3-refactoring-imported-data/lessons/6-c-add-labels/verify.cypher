MATCH (a:Actor) with count(a) as numActors
MATCH (d:Director) with numActors, count(d) as numDirectors
return numActors + numDirectors = 450 as outcome