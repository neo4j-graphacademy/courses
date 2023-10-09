CALL apoc.meta.nodeTypeProperties()
YIELD nodeType, propertyName, propertyTypes
WHERE nodeType = ":`Movie`" AND propertyName = "countries" AND propertyTypes = ["StringArray"]
return True as outcome
