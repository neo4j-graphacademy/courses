MATCH (p:Person)
RETURN apoc.agg.statistics(p.Biology)
