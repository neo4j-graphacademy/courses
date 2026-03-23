MATCH (t:ReasoningTrace)-[:HAS_STEP]->(s:ReasoningStep)-[:USED_TOOL]->(tc:ToolCall)
RETURN count(t) >= 1 AND count(s) >= 1 AND count(tc) >= 1 AS outcome
