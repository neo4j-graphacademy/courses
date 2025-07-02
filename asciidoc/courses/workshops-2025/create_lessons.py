#!/usr/bin/env python3

import os

# Define all the lesson content templates
lessons = {
    # Module 3: Unstructured Data
    "3-unstructured-data/lessons/2-entity-extraction/lesson.adoc": """= Entity Extraction and Relationship Discovery
:type: lesson
:order: 2
:duration: 25 minutes

== Learning Objectives
* Extract entities using OpenAI and local models
* Discover relationships between entities
* Create knowledge graph structures from text
* Validate and improve extraction quality

== OpenAI-Based Entity Extraction
```python
import openai

def extract_entities_openai(text):
    prompt = f'''
    Extract entities from this text and classify them:
    
    Text: {text}
    
    Return JSON with entities and their types (PERSON, ORGANIZATION, LOCATION, CONCEPT, FINANCIAL_INSTRUMENT, etc.)
    '''
    
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    
    return response.choices[0].message.content
```

== Relationship Extraction
```python
def extract_relationships(text, entities):
    relationships = []
    
    # Simple pattern-based relationships
    patterns = {
        'WORKS_FOR': r'(\w+(?:\s+\w+)*)\s+(?:works for|employed by|CEO of)\s+(\w+(?:\s+\w+)*)',
        'LOCATED_IN': r'(\w+(?:\s+\w+)*)\s+(?:in|located in|based in)\s+(\w+(?:\s+\w+)*)',
        'OWNS': r'(\w+(?:\s+\w+)*)\s+(?:owns|acquired|purchased)\s+(\w+(?:\s+\w+)*)'
    }
    
    for rel_type, pattern in patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            relationships.append({
                'source': match[0].strip(),
                'target': match[1].strip(),
                'type': rel_type,
                'confidence': 0.8
            })
    
    return relationships
```

== Creating Graph from Extracted Data
```cypher
// Import extracted entities
UNWIND $entities AS entity
MERGE (e:Entity {name: entity.text})
SET e.type = entity.label,
    e.confidence = entity.confidence

// Import relationships  
UNWIND $relationships AS rel
MATCH (source:Entity {name: rel.source})
MATCH (target:Entity {name: rel.target})
MERGE (source)-[:RELATED_TO {
    type: rel.type,
    confidence: rel.confidence
}]->(target)
```

== Summary
Entity and relationship extraction transforms unstructured text into structured knowledge that can be stored in graphs and used for AI applications.
""",

    "3-unstructured-data/lessons/3-vector-embeddings/lesson.adoc": """= Vector Embeddings and Semantic Search
:type: lesson
:order: 3
:duration: 20 minutes

== Learning Objectives
* Create vector embeddings for text content
* Implement semantic search in Neo4j
* Combine keyword and vector search
* Optimize embedding performance

== Creating Embeddings
```python
import openai
from sentence_transformers import SentenceTransformer

# OpenAI embeddings
def create_openai_embedding(text):
    response = openai.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

# Local model embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

def create_local_embedding(text):
    return model.encode(text).tolist()
```

== Storing Embeddings in Neo4j
```cypher
// Create vector index
CREATE VECTOR INDEX document_embeddings FOR (d:Document) ON (d.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}

// Store embeddings
MATCH (d:Document) 
WHERE d.embedding IS NULL
WITH d LIMIT 100
CALL apoc.ml.openai.embedding([d.content], $openai_key) YIELD embedding
SET d.embedding = embedding
```

== Semantic Search
```cypher
// Find similar documents
WITH "financial risk management" AS query
CALL db.index.vector.queryNodes('document_embeddings', 5, $query_embedding)
YIELD node AS doc, score
RETURN doc.title, doc.content[0..200], score
ORDER BY score DESC
```

== Summary
Vector embeddings enable semantic search capabilities that go beyond keyword matching, finding conceptually similar content even when different words are used.
""",

    "3-unstructured-data/lessons/4-hands-on-exercise/lesson.adoc": """= Hands-on Exercise: Document Knowledge Graph
:type: challenge
:order: 4
:duration: 10 minutes

== Exercise Overview
Process financial documents from the GraphRAG dataset to create a knowledge graph with entities, relationships, and embeddings.

== Step 1: Process Documents
```python
# Load and process documents
documents = load_financial_documents()

for doc in documents:
    # Extract entities
    entities = extract_entities_openai(doc.content)
    
    # Extract relationships
    relationships = extract_relationships(doc.content, entities)
    
    # Create embeddings
    embedding = create_openai_embedding(doc.content)
    
    # Store in Neo4j
    store_document_graph(doc, entities, relationships, embedding)
```

== Step 2: Create Knowledge Graph
```cypher
// Create document with embedding
CREATE (d:Document {
    id: $doc_id,
    title: $title,
    content: $content,
    embedding: $embedding,
    processed_date: datetime()
})

// Create entities
UNWIND $entities AS entity
MERGE (e:Entity {name: entity.name, type: entity.type})
CREATE (d)-[:MENTIONS {confidence: entity.confidence}]->(e)

// Create relationships between entities
UNWIND $relationships AS rel
MATCH (source:Entity {name: rel.source})
MATCH (target:Entity {name: rel.target})
MERGE (source)-[:RELATED_TO {
    type: rel.type,
    confidence: rel.confidence,
    source_document: $doc_id
}]->(target)
```

== Step 3: Test Semantic Search
```cypher
// Semantic search for risk-related content
CALL db.index.vector.queryNodes('document_embeddings', 10, $risk_query_embedding)
YIELD node AS doc, score
MATCH (doc)-[:MENTIONS]->(entity:Entity)
WHERE entity.type IN ['FINANCIAL_CONCEPT', 'RISK_FACTOR']
RETURN doc.title, collect(entity.name)[0..5] AS related_entities, score
ORDER BY score DESC
```

== Challenge Questions
1. How would you improve entity extraction accuracy?
2. What additional relationships could enhance this knowledge graph?
3. How would you handle entity disambiguation?

== Summary
You've built a complete pipeline from unstructured text to searchable knowledge graph, ready for AI applications like semantic search and reasoning.
""",

    # Module 4: Graph Analytics  
    "4-graph-analytics/lessons/1-gds-overview/lesson.adoc": """= Graph Data Science Overview
:type: lesson
:order: 1
:duration: 20 minutes

== Learning Objectives
* Understand Graph Data Science (GDS) fundamentals
* Identify algorithm categories and use cases
* Set up GDS environment and projections
* Choose appropriate algorithms for business problems

== GDS Algorithm Categories

=== Centrality Algorithms
Find important nodes in the graph:
* **PageRank**: Authority based on incoming connections
* **Degree Centrality**: Importance by connection count
* **Betweenness Centrality**: Importance as bridge between parts
* **Closeness Centrality**: Importance by proximity to all nodes

=== Community Detection
Discover groups and clusters:
* **Louvain**: Optimize modularity to find communities
* **Label Propagation**: Fast community detection
* **Weakly Connected Components**: Find disconnected groups

=== Similarity Algorithms  
Find similar nodes:
* **Node Similarity**: Compare node neighborhoods
* **K-Nearest Neighbors**: Find most similar nodes
* **Jaccard Similarity**: Compare shared connections

== Creating Graph Projections
```cypher
// Create projection for analysis
CALL gds.graph.project(
  'financial-network',
  ['Customer', 'Account', 'Merchant'],
  {
    TRANSACTION: {
      properties: ['amount', 'date']
    },
    HAS_ACCOUNT: {},
    LOCATED_IN: {}
  }
)
YIELD graphName, nodeCount, relationshipCount
```

== Running Algorithms
```cypher
// PageRank for influential accounts
CALL gds.pageRank.stream('financial-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC LIMIT 10

// Community detection
CALL gds.louvain.stream('financial-network')  
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId)) AS members
WHERE size(members) > 5
RETURN communityId, size(members) AS size,
       [m IN members | m.name][0..3] AS sample_members
```

== Summary
GDS provides powerful algorithms to extract insights from graph structures, revealing patterns invisible in traditional analytics.
""",

    "4-graph-analytics/lessons/2-centrality-algorithms/lesson.adoc": """= Centrality Algorithms in Practice
:type: lesson
:order: 2
:duration: 25 minutes

== Learning Objectives
* Apply different centrality measures appropriately
* Interpret centrality scores for business insights
* Combine multiple centrality measures
* Use centrality for feature engineering

== PageRank for Authority
```cypher
// Find most influential customers
CALL gds.pageRank.stream('financial-network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE 'Customer' IN labels(node)
RETURN node.name, node.total_balance, score
ORDER BY score DESC LIMIT 10
```

== Betweenness for Bridges
```cypher
// Find bridge accounts (potential money laundering)
CALL gds.betweenness.stream('financial-network')
YIELD nodeId, score  
WITH gds.util.asNode(nodeId) AS node, score
WHERE 'Account' IN labels(node) AND score > 100
RETURN node.number, node.type, score
ORDER BY score DESC
```

== Degree Centrality for Hubs
```cypher
// Find highly connected merchants
CALL gds.degree.stream('financial-network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score  
WHERE 'Merchant' IN labels(node)
RETURN node.name, node.category, score AS connections
ORDER BY score DESC LIMIT 10
```

== Business Applications
* **Fraud Detection**: High betweenness centrality accounts
* **Influence Analysis**: PageRank for customer importance  
* **Network Hubs**: Degree centrality for key connectors
* **Risk Assessment**: Centrality patterns for unusual behavior

== Summary
Centrality algorithms reveal different aspects of node importance, providing multiple lenses for understanding network structure and business dynamics.
""",

    "4-graph-analytics/lessons/3-community-detection/lesson.adoc": """= Community Detection and Clustering
:type: lesson
:order: 3
:duration: 25 minutes

== Learning Objectives
* Apply community detection algorithms
* Interpret community structures for business insights
* Use communities for customer segmentation
* Evaluate community quality

== Louvain Community Detection
```cypher
// Find customer communities
CALL gds.louvain.stream('financial-network')
YIELD nodeId, communityId
WITH communityId, 
     collect(gds.util.asNode(nodeId)) AS members,
     count(*) AS size
WHERE size > 3
RETURN communityId, size,
       [m IN members WHERE 'Customer' IN labels(m) | m.name][0..5] AS sample_customers,
       [m IN members WHERE 'Merchant' IN labels(m) | m.name][0..3] AS common_merchants
ORDER BY size DESC
```

== Label Propagation
```cypher
// Fast community detection for large graphs
CALL gds.labelPropagation.stream('financial-network', {
  maxIterations: 10
})
YIELD nodeId, communityId
WITH communityId, collect(nodeId) AS members
WHERE size(members) > 5
RETURN communityId, size(members) AS community_size
ORDER BY community_size DESC
```

== Business Applications
```cypher
// Customer segmentation based on transaction patterns
CALL gds.louvain.write('financial-network', {
  writeProperty: 'community'
})

// Analyze community characteristics
MATCH (c:Customer)
WITH c.community AS community, 
     collect(c) AS customers,
     avg(c.age) AS avg_age,
     avg(c.income) AS avg_income
RETURN community, size(customers) AS size,
       avg_age, avg_income,
       [cust IN customers | cust.name][0..3] AS sample_members
ORDER BY size DESC
```

== Summary
Community detection reveals natural groupings in data, enabling customer segmentation, market analysis, and targeted strategies based on behavioral patterns.
""",

    "4-graph-analytics/lessons/4-hands-on-exercise/lesson.adoc": """= Hands-on Exercise: Financial Network Analysis
:type: challenge
:order: 4
:duration: 20 minutes

== Exercise Overview
Apply graph analytics to detect patterns in financial data for fraud detection, customer segmentation, and risk assessment.

== Step 1: Create Analytics Projection
```cypher
CALL gds.graph.project(
  'financial-analytics',
  ['Customer', 'Account', 'Merchant', 'Location'],
  {
    HAS_ACCOUNT: {},
    TRANSACTION: {properties: ['amount']},
    LOCATED_IN: {},
    AT_MERCHANT: {}
  }
)
```

== Step 2: Fraud Detection Analysis
```cypher
// Find potential money laundering patterns
CALL gds.betweenness.stream('financial-analytics')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS account, score
WHERE 'Account' IN labels(account) AND score > 1000
MATCH (account)<-[:HAS_ACCOUNT]-(customer:Customer)
MATCH (account)-[t:TRANSACTION]->()
WITH customer, account, score, 
     count(t) AS transaction_count,
     avg(t.amount) AS avg_amount
WHERE transaction_count > 100 AND avg_amount > 5000
RETURN customer.name, account.number, score, 
       transaction_count, avg_amount
ORDER BY score DESC
```

== Step 3: Customer Segmentation  
```cypher
// Segment customers by community and behavior
CALL gds.louvain.write('financial-analytics', {
  writeProperty: 'segment'
})

MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WITH c.segment AS segment,
     collect(c) AS customers,
     avg(c.age) AS avg_age,
     sum(a.balance) AS total_assets,
     count(a) AS total_accounts
RETURN segment, size(customers) AS customer_count,
       avg_age, total_assets, total_accounts,
       total_assets / size(customers) AS avg_assets_per_customer
ORDER BY customer_count DESC
```

== Step 4: Risk Scoring
```cypher
// Create risk scores using multiple centrality measures
CALL gds.pageRank.write('financial-analytics', {
  writeProperty: 'influence_score'
})

MATCH (c:Customer)-[:HAS_ACCOUNT]->(a:Account)
WITH c, a,
     a.influence_score AS influence,
     count{(a)-[:TRANSACTION]-()} AS activity_level,
     c.credit_score AS credit
WITH c, 
     avg(influence) AS avg_influence,
     max(activity_level) AS max_activity,
     c.credit_score AS credit_score,
     // Composite risk score
     (avg(influence) * 0.3 + max(activity_level) * 0.4 + (800 - c.credit_score) * 0.3) AS risk_score
SET c.risk_score = risk_score
RETURN c.name, c.segment, risk_score, credit_score
ORDER BY risk_score DESC
LIMIT 20
```

== Challenge Questions
1. What patterns indicate potential fraud vs. legitimate high-value activity?
2. How would you validate customer segmentation results?
3. What other graph metrics could improve risk scoring?

== Summary
Graph analytics provides powerful insights for financial applications, from fraud detection to customer segmentation, by revealing patterns in network structure and behavior.
""",

    # Module 5: Retrievers
    "5-retrievers/lessons/1-vector-search/lesson.adoc": """= Vector Similarity Search
:type: lesson
:order: 1
:duration: 20 minutes

== Learning Objectives
* Implement vector similarity search in Neo4j
* Optimize vector index configuration
* Handle different embedding models
* Evaluate search quality

== Vector Index Setup
```cypher
// Create vector index for documents
CREATE VECTOR INDEX document_vectors FOR (d:Document) ON (d.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}

// For smaller local embeddings
CREATE VECTOR INDEX document_local FOR (d:Document) ON (d.local_embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 384,
    `vector.similarity_function`: 'cosine'
  }
}
```

== Basic Vector Search
```python
import openai
from neo4j import GraphDatabase

class VectorSearcher:
    def __init__(self, driver, openai_key):
        self.driver = driver
        openai.api_key = openai_key
    
    def search_documents(self, query, top_k=5):
        # Generate query embedding
        response = openai.embeddings.create(
            model="text-embedding-ada-002",
            input=query
        )
        query_embedding = response.data[0].embedding
        
        # Search similar documents
        with self.driver.session() as session:
            result = session.run("""
                CALL db.index.vector.queryNodes('document_vectors', $k, $embedding)
                YIELD node AS doc, score
                RETURN doc.title, doc.content, doc.source, score
                ORDER BY score DESC
            """, k=top_k, embedding=query_embedding)
            
            return [record.data() for record in result]
```

== Advanced Search Patterns
```cypher
// Search with metadata filtering
CALL db.index.vector.queryNodes('document_vectors', 20, $query_embedding)
YIELD node AS doc, score
WHERE doc.publish_date > date('2023-01-01') 
  AND doc.category = 'financial_analysis'
RETURN doc.title, doc.content[0..200], score
ORDER BY score DESC
LIMIT 5

// Multi-field search
WITH $query_embedding AS embedding
CALL db.index.vector.queryNodes('document_vectors', 10, embedding)
YIELD node AS doc, score AS vector_score
WITH doc, vector_score,
     apoc.text.score(doc.content, $keywords) AS keyword_score
WITH doc, vector_score, keyword_score,
     (vector_score * 0.7 + keyword_score * 0.3) AS combined_score
RETURN doc.title, combined_score
ORDER BY combined_score DESC
```

== Summary
Vector search enables semantic similarity matching, finding relevant content even when different terminology is used, forming the foundation for RAG applications.
""",

    "5-retrievers/lessons/2-graph-traversal/lesson.adoc": """= Graph Traversal Retrieval
:type: lesson
:order: 2
:duration: 25 minutes

== Learning Objectives
* Design graph traversal patterns for retrieval
* Combine entity relationships with content retrieval
* Implement multi-hop reasoning
* Balance relevance and context

== Entity-Based Retrieval
```cypher
// Find documents through entity relationships
MATCH (query_entity:Entity {name: "financial risk"})
MATCH (query_entity)-[:RELATED_TO*1..2]-(related:Entity)
MATCH (related)<-[:MENTIONS]-(doc:Document)
WITH doc, count(related) AS entity_relevance,
     collect(DISTINCT related.name)[0..5] AS related_entities
RETURN doc.title, doc.content[0..200], 
       entity_relevance, related_entities
ORDER BY entity_relevance DESC
LIMIT 10
```

== Hierarchical Traversal
```cypher
// Navigate concept hierarchies
MATCH (concept:Concept {name: "machine learning"})
MATCH path = (concept)-[:SUBCONCEPT_OF*0..3]-(broader:Concept)
MATCH (broader)<-[:ABOUT]-(doc:Document)
WITH doc, length(path) AS hierarchy_distance,
     collect(DISTINCT broader.name) AS concepts
RETURN doc.title, concepts, hierarchy_distance
ORDER BY hierarchy_distance ASC, doc.relevance_score DESC
```

== Temporal Traversal
```cypher
// Find related documents through time
MATCH (doc1:Document {title: $source_document})
MATCH (doc1)-[:MENTIONS]->(entity:Entity)<-[:MENTIONS]-(doc2:Document)
WHERE doc2.publish_date > doc1.publish_date
  AND doc2.publish_date < doc1.publish_date + duration('P30D')
WITH doc2, count(entity) AS shared_entities
WHERE shared_entities >= 3
RETURN doc2.title, doc2.publish_date, shared_entities
ORDER BY shared_entities DESC, doc2.publish_date ASC
```

== Context Expansion
```cypher
// Expand context around relevant entities
WITH ["Apple Inc", "financial performance"] AS key_entities
UNWIND key_entities AS entity_name
MATCH (entity:Entity {name: entity_name})
MATCH (entity)-[:RELATED_TO]-(context_entity:Entity)
MATCH (context_entity)<-[:MENTIONS]-(doc:Document)
WITH doc, count(DISTINCT entity) AS direct_relevance,
     count(DISTINCT context_entity) AS context_relevance
RETURN doc.title, 
       direct_relevance + (context_relevance * 0.5) AS total_score
ORDER BY total_score DESC
```

== Summary
Graph traversal retrieval leverages the rich relationship structure in knowledge graphs to find contextually relevant information beyond simple similarity search.
""",

    "5-retrievers/lessons/3-hybrid-retrieval/lesson.adoc": """= Hybrid Retrieval Strategies  
:type: lesson
:order: 3
:duration: 20 minutes

== Learning Objectives
* Combine vector and graph retrieval methods
* Implement weighted scoring systems
* Optimize retrieval for specific use cases
* Handle context window limitations

== Hybrid Retrieval Pipeline
```python
class HybridRetriever:
    def __init__(self, neo4j_driver, openai_key):
        self.driver = neo4j_driver
        self.openai_key = openai_key
    
    def retrieve(self, query, max_tokens=4000):
        # Step 1: Vector similarity search
        vector_results = self.vector_search(query, top_k=10)
        
        # Step 2: Entity-based graph traversal
        entities = self.extract_query_entities(query)
        graph_results = self.graph_traversal_search(entities)
        
        # Step 3: Combine and rank results
        combined = self.combine_results(vector_results, graph_results)
        
        # Step 4: Optimize for token limit
        return self.optimize_context(combined, max_tokens)
    
    def combine_results(self, vector_results, graph_results):
        result_map = {}
        
        # Weight vector results
        for result in vector_results:
            doc_id = result['doc_id']
            result_map[doc_id] = {
                **result,
                'vector_score': result['score'],
                'graph_score': 0,
                'combined_score': result['score'] * 0.6
            }
        
        # Add graph results
        for result in graph_results:
            doc_id = result['doc_id']
            if doc_id in result_map:
                result_map[doc_id]['graph_score'] = result['relevance']
                result_map[doc_id]['combined_score'] += result['relevance'] * 0.4
            else:
                result_map[doc_id] = {
                    **result,
                    'vector_score': 0,
                    'graph_score': result['relevance'],
                    'combined_score': result['relevance'] * 0.4
                }
        
        return sorted(result_map.values(), 
                     key=lambda x: x['combined_score'], 
                     reverse=True)
```

== Context Window Optimization
```cypher
// Intelligent chunk selection
WITH $retrieved_docs AS docs, $max_tokens AS token_limit
UNWIND docs AS doc
MATCH (d:Document {id: doc.doc_id})-[:HAS_CHUNK]->(chunk:Chunk)
WITH doc, chunk, chunk.token_count AS tokens,
     doc.combined_score * chunk.relevance_score AS chunk_score
ORDER BY chunk_score DESC

// Cumulative token counting
WITH collect({
    chunk: chunk, 
    tokens: tokens, 
    score: chunk_score,
    doc_title: doc.title
}) AS ranked_chunks

CALL {
    WITH ranked_chunks, token_limit
    WITH ranked_chunks, 0 AS cumulative_tokens, [] AS selected_chunks
    UNWIND range(0, size(ranked_chunks)-1) AS i
    WITH ranked_chunks[i] AS chunk, cumulative_tokens, selected_chunks
    WITH chunk, cumulative_tokens + chunk.tokens AS new_total, selected_chunks
    WHERE new_total <= token_limit
    RETURN collect(chunk) AS final_chunks
}

RETURN final_chunks
```

== Adaptive Retrieval
```python
def adaptive_retrieve(self, query, query_type="general"):
    """Adjust retrieval strategy based on query type"""
    
    strategies = {
        "factual": {"vector_weight": 0.8, "graph_weight": 0.2},
        "analytical": {"vector_weight": 0.5, "graph_weight": 0.5}, 
        "exploratory": {"vector_weight": 0.3, "graph_weight": 0.7}
    }
    
    weights = strategies.get(query_type, {"vector_weight": 0.6, "graph_weight": 0.4})
    
    vector_results = self.vector_search(query, top_k=15)
    graph_results = self.graph_traversal_search(self.extract_entities(query))
    
    return self.combine_with_weights(vector_results, graph_results, weights)
```

== Quality Evaluation
```cypher
// Measure retrieval quality
WITH $query AS query, $retrieved_docs AS docs, $ground_truth AS relevant_docs
WITH docs, relevant_docs,
     [doc IN docs WHERE doc.doc_id IN relevant_docs] AS true_positives,
     size(docs) AS total_retrieved,
     size(relevant_docs) AS total_relevant

RETURN 
    size(true_positives) AS true_positives,
    toFloat(size(true_positives)) / total_retrieved AS precision,
    toFloat(size(true_positives)) / total_relevant AS recall,
    2.0 * (precision * recall) / (precision + recall) AS f1_score
```

== Summary
Hybrid retrieval combines the strengths of vector similarity and graph traversal to provide more comprehensive and contextually relevant results for RAG applications.
""",

    "5-retrievers/lessons/4-hands-on-exercise/lesson.adoc": """= Hands-on Exercise: GraphRAG Retrieval System
:type: challenge
:order: 4
:duration: 10 minutes

== Exercise Overview
Build a complete retrieval system that combines vector search with graph traversal for enhanced RAG performance.

== Step 1: Setup Retrieval Infrastructure
```cypher
// Ensure vector indexes exist
CREATE VECTOR INDEX IF NOT EXISTS document_embeddings 
FOR (d:Document) ON (d.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}

// Create text search index
CREATE FULLTEXT INDEX document_text FOR (d:Document) ON EACH [d.title, d.content]
```

== Step 2: Implement Hybrid Retrieval
```python
class GraphRAGRetriever:
    def __init__(self, driver, openai_key):
        self.driver = driver
        self.openai_key = openai_key
    
    def retrieve_for_query(self, query, top_k=5):
        # Generate query embedding
        query_embedding = self.get_embedding(query)
        
        # Multi-strategy retrieval
        with self.driver.session() as session:
            result = session.run("""
                // Vector similarity
                CALL {
                    CALL db.index.vector.queryNodes('document_embeddings', 10, $embedding)
                    YIELD node AS doc, score AS vector_score
                    RETURN doc, vector_score, 0 AS graph_score
                }
                
                UNION
                
                // Graph traversal via entities
                CALL {
                    WITH $query AS query_text
                    CALL db.index.fulltext.queryNodes('document_text', query_text)
                    YIELD node AS seed_doc, score
                    MATCH (seed_doc)-[:MENTIONS]->(entity:Entity)
                    MATCH (entity)<-[:MENTIONS]-(related_doc:Document)
                    WHERE related_doc <> seed_doc
                    WITH related_doc, count(entity) AS shared_entities
                    RETURN related_doc AS doc, 0 AS vector_score, 
                           toFloat(shared_entities) / 10 AS graph_score
                }
                
                // Combine scores
                WITH doc, 
                     max(vector_score) AS vector_score,
                     max(graph_score) AS graph_score
                WITH doc, vector_score, graph_score,
                     (vector_score * 0.7 + graph_score * 0.3) AS combined_score
                RETURN doc.title, doc.content[0..300] + "..." AS snippet,
                       vector_score, graph_score, combined_score
                ORDER BY combined_score DESC
                LIMIT $top_k
            """, embedding=query_embedding, query=query, top_k=top_k)
            
            return [record.data() for record in result]
```

== Step 3: Test Different Query Types
```python
# Test queries
test_queries = [
    "What are the main financial risks facing technology companies?",
    "How does inflation impact consumer spending patterns?", 
    "What regulatory changes affect banking operations?",
    "How do ESG factors influence investment decisions?"
]

for query in test_queries:
    print(f"\\nQuery: {query}")
    results = retriever.retrieve_for_query(query, top_k=3)
    
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['title']}")
        print(f"   Vector: {result['vector_score']:.3f}, "
              f"Graph: {result['graph_score']:.3f}, "
              f"Combined: {result['combined_score']:.3f}")
        print(f"   {result['snippet']}")
```

== Step 4: Context Optimization
```cypher
// Optimize context for LLM input
WITH $retrieved_results AS results, 4000 AS max_tokens

UNWIND results AS result
MATCH (doc:Document {title: result.title})
OPTIONAL MATCH (doc)-[:HAS_CHUNK]->(chunk:Chunk)

WITH result, doc, chunk,
     COALESCE(chunk.token_count, doc.estimated_tokens) AS tokens,
     result.combined_score AS relevance

ORDER BY relevance DESC, tokens ASC

// Select chunks within token limit
WITH collect({
    content: COALESCE(chunk.content, doc.content),
    tokens: tokens,
    relevance: relevance,
    source: doc.title
}) AS candidates

CALL {
    WITH candidates, max_tokens
    WITH candidates, 0 AS running_total, [] AS selected
    UNWIND range(0, size(candidates)-1) AS i
    WITH candidates[i] AS candidate, running_total, selected
    WITH candidate, running_total + candidate.tokens AS new_total, selected
    WHERE new_total <= max_tokens
    WITH selected + [candidate] AS updated_selected, new_total AS running_total
    RETURN updated_selected AS final_selection
}

RETURN [item IN final_selection | {
    content: item.content,
    source: item.source,
    relevance: item.relevance
}] AS optimized_context
```

== Step 5: Evaluation and Improvement
```python
# Evaluate retrieval quality
def evaluate_retrieval(queries_with_ground_truth):
    results = []
    
    for query_data in queries_with_ground_truth:
        query = query_data['query']
        relevant_docs = set(query_data['relevant_docs'])
        
        retrieved = retriever.retrieve_for_query(query, top_k=10)
        retrieved_docs = set([r['title'] for r in retrieved])
        
        true_positives = len(retrieved_docs & relevant_docs)
        precision = true_positives / len(retrieved_docs) if retrieved_docs else 0
        recall = true_positives / len(relevant_docs) if relevant_docs else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        results.append({
            'query': query,
            'precision': precision,
            'recall': recall,
            'f1': f1
        })
    
    return results
```

== Challenge Questions
1. How would you handle queries that need real-time information?
2. What strategies would improve retrieval for technical vs. business queries?
3. How would you implement retrieval caching for performance?

== Summary
You've built a sophisticated retrieval system that combines vector similarity with graph relationships, providing rich context for LLM applications while optimizing for token limits and relevance.
""",

    # Module 6: Agents
    "6-agents/lessons/1-agent-architecture/lesson.adoc": """= Agent Architecture with Graphs
:type: lesson
:order: 1
:duration: 25 minutes

== Learning Objectives
* Design agent architectures that leverage graph knowledge
* Understand different agent patterns and use cases
* Implement graph-aware reasoning systems
* Handle agent memory and state management

== Graph-Enhanced Agent Patterns

=== Knowledge Graph Agent
```python
class GraphKnowledgeAgent:
    def __init__(self, graph_db, llm):
        self.graph = graph_db
        self.llm = llm
        self.memory = GraphMemory(graph_db)
    
    def process_query(self, user_query):
        # Extract entities from query
        entities = self.extract_entities(user_query)
        
        # Retrieve relevant graph context  
        context = self.retrieve_graph_context(entities)
        
        # Reason over graph structure
        reasoning_path = self.reason_over_graph(user_query, context)
        
        # Generate response with evidence
        return self.generate_response(user_query, reasoning_path)
    
    def retrieve_graph_context(self, entities):
        with self.graph.session() as session:
            result = session.run("""
                UNWIND $entities AS entity_name
                MATCH (e:Entity {name: entity_name})
                MATCH path = (e)-[:RELATED_TO*1..2]-(related)
                RETURN entity_name, related.name, 
                       type(relationships(path)[0]) AS relationship,
                       length(path) AS distance
                ORDER BY distance ASC
                LIMIT 20
            """, entities=entities)
            
            return [record.data() for record in result]
```

=== Multi-Agent System
```python
class MultiAgentGraphSystem:
    def __init__(self, graph_db):
        self.graph = graph_db
        self.agents = {
            'researcher': ResearchAgent(graph_db),
            'analyst': AnalysisAgent(graph_db), 
            'validator': ValidationAgent(graph_db)
        }
        self.coordinator = CoordinatorAgent(self.agents)
    
    def solve_complex_query(self, query):
        # Decompose query into sub-tasks
        tasks = self.coordinator.decompose_query(query)
        
        # Assign tasks to specialist agents
        results = {}
        for task in tasks:
            agent_type = self.coordinator.select_agent(task)
            results[task.id] = self.agents[agent_type].execute(task)
        
        # Synthesize results
        return self.coordinator.synthesize(query, results)
```

== Graph Memory Systems
```python
class GraphMemory:
    def __init__(self, graph_db):
        self.graph = graph_db
    
    def store_interaction(self, user_id, query, response, entities):
        with self.graph.session() as session:
            session.run("""
                MERGE (u:User {id: $user_id})
                CREATE (i:Interaction {
                    id: randomUUID(),
                    query: $query,
                    response: $response,
                    timestamp: datetime()
                })
                CREATE (u)-[:HAD_INTERACTION]->(i)
                
                // Link to mentioned entities
                UNWIND $entities AS entity_name
                MATCH (e:Entity {name: entity_name})
                CREATE (i)-[:MENTIONED]->(e)
            """, user_id=user_id, query=query, response=response, entities=entities)
    
    def get_conversation_context(self, user_id, limit=5):
        with self.graph.session() as session:
            result = session.run("""
                MATCH (u:User {id: $user_id})-[:HAD_INTERACTION]->(i:Interaction)
                OPTIONAL MATCH (i)-[:MENTIONED]->(e:Entity)
                WITH i, collect(e.name) AS mentioned_entities
                RETURN i.query, i.response, mentioned_entities, i.timestamp
                ORDER BY i.timestamp DESC
                LIMIT $limit
            """, user_id=user_id, limit=limit)
            
            return [record.data() for record in result]
```

== Summary
Graph-enhanced agents can reason over structured knowledge, maintain rich memory systems, and coordinate through shared graph representations for complex problem-solving.
""",

    "6-agents/lessons/2-graph-reasoning/lesson.adoc": """= Graph-Based Reasoning Patterns
:type: lesson
:order: 2
:duration: 30 minutes

== Learning Objectives
* Implement multi-hop reasoning over graphs
* Handle uncertainty and confidence in reasoning
* Create transparent reasoning chains
* Validate reasoning quality

== Multi-Hop Reasoning
```python
class GraphReasoningEngine:
    def __init__(self, graph_db, llm):
        self.graph = graph_db
        self.llm = llm
    
    def reason_path(self, start_entity, target_entity, max_hops=3):
        with self.graph.session() as session:
            result = session.run("""
                MATCH path = shortestPath(
                    (start:Entity {name: $start})-[:RELATED_TO*1..$max_hops]-(end:Entity {name: $target})
                )
                WITH path, length(path) AS path_length
                UNWIND relationships(path) AS rel
                UNWIND nodes(path) AS node
                RETURN path_length,
                       [n IN nodes(path) | n.name] AS entities,
                       [r IN relationships(path) | {type: type(r), confidence: r.confidence}] AS relationships
                ORDER BY path_length ASC
                LIMIT 5
            """, start=start_entity, target=target_entity, max_hops=max_hops)
            
            return [record.data() for record in result]
    
    def explain_reasoning(self, reasoning_paths):
        explanation_prompt = f'''
        Explain the logical connections in these reasoning paths:
        
        {self.format_paths(reasoning_paths)}
        
        Provide a clear, step-by-step explanation of how these entities are connected and why the relationships support the conclusion.
        '''
        
        return self.llm.generate(explanation_prompt)
```

== Uncertainty Handling
```cypher
// Confidence-weighted reasoning
MATCH path = (start:Entity {name: $start_entity})-[:RELATED_TO*1..3]-(end:Entity {name: $target_entity})
WITH path, 
     reduce(conf = 1.0, r IN relationships(path) | conf * r.confidence) AS path_confidence,
     length(path) AS path_length

// Weight by path confidence and length
WITH path, path_confidence, path_length,
     path_confidence / path_length AS weighted_score

WHERE weighted_score > 0.3
RETURN [n IN nodes(path) | n.name] AS reasoning_chain,
       [r IN relationships(path) | {type: type(r), confidence: r.confidence}] AS evidence,
       weighted_score
ORDER BY weighted_score DESC
LIMIT 10
```

== Causal Reasoning
```python
def analyze_causal_chain(self, cause_entity, effect_entity):
    """Find causal relationships between entities"""
    
    with self.graph.session() as session:
        result = session.run("""
            MATCH path = (cause:Entity {name: $cause})-[:CAUSES|:LEADS_TO|:INFLUENCES*1..4]->(effect:Entity {name: $effect})
            WITH path, 
                 [r IN relationships(path) WHERE type(r) IN ['CAUSES', 'LEADS_TO'] | r] AS causal_links,
                 [r IN relationships(path) WHERE type(r) = 'INFLUENCES' | r] AS influence_links
            
            WITH path, size(causal_links) AS direct_causal, size(influence_links) AS indirect_causal,
                 reduce(strength = 1.0, r IN relationships(path) | strength * coalesce(r.strength, 0.5)) AS path_strength
            
            RETURN [n IN nodes(path) | n.name] AS causal_chain,
                   direct_causal, indirect_causal, path_strength,
                   [r IN relationships(path) | {type: type(r), strength: coalesce(r.strength, 0.5)}] AS mechanisms
            ORDER BY direct_causal DESC, path_strength DESC
        """, cause=cause_entity, effect=effect_entity)
        
        return [record.data() for record in result]
```

== Temporal Reasoning
```cypher
// Reason about temporal sequences
MATCH (event1:Event)-[:HAPPENED_BEFORE*1..5]->(event2:Event)
WHERE event1.date < event2.date
  AND duration.between(event1.date, event2.date).days <= 90

WITH event1, event2, 
     duration.between(event1.date, event2.date).days AS days_between
WHERE days_between > 0

// Find intermediate events
OPTIONAL MATCH path = (event1)-[:HAPPENED_BEFORE*1..3]->(intermediate:Event)-[:HAPPENED_BEFORE*1..3]->(event2)
WHERE intermediate.date > event1.date AND intermediate.date < event2.date

RETURN event1.name AS cause_event,
       event2.name AS effect_event,
       days_between,
       collect(intermediate.name) AS intermediate_events
ORDER BY days_between ASC
```

== Analogical Reasoning
```python
def find_analogies(self, source_pattern, target_domain):
    """Find analogous patterns in different domains"""
    
    with self.graph.session() as session:
        result = session.run("""
            // Find source pattern structure
            MATCH source_path = (a:Entity)-[r1]->(b:Entity)-[r2]->(c:Entity)
            WHERE a.name IN $source_pattern
            WITH type(r1) AS rel1_type, type(r2) AS rel2_type, 
                 labels(a)[0] AS a_type, labels(b)[0] AS b_type, labels(c)[0] AS c_type
            
            // Find similar patterns in target domain
            MATCH target_path = (x:Entity)-[s1]->(y:Entity)-[s2]->(z:Entity)
            WHERE type(s1) = rel1_type 
              AND type(s2) = rel2_type
              AND any(label IN labels(x) WHERE label CONTAINS $target_domain)
            
            RETURN x.name AS target_a, y.name AS target_b, z.name AS target_c,
                   rel1_type, rel2_type,
                   labels(x) AS target_types
            LIMIT 10
        """, source_pattern=source_pattern, target_domain=target_domain)
        
        return [record.data() for record in result]
```

== Summary
Graph-based reasoning enables agents to follow logical connections, handle uncertainty, trace causal relationships, and find analogies across different domains of knowledge.
""",

    "6-agents/lessons/3-tool-integration/lesson.adoc": """= Tool Integration and Graph Operations
:type: lesson
:order: 3
:duration: 25 minutes

== Learning Objectives
* Integrate graph operations as agent tools
* Implement dynamic query generation
* Handle tool chaining and composition
* Validate tool execution results

== Graph Tool Framework
```python
class GraphToolAgent:
    def __init__(self, graph_db, llm):
        self.graph = graph_db
        self.llm = llm
        self.tools = {
            'find_entities': self.find_entities_tool,
            'explore_relationships': self.explore_relationships_tool,
            'analyze_patterns': self.analyze_patterns_tool,
            'update_knowledge': self.update_knowledge_tool
        }
    
    def find_entities_tool(self, entity_type, filters=None):
        """Find entities of specific type with optional filters"""
        
        filter_clause = ""
        if filters:
            conditions = [f"e.{k} = '{v}'" for k, v in filters.items()]
            filter_clause = f"WHERE {' AND '.join(conditions)}"
        
        query = f"""
            MATCH (e:Entity)
            WHERE $entity_type IN labels(e)
            {filter_clause}
            RETURN e.name, e.type, properties(e) AS properties
            ORDER BY e.name
            LIMIT 20
        """
        
        with self.graph.session() as session:
            result = session.run(query, entity_type=entity_type)
            return [record.data() for record in result]
    
    def explore_relationships_tool(self, entity_name, direction='both', depth=1):
        """Explore relationships around an entity"""
        
        direction_pattern = {
            'outgoing': f'-[r]->(related)',
            'incoming': f'<-[r]-(related)', 
            'both': f'-[r]-(related)'
        }[direction]
        
        query = f"""
            MATCH (e:Entity {{name: $entity_name}})
            MATCH (e){direction_pattern}
            RETURN related.name AS entity,
                   type(r) AS relationship,
                   properties(r) AS relationship_props,
                   labels(related) AS entity_types
            ORDER BY relationship, entity
            LIMIT 50
        """
        
        with self.graph.session() as session:
            result = session.run(query, entity_name=entity_name)
            return [record.data() for record in result]
```

== Dynamic Query Generation
```python
def generate_cypher_tool(self, natural_language_request):
    """Convert natural language to Cypher query"""
    
    prompt = f'''
    Convert this natural language request to a Cypher query:
    
    Request: {natural_language_request}
    
    Available node types: Entity, Document, Person, Company, Location
    Available relationships: RELATED_TO, WORKS_FOR, LOCATED_IN, MENTIONS
    
    Return only the Cypher query, no explanation.
    '''
    
    cypher_query = self.llm.generate(prompt)
    
    # Validate and execute safely
    if self.validate_cypher(cypher_query):
        with self.graph.session() as session:
            try:
                result = session.run(cypher_query)
                return [record.data() for record in result]
            except Exception as e:
                return f"Query execution error: {str(e)}"
    else:
        return "Invalid or unsafe query generated"

def validate_cypher(self, query):
    """Basic safety validation for generated Cypher"""
    forbidden_keywords = ['DELETE', 'DROP', 'CREATE', 'MERGE', 'SET', 'REMOVE']
    query_upper = query.upper()
    
    return not any(keyword in query_upper for keyword in forbidden_keywords)
```

== Tool Chaining
```python
def complex_analysis_tool(self, analysis_request):
    """Chain multiple tools for complex analysis"""
    
    steps = self.decompose_analysis(analysis_request)
    results = {}
    
    for step in steps:
        if step['type'] == 'find_entities':
            results[step['id']] = self.find_entities_tool(
                step['entity_type'], 
                step.get('filters')
            )
        elif step['type'] == 'explore_relationships':
            entity = self.get_entity_from_previous_step(results, step['depends_on'])
            results[step['id']] = self.explore_relationships_tool(
                entity, 
                step['direction']
            )
        elif step['type'] == 'pattern_analysis':
            entities = self.get_entities_from_previous_steps(results, step['depends_on'])
            results[step['id']] = self.analyze_patterns_tool(entities)
    
    return self.synthesize_analysis_results(results)

def decompose_analysis(self, request):
    """Decompose complex analysis into steps"""
    
    decomposition_prompt = f'''
    Break down this analysis request into specific steps:
    
    Request: {request}
    
    Available tools:
    - find_entities: Find entities by type and filters
    - explore_relationships: Explore entity connections
    - analyze_patterns: Find patterns in entity sets
    
    Return JSON list of steps with dependencies.
    '''
    
    response = self.llm.generate(decomposition_prompt)
    return json.loads(response)
```

== Knowledge Update Tools
```python
def update_knowledge_tool(self, new_information, source):
    """Update graph with new information"""
    
    # Extract entities and relationships from new information
    entities = self.extract_entities(new_information)
    relationships = self.extract_relationships(new_information)
    
    with self.graph.session() as session:
        # Create/update entities
        for entity in entities:
            session.run("""
                MERGE (e:Entity {name: $name})
                SET e.type = $type,
                    e.confidence = coalesce(e.confidence, 0) + $confidence,
                    e.last_updated = datetime(),
                    e.sources = coalesce(e.sources, []) + [$source]
            """, name=entity['name'], type=entity['type'], 
                 confidence=entity['confidence'], source=source)
        
        # Create/update relationships
        for rel in relationships:
            session.run("""
                MATCH (source:Entity {name: $source_name})
                MATCH (target:Entity {name: $target_name})
                MERGE (source)-[r:RELATED_TO {type: $rel_type}]->(target)
                SET r.confidence = coalesce(r.confidence, 0) + $confidence,
                    r.sources = coalesce(r.sources, []) + [$source],
                    r.last_updated = datetime()
            """, source_name=rel['source'], target_name=rel['target'],
                 rel_type=rel['type'], confidence=rel['confidence'], source=source)
    
    return f"Updated knowledge graph with {len(entities)} entities and {len(relationships)} relationships"
```

== Agent Tool Execution
```python
def execute_with_tools(self, user_query):
    """Execute query using available tools"""
    
    # Determine which tools to use
    tool_plan = self.plan_tool_usage(user_query)
    
    execution_log = []
    context = {}
    
    for step in tool_plan:
        tool_name = step['tool']
        tool_args = step['args']
        
        # Execute tool
        try:
            result = self.tools[tool_name](**tool_args)
            context[step['output_var']] = result
            execution_log.append({
                'tool': tool_name,
                'args': tool_args,
                'success': True,
                'result_size': len(result) if isinstance(result, list) else 1
            })
        except Exception as e:
            execution_log.append({
                'tool': tool_name,
                'args': tool_args,
                'success': False,
                'error': str(e)
            })
    
    # Generate final response
    response = self.generate_response_from_context(user_query, context)
    
    return {
        'response': response,
        'execution_log': execution_log,
        'tools_used': [step['tool'] for step in tool_plan]
    }
```

== Summary
Tool integration allows agents to dynamically interact with graph databases, perform complex analyses, and update knowledge while maintaining transparency and safety in operations.
""",

    "6-agents/lessons/4-hands-on-exercise/lesson.adoc": """= Hands-on Exercise: Financial Analysis Agent
:type: challenge
:order: 4
:duration: 20 minutes

== Exercise Overview
Build a complete financial analysis agent that can reason over graph knowledge, use tools, and provide transparent, evidence-based responses.

== Step 1: Agent Architecture Setup
```python
class FinancialAnalysisAgent:
    def __init__(self, graph_db, openai_key):
        self.graph = graph_db
        self.llm = OpenAI(api_key=openai_key)
        self.memory = GraphMemory(graph_db)
        self.tools = self.setup_tools()
    
    def setup_tools(self):
        return {
            'find_companies': self.find_companies_tool,
            'analyze_financial_metrics': self.analyze_metrics_tool,
            'find_relationships': self.find_relationships_tool,
            'risk_assessment': self.risk_assessment_tool,
            'market_analysis': self.market_analysis_tool
        }
    
    def find_companies_tool(self, criteria):
        """Find companies matching specific criteria"""
        with self.graph.session() as session:
            result = session.run("""
                MATCH (c:Company)
                WHERE ($industry IS NULL OR c.industry = $industry)
                  AND ($min_revenue IS NULL OR c.annual_revenue >= $min_revenue)
                  AND ($region IS NULL OR c.region = $region)
                RETURN c.name, c.industry, c.annual_revenue, c.market_cap,
                       c.risk_score, c.founded_year
                ORDER BY c.market_cap DESC
                LIMIT 20
            """, **criteria)
            return [record.data() for record in result]
    
    def analyze_metrics_tool(self, company_names):
        """Analyze financial metrics for companies"""
        with self.graph.session() as session:
            result = session.run("""
                UNWIND $companies AS company_name
                MATCH (c:Company {name: company_name})
                OPTIONAL MATCH (c)-[:HAS_METRIC]->(m:FinancialMetric)
                WHERE m.year = 2023
                RETURN c.name,
                       c.market_cap,
                       c.annual_revenue,
                       collect({metric: m.type, value: m.value, trend: m.trend}) AS metrics
            """, companies=company_names)
            return [record.data() for record in result]
```

== Step 2: Reasoning Engine
```python
def reason_about_query(self, user_query):
    """Multi-step reasoning over financial graph"""
    
    # Extract key entities from query
    entities = self.extract_financial_entities(user_query)
    
    # Build reasoning chain
    reasoning_steps = []
    
    for entity in entities:
        # Find related information
        context = self.get_entity_context(entity)
        reasoning_steps.append({
            'entity': entity,
            'context': context,
            'reasoning': self.analyze_entity_context(entity, context)
        })
    
    # Synthesize reasoning
    final_reasoning = self.synthesize_reasoning(user_query, reasoning_steps)
    
    return {
        'reasoning_chain': reasoning_steps,
        'conclusion': final_reasoning,
        'confidence': self.calculate_confidence(reasoning_steps)
    }

def get_entity_context(self, entity):
    """Get comprehensive context for an entity"""
    with self.graph.session() as session:
        result = session.run("""
            MATCH (e:Entity {name: $entity})
            OPTIONAL MATCH (e)-[r1]-(related1)
            OPTIONAL MATCH (e)-[r2*2]-(related2)
            WHERE type(r2) <> type(r1)
            
            RETURN e.name AS entity,
                   collect(DISTINCT {
                       entity: related1.name,
                       relationship: type(r1),
                       type: labels(related1)[0]
                   })[0..10] AS direct_connections,
                   collect(DISTINCT {
                       entity: related2.name,
                       path_length: 2,
                       type: labels(related2)[0]
                   })[0..10] AS indirect_connections
        """, entity=entity)
        
        return result.single().data() if result.single() else None
```

== Step 3: Risk Assessment Tool
```python
def risk_assessment_tool(self, company_name):
    """Comprehensive risk assessment using graph data"""
    
    with self.graph.session() as session:
        result = session.run("""
            MATCH (c:Company {name: $company})
            
            // Financial risk factors
            OPTIONAL MATCH (c)-[:HAS_RISK]->(fr:FinancialRisk)
            
            // Market risk through industry connections
            OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)-[:HAS_RISK]->(mr:MarketRisk)
            
            // Regulatory risk through operations
            OPTIONAL MATCH (c)-[:OPERATES_IN]->(region:Region)-[:HAS_REGULATION]->(reg:Regulation)
            WHERE reg.compliance_risk > 0.5
            
            // Competitive risk analysis
            OPTIONAL MATCH (c)-[:COMPETES_WITH]->(competitor:Company)
            WITH c, competitor, count(competitor) AS competitor_count
            
            // Supply chain risk
            OPTIONAL MATCH (c)-[:SUPPLIER_OF|:CUSTOMER_OF]-(partner:Company)
            WHERE partner.risk_score > 0.7
            WITH c, count(partner) AS high_risk_partners, competitor_count
            
            RETURN c.name,
                   c.base_risk_score,
                   competitor_count,
                   high_risk_partners,
                   // Calculated composite risk
                   (c.base_risk_score + 
                    (competitor_count * 0.1) + 
                    (high_risk_partners * 0.2)) AS composite_risk_score,
                   
                   collect(DISTINCT fr.type) AS financial_risks,
                   collect(DISTINCT mr.type) AS market_risks
        """, company=company_name)
        
        risk_data = result.single().data()
        
        # Generate risk explanation
        risk_explanation = self.explain_risk_assessment(risk_data)
        
        return {
            'risk_score': risk_data['composite_risk_score'],
            'risk_factors': {
                'financial': risk_data['financial_risks'],
                'market': risk_data['market_risks'],
                'competitive': risk_data['competitor_count'],
                'supply_chain': risk_data['high_risk_partners']
            },
            'explanation': risk_explanation
        }
```

== Step 4: Query Processing Pipeline
```python
def process_financial_query(self, user_query):
    """Complete pipeline for financial analysis queries"""
    
    # Classify query type
    query_type = self.classify_query(user_query)
    
    # Route to appropriate processing
    if query_type == 'company_analysis':
        return self.handle_company_analysis(user_query)
    elif query_type == 'market_analysis':
        return self.handle_market_analysis(user_query)
    elif query_type == 'risk_assessment':
        return self.handle_risk_assessment(user_query)
    elif query_type == 'comparative_analysis':
        return self.handle_comparative_analysis(user_query)
    else:
        return self.handle_general_query(user_query)

def handle_company_analysis(self, query):
    """Handle company-specific analysis queries"""
    
    # Extract company names from query
    companies = self.extract_company_names(query)
    
    analysis_results = []
    for company in companies:
        # Get comprehensive company data
        company_data = self.tools['analyze_financial_metrics']([company])
        
        # Perform risk assessment
        risk_data = self.tools['risk_assessment'](company)
        
        # Find key relationships
        relationships = self.tools['find_relationships'](company, depth=2)
        
        analysis_results.append({
            'company': company,
            'financial_data': company_data,
            'risk_assessment': risk_data,
            'key_relationships': relationships
        })
    
    # Generate comprehensive response
    response = self.generate_company_analysis_response(query, analysis_results)
    
    return {
        'response': response,
        'data': analysis_results,
        'confidence': self.calculate_analysis_confidence(analysis_results)
    }
```

== Step 5: Testing and Validation
```python
# Test the agent with various financial queries
test_queries = [
    "What are the main risk factors for Apple Inc?",
    "Compare the financial performance of Tesla and Ford",
    "Which technology companies have the highest growth potential?",
    "How does inflation affect retail companies?",
    "What are the key relationships between JPMorgan and other financial institutions?"
]

agent = FinancialAnalysisAgent(graph_db, openai_key)

for query in test_queries:
    print(f"\\nQuery: {query}")
    print("-" * 50)
    
    result = agent.process_financial_query(query)
    
    print(f"Response: {result['response']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Tools used: {result.get('tools_used', [])}")
    
    # Store interaction for learning
    agent.memory.store_interaction(
        user_id="analyst_001",
        query=query,
        response=result['response'],
        entities=result.get('entities', [])
    )
```

== Step 6: Agent Improvement Loop
```python
def analyze_agent_performance(self):
    """Analyze agent performance for improvement"""
    
    with self.graph.session() as session:
        # Get interaction statistics
        stats = session.run("""
            MATCH (i:Interaction)
            WHERE i.timestamp > datetime() - duration('P7D')
            
            OPTIONAL MATCH (i)-[:MENTIONED]->(e:Entity)
            WITH i, count(e) AS entities_mentioned
            
            RETURN count(i) AS total_interactions,
                   avg(entities_mentioned) AS avg_entities_per_query,
                   collect(i.query)[0..5] AS sample_queries
        """).single().data()
        
        # Identify knowledge gaps
        gaps = session.run("""
            MATCH (i:Interaction)-[:MENTIONED]->(e:Entity)
            WHERE NOT EXISTS {
                MATCH (e)-[:RELATED_TO]-(:Entity)
            }
            RETURN e.name AS isolated_entity, count(i) AS mention_count
            ORDER BY mention_count DESC
            LIMIT 10
        """).data()
        
        return {
            'performance_stats': stats,
            'knowledge_gaps': gaps,
            'improvement_suggestions': self.generate_improvement_suggestions(stats, gaps)
        }
```

== Challenge Questions
1. How would you implement agent learning from user feedback?
2. What safety measures would you add for financial advice agents?
3. How would you handle conflicting information in the knowledge graph?
4. What additional tools would enhance financial analysis capabilities?

== Summary
You've built a sophisticated financial analysis agent that combines graph reasoning, tool usage, and transparent explanation generation, demonstrating the power of graph-enhanced AI systems for complex domain-specific applications.
"""
}

# Write all the lesson files
base_path = "/mnt/c/Users/Alison Cossette/OneDrive/Github/courses/asciidoc/courses/workshops-2025/modules"

for lesson_path, content in lessons.items():
    full_path = os.path.join(base_path, lesson_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Created: {lesson_path}")

print("All lessons created successfully!")