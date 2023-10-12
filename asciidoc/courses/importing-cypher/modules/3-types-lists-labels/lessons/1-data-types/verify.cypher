CALL apoc.meta.nodeTypeProperties()
YIELD nodeType, propertyName, propertyTypes
WHERE (nodeType = ":`Person`" AND propertyName = "born" AND propertyTypes = ["Date"]) OR (nodeType = ":`Person`" AND propertyName = "died" AND propertyTypes = ["Date"])
RETURN count(*)=2 as outcome