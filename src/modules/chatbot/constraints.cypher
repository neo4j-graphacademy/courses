// Neo4j Unique Constraints for Chatbot Module
// Conversation unique constraint
CREATE CONSTRAINT conversation_id_unique IF NOT EXISTS
FOR (c:Conversation)
REQUIRE c.id IS UNIQUE;

// Checkpoint unique constraint - compound key
CREATE CONSTRAINT checkpoint_id_ns_unique IF NOT EXISTS
FOR (cp:Checkpoint)
REQUIRE (cp.checkpoint_id, cp.checkpoint_ns) IS UNIQUE;

// User unique constraint
CREATE CONSTRAINT user_sub_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.sub IS UNIQUE;

// CheckpointMessage unique constraint
CREATE CONSTRAINT checkpoint_message_id_unique IF NOT EXISTS
FOR (m:CheckpointMessage)
REQUIRE m.id IS UNIQUE;

// Tool unique constraint
CREATE CONSTRAINT tool_id_unique IF NOT EXISTS
FOR (t:Tool)
REQUIRE t.id IS UNIQUE;

// CheckpointWrite unique constraint
CREATE CONSTRAINT checkpoint_write_task_id_unique IF NOT EXISTS
FOR (cw:CheckpointWrite)
REQUIRE cw.task_id IS UNIQUE;