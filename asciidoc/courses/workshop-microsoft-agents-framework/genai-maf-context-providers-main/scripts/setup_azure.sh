#!/bin/bash
# Configure Azure region for GenAI MAF Context Providers Workshop
# Run this after: az login --use-device-code && azd auth login --use-device-code

set -e

echo ""
echo "Azure AI Foundry serverless models require one of these regions:"
echo "  1) East US 2 (eastus2) - Recommended"
echo "  2) Sweden Central (swedencentral)"
echo "  3) West US 2 (westus2)"
echo "  4) West US 3 (westus3)"
echo ""
read -p "Select a region [1-4] (default: 1): " choice
choice=${choice:-1}

case $choice in
    1) REGION="eastus2" ;;
    2) REGION="swedencentral" ;;
    3) REGION="westus2" ;;
    4) REGION="westus3" ;;
    *)
        echo "Invalid choice. Please enter 1-4."
        exit 1
        ;;
esac

if [ -d ".azure" ]; then
    echo "Removing existing .azure directory..."
    rm -rf .azure
fi

read -p "Environment name (default: dev): " ENV_NAME
ENV_NAME=${ENV_NAME:-dev}

echo "Initializing azd environment..."
azd init -e "$ENV_NAME"

azd env set AZURE_LOCATION "$REGION"

RG_NAME="rg-${ENV_NAME}"
echo "Creating resource group '$RG_NAME' in $REGION..."
az group create --name "$RG_NAME" --location "$REGION" --tags "azd-env-name=$ENV_NAME" -o none
azd env set AZURE_RESOURCE_GROUP "$RG_NAME"

echo ""
echo "Azure configured: $REGION (resource group: $RG_NAME)"
echo ""
echo "Ready to deploy! Run:"
echo "   azd provision --no-prompt"
echo ""
echo "After deployment, retrieve the API key:"
echo "   az cognitiveservices account keys list \\"
echo "     --name \$(azd env get-values | grep AZURE_AI_SERVICES_NAME | cut -d'=' -f2 | tr -d '\"') \\"
echo "     --resource-group \$(azd env get-values | grep AZURE_RESOURCE_GROUP | cut -d'=' -f2 | tr -d '\"') \\"
echo "     --query 'key1' -o tsv"
