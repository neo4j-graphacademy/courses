#!/usr/bin/env bash
pip3 install -r requirements.txt
python3 -m ipykernel install --user --name python3 --display-name "Python 3"

# Generate .env from Codespaces secrets if available
ENV_FILE=".env"
if [ -n "$OPENAI_API_KEY" ] || [ -n "$NEO4J_URI" ]; then
  echo "Generating .env from Codespaces secrets..."
  cat > "$ENV_FILE" <<EOF
OPENAI_API_KEY="${OPENAI_API_KEY:-sk-}"
OPENAI_RESPONSES_MODEL_ID="gpt-5-mini"
NEO4J_URI="${NEO4J_URI:-neo4j+s://}"
NEO4J_USERNAME="${NEO4J_USERNAME:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-}"
NEO4J_VECTOR_INDEX_NAME="moviePlots"
NEO4J_FULLTEXT_INDEX_NAME="moviePlotsFulltext"
EOF
  echo ".env file created successfully."
else
  echo "No Codespaces secrets found. Copy .env.example to .env and fill in your credentials manually."
fi
