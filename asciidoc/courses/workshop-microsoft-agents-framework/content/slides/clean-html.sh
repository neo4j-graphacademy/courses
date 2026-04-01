#!/bin/bash
# Remove all Marp-generated HTML files from the slides directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

count=0
while IFS= read -r -d '' file; do
    rm "$file"
    echo "Removed: ${file#"$SCRIPT_DIR"/}"
    ((count++))
done < <(find "$SCRIPT_DIR" -name "*.html" -print0)

echo ""
echo "Removed $count HTML file(s)"
