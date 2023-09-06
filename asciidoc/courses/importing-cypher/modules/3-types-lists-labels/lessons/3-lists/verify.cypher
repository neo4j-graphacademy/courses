CALL apoc.meta.nodeTypeProperties()
YIELD nodeType, propertyName, propertyTypes
WHERE (nodeType = ":`Movie`" AND propertyName = "countries" AND propertyTypes = ["StringArray"]) OR (nodeType = ":`Movie`" AND propertyName = "languages" AND propertyTypes = ["StringArray"])
return count(*)=2 as outcome
