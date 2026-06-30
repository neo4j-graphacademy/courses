#!/bin/bash
# Retrieve Azure AI credentials from azd and write them to .env.
# Run this after: azd provision --no-prompt

set -euo pipefail

if [ ! -d ".azure" ]; then
    echo "No .azure directory found. Run 'bash scripts/setup_azure.sh' first."
    exit 1
fi

# Find the default azd environment
AZD_ENV=$(azd env list --output json 2>/dev/null | python3 -c "
import json, sys
envs = json.load(sys.stdin)
for e in envs:
    if e.get('IsDefault'):
        print(e['Name'])
        break
" 2>/dev/null || true)

if [ -z "$AZD_ENV" ]; then
    echo "No default azd environment found. Run 'bash scripts/setup_azure.sh' first."
    exit 1
fi

echo "Using azd environment: $AZD_ENV"

# Extract values from the azd environment
get_azd_value() {
    azd env get-values -e "$AZD_ENV" 2>/dev/null | grep "^${1}=" | cut -d'=' -f2 | tr -d '"'
}

SERVICES_NAME=$(get_azd_value AZURE_AI_SERVICES_NAME)
ENDPOINT=$(get_azd_value AZURE_AI_SERVICES_ENDPOINT)
RESOURCE_GROUP=$(get_azd_value AZURE_RESOURCE_GROUP)

if [ -z "$SERVICES_NAME" ] || [ -z "$RESOURCE_GROUP" ]; then
    echo "Could not read AZURE_AI_SERVICES_NAME or AZURE_RESOURCE_GROUP from azd."
    echo "Have you run 'azd provision --no-prompt'?"
    exit 1
fi

echo "Retrieving API key for '$SERVICES_NAME'..."
API_KEY=$(az cognitiveservices account keys list \
    --name "$SERVICES_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query 'key1' -o tsv)

if [ -z "$API_KEY" ]; then
    echo "Failed to retrieve API key."
    exit 1
fi

# Create .env from .env.example if it does not exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    else
        echo "No .env or .env.example found."
        exit 1
    fi
fi

# Helper: set a key in .env.  Replaces an existing line (commented or not),
# or appends if not present.
set_env() {
    local key="$1"
    local value="$2"
    # Match lines like:  KEY=..., # KEY=..., #KEY=...
    if grep -qE "^#?\s*${key}=" .env; then
        sed -i.bak "s|^#*\s*${key}=.*|${key}=\"${value}\"|" .env
    else
        echo "${key}=\"${value}\"" >> .env
    fi
}

echo "Updating .env with Azure credentials..."

set_env LLM_PROVIDER "azure"
set_env AZURE_OPENAI_API_KEY "$API_KEY"
set_env AZURE_OPENAI_ENDPOINT "$ENDPOINT"
set_env AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME "gpt-5-mini"
set_env AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME "text-embedding-3-small"
set_env AZURE_OPENAI_API_VERSION "2025-03-01-preview"

# Clean up sed backup file
rm -f .env.bak

echo ""
echo "Done! Azure credentials written to .env."
echo "Verify with: python genai-maf-context-providers/test_environment.py"
