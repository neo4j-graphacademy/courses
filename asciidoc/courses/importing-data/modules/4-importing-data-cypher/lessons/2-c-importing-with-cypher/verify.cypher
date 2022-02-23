call apoc.meta.stats() yield labelCount, relTypeCount, nodeCount, relCount
with labelCount, relTypeCount,  nodeCount, relCount
return labelCount + relTypeCount  + nodeCount + relCount = 195134 as outcome