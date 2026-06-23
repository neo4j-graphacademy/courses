// The document graph is built by the Codespace pipeline, not a Cypher seed.
// Run it in your Codespace terminal (safe to re-run - it rebuilds the graph):
//
//   python load/load_documents.py
//
// It parses the PDF library into your Neo4j sandbox: 1 Library, 3 folders,
// 183 documents, 985 sections, threaded by NEXT_SECTION and LINKS_TO.
// Part numbers and trouble codes are NOT nodes - they live in the section
// text (and in BigQuery). The warehouse rows stay in BigQuery.
RETURN 'Run: python load/load_documents.py' AS solution;
