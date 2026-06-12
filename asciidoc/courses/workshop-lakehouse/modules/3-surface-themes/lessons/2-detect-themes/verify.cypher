WITH COUNT { (d:Document) WHERE d.themeId IS NOT NULL } AS grouped,
     COUNT { (:Document) } AS total
WITH grouped, total,
     COUNT { MATCH (d:Document) WHERE d.themeId IS NOT NULL
             RETURN DISTINCT d.themeId } AS themes
RETURN total > 0 AND grouped >= 6 AND themes >= 2 AS outcome,
       CASE
           WHEN total = 0
           THEN 'No Document nodes found. Run the load pipeline first: python load/load_graph.py'
           WHEN grouped = 0
           THEN 'No Document carries a themeId. Run the themes tool: python skill/scripts/themes.py'
           WHEN grouped < 6 OR themes < 2
           THEN 'Only ' + toString(grouped) + ' documents in ' + toString(themes) + ' themes. Re-run python skill/scripts/themes.py with default gamma - most documents should group.'
           ELSE 'Success! ' + toString(grouped) + ' of ' + toString(total) + ' documents grouped into ' + toString(themes) + ' themes.'
       END AS reason
