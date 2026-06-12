// Minimal passing assignment - the real path is: python skill/scripts/themes.py
MATCH (d:Document)
WHERE d.docType IN ['Manual', 'Bulletin']
SET d.themeId = CASE WHEN d.model = 'Falcon' THEN 0 ELSE 1 END;
