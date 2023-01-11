MATCH (a:Actor)
RETURN percentileCont(a.born.year,.75)