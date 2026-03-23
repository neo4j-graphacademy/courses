// Solution: complete memory_agent.py and run it
// The agent should produce ReasoningTrace, ReasoningStep, and ToolCall nodes in Neo4j

MATCH (t:ReasoningTrace)-[:HAS_STEP]->(s:ReasoningStep)-[:USED_TOOL]->(tc:ToolCall)
RETURN t.task, t.status, count(s) AS steps, count(tc) AS tool_calls
ORDER BY t.created_at DESC
LIMIT 5;
