UNWIND ['these will be', 'displayed as hints', 'in the UI', 'if outcome is false'] AS condition
RETURN false AS outcome, condition AS reason
