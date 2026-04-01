#!/bin/bash
# Tear down Azure resources and remove local azd state.

set -euo pipefail

if [ ! -d ".azure" ]; then
    echo "No .azure directory found — nothing to clean up."
    exit 0
fi

# Check for a default azd environment
AZD_ENV=$(azd env list --output json 2>/dev/null | python3 -c "
import json, sys
envs = json.load(sys.stdin)
for e in envs:
    if e.get('IsDefault'):
        print(e['Name'])
        break
" 2>/dev/null || true)

if [ -z "$AZD_ENV" ]; then
    echo "No azd environment found. Removing .azure directory."
    rm -rf .azure
    echo "Done."
    exit 0
fi

echo "Active azd environment: $AZD_ENV"

AZURE_RG=$(azd env get-values -e "$AZD_ENV" 2>/dev/null | grep '^AZURE_RESOURCE_GROUP=' | cut -d'=' -f2 | tr -d '"')

if [ -n "$AZURE_RG" ] && az group show --name "$AZURE_RG" >/dev/null 2>&1; then
    echo "Resource group '$AZURE_RG' exists in Azure."
    echo ""
    echo "Running 'azd down' to delete deployed resources..."
    azd down --force --purge
    echo ""
    echo "azd down complete."
else
    echo "No deployed resource group found."
fi

echo "Removing .azure directory..."
rm -rf .azure
echo "Done. Run 'bash scripts/setup_azure.sh' to set up a new environment."
