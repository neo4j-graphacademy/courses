CALL apoc.meta.nodeTypeProperties()
YIELD nodeType, propertyName, propertyTypes
WHERE (nodeType = ":`Movie`" AND propertyName = "year" AND propertyTypes = ["Long"]) OR (nodeType = ":`Movie`" AND propertyName = "budget" AND propertyTypes = ["Long"])
RETURN count(*)=2 as outcome